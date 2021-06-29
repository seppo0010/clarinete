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
        cur.execute('''INSERT INTO sections (name) VALUES (?)''', [obj['section']])
        cur.execute('''INSERT INTO news (url, title, volanta, section_id, image) VALUES (?, ?, ?, ?, ?)''',
            [
                obj['url'],
                obj['title'],
                obj['volanta'],
                section_id,
                obj['image'],
            ]
        )
        break
