import datetime
import os
import psycopg2
import psycopg2.extras
import time
import urllib

from flask import Flask, jsonify, request, g
from waitress import serve
import redis
from google.auth.transport import requests
from google.oauth2 import id_token


ARCHIVE_KEY = 'archived:{user}'
ARCHIVE_MAX = 2000

def get_archive_db():
    return redis.Redis(host='userpreferences', port=6379, db=0)

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

def get_trends_db():
    return redis.Redis(host='trends-database', port=6379, db=0)

def validate_user(user_email, user_token):
    if user_email is None or user_email == '':
        return True
    request = requests.Request()
    try:
        id_info = id_token.verify_oauth2_token(user_token, request, os.getenv("GOOGLE_CLIENT_ID"))
    except ValueError:
        return False
    return id_info['email'] == user_email

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
    SELECT DISTINCT news.url, title, volanta, section.name AS section, date, source.name AS source, country, news.summary, news.created_at
    FROM news
    INNER JOIN news_entities ON news.url = news_entities.url
    LEFT JOIN section ON news.section_id = section.id
    JOIN source ON news.source_id = source.id
    WHERE news_entities.entity_id IN (
        SELECT %s
        UNION
        SELECT id FROM entities WHERE canonical_id = %s
    ) AND created_at IS NOT NULL
    ORDER BY date DESC
    ''', [entity_id, entity_id])
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
        SELECT DISTINCT news.url, title, volanta, section.name AS section, date, source.name AS source, country, news.summary, COALESCE(news.created_at, '1970-01-01') AS created_at
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
            WHERE news.date IS NOT NULL
        UNION
        SELECT * FROM (
            SELECT url, title, volanta, section, date, source, country, summary, created_at
            FROM (
                SELECT url, title, volanta, COALESCE(section.category, 'Otros') AS section, date, source.name AS source, source.country, summary, ts_rank_cd(to_tsvector('spanish', title), query) AS rank, created_at
                FROM news
                    LEFT JOIN section ON news.section_id = section.id
                    JOIN source ON news.source_id = source.id
                    , plainto_tsquery('spanish', %s) query
                WHERE to_tsvector('spanish', title) @@ query
                AND news.date IS NOT NULL
                UNION
                SELECT url, title, volanta, COALESCE(section.category, 'Otros') AS section, date, source.name AS source, source.country, summary, ts_rank_cd(to_tsvector('spanish', content), query) AS rank, created_at
                FROM news
                    LEFT JOIN section ON news.section_id = section.id
                    JOIN source ON news.source_id = source.id
                    , plainto_tsquery('spanish', %s) query
                WHERE to_tsvector('spanish', content) @@ query
                AND news.date IS NOT NULL
                ORDER BY date DESC
                LIMIT 20
            ) t
            ORDER BY date DESC
        ) t
        ORDER BY date DESC
        LIMIT 50
    ''', [criteria, criteria, criteria, criteria])
    return jsonify(cur.fetchall())

@app.route("/api/news")
def news_list():
    con = get_archive_db()
    user_email = request.args.get('userEmail', None)
    if not validate_user(user_email, request.args.get('userToken', None)):
        return '{}', 403
    key = ARCHIVE_KEY.format(user=user_email)
    archived = set(map(lambda x: x.decode('utf-8'), con.lrange(key, 0, -1)))
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
    return jsonify([x for x in cur.fetchall() if x['url'] not in archived])

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

@app.route("/api/trends")
def trends():
    con = get_trends_db()
    trends = [int(x.decode('utf-8')) for x in con.zrangebyscore('trends', '-inf', 0, start=0, num=10)]

    con = get_news_db()
    cur = con.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute('''
        SELECT id, name FROM entities WHERE id = ANY(%s)
        ''', [trends])
    entity_by_id = {x['id']: x['name'] for x in cur.fetchall()}
    return jsonify([entity_by_id[x] for x in trends])

@app.route("/api/archive", methods=['POST'])
def archive():
    con = get_archive_db()
    params = request.get_json()
    url = params['url']
    user_email = params.get('userEmail', None)
    if not validate_user(user_email, params.get('userToken', None)):
        return '{}', 403
    key = ARCHIVE_KEY.format(user=user_email)
    con.rpush(key, url)
    while con.llen(key) > ARCHIVE_MAX:
        con.lpop(key)
    return jsonify(list(map(lambda x: x.decode('utf-8'), con.lrange(key, 0, -1))))

@app.route("/api/googleTokens", methods=['GET'])
def google_tokens():
    return jsonify({
        'apiKey': os.getenv("GOOGLE_API_KEY"),
        'clientId': os.getenv("GOOGLE_CLIENT_ID"),
    })

@app.route("/api/history", methods=['GET'])
def history():
    con = get_news_db()
    entity = request.args.get('entity')
    now = datetime.datetime.now()
    sql = '''
    SELECT DATE(created_at + '1 day' - time %s) AS created_at, COUNT(*)
    FROM news
        JOIN news_entities ON news.url = news_entities.url
        JOIN entities ON news_entities.entity_id = entities.id
    WHERE
        created_at IS NOT NULL
        AND created_at BETWEEN %s AND %s
        AND STRPOS(news.title, entities.name) > 0
        AND COALESCE(entities.canonical_id, entities.id) = (
            SELECT id FROM entities WHERE name = %s
        )
    GROUP BY DATE(created_at + '1 day' - time %s)
    '''
    cur = con.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute(sql, [
        time.strftime("%H:%M:%S", time.localtime()),
        now + datetime.timedelta(days=-28),
        now + datetime.timedelta(days=0),
        entity,
        time.strftime("%H:%M:%S", time.localtime()),
    ])
    return jsonify(cur.fetchall())


if __name__ == '__main__':
    if os.getenv('FLASK_DEBUG', False):
        app.run('0.0.0.0', debug=True)
    else:
        serve(app, host='0.0.0.0', port=5000)
