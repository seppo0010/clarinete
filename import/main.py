import sys
import jsonlines
import sqlite3

def update_article(cur, obj):
    cur.execute('''INSERT INTO news (url) VALUES (?) ON CONFLICT DO NOTHING''', [obj['url']])
    if 'section' in obj and obj['section']:
        cur.execute('''INSERT INTO section (name) VALUES (?) ON CONFLICT DO NOTHING''', [obj['section']])
        cur.execute('''UPDATE news SET section_id = (SELECT id FROM section WHERE name = ?) WHERE url = ?''', [
            obj['section'],
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

def update_hompage(cur, urls):
    cur.execute(f'''UPDATE news SET position = NULL''')

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
                update_hompage(cur, obj['homepage'])
    cur.execute('''INSERT INTO updated (time) VALUES (strftime('%Y-%m-%d %H:%M:%S', datetime('now')))''')
    con.commit()
