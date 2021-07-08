FROM ubuntu:20.04

RUN apt-get update && apt-get install -y pipenv && rm -rf /var/lib/apt/lists/*
COPY Pipfile* /summarizer/
RUN pip install pipenv && cd /summarizer && pipenv install --system --deploy --ignore-pipfile
RUN python3 -c "from transformers import pipeline;pipeline('sentiment-analysis', model='distilbert-base-uncased-finetuned-sst-2-english'); pipeline('translation_en_to_es', model='Helsinki-NLP/opus-mt-en-es'); pipeline('translation_es_to_en', model='Helsinki-NLP/opus-mt-es-en'); pipeline('summarization')"

COPY . /summarizer

CMD python3 /summarizer/main.py
