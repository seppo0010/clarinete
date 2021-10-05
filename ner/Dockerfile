FROM ubuntu:20.04 AS ner

RUN apt-get update && apt-get install -y pipenv && rm -rf /var/lib/apt/lists/*
COPY Pipfile* /ner/
RUN pip install pipenv && cd /ner && pipenv install --system --deploy --ignore-pipfile
RUN python3 -m spacy download es_core_news_lg
RUN python3 -m spacy download en_core_web_lg

COPY main.py /ner
COPY ner /ner/ner

CMD python3 /ner/main.py

FROM ner AS ner_test
COPY . /ner
CMD cd /ner && python3 -m unittest discover
