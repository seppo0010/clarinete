FROM ubuntu:20.04

RUN apt-get update && apt-get install -y pipenv && rm -rf /var/lib/apt/lists/*
COPY Pipfile* /trends/
RUN pip install pipenv && cd /trends && pipenv install --system --deploy --ignore-pipfile

COPY . /trends
CMD cd /trends && ./run.sh
