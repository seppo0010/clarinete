from datetime import datetime
import scrapy
import lxml
from lxml.html.clean import Cleaner

SOURCE = 'New York Tomes'
LANGUAGE = 'en'
cleaner = Cleaner(allow_tags=['p', 'br', 'b', 'a', 'strong', 'i', 'em'])
class ClarinSpider(scrapy.Spider):
    name = 'newyorktimes'
    allowed_domains = ['nytimes.com']

    def start_requests(self):
        url = getattr(self, 'article_url', None)
        if url is not None:
            yield scrapy.Request(url, callback=self.parse_article, cb_kwargs=dict(url=url))
        else:
            yield scrapy.Request('http://nytimes.com/')

    def parse(self, response):
        urls = []
        for article in response.css('section.story-wrapper'):
            try:
                url = article.css('a').attrib['href']
            except:
                url = None
                pass
            if not url:
                continue
            if not url.startswith('http'):
                url = 'https://nytimes.com' + url
            urls.append(url)

            obj = {
                'title': article.css('h3::text').get(),
                'url': url,
                'image': None,
                'source': SOURCE,
                'source_language': LANGUAGE,
            }

            yield obj
            request = scrapy.Request(url, callback=self.parse_article, cb_kwargs=dict(url=url))
            yield request
        yield {'source': SOURCE, 'homepage': urls}

    def parse_article(self, response, url):
        html = ''.join(response.xpath('//section[@name="articleBody"]//p').extract())
        if not html:
            return
        title = response.css('h1::text').get()
        content = lxml.html.tostring(cleaner.clean_html(lxml.html.fromstring(html))).decode('utf-8')

        date = response.css('time').attrib['datetime']
        obj = {
            'url': url,
            'title': title,
            'content': content,
            'date': date,
        }

        yield obj
