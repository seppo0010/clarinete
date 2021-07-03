FROM ubuntu:20.04

RUN apt-get update && apt-get install -y pipenv && rm -rf /var/lib/apt/lists/*
COPY Pipfile* /import/
RUN pip install pipenv && cd /import && pipenv install --system --deploy --ignore-pipfile
RUN python3 -c "from transformers import pipeline;pipeline('sentiment-analysis', model='cardiffnlp/twitter-roberta-base-emotion'); pipeline('translation_en_to_es', model='Helsinki-NLP/opus-mt-en-es'); pipeline('translation_es_to_en', model='Helsinki-NLP/opus-mt-es-en'); pipeline('summarization')"

COPY . /import
