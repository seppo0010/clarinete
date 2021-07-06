#!/bin/bash
set -Eeux

while true; do
    /scrapy/run-once.sh
    sleep 900
done
