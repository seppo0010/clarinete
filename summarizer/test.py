from time import sleep
import unittest
from summarizer import run_once, setup_channel, QUEUE_KEY, RESPONSE_KEY
import sys
import traceback
import socket
import json
import pika
import timeout_decorator
import torch

# logging in test seems hard and I'm tired
def log(message):
    sys.stderr.write(message + '\n')

class TestSummarizer(unittest.TestCase):
    def setUp(self):
        self.assertTrue(torch.cuda.is_available())
        self.wait_for_queue()
        channel = setup_channel()
        channel.queue_delete(queue=QUEUE_KEY)
        channel.queue_delete(queue=RESPONSE_KEY)

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

    @timeout_decorator.timeout(240)
    def test_summary_es(self):
        url = 'http://fake-url/es'
        title = 'PREAMBULO'
        content = 'Nos los representantes del pueblo de la Nación Argentina, reunidos en Congreso General Constituyente por voluntad y elección de las provincias que la componen, en cumplimiento de pactos preexistentes, con el objeto de constituir la unión nacional, afianzar la justicia, consolidar la paz interior, proveer a la defensa común, promover el bienestar general, y asegurar los beneficios de la libertad, para nosotros, para nuestra posteridad, y para todos los hombres del mundo que quieran habitar en el suelo argentino: invocando la protección de Dios, fuente de toda razón y justicia: ordenamos, decretamos y establecemos esta Constitución, para la Nación Argentina.'
        language = 'es'
        channel = setup_channel()
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
        channel = setup_channel()
        channel.queue_declare(queue=RESPONSE_KEY, durable=True)
        for method_frame, properties, body in channel.consume(RESPONSE_KEY):
            obj = json.loads(body.decode('utf-8'))
            self.assertEqual(obj['url'], url)
            self.assertIn('representantes', obj['summary'].lower())
            break

    @timeout_decorator.timeout(120)
    def test_summary_en(self):
        url = 'http://fake-url/en'
        title = 'Preamble'
        content = 'We the People of the United States, in Order to form a more perfect Union, establish Justice, insure domestic Tranquility, provide for the common defence, promote the general Welfare, and secure the Blessings of Liberty to ourselves and our Posterity, do ordain and establish this Constitution for the United States of America.'
        language = 'en'
        channel = setup_channel()
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
        channel = setup_channel()
        channel.queue_declare(queue=RESPONSE_KEY, durable=True)
        for method_frame, properties, body in channel.consume(RESPONSE_KEY):
            obj = json.loads(body.decode('utf-8'))
            self.assertEqual(obj['url'], url)
            self.assertIn('union', obj['summary'].lower())
            break
