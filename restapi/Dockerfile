FROM ubuntu:20.04

RUN apt-get update && apt-get install -y pipenv && rm -rf /var/lib/apt/lists/*
COPY Pipfile* /restapi/
RUN pip install pipenv && cd /restapi && pipenv install --system --deploy --ignore-pipfile
COPY . /restapi

EXPOSE 5000

CMD cd /restapi && python3 main.py /database/news.db
