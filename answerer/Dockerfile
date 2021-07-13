FROM nvidia/cuda:11.2.0-runtime-ubuntu20.04

RUN apt-get update && apt-get install -y pipenv && rm -rf /var/lib/apt/lists/*
COPY Pipfile* /answerer/
RUN pip install pipenv && cd /answerer && pipenv install --system --deploy --ignore-pipfile
RUN python3 -c "from transformers import pipeline;pipeline('translation_en_to_es', model='Helsinki-NLP/opus-mt-en-es');pipeline('translation_es_to_en', model='Helsinki-NLP/opus-mt-es-en');pipeline('question-answering', model='bert-large-uncased-whole-word-masking-finetuned-squad')"

COPY . /answerer
CMD python3 /answerer/main.py
