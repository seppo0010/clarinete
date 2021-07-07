import os

from waitress import serve
from flask import Flask, jsonify, request
from deduplicator import deduplicator

app = Flask(__name__)

if __name__ == '__main__':
    pika_connection = pika.BlockingConnection(pika.ConnectionParameters(host='news-queue', heartbeat=600, blocked_connection_timeout=6000))
    channel = pika_connection.channel()
    channel.basic_qos(prefetch_count=1)
    channel.queue_declare(queue='answer_item', durable=True)
    for method_frame, properties, body in channel.consume('answer_item'):
        obj = json.loads(body.decode('utf-8'))
        logger.info('deduplicator ' + obj['title'])
        try:
            rep = deduplicator(title, [x[1] for x in alternatives])
            if rep:
                channel.basic_publish(
                    exchange='',
                    routing_key='item',
                    body=json.dumps({
                        'url': [x for x in alternatives if x == rep][0]['canonical_url'],
                        'canonical_url': canonical_url,
                    }),
                    properties=pika.BasicProperties(
                        content_type='application/json',
                        delivery_mode=1,
                    )
                )
        except:
            traceback.print_exc()
        channel.basic_ack(method_frame.delivery_tag)
