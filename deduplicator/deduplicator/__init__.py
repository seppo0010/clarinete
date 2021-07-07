import logging

from sentence_transformers import SentenceTransformer, util

sentence_encoder = None

def get_module_logger(mod_name):
    logger = logging.getLogger(mod_name)
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        '%(asctime)s [%(name)-12s] %(levelname)-8s %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.DEBUG)
    return logger
logger = get_module_logger(__name__)

def cos_simer(title, alternatives):
    global sentence_encoder
    if sentence_encoder is None:
        sentence_encoder = SentenceTransformer('sentence-transformers/paraphrase-xlm-r-multilingual-v1')
    logger.debug('encoding title: ' + title)
    title_embeddings = sentence_encoder.encode(title)
    embeddings = sentence_encoder.encode(alternatives)
    return util.cos_sim(title_embeddings, embeddings)[0]

def deduplicator(title, alternatives, cos_simer=cos_simer):
    cos_sim = cos_simer(title, alternatives)
    max_cos_sim = max(cos_sim)
    if float(max_cos_sim) > 0.65:
        for a, s in zip(alternatives, cos_sim):
            if s == max_cos_sim:
                logger.info(f'best sentence for {title} ({max_cos_sim:.4f}): {a}')
                return a
    return None
