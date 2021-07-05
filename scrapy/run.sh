#!/bin/bash
set -Eeux

while true; do
    /scrapy/runonce.sh
    sleep 900
done
