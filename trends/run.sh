#!/bin/bash
set -Eeux

while true; do
    /trends/run-once.sh
    sleep 900
done
