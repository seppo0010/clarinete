import os
import json
import logging
import re
import html

import pika
import traceback
import spacy

RESPONSE_KEY = 'item'
QUEUE_KEY = 'ner_item'

nlp_es = spacy.load('es_core_news_lg')

def cleanhtml(raw_html):
  cleantext = re.sub('<.*?>', '', re.sub('</p.*?>', '\n', raw_html))
  return html.unescape(cleantext)


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

def ner(content, language='es'):
    doc = nlp_es(cleanhtml(content))
    return [(chunk.text, chunk.ents[0].label_) for chunk in doc.noun_chunks if len(chunk.ents)]

def run_once(channel):
    for method_frame, properties, body in channel.consume(QUEUE_KEY):
        # at most once delivery
        channel.basic_ack(method_frame.delivery_tag)
        obj = json.loads(body.decode('utf-8'))
        url = obj['url']
        content = (obj['title'] or '') + '.\n' + (obj['content'] or '')
        language = obj.get('language', 'es')
        if not content:
            logger.warning('no title in object ' + json.dumps(obj))
            continue
        logger.debug('ner ' + url)
        try:
            entities = ner(content, language=language)
            logger.debug('entities: ' + str(entities or 'None'))
            channel.queue_declare(queue=RESPONSE_KEY, durable=True)
            channel.basic_publish(
                exchange='',
                routing_key=RESPONSE_KEY,
                body=json.dumps({
                    'url': url,
                    'entities': entities,
                }),
                properties=pika.BasicProperties(
                    content_type='application/json',
                    delivery_mode=1,
                )
            )
        except:
            logger.error('error ner')
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
