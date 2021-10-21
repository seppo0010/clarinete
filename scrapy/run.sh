#!/bin/bash
set -Eeux

while true; do
    /scrapy/run-once.sh
    sleep 1800
done
