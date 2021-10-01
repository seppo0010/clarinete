"""

"""

from yoyo import step

__depends__ = {'20210918_02_XjT2u'}

steps = [
    step(
        "ALTER TABLE news_entities ADD COLUMN is_title INTEGER NOT NULL DEFAULT 0",
        "ALTER TABLE news_entities DROP COLUMN is_title",
    )
]
