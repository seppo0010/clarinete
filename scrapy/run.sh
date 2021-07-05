#!/bin/bash
set -Eeux

while true; do
    cd /scrapy
    scrapy runspider -L WARNING clarinetear/spiders/clarin.py
    scrapy runspider -L WARNING clarinetear/spiders/lanacion.py
    sleep 900
done
