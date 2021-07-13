FROM nvidia/cuda:11.2.0-runtime-ubuntu20.04

RUN apt-get update && apt-get install -y pipenv && rm -rf /var/lib/apt/lists/*
COPY Pipfile* /summarizer/
RUN pip install pipenv && cd /summarizer && pipenv install --system --deploy --ignore-pipfile
RUN python3 -c "from transformers import pipeline;pipeline('summarization', model='facebook/bart-large-cnn')"

COPY . /summarizer

CMD python3 /summarizer/main.py
