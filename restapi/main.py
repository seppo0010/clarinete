import sys
from flask import Flask, jsonify

if len(sys.argv) != 2:
    sys.stderr.write(f'usage: {sys.argv[0]} <sqlite database>\n')
    sys.exit(1)

con = sqlite3.connect(sys.argv[1])
app = Flask(__name__)

@app.route("/news")
def news_list():
    cur = con.cursor()
    cur.execute('''SELECT url, title, volanta, section FROM news JOIN section ON news.section_id = section.id ''')
    return "<p>Hello, World!</p>"
