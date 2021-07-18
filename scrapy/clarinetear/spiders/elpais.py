from datetime import datetime
import scrapy
import lxml
from lxml.html.clean import Cleaner
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
        for article in response.css('article'):
            link = article.css('a')
            url = link.attrib['href']
            if not url:
                continue
            if not url.startswith('http'):
                url = 'https://www.elpais.com.uy' + url
            urls.append(url)

            maybe_img = article.css('.image-container img')
            obj = {
                'title': article.css('.title a::text').get(''),
                'volanta': article.css('.supratitle a::text').get('').strip(),
                'section': article.css('.category a::text').get('').strip(),
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
        html = ''.join(response.xpath('//div[@class="article-content"]//p').extract())
        if not html:
            return
        content = lxml.html.tostring(cleaner.clean_html(lxml.html.fromstring(html))).decode('utf-8')

        date = response.css('#article-published-at-date').attrib['data-published-at-date']
        date_fragments = re.match(r'^.+, ([0-9]{1,2}) ([a-z]+) ([0-9]{4}) ([0-9]{1,2}):([0-9]{2})$', date)
        months = {
            'enero': 1,
            'febrero': 2,
            'marzo': 3,
            'abril': 4,
            'mayo': 5,
            'junio': 6,
            'julio': 7,
            'agosto': 8,
            'septiembre': 9,
            'octubre': 10,
            'noviembre': 11,
            'diciembre': 12,
        }
        if date_fragments is not None:
            day = int(date_fragments.group(1))
            month = months[date_fragments.group(2)]
            year = int(date_fragments.group(3))
            hour = int(date_fragments.group(4))
            minute = int(date_fragments.group(5))
            date = datetime(year, month, day, hour, minute)
            obj = {
                'url': url,
                'content': content,
                'date': date.isoformat()
            }
        else:
            obj = {
                'url': url,
                'content': content,
            }

        yield obj
