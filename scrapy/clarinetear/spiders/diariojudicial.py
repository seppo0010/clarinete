from datetime import datetime
import scrapy
import lxml
from lxml.html.clean import Cleaner

SOURCE = 'Diario Judicial'
LANGUAGE = 'es'
cleaner = Cleaner(allow_tags=['p', 'br', 'b', 'a', 'strong', 'i', 'em'])
class DiariojudicialSpider(scrapy.Spider):
    name = 'diariojudicial'
    allowed_domains = ['diariojudicial.com']

    def start_requests(self):
        url = getattr(self, 'article_url', None)
        if url is not None:
            yield scrapy.Request(url, callback=self.parse_article, cb_kwargs=dict(url=url))
        else:
            yield scrapy.Request('http://diariojudicial.com/')

    def parse(self, response):
        urls = []
        for article in response.css('.textos, .item'):
            url = article.css('a').attrib['href']
            if not url:
                continue
            if not url.startswith('http'):
                url = 'https://diariojudicial.com' + url
            urls.append(url)

            maybe_img = article.css('figure img')
            obj = {
                'title': article.css('h1::text, h2::text').get(),
                'volanta': article.css('h3::text').get(),
                'section': 'Judiciales',
                'url': url,
                'image': maybe_img.attrib['src'] if maybe_img else None,
                'source': SOURCE,
                'source_language': LANGUAGE,
            }

            yield obj
            request = scrapy.Request(url, callback=self.parse_article, cb_kwargs=dict(url=url))
            yield request
        yield {'source': SOURCE, 'homepage': urls}

    def parse_article(self, response, url):
        html = ''.join(response.xpath('//div[@id="cuerpo-texto"]/p').extract())
        if not html:
            return
        content = lxml.html.tostring(cleaner.clean_html(lxml.html.fromstring(html))).decode('utf-8')

        datestr = response.xpath('//time').attrib['datetime']

        obj = {
            'url': url,
            'content': content,
            'date': datetime.fromisoformat(datestr).isoformat()
        }

        yield obj
