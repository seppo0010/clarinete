FROM ubuntu:20.04

RUN apt-get update && apt-get install -y pipenv && rm -rf /var/lib/apt/lists/*
COPY Pipfile* /import/
RUN pip install pipenv && cd /import && pipenv install --system --deploy --ignore-pipfile

COPY . /import
CMD python3 /import/main.py
