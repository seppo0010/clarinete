from datetime import datetime
import scrapy
import lxml
from lxml.html.clean import Cleaner
import re


SOURCE = 'La Nación'
LANGUAGE = 'es'
cleaner = Cleaner(allow_tags=['p', 'br', 'b', 'a', 'strong', 'i', 'em'])
class LanacionSpider(scrapy.Spider):
    name = 'lanacion'
    allowed_domains = ['www.lanacion.com.ar']

    def start_requests(self):
        url = getattr(self, 'article_url', None)
        if url is not None:
            yield scrapy.Request(url, callback=self.parse_article, cb_kwargs=dict(url=url))
        else:
            yield scrapy.Request('http://www.lanacion.com.ar/')

    def parse(self, response):
        urls = []
        for article in response.css('article'):
            link = article.css('a')
            url = link.attrib['href']
            if not url:
                continue
            if not url.startswith('http'):
                url = 'https://www.lanacion.com.ar' + url
            urls.append(url)

            maybe_img = article.css('figure picture img')
            obj = {
                'title': article.css('h1 a::text, h2 a::text').get(),
                'volanta': article.css('h1 em::text, h2 em::text').get('').strip(),
                'section': url.split('/')[3],
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
        html = ''.join(response.xpath('//div/p[@class="com-paragraph   --s" or @class="com-paragraph  --capital --s"]').extract())
        if not html:
            return
        content = lxml.html.tostring(cleaner.clean_html(lxml.html.fromstring(html))).decode('utf-8')

        date = response.css('time.com-date::text').get().strip()
        date_fragments = re.match(r'^([0-9]{1,2}) de ([a-z]+) de ([0-9]{4})$', date)
        time = (response.css('time.com-hour::text').get() or '').strip()
        time_fragments = re.match(r'^([0-9]{1,2}):([0-9]{2})$', time)
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
        day = int(date_fragments.group(1))
        month = months[date_fragments.group(2)]
        year = int(date_fragments.group(3))
        hour = int(time_fragments.group(1)) if time_fragments is not None else 0
        minute = int(time_fragments.group(2)) if time_fragments is not None else 0
        date = datetime(year, month, day, hour, minute)

        obj = {
            'url': url,
            'content': content,
            'date': date.isoformat()
        }

        yield obj
