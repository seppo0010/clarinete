import json
import re
import html
import traceback
import logging

import pika
from transformers import pipeline
import requests

QUEUE_KEY = 'summary_item'
RESPONSE_KEY = 'item'
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

def get_module_logger(mod_name):
    logger = logging.getLogger(mod_name)
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        '%(asctime)s [%(name)-12s] %(levelname)-8s %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.DEBUG)
    return logger
logger = get_module_logger(__name__)

def cleanhtml(raw_html):
  cleantext = re.sub('<.*?>', '', re.sub('</p.*?>', '\n', raw_html))
  return html.unescape(cleantext)

def get_summary(text, language='es'):
    return summarizer(cleanhtml(text), max_length=130, min_length=30, do_sample=False, truncation=True)[0]['summary_text']

def run_once(channel):
    for method_frame, properties, body in channel.consume(QUEUE_KEY):
        # at most once delivery
        # Many times it fails to ack due to timeout, but it does set
        # the summary. If it truly fails, we are OK missing it.
        channel.basic_ack(method_frame.delivery_tag)
        try:
            obj = json.loads(body.decode('utf-8'))
            logger.info('summarizing ' + obj['url'])
            summary = get_summary(obj['title'] + '\n' + obj['content'], obj['language'])
            channel.queue_declare(queue=RESPONSE_KEY, durable=True)
            channel.basic_publish(
                exchange='',
                routing_key=RESPONSE_KEY,
                body=json.dumps({
                    'url': obj['url'],
                    'summary': summary,
                }),
                properties=pika.BasicProperties(
                    content_type='application/json',
                    delivery_mode=1,
                )
            )
        except:
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
