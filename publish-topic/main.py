from datetime import datetime, timedelta
import json
import os

import redis
from telethon import TelegramClient


TREND_CAN_REPEAT_AFTER = timedelta(days=1)
NEW_TRENDS_KEY = 'new_trends'
CAN_REPEAT_KEY = 'trends_publish_history'

def get_trends_db():
    return redis.Redis(host='trends-database', port=6379, db=0)

def get_telegram_client():
    with open('/run/secrets/telegram-api-token', 'r') as fp:
        api_token = fp.read().strip()
    with open('/run/secrets/telegram-bot-token', 'r') as fp:
        bot_token = fp.read().strip()
    api_id, api_hash = api_token.split(':')
    return TelegramClient(
        'bot',
        api_id=int(api_id),
        api_hash=api_hash,
    ).start(bot_token=bot_token)


def wait_for_new_trends(con):
    pubsub = con.pubsub()
    pubsub.subscribe(NEW_TRENDS_KEY)
    for message in pubsub.listen():
        if message['type'] == 'message':
            return [json.loads(x) for x in json.loads(message['data']).keys()]

def clean_old_topics(con, now):
    con.zremrangebyscore(CAN_REPEAT_KEY, '-inf', (now - TREND_CAN_REPEAT_AFTER).strftime('%s'))

def get_published_topics(con):
    return [x.decode('utf-8') for x in con.zrangebyscore(CAN_REPEAT_KEY, '-inf', '+inf')]

def choose_topic(topics, published_topics):
    for topic in topics:
        if topic['name'] not in published_topics:
            return topic
        published_topics.append(topic['name'])
        for rtopic in topic['related_topics']:
            published_topics.append(rtopic)

async def publish_topic(con, telegram_client, topic, now):
    con.zadd(CAN_REPEAT_KEY, {topic['name']: now.strftime('%s')})
    await telegram_client.send_message(os.getenv('TELEGRAM_CHANNEL'), topic['url'])

async def main(telegram_client):
    now = datetime.now()
    redis_con = get_trends_db()
    topics = wait_for_new_trends(redis_con)
    clean_old_topics(redis_con, now)
    published_topics = get_published_topics(redis_con)
    topic = choose_topic(topics, published_topics)
    if topic is None:
        return
    await publish_topic(redis_con, telegram_client, topic, now)

if __name__ == '__main__':
    telegram_client = get_telegram_client()
    with telegram_client:
        telegram_client.loop.run_until_complete(main(telegram_client))
