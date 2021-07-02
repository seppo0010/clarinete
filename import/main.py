import sys
import jsonlines
import sqlite3

def update_article(cur, obj):
    cur.execute('''INSERT INTO news (url) VALUES (?) ON CONFLICT DO NOTHING''', [obj['url']])
    for k in 'section', 'source':
        if k in obj and obj[k]:
            cur.execute(f'''INSERT INTO {k} (name) VALUES (?) ON CONFLICT DO NOTHING''', [obj[k]])
            cur.execute(f'''UPDATE news SET {k}_id = (SELECT id FROM {k} WHERE name = ?) WHERE url = ?''', [
                obj[k],
                obj['url']
            ])
    for f in 'title', 'volanta', 'image', 'content', 'date':
        if obj.get(f, None) is None:
            continue
        cur.execute(f'''UPDATE news SET {f} = ? WHERE url = ?''',
            [
                obj[f],
                obj['url'],
            ]
        )

def update_homepage(cur, source, urls):
    cur.execute('SELECT id FROM source WHERE name = ?', [source])
    source_id = cur.fetchone()[0]
    cur.execute(f'''UPDATE news SET position = NULL WHERE source_id = ?''', [source_id])

    for i, url in enumerate(urls):
        cur.execute(f'''UPDATE news SET position = ? WHERE url = ?''', [i, url])


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.stderr.write(f'usage: {sys.argv[0]} <input json lines> <sqlite database>\n')
        sys.exit(1)

    con = sqlite3.connect(sys.argv[2])
    cur = con.cursor()

    with (jsonlines.open(sys.argv[1]) if sys.argv[1] != '-' else jsonlines.Reader(sys.stdin)) as reader:
        for obj in reader:
            if 'url' in obj:
                update_article(cur, obj)
            elif 'homepage' in obj:
                update_homepage(cur, obj['source'], obj['homepage'])
    cur.execute('''DELETE FROM updated''')
    cur.execute('''INSERT INTO updated (time) VALUES (strftime('%Y-%m-%d %H:%M:%S', datetime('now')))''')
    con.commit()
