import os

from waitress import serve
from flask import Flask, jsonify, request
from deduplicator import deduplicator

app = Flask(__name__)

@app.route("/api/deduplicator", methods=['POST'])
def api_deduplicator():
    data = request.get_json()
    title = data.get('title', None)
    alternatives = data.get('alternatives', None)
    if not title or not alternatives or not isinstance(title, str) or not isinstance(alternatives, list):
        return '{}', 400
    return jsonify({'sentence': deduplicator(title, alternatives)})

if __name__ == '__main__':
    if os.getenv('FLASK_DEBUG', False):
        app.run('0.0.0.0', debug=True)
    else:
        serve(app, host='0.0.0.0', port=5000)
