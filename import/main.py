import os
import pika
import sqlite3
import json
from yoyo import read_migrations
from yoyo import get_backend


def update_article(cur, obj):
    cur.execute('''INSERT INTO news (url) VALUES (?) ON CONFLICT DO NOTHING''', [obj['url']])
    for k in 'section', 'source':
        if k in obj and obj[k]:
            cur.execute(f'''INSERT INTO {k} (name) VALUES (?) ON CONFLICT DO NOTHING''', [obj[k]])
            cur.execute(f'''UPDATE news SET {k}_id = (SELECT id FROM {k} WHERE name = ?) WHERE url = ?''', [
                obj[k],
                obj['url']
            ])

    changed_text = False
    for f in 'title', 'volanta', 'image', 'content', 'date':
        if obj.get(f, None) is None:
            continue
        cur.execute(f'''UPDATE news SET {f} = ? WHERE url = ? AND ({f} IS NULL OR {f} != ?)''',
            [
                obj[f],
                obj['url'],
                obj[f],
            ]
        )

def update_homepage(cur, source, urls):
    cur.execute('SELECT id FROM source WHERE name = ?', [source])
    source_id = cur.fetchone()[0]
    cur.execute(f'''UPDATE news SET position = NULL WHERE source_id = ?''', [source_id])

    for i, url in enumerate(urls):
        cur.execute(f'''UPDATE news SET position = ? WHERE url = ?''', [i, url])


if __name__ == '__main__':
    db = os.getenv('CLARINETE_DATABASE', '/database/news.db')
    con = sqlite3.connect(db)

    backend = get_backend('sqlite:///' + db)
    migrations = read_migrations(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'migrations'))

    with backend.lock():
        backend.apply_migrations(backend.to_apply(migrations))

    connection = pika.BlockingConnection(pika.ConnectionParameters(host='scrapy-queue'))
    channel = connection.channel()
    for method_frame, properties, body in channel.consume('item'):
        obj = json.loads(body.decode('utf-8'))
        cur = con.cursor()
        if 'url' in obj:
            update_article(cur, obj)
        elif 'homepage' in obj:
            update_homepage(cur, obj['source'], obj['homepage'])
            cur.execute('''DELETE FROM updated''')
            cur.execute('''INSERT INTO updated (time) VALUES (strftime('%Y-%m-%d %H:%M:%S', datetime('now')))''')
        channel.basic_ack(method_frame.delivery_tag)
        con.commit()
