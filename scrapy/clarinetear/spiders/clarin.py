import scrapy
import lxml
from lxml.html.clean import Cleaner

class ClarinSpider(scrapy.Spider):
    name = 'clarin'
    allowed_domains = ['clarin.com']
    start_urls = ['http://clarin.com/']

    def parse(self, response):
        for article in response.css('article a[onclick]'):
            url = article.attrib['href']
            if not url:
                continue
            if not url.startswith('http'):
                url = 'https://clarin.com' + url
            article.css('.publishedDate::text')
            article.css('.modificatedDate::text')
            maybe_img = article.css('figure img')
            yield {
                'title': article.css('h1::text, h2::text').get(),
                'volanta': article.css('.volanta::text').get(),
                'section': article.css('.section::text').get(),
                'url': url,
                'image': maybe_img.attrib['data-big'] if maybe_img else None,
                'date':
            }
            request = scrapy.Request(url, callback=self.parse_article, cb_kwargs=dict(url=url))
            yield request

    def parse_article(self, response, url):
        html = ''.join(response.xpath('//div[@class="body-nota"]/*').extract())
        cleaner = Cleaner(allow_tags=['p', 'br', 'b', 'a', 'strong', 'i', 'em'])
        yield {
            'url': url,
            'content': lxml.html.tostring(cleaner.clean_html(lxml.html.fromstring(html))).decode('utf-8'),
        }
