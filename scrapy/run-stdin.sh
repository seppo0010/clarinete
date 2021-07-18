#!/bin/bash
set -Eeux

cd /scrapy
while read line
do
    scrapy runspider -L WARNING clarinetear/spiders/clarin.py -a article_url=$line
    scrapy runspider -L WARNING clarinetear/spiders/lanacion.py -a article_url=$line
    scrapy runspider -L WARNING clarinetear/spiders/ambitofinanciero.py -a article_url=$line
    scrapy runspider -L WARNING clarinetear/spiders/pagina12.py -a article_url=$line
    scrapy runspider -L WARNING clarinetear/spiders/elpais.py -a article_url=$line
    scrapy runspider -L WARNING clarinetear/spiders/latercera.py -a article_url=$line
done < "${1:-/dev/stdin}"
