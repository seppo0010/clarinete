from datetime import datetime
import scrapy
import lxml
from lxml.html.clean import Cleaner
import re


SOURCE = 'Página 12'
cleaner = Cleaner(allow_tags=['p', 'br', 'b', 'a', 'strong', 'i', 'em'])
class Pagina12Spider(scrapy.Spider):
    name = 'pagina12'
    allowed_domains = ['www.pagina12.com.ar']
    start_urls = ['https://www.pagina12.com.ar/']

    def parse(self, response):
        urls = []
        for article in response.css('article'):
            link = article.css('a')
            url = link.attrib['href']
            if not url:
                continue
            if not url.startswith('http'):
                url = 'https://www.pagina12.com.ar' + url
            urls.append(url)

            maybe_img = article.css('img.show-for-large-only')
            obj = {
                'title': article.css('.article-title a::text, a .title::text').get(),
                'volanta': (article.css('.article-title a .title-prefix::text').get() or '').strip(),
                'url': url,
                'image': maybe_img.attrib['src'] if maybe_img else None,
                'source': SOURCE,
            }

            yield obj
            request = scrapy.Request(url, callback=self.parse_article, cb_kwargs=dict(url=url))
            yield request
        yield {'homepage': urls, 'source': SOURCE}

    def parse_article(self, response, url):
        html = ''.join(response.xpath('//div[@class="article-main-content article-text "]/p').extract())
        if not html:
            return
        content = lxml.html.tostring(cleaner.clean_html(lxml.html.fromstring(html))).decode('utf-8')

        date = response.css('div.date span::text').get().strip()
        date_fragments = re.match(r'^([0-9]{1,2}) de ([a-z]+) de ([0-9]{4})$', date)
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
        hour = 0
        minute = 0
        date = datetime(year, month, day, hour, minute)

        obj = {
            'url': url,
            'content': content,
            'date': date.isoformat()
        }

        yield obj
