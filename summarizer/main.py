import json
import re
import html
import traceback
import logging

import pika
import requests
from transformers import pipeline

def translate(t, source, target):
    r = requests.post('http://translator/api/translate', json={
        'from': source,
        'to': target,
        'source': t.replace('\n', ' '),
    })
    r.raise_for_status()
    return r.json()['translation']

def es_en(t):
    return translate(t, 'es', 'en')

def en_es(t):
    return translate(t, 'en', 'es')

summarizer = pipeline("summarization", model='sshleifer/distilbart-xsum-6-6')

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

def summary_line(line):
    MAX_SUMMARY = 40
    if len(line.split(' ')) < MAX_SUMMARY:
        return line
    else:
        return summarizer(line, truncation=True)[0]['summary_text']

def summarize(text):
    lines_total = text.split('\n')
    lines_total = [x.strip() for x in lines_total]
    lines_total = [x for x in lines_total if x != '']
    if len(lines_total) == 0:
        return ''
    lines_summary = []

    text_summary = ' '.join([summary_line(line) for line in lines_total])
    return summary_line(text_summary)

def get_summary(text):
    en = es_en(cleanhtml(text))
    logger.debug(f'en: {en}')
    summarized = summarize(en)
    logger.debug(f'summarized: {summarized}')
    es = en_es(summarized)
    logger.debug(f'es: {es}')

    return ''.join(es)

if __name__ == '__main__':
    pika_connection = pika.BlockingConnection(pika.ConnectionParameters(host='news-queue', heartbeat=600, blocked_connection_timeout=30000))
    channel = pika_connection.channel()
    channel.basic_qos(prefetch_count=1)
    channel.queue_declare(queue='summary_item', durable=True, arguments={
        "x-dead-letter-exchange" : 'summary_item-dlx',
    })
    # at most once delivery
    # Many times it fails to ack due to timeout, but it does set
    # the summary. If it truly fails, we are OK missing it.
    for method_frame, properties, body in channel.consume('summary_item'):
        channel.basic_ack(method_frame.delivery_tag)
        obj = json.loads(body.decode('utf-8'))
        logger.info('summarizing ' + obj['url'])
        try:
            summary = get_summary(obj['title'] + '\n' + obj['content'])
            channel.basic_publish(
                exchange='',
                routing_key='item',
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
