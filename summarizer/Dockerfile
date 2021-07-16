FROM nvidia/cuda:11.2.0-runtime-ubuntu20.04 AS summarizer

RUN apt-get update && apt-get install -y pipenv && rm -rf /var/lib/apt/lists/*
COPY Pipfile* /summarizer/
RUN pip install pipenv && cd /summarizer && pipenv install --system --deploy --ignore-pipfile
RUN python3 -c "from transformers import pipeline;pipeline('summarization')"

COPY main.py /summarizer
COPY summarizer /summarizer/summarizer

CMD python3 /summarizer/main.py

FROM summarizer AS summarizer_test
COPY . /summarizer
CMD cd /summarizer && python3 -m unittest discover
