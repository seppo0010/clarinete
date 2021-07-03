import sys
import jsonlines
import sqlite3
import re
import html
import traceback

from transformers import pipeline

class Models:
    def __init__(self):
        self.sentiment_analysis = None
        self.en_es_translator = None
        self.es_en_translator = None
        self.summarizer = None

    def load(self):
        self.sentiment_analysis = self.sentiment_analysis or pipeline("sentiment-analysis", model="cardiffnlp/twitter-roberta-base-emotion")
        self.en_es_translator = self.en_es_translator or pipeline("translation_en_to_es", model='Helsinki-NLP/opus-mt-en-es')
        self.es_en_translator = self.es_en_translator or pipeline("translation_es_to_en", model='Helsinki-NLP/opus-mt-es-en')
        self.summarizer = self.summarizer or pipeline("summarization")

models = Models()


def cleanhtml(raw_html):
  cleantext = re.sub('<.*?>', '', re.sub('</p.*?>', '\n', raw_html))
  return html.unescape(cleantext)

def get_summary_and_sentiment(text):
    models.load()
    paragraphs = [' '.join(x.strip().split(' ')[:512]) for x in text.split('\n') if x.strip() != '']
    translated = models.es_en_translator(paragraphs)
    translated_str = '\n\n'.join((x['translation_text'] for x in translated))
    summarized_en_list = models.summarizer(translated_str.split('\n\n'), min_length=0, max_length=40)
    summarized = models.summarizer('\n'.join(x['summary_text'] for x in summarized_en_list))[0]['summary_text']
    summarized_es = models.en_es_translator(summarized)[0]['translation_text']
    sentiment = models.sentiment_analysis(summarized)[0]['label']
    return ''.join(summarized_es), sentiment

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
        changed_text = changed_text or (f in ('content', 'title') and cur.rowcount > 0)

    if changed_text:
        cur.execute('SELECT title, content FROM news WHERE url = ?', [obj['url']])
        title, content = cur.fetchone()
        title = title or ''
        content = content or ''
        text = (title + '\n' + cleanhtml(content)).strip()
        if text:
            try:
                summary, sentiment = get_summary_and_sentiment(text)
                s = {
                    'LABEL_0': 1,
                    'LABEL_1': 2,
                    'LABEL_2': 3,
                    'LABEL_3': 4,
                }.get(sentiment, 0)
                cur.execute(f'''UPDATE news SET summary = ?, sentiment = ? WHERE url = ?''', [summary, s, obj['url']])
            except:
                traceback.print_exc()

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
