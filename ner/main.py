import sys

from waitress import serve
from flask import Flask, jsonify, request
import spacy
app = Flask(__name__)

nlp_es = spacy.load('es_core_news_lg')
nlp_en = spacy.load('en_core_web_lg')

def ner(text, language='es'):
    if language == 'es':
        doc = nlp_es(text)
    elif language == 'en':
        doc = nlp_en(text)
    else:
        return None
    return {'entities': [chunk.text for chunk in doc.noun_chunks if chunk.ents]}

@app.route("/ner", methods=['POST'])
def api_ner():
    data = request.get_json()
    text = data.get('text', None)
    language = data.get('language', 'es')
    if not text:
        return '{}', 400
    r = ner(text, language)
    if r is None:
        return '{}', 400
    return jsonify(r)

if __name__ == '__main__':
    if len(sys.argv) == 2:
        print(ner(sys.argv[1]))
        sys.exit(0)
    serve(app, host='0.0.0.0', port=5000)
