FROM ubuntu:20.04 AS entitier

RUN apt-get update && apt-get install -y pipenv && rm -rf /var/lib/apt/lists/*
COPY Pipfile* /entitier/
RUN pip install pipenv && cd /entitier && pipenv install --system --deploy --ignore-pipfile

COPY main.py /entitier
COPY entitier /entitier/entitier

CMD python3 /entitier/main.py

FROM entitier AS entitier_test
COPY . /entitier
CMD cd /entitier && python3 -m unittest discover
