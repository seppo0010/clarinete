from datetime import datetime
import scrapy
import lxml
from lxml.html.clean import Cleaner

SOURCE = 'Clarín'
LANGUAGE = 'es'
cleaner = Cleaner(allow_tags=['p', 'br', 'b', 'a', 'strong', 'i', 'em'])
class ClarinSpider(scrapy.Spider):
    name = 'clarin'
    allowed_domains = ['clarin.com']

    def start_requests(self):
        url = getattr(self, 'article_url', None)
        if url is not None:
            yield scrapy.Request(url, callback=self.parse_article, cb_kwargs=dict(url=url))
        else:
            yield scrapy.Request('http://clarin.com/')

    def parse(self, response):
        urls = []
        for article in response.css('article'):
            try:
                url = article.css('a').attrib['href']
            except:
                url = None
                pass
            if not url:
                continue
            if not url.startswith('http'):
                url = 'https://clarin.com' + url
            urls.append(url)

            maybe_img = article.css('figure img')
            obj = {
                'title': article.css('h1::text, h2::text').get(),
                'volanta': article.css('.volanta::text').get(),
                'section': article.css('.section::text').get(),
                'url': url,
                'image': maybe_img.attrib['data-big'] if maybe_img else None,
                'source': SOURCE,
                'source_language': LANGUAGE,
            }

            yield obj
            request = scrapy.Request(url, callback=self.parse_article, cb_kwargs=dict(url=url))
            yield request
        yield {'source': SOURCE, 'homepage': urls}

    def parse_article(self, response, url):
        html = ''.join(response.xpath('//div[@class="body-nota"]/p').extract())
        if not html:
            return
        content = lxml.html.tostring(cleaner.clean_html(lxml.html.fromstring(html))).decode('utf-8')

        modificated_date = response.css('.modificatedDate::text').get().strip()
        if not modificated_date:
            raise ValueError('no modificated date')
        modificated_date_prefix = 'Actualizado al '
        if not modificated_date.startswith(modificated_date_prefix):
            raise ValueError('modificated date does not start with ' + modificated_date_prefix)
        modificated_date = modificated_date[len(modificated_date_prefix):]
        date = datetime.strptime(modificated_date, '%d/%m/%Y %H:%M')

        obj = {
            'url': url,
            'content': content,
            'date': date.isoformat()
        }

        yield obj
