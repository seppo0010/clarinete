FROM opus-mt-base

RUN apt-get update && \
        apt-get install -y wget unzip && \
        cd /usr/src/app &&\
        mkdir -p "./models/en-es/" && \
        cd "./models/en-es/" && \
        wget -q https://object.pouta.csc.fi/OPUS-MT-models/en-es/opus-2019-12-04.zip && \
        unzip opus-2019-12-04.zip && \
        cd /usr/src/app &&\
        mkdir -p "./models/es-en/" && \
        cd "./models/es-en/" && \
        wget -q https://object.pouta.csc.fi/OPUS-MT-models/es-en/opus-2019-12-04.zip && \
        unzip opus-2019-12-04.zip && \
        apt-get remove unzip wget -y && \
        rm opus-2019-12-04.zip && \
        rm -rf /var/lib/apt/lists/*

RUN echo '{"en":{"es":{"configuration":"./models/en-es/decoder.yml","sourcebpe":"./models/en-es/source.bpe","host":"localhost","port":"10001"}},"es":{"en":{"configuration":"./models/es-en/decoder.yml","sourcebpe":"./models/es-en/source.bpe","host":"localhost","port":"10002"}}}' > services.json
