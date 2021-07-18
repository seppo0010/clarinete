"""

"""

from yoyo import step

__depends__ = {'20210718_01_r3QS4'}

steps = [
    step(
        "CREATE TABLE entities ( id SERIAL, name VARCHAR(511), entity_type VARCHAR(10), canonical_id INTEGER )",
        "DROP TABLE entities",
    ),
    step(
        "CREATE TABLE news_entities ( url VARCHAR(511), entity_id INTEGER )",
        "DROP TABLE news_entities",
    ),
    step(
        "CREATE UNIQUE INDEX entities_name ON entities (name)",
        "DROP INDEX entities_name",
    ),
    step(
        "CREATE UNIQUE INDEX news_entities_id ON news_entities (url, entity_id)",
        "DROP INDEX news_entities_id",
    ),
]
