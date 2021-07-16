from time import sleep
import unittest
from deduplicator import run_once, setup_channel, QUEUE_KEY, RESPONSE_KEY
import sys
import traceback
import socket
import json
import pika
# import timeout_decorator
import torch

# logging in test seems hard and I'm tired
def log(message):
    sys.stderr.write(message + '\n')

class TestDeduplicator(unittest.TestCase):
    def setUp(self):
        self.assertTrue(torch.cuda.is_available())
        self.wait_for_queue()
        conn, channel = setup_channel()
        channel.queue_delete(queue=QUEUE_KEY)
        channel.queue_delete(queue=RESPONSE_KEY)
        channel.close()
        conn.close()

    def wait_for_queue(self):
        for i in range(10):
            log(f'attempt {i} to connect to queue')
            try:
                s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                s.connect(("news-queue", 5672))
                sleep(6)
                s.close()
                return
            except:
                traceback.print_exc()
        raise Exception('wait for queue timed out')

    # @timeout_decorator.timeout(240)
    def test_deduplicator(self):
        url = 'http://fake-url/es'
        title = 'boca ganó 3-0'
        alternatives = [
            ['http://fake-url/1', "river perdió 0-3"],
            ['http://fake-url/2', "boca goleó a river"],
            ['http://fake-url/3', "la inflación de junio fue del 3%"],
            ['http://fake-url/4', "murió diego maradona"],
        ]
        language = 'es'
        conn, channel = setup_channel()
        channel.basic_publish(
            exchange='',
            routing_key=QUEUE_KEY,
            body=json.dumps({
                'url': url,
                'title': title,
                'alternatives': alternatives,
                'language': language,
            }),
            properties=pika.BasicProperties(
                content_type='application/json',
                delivery_mode=1,
            )
        )
        run_once(channel)
        channel.close()
        conn.close()
        conn, channel = setup_channel()
        channel.queue_declare(queue=RESPONSE_KEY, durable=True)
        for method_frame, properties, body in channel.consume(RESPONSE_KEY, inactivity_timeout=1):
            obj = json.loads(body.decode('utf-8'))
            self.assertEqual(obj['canonical_url'], url)
            self.assertEqual(obj['url'], alternatives[0][0])
            break
        channel.close()
        conn.close()

