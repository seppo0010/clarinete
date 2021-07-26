import os
import json
import logging

import wikipedia
import pika
import traceback
from time import sleep

RESPONSE_KEY = 'item'
QUEUE_KEY = 'entity_item'
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

def get_summary(name):
    return wikipedia.summary(name)

def run_once(channel):
    for method_frame, properties, body in channel.consume(QUEUE_KEY):
        # at most once delivery
        channel.basic_ack(method_frame.delivery_tag)
        obj = json.loads(body.decode('utf-8'))
        name = obj['entity']
        if not name:
            logger.warning('no name in object ' + json.dumps(obj))
            continue
        logger.debug('summary ' + name)
        try:
            summary = get_summary(name)
            if summary:
                channel.queue_declare(queue=RESPONSE_KEY, durable=True)
                channel.basic_publish(
                    exchange='',
                    routing_key=RESPONSE_KEY,
                    body=json.dumps({
                        'entity': name,
                        'summary': summary,
                    }),
                    properties=pika.BasicProperties(
                        content_type='application/json',
                        delivery_mode=1,
                    )
                )
        except:
            logger.error('error entitiering')
            traceback.print_exc()
        break

def run():
    conn, channel = setup_channel()
    while True:
        run_once(channel)
        sleep(1) # fetch slowly
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
