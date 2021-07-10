from datetime import datetime
import scrapy
import lxml
from lxml.html.clean import Cleaner
import re


SOURCE = 'Ambito Financiero'
cleaner = Cleaner(allow_tags=['p', 'br', 'b', 'a', 'strong', 'i', 'em'])
class LanacionSpider(scrapy.Spider):
    name = 'ambitofinanciero'
    allowed_domains = ['www.ambito.com']
    start_urls = ['https://www.ambito.com/']

    def parse(self, response):
        urls = []
        for article in response.css('article'):
            link = article.css('.title a')
            url = link.attrib.get('href', None)
            if not url:
                continue
            if not url.startswith('http'):
                url = 'https://www.ambito.com' + url
            urls.append(url)

            maybe_img = article.css('figure img')
            obj = {
                'title': article.css('.title a::text').get(),
                'volanta': (article.css('span.article-kicker::text').get() or '').strip(),
                'section': url.split('/')[3],
                'url': url,
                'image': maybe_img.attrib.get('data-td-src-property', maybe_img.attrib.get('src', None)) if maybe_img else None,
                'source': SOURCE,
            }

            yield obj
            request = scrapy.Request(url, callback=self.parse_article, cb_kwargs=dict(url=url))
            yield request
        yield {'homepage': urls, 'source': SOURCE}

    def parse_article(self, response, url):
        html = ''.join(response.xpath('//section[contains(@class, \'detail-body\')]').extract())
        if not html:
            return
        content = lxml.html.tostring(cleaner.clean_html(lxml.html.fromstring(html))).decode('utf-8')

        date = response.css('time.date::text').get().strip()
        date_fragments = re.match(r'^([0-9]{1,2}) ([A-Za-z]+) ([0-9]{4})(?: - ([0-9]{1,2}):([0-9]{2}))?$', date)
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
        month = months[date_fragments.group(2).lower()]
        year = int(date_fragments.group(3))
        hour = int(date_fragments.group(4) or 0)
        minute = int(date_fragments.group(5) or 0)
        date = datetime(year, month, day, hour, minute)

        obj = {
            'url': url,
            'content': content,
            'date': date.isoformat()
        }

        yield obj
