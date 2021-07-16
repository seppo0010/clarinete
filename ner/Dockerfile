FROM nvidia/cuda:11.2.0-runtime-ubuntu20.04 AS ner

RUN apt-get update && apt-get install -y pipenv && rm -rf /var/lib/apt/lists/*
COPY Pipfile* /ner/
RUN pip install pipenv && cd /ner && pipenv install --system --deploy --ignore-pipfile
RUN python3 -m spacy download en_core_web_lg &&\
    python3 -m spacy download es_core_news_lg

COPY main.py /ner/

CMD python3 /ner/main.py
