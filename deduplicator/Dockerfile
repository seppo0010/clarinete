FROM nvidia/cuda:11.2.0-runtime-ubuntu20.04 AS deduplicator

RUN apt-get update && apt-get install -y pipenv && rm -rf /var/lib/apt/lists/*
COPY Pipfile* /deduplicator/
RUN pip install pipenv && cd /deduplicator && pipenv install --system --deploy --ignore-pipfile
RUN python3 -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/paraphrase-xlm-r-multilingual-v1')"

COPY main.py /deduplicator
COPY deduplicator /deduplicator/deduplicator

CMD python3 /deduplicator/main.py

FROM deduplicator AS deduplicator_test
COPY . /deduplicator
CMD cd /deduplicator && python3 -m unittest discover
