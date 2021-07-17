from datetime import datetime
import scrapy
import lxml
from lxml.html.clean import Cleaner
import re


SOURCE = 'La Tercera'
LANGUAGE = 'es'
cleaner = Cleaner(allow_tags=['p', 'br', 'b', 'a', 'strong', 'i', 'em'])
class LanacionSpider(scrapy.Spider):
    name = 'latercera'
    allowed_domains = ['www.latercera.com']

    def start_requests(self):
        url = getattr(self, 'article_url', None)
        if url is not None:
            yield scrapy.Request(url, callback=self.parse_article, cb_kwargs=dict(url=url))
        else:
            yield scrapy.Request('https://www.latercera.com/')

    def parse(self, response):
        urls = []
        for article in response.css('article'):
            link = article.css('a')
            url = link.attrib['href']
            if not url:
                continue
            if not url.startswith('http'):
                url = 'https://www.latercera.com' + url
            urls.append(url)

            maybe_img = article.css('figure picture img')
            title = lxml.html.fromstring(article.css('.headline a').get(''))
            cleaner = Cleaner(allow_tags=[''], remove_unknown_tags=False)
            truetitle = cleaner.clean_html(title).text_content().strip()
            obj = {
                'title': truetitle,
                'volanta': article.css('.headline a span::text').get('').strip(),
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
        html = ''.join(response.xpath('//div[@class="single-content"]/p').extract())
        if not html:
            return
        content = lxml.html.tostring(cleaner.clean_html(lxml.html.fromstring(html))).decode('utf-8')

        date = response.css('time').attrib['datetime']
        date_fragments = re.match(r'^.{3} ([A-Za-z]+) ([0-9]{1,2}) ([0-9]{4}) ([0-9]{1,2}):([0-9]{2})', date)
        months = {
            'Jan': 1,
            'Feb': 2,
            'Mar': 3,
            'Apr': 4,
            'May': 5,
            'Jun': 6,
            'Jul': 7,
            'Aug': 8,
            'Sep': 9,
            'Oct': 10,
            'Nov': 11,
            'Dec': 12,
        }
        day = int(date_fragments.group(2))
        month = months[date_fragments.group(1)]
        year = int(date_fragments.group(3))
        hour = int(date_fragments.group(4))
        minute = int(date_fragments.group(5))
        date = datetime(year, month, day, hour, minute)

        obj = {
            'url': url,
            'content': content,
            'date': date.isoformat()
        }

        yield obj
