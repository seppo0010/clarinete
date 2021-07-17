import scrapy
import pika
from scrapy.crawler import CrawlerProcess
from clarinetear.spiders.clarin import ClarinSpider
import logging
import json
import traceback

QUEUE_KEY = 'scrapy-queue'

def get_module_logger(mod_name):
    logger = logging.getLogger(mod_name)
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        '%(asctime)s [%(name)-12s] %(levelname)-8s %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.DEBUG)
    return logger
logger = get_module_logger(__name__)


if __name__ == '__main__':
    pika_connection = pika.BlockingConnection(pika.ConnectionParameters(host='news-queue', heartbeat=600, blocked_connection_timeout=30000))
    channel = pika_connection.channel()
    channel.basic_qos(prefetch_count=1)
    channel.queue_declare(queue=QUEUE_KEY, durable=True)
    for method_frame, properties, body in channel.consume(QUEUE_KEY):
        # at most once delivery
        channel.basic_ack(method_frame.delivery_tag)
        try:
            obj = json.loads(body.decode('utf-8'))
            c = CrawlerProcess()
            c.crawl(ClarinSpider, article_url=obj['url'])
            c.start()
        except:
            traceback.print_exc()
        break
