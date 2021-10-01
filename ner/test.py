from time import sleep
import unittest
from ner import run_once, setup_channel, QUEUE_KEY, RESPONSE_KEY
import sys
import traceback
import socket
import json
import pika

# logging in test seems hard and I'm tired
def log(message):
    sys.stderr.write(message + '\n')

class TestDeduplicator(unittest.TestCase):
    def setUp(self):
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

    def test_ner(self):
        url = 'http://fake-url/es'
        title = 'Preámbulo de la Constición de la Nación Argentina'
        content = '''
        Nos los representantes del pueblo de la Nación Argentina, reunidos en Congreso General Constituyente por voluntad y elección de las provincias que la componen, en cumplimiento de pactos preexistentes, con el objeto de constituir la unión nacional, afianzar la justicia, consolidar la paz interior
        '''
        language = 'es'
        conn, channel = setup_channel()
        channel.basic_publish(
            exchange='',
            routing_key=QUEUE_KEY,
            body=json.dumps({
                'url': url,
                'title': title,
                'content': content,
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
            self.assertEqual(obj['url'], url)
            self.assertEqual(obj['entities'], [['la Nación Argentina', 'LOC'], ['Congreso General Constituyente', 'MISC']])
            self.assertEqual(obj['title_entities'], [['Preámbulo de la Constición de la Nación Argentina', 'MISC']])
            break
        channel.close()
        conn.close()
