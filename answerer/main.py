import logging
import os

from transformers import pipeline
from waitress import serve
from flask import Flask, jsonify, request

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
    logger.setLevel(logging.DEBUG)
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

@app.route("/api/answerer", methods=['POST'])
def api_answerer():
    data = request.get_json()
    title = data.get('title', None)
    text = data.get('text', None)
    if not title or not text or not isinstance(title, str) or not isinstance(text, str):
        return '{}', 400
    return jsonify({'answer': answerer(title, text)})

if __name__ == '__main__':
    if os.getenv('FLASK_DEBUG', False):
        app.run('0.0.0.0', debug=True)
    else:
        serve(app, host='0.0.0.0', port=5000)
