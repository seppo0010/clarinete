FROM ubuntu:20.04

RUN apt-get update && apt-get install -y pipenv && rm -rf /var/lib/apt/lists/*
COPY . /scrapy
RUN pip install pipenv && cd /scrapy && pipenv install --system --deploy --ignore-pipfile
