#!/bin/bash
set -Eeux

while true; do
    cd /scrapy
    scrapy runspider clarinetear/spiders/clarin.py
    scrapy runspider clarinetear/spiders/lanacion.py
    sleep 900
done
