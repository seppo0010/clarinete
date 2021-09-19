"""

"""

from yoyo import step

__depends__ = {'20210918_01_8OECi'}

steps = [
    step(
        'CREATE INDEX news_entities_entity_id ON news_entities (entity_id)',
    ),
    step(
        'DROP INDEX news_entities_entity_id',
    ),
]
