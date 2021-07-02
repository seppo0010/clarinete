import sys
import sqlite3
from flask import Flask, jsonify, request

if len(sys.argv) != 2:
    sys.stderr.write(f'usage: {sys.argv[0]} <sqlite database>\n')
    sys.exit(1)

dbpath = sys.argv[1]
app = Flask(__name__)

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

@app.route("/api/last_updated")
def last_updated():
    con = sqlite3.connect(dbpath)
    cur = con.cursor()
    cur.execute('''SELECT MAX(time) FROM updated''')
    return jsonify(cur.fetchone())

@app.route("/api/news")
def news_list():
    con = sqlite3.connect(dbpath)
    con.row_factory = dict_factory
    cur = con.cursor()
    cur.execute('''
        SELECT url, title, volanta, section.name AS section, date, source.name AS source
        FROM news
            JOIN section ON news.section_id = section.id
            JOIN source ON news.source_id = source.id
        WHERE position IS NOT NULL
        ORDER BY position ASC''')
    return jsonify(cur.fetchall())

@app.route("/api/news/details")
def news_details():
    url = request.args.get('url')
    if not url:
        return 400, ''
    con = sqlite3.connect(dbpath)
    con.row_factory = dict_factory
    cur = con.cursor()
    cur.execute('''
        SELECT url, title, volanta, section.name AS section, date, content, source.name AS source
        FROM news
            JOIN section ON news.section_id = section.id
            JOIN source ON news.source_id = source.id
        WHERE url = ?''', [url])
    row = cur.fetchone()
    if not url:
        return 404, ''
    return jsonify(row)


if __name__ == '__main__':
  app.run('0.0.0.0', debug=True)
