from datetime import datetime
import scrapy
import lxml
from lxml.html.clean import Cleaner

SOURCE = 'El Mundo'
LANGUAGE = 'es'
cleaner = Cleaner(allow_tags=['p', 'br', 'b', 'a', 'strong', 'i', 'em'])
class ClarinSpider(scrapy.Spider):
    name = 'elmundo'
    allowed_domains = ['www.elmundo.es']

    def start_requests(self):
        url = getattr(self, 'article_url', None)
        if url is not None:
            yield scrapy.Request(url, callback=self.parse_article, cb_kwargs=dict(url=url))
        else:
            yield scrapy.Request('https://www.elmundo.es/index.html')

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
                'title': article.css('a.ue-c-cover-content__link::text').get(),
                'volanta': article.css('.ue-c-cover-content__kicker::text').get(),
                'section': None,
                'url': url,
                'image': maybe_img.attrib['src'] if maybe_img and 'src' in maybe_img.attrib else None,
                'source': SOURCE,
                'source_language': LANGUAGE,
            }

            yield obj
            request = scrapy.Request(url, callback=self.parse_article, cb_kwargs=dict(url=url))
            yield request
        yield {'source': SOURCE, 'homepage': urls}

    def parse_article(self, response, url):
        html = ''.join(response.xpath('//article//p').extract())
        if not html:
            return
        title = response.css('h1::text').get()
        content = lxml.html.tostring(cleaner.clean_html(lxml.html.fromstring(html))).decode('utf-8')
        time = response.css('time')
        date = time.attrib['datetime'] if 'datetime' in time.attrib else None

        obj = {
            'url': url,
            'title': title,
            'content': content,
            'date': date,
        }

        yield obj
