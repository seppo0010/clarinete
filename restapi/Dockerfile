FROM ubuntu:20.04

RUN apt-get update && apt-get install -y pipenv && rm -rf /var/lib/apt/lists/*
COPY . /restapi
RUN pip install pipenv && cd /restapi && pipenv install --system --deploy --ignore-pipfile

EXPOSE 5000

CMD cd /restapi && python3 main.py /database/news.db
