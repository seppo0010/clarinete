import os
import logging

from waitress import serve
from sentence_transformers import SentenceTransformer, util
from flask import Flask, jsonify, request

sentence_encoder = SentenceTransformer('sentence-transformers/paraphrase-xlm-r-multilingual-v1')
app = Flask(__name__)

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

@app.route("/api/deduplicator", methods=['POST'])
def deduplicator():
    data = request.get_json()
    title = data.get('title', None)
    alternatives = data.get('alternatives', None)
    if not title or not alternatives or not isinstance(title, str) or not isinstance(alternatives, list):
        return '{}', 400
    title_embeddings = sentence_encoder.encode(title)
    embeddings = sentence_encoder.encode(alternatives)
    cos_sim = util.cos_sim(title_embeddings, embeddings)[0]
    max_cos_sim = max(cos_sim)
    if float(max_cos_sim) > 0.65:
        for a, s in zip(alternatives, cos_sim):
            if s == max_cos_sim:
                logger.info(f'best sentence for {title} ({max_cos_sim:.4f}): {a}')
                return jsonify({'sentence': a})
    return jsonify({'sentence': None})

if __name__ == '__main__':
    if os.getenv('FLASK_DEBUG', False):
        app.run('0.0.0.0', debug=True)
    else:
        serve(app, host='0.0.0.0', port=5000)
