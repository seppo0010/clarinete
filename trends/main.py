import datetime
import os
import psycopg2
import psycopg2.extras
import urllib

import pandas as pd
import redis
import pmdarima as pm

A_PRIORI_LENGTH = 40
PERIOD_LENGTH = datetime.timedelta(days=1)
NUM_PERIODS = 14
CONFIDENCE = 0.6

def get_news_db():
    pg_user = os.getenv("POSTGRES_USER")
    pg_host = 'news-database'
    pg_db = os.getenv("POSTGRES_DB")
    with open('/run/secrets/postgres-password', 'r') as fp:
        pg_password = fp.read().strip()
    dsn = f'postgres://{pg_user}:{urllib.parse.quote(pg_password)}@{pg_host}/{pg_db}'

    return psycopg2.connect(dsn)

def get_trends_db():
    return redis.Redis(host='trends-database', port=6379, db=0)


def get_apriori_topics(now):
    con = get_news_db()
    cur = con.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute(f'''
    SELECT entities.id, entities.name, COUNT(*) AS q FROM (
    SELECT entities.id, entities.name
    FROM news_entities
        INNER JOIN entities ON news_entities.entity_id = COALESCE(entities.canonical_id, entities.id)
            AND entities.canonical_id is null
        INNER JOIN news USING (url)
        INNER JOIN source ON news.source_id = source.id
        WHERE created_at BETWEEN %s AND %s
        -- blacklist self references
        AND (source.name != 'Ámbito Financiero' OR entities.name != 'Ámbito')
        AND (LOWER(source.name) != LOWER(entities.name))

        -- blacklist common words, not proper nouns
        AND LOWER(entities.name) != 'él'
        AND LOWER(entities.name) != 'nadie'
    ) entities
    GROUP BY entities.id, entities.name
    ORDER BY q DESC
    LIMIT {A_PRIORI_LENGTH}
    ''', [now - PERIOD_LENGTH, now])
    entities = pd.DataFrame(cur.fetchall())
    return entities

def get_max_count_expected(id, now):
    con = get_news_db()
    data = []
    for dt in range(-NUM_PERIODS, 0):
        sql = '''
        SELECT COUNT(*)
        FROM news
            JOIN news_entities ON news.url = news_entities.url
            JOIN entities ON news_entities.entity_id = entities.id
        WHERE
            created_at IS NOT NULL
            AND created_at BETWEEN %s AND %s
            AND COALESCE(entities.canonical_id, entities.id) = %s
        '''
        cur = con.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(sql, [
            now + PERIOD_LENGTH * dt,
            now + PERIOD_LENGTH * (dt + 1),
            id,
        ])
        data.append(cur.fetchone()['count'])

    est = pm.arima.ARIMA((2,1,0))
    est.fit(data)
    return est.predict(1, return_conf_int=True, alpha=1 - CONFIDENCE)[1][0][1]

def update_trends(now):
    topic = get_apriori_topics(now)
    topic.loc[:, 'max_expected'] = topic['id'].apply(lambda id: get_max_count_expected(id, now))

    vals = {x['id']: x['max_expected'] - x['q'] for x in topic.T.to_dict().values()}
    con = get_trends_db()
    con.delete('trends')
    con.zadd('trends', vals)
    return topic

if __name__ == '__main__':
    now = datetime.datetime.now()
    print(update_trends(now))
