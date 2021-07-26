from time import sleep
import unittest
from entitier import run_once, setup_channel, QUEUE_KEY, RESPONSE_KEY
import sys
import traceback
import socket
import json
import pika

# logging in test seems hard and I'm tired
def log(message):
    sys.stderr.write(message + '\n')

class TestEntitier(unittest.TestCase):
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
                s.close()
                return
            except:
                sleep(6)
                traceback.print_exc()
        raise Exception('wait for queue timed out')

    def test_entitier(self):
        name = 'Club Atlético Boca Juniors'
        conn, channel = setup_channel()
        channel.basic_publish(
            exchange='',
            routing_key=QUEUE_KEY,
            body=json.dumps({
                'name': name,
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
            self.assertEqual(name, obj['entity'])
            self.assertIn('football', obj['summary'])
            break
        channel.close()
        conn.close()
