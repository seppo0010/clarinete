import os
import pika
import json
import psycopg2
import urllib
from yoyo import read_migrations
from yoyo import get_backend


def update_article(cur, obj):
    cur.execute('''INSERT INTO news (url) VALUES (%s) ON CONFLICT DO NOTHING''', [obj['url']])
    for k in 'section', 'source':
        if k in obj and obj[k]:
            cur.execute(f'''INSERT INTO {k} (name) VALUES (%s) ON CONFLICT DO NOTHING''', [obj[k]])
            cur.execute(f'''UPDATE news SET {k}_id = (SELECT id FROM {k} WHERE name = %s) WHERE url = %s''', [
                obj[k],
                obj['url']
            ])

    changed_text = False
    for f in 'title', 'volanta', 'image', 'content', 'date', 'summary', 'sentiment':
        if obj.get(f, None) is None:
            continue
        cur.execute(f'''UPDATE news SET {f} = %s WHERE url = %s AND ({f} IS NULL OR {f} != %s)''',
            [
                obj[f],
                obj['url'],
                obj[f],
            ]
        )
        changed_text = changed_text or (cur.rowcount > 0 and f in 'title', 'content')

    if changed_text:
        cur.execute('SELECT title, content FROM news WHERE url = %s', [obj['url']])
        title, content = cur.fetchone()

        pika_connection = pika.BlockingConnection(pika.ConnectionParameters(host='news-queue'))
        channel = pika_connection.channel()
        channel.queue_declare(queue='summary_item', durable=True)
        channel.basic_publish(
            exchange='',
            routing_key='summary_item',
            body=json.dumps({
                'url': obj['url'],
                'title': title,
                'content': content,
            }),
            properties=pika.BasicProperties(
                content_type='application/json',
                delivery_mode=1,
            )
        )

def update_homepage(cur, source, urls):
    cur.execute('SELECT id FROM source WHERE name = %s', [source])
    source_id = cur.fetchone()[0]
    cur.execute(f'''UPDATE news SET position = NULL WHERE source_id = %s''', [source_id])

    for i, url in enumerate(urls):
        cur.execute(f'''UPDATE news SET position = %s WHERE url = %s''', [i, url])


if __name__ == '__main__':
    pg_user = os.getenv("POSTGRES_USER")
    pg_host = 'news-database'
    pg_db = os.getenv("POSTGRES_DB")
    with open('/run/secrets/postgres-password', 'r') as fp:
        pg_password = fp.read().strip()
    dsn = f'postgres://{pg_user}:{urllib.parse.quote(pg_password)}@{pg_host}/{pg_db}'
    backend = get_backend(dsn)
    migrations = read_migrations(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'migrations'))

    with backend.lock():
        backend.apply_migrations(backend.to_apply(migrations))

    pika_connection = pika.BlockingConnection(pika.ConnectionParameters(host='news-queue'))
    channel = pika_connection.channel()
    pg_connection = psycopg2.connect(dsn)
    channel.queue_declare(queue='item', durable=True)
    for method_frame, properties, body in channel.consume('item'):
        obj = json.loads(body.decode('utf-8'))
        cur = pg_connection.cursor()
        if 'url' in obj:
            update_article(cur, obj)
        elif 'homepage' in obj:
            update_homepage(cur, obj['source'], obj['homepage'])
            cur.execute('''DELETE FROM updated''')
            cur.execute('''INSERT INTO updated (time) VALUES (NOW())''')
        channel.basic_ack(method_frame.delivery_tag)
        pg_connection.commit()
