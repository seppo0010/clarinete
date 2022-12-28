from datetime import datetime
import json
import scrapy
import lxml
from lxml.html.clean import Cleaner
import dateutil.parser
import re


SOURCE = 'El País'
LANGUAGE = 'es'
cleaner = Cleaner(allow_tags=['p', 'br', 'b', 'a', 'strong', 'i', 'em'])
class ElpaisSpider(scrapy.Spider):
    name = 'elpais'
    allowed_domains = ['elpais.com.uy']

    def start_requests(self):
        url = getattr(self, 'article_url', None)
        if url is not None:
            yield scrapy.Request(url, callback=self.parse_article, cb_kwargs=dict(url=url))
        else:
            yield scrapy.Request('http://elpais.com.uy')

    def parse(self, response):
        urls = []
        for article in response.css('.PromoBasic, .PromoVisual'):
            link = article.css('a')
            url = link.attrib['href']
            if not url:
                continue
            if not url.startswith('http'):
                url = 'https://www.elpais.com.uy' + url
            urls.append(url)

            maybe_img = article.css('picture img')
            obj = {
                'title': article.css('.Promo-title a::text').get(''),
                'section': article.css('.Promo-category a::text').get('').strip(),
                'url': url,
                'image': maybe_img.attrib['src'] if maybe_img else None,
                'source': SOURCE,
                'source_language': LANGUAGE,
            }

            yield obj
            request = scrapy.Request(url, callback=self.parse_article, cb_kwargs=dict(url=url))
            yield request
        yield {'homepage': urls, 'source': SOURCE}

    def parse_article(self, response, url):
        doc = response.body.decode("utf-8")
        for line in doc.split('\n'):
            if '"@type":"NewsArticle"' not in line: continue
            line = line.replace('<script type="application/ld+json">', '')
            line = line.replace('</script>', '')
            data = json.loads(line)
            date = dateutil.parser.isoparse(data['dateModified'])
            obj = {
                'url': url,
                'content': data['articleBody'],
                'volanta': data.get('description', None),
                'date': date.isoformat()
            }
            yield obj
            break
