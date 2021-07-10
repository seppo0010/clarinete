#!/bin/bash
set -Eeux

cd /scrapy
scrapy runspider -L WARNING clarinetear/spiders/clarin.py
scrapy runspider -L WARNING clarinetear/spiders/lanacion.py
scrapy runspider -L WARNING clarinetear/spiders/ambitofinanciero.py
scrapy runspider -L WARNING clarinetear/spiders/pagina12.py
scrapy runspider -L WARNING clarinetear/spiders/elpais.py
