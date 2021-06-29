import sys
import jsonlines
import sqlite3

if len(sys.argv) != 3:
    sys.stderr.write(f'usage: {sys.argv[0]} <input json lines> <sqlite database>\n')
    sys.exit(1)

con = sqlite3.connect(sys.argv[2])
cur = con.cursor()
with jsonlines.open(sys.argv[1]) as reader:
    for obj in reader:
        if not 'url' in obj:
            continue
        cur.execute('''INSERT INTO news (url) VALUES (?) ON CONFLICT DO NOTHING''', [obj['url']])
        if 'section' in obj and obj['section']:
            cur.execute('''INSERT INTO section (name) VALUES (?) ON CONFLICT DO NOTHING''', [obj['section']])
            cur.execute('''UPDATE news SET section_id = (SELECT id FROM section WHERE name = ?) WHERE url = ?''', [
                obj['section'],
                obj['url']
            ])
        for f in 'title', 'volanta', 'image', 'content':
            if not f in obj:
                continue
            cur.execute(f'''UPDATE news SET {f} = ? WHERE url = ?''',
                [
                    obj[f],
                    obj['url'],
                ]
            )
con.commit()
