FROM nvidia/cuda:11.4.0-runtime-ubuntu20.04 AS publish-topic

RUN apt-get update && apt-get install -y pipenv && rm -rf /var/lib/apt/lists/*
COPY Pipfile* /publish-topic/
RUN pip install pipenv && cd /publish-topic && pipenv install --system --deploy --ignore-pipfile

COPY . /publish-topic

CMD /publish-topic/run.sh
