import os
import psycopg2
import psycopg2.extras
import urllib

from flask import Flask, jsonify, request, g
from waitress import serve
import redis


def get_news_db():
    pg_user = os.getenv("POSTGRES_USER")
    pg_host = 'news-database'
    pg_db = os.getenv("POSTGRES_DB")
    with open('/run/secrets/postgres-password', 'r') as fp:
        pg_password = fp.read().strip()
    dsn = f'postgres://{pg_user}:{urllib.parse.quote(pg_password)}@{pg_host}/{pg_db}'

    if 'db' not in g:
        g.db = pg_connection = psycopg2.connect(dsn)
    return g.db

def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()

app = Flask(__name__)
app.teardown_appcontext(close_db)

@app.route("/api/last_updated")
def last_updated():
    con = get_news_db()
    cur = con.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute('''SELECT MAX(time) AS time FROM updated''')
    return jsonify(cur.fetchone())

@app.route("/api/entities")
def entities():
    con = get_news_db()
    cur = con.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute('''
    SELECT entities.name, COUNT(*) as q FROM (
        SELECT name
        FROM news_entities
            JOIN entities
                ON news_entities.entity_id = COALESCE(entities.canonical_id, entities.id)
                    AND entities.canonical_id IS NULL
    ) entities
    GROUP BY entities.name
    ORDER BY q DESC
    LIMIT 100
    ''')
    return jsonify(cur.fetchall())

def search_entity(entity_id):
    con = get_news_db()
    cur = con.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute('''
    SELECT DISTINCT news.url, title, volanta, section.name AS section, date, source.name AS source, country, news.summary
    FROM news
    INNER JOIN news_entities ON news.url = news_entities.url
    LEFT JOIN section ON news.section_id = section.id
    JOIN source ON news.source_id = source.id
    WHERE news_entities.entity_id = %s
    ''', [entity_id])
    return jsonify(cur.fetchall())

@app.route("/api/search")
def search():
    criteria = request.args.get('criteria')
    con = get_news_db()
    cur = con.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute('''
        SELECT id FROM entities WHERE name = %s
    ''', [criteria])
    r = cur.fetchone()
    if r is not None:
        return search_entity(r['id'])

    cur = con.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute('''
        SELECT DISTINCT news.url, title, volanta, section.name AS section, date, source.name AS source, country, news.summary
        FROM news
            LEFT JOIN section ON news.section_id = section.id
            JOIN source ON news.source_id = source.id
            INNER JOIN news_entities ON news.url = news_entities.url
            INNER JOIN entities ON news_entities.entity_id IN (
                SELECT e1.id FROM entities e1 JOIN entities e2 ON e1.canonical_id = e2.id
                WHERE e2.name = %s
                UNION
                SELECT id FROM entities WHERE name = %s
            )
        UNION
        SELECT * FROM (
            SELECT url, title, volanta, section, date, source, country, summary
            FROM (
                SELECT url, title, volanta, COALESCE(section.category, 'Otros') AS section, date, source.name AS source, source.country, summary, ts_rank_cd(to_tsvector('spanish', title), query) AS rank
                FROM news
                    LEFT JOIN section ON news.section_id = section.id
                    JOIN source ON news.source_id = source.id
                    , plainto_tsquery('spanish', %s) query
                WHERE to_tsvector('spanish', title) @@ query
                UNION
                SELECT url, title, volanta, COALESCE(section.category, 'Otros') AS section, date, source.name AS source, source.country, summary, ts_rank_cd(to_tsvector('spanish', content), query) AS rank
                FROM news
                    LEFT JOIN section ON news.section_id = section.id
                    JOIN source ON news.source_id = source.id
                    , plainto_tsquery('spanish', %s) query
                WHERE to_tsvector('spanish', content) @@ query
                LIMIT 20
            ) t
            ORDER BY rank DESC
        ) t
        LIMIT 50
    ''', [criteria, criteria, criteria, criteria])
    return jsonify(cur.fetchall())

@app.route("/api/news")
def news_list():
    con = get_news_db()
    cur = con.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute('''
        SELECT url, title, volanta, COALESCE(section.category, 'Otros') AS section, date, source.name AS source, source.country, summary
        FROM news
            LEFT JOIN section ON news.section_id = section.id
            JOIN source ON news.source_id = source.id
        WHERE position IS NOT NULL AND
            canonical_url IS NULL
        ORDER BY position ASC, date DESC''')
    return jsonify(cur.fetchall())

@app.route("/api/news/details")
def news_details():
    con = get_news_db()
    url = request.args.get('url')
    if not url:
        return 400, ''
    cur = con.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute('''
        SELECT url, title, volanta, COALESCE(section.category, 'Otros') AS section, date, content, source.name AS source, source.country, summary
        FROM news
            LEFT JOIN section ON news.section_id = section.id
            JOIN source ON news.source_id = source.id
        WHERE url = %s OR canonical_url = %s
        ORDER BY canonical_url IS NULL DESC
        ''', [url, url])
    return jsonify(cur.fetchall())

if __name__ == '__main__':
    if os.getenv('FLASK_DEBUG', False):
        app.run('0.0.0.0', debug=True)
    else:
        serve(app, host='0.0.0.0', port=5000)
