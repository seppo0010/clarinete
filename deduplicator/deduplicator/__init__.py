import os
import json
import logging

import pika
import traceback

from sentence_transformers import SentenceTransformer, util

RESPONSE_KEY = 'item'
QUEUE_KEY = 'deduplicator_item'
sentence_encoder = None


def get_module_logger(mod_name):
    logger = logging.getLogger(mod_name)
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        '%(asctime)s [%(name)-12s] %(levelname)-8s %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel({
        'DEBUG': logging.DEBUG,
        'INFO': logging.INFO,
        'WARNING': logging.WARNING,
        'ERROR': logging.ERROR,
    }[os.getenv('LOG_LEVEL', 'DEBUG')])
    return logger
logger = get_module_logger(__name__)

def cos_simer(title, alternatives, language='es'):
    global sentence_encoder
    if sentence_encoder is None:
        sentence_encoder = SentenceTransformer('sentence-transformers/paraphrase-xlm-r-multilingual-v1')
    logger.debug('encoding title: ' + title)
    title_embeddings = sentence_encoder.encode(title)
    embeddings = sentence_encoder.encode(alternatives)
    return util.cos_sim(title_embeddings, embeddings)[0]

def deduplicator(title, alternatives, cos_simer=cos_simer, language='es'):
    cos_sim = cos_simer(title, alternatives, language=language)
    max_cos_sim = max(cos_sim)
    if float(max_cos_sim) > 0.65:
        for a, s in zip(alternatives, cos_sim):
            if s == max_cos_sim:
                logger.info(f'best sentence for {title} ({max_cos_sim:.4f}): {a}')
                return a
    return None

def run_once(channel):
    for method_frame, properties, body in channel.consume(QUEUE_KEY):
        # at most once delivery
        channel.basic_ack(method_frame.delivery_tag)
        obj = json.loads(body.decode('utf-8'))
        title = obj['title']
        alternatives = obj['alternatives']
        if not title:
            logger.warning('no title in object ' + json.dumps(obj))
            continue
        logger.debug('deduplicator ' + title)
        try:
            rep = deduplicator(title, [x[1] for x in alternatives], language=obj['language'])
            logger.debug('rep: ' + (rep or 'None'))
            if rep:
                channel.queue_declare(queue=RESPONSE_KEY, durable=True)
                channel.basic_publish(
                    exchange='',
                    routing_key=RESPONSE_KEY,
                    body=json.dumps({
                        'url': [x[0] for x in alternatives if x[1] == rep][0],
                        'canonical_url': obj['url'],
                    }),
                    properties=pika.BasicProperties(
                        content_type='application/json',
                        delivery_mode=1,
                    )
                )
        except:
            logger.error('error deduplicting')
            traceback.print_exc()
        break

def run():
    conn, channel = setup_channel()
    while True:
        run_once(channel)
    channel.close()
    conn.close()

def setup_channel():
    pika_connection = pika.BlockingConnection(pika.ConnectionParameters(host='news-queue', heartbeat=600, blocked_connection_timeout=30000))
    channel = pika_connection.channel()
    channel.basic_qos(prefetch_count=1)
    channel.queue_declare(queue=QUEUE_KEY, durable=True, arguments={
        "x-dead-letter-exchange" : f'{QUEUE_KEY}-dlx',
    })
    return pika_connection, channel
