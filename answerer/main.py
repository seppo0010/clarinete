import logging
import os

from transformers import pipeline
import pika

en_es_translator = pipeline("translation_en_to_es", model='Helsinki-NLP/opus-mt-en-es')
es_en_translator = pipeline("translation_es_to_en", model='Helsinki-NLP/opus-mt-es-en')
qa = pipeline('question-answering', model='bert-large-uncased-whole-word-masking-finetuned-squad')

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
        'DEBUG': logging.DEBUG,
    }[os.getenv('LOG_LEVEL', 'WARNING')])
    return logger
logger = get_module_logger(__name__)

def answerer(title, text):
    title_en = es_en_translator(title)
    text_en = '\n'.join(
        x['translation_text']
        for x in es_en_translator(
            [x.strip() for x in text.split('\n') if x.strip() != ''],
            truncation=True
        )
    )
    r = qa(title_en[0]['translation_text'], text_en)
    answer = en_es_translator(r['answer'], truncation=True)[0]['translation_text']
    score = r['score']
    logger.info(f'answer to {title} ({score}): {answer}')
    if score > 0.1:
        return answer
    return None

app = Flask(__name__)

if __name__ == '__main__':
    pika_connection = pika.BlockingConnection(pika.ConnectionParameters(host='news-queue', heartbeat=600, blocked_connection_timeout=6000))
    channel = pika_connection.channel()
    channel.basic_qos(prefetch_count=1)
    channel.queue_declare(queue='answer_item', durable=True)
    for method_frame, properties, body in channel.consume('answer_item'):
        obj = json.loads(body.decode('utf-8'))
        logger.info('answering ' + obj['url'])
        try:
            answer = answerer(obj['title'], obj['content'])
            if answer:
                channel.basic_publish(
                    exchange='',
                    routing_key='item',
                    body=json.dumps({
                        'url': obj['url'],
                        'answer': answer,
                    }),
                    properties=pika.BasicProperties(
                        content_type='application/json',
                        delivery_mode=1,
                    )
                )
        except:
            traceback.print_exc()
        channel.basic_ack(method_frame.delivery_tag)
