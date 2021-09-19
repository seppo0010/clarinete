"""

"""

from yoyo import step

__depends__ = {'20210806_01_136dJ'}

steps = [
    step(
        'ALTER TABLE news ADD COLUMN created_at TIMESTAMP',
    ),
    step(
        'CREATE INDEX news_created_at ON news (created_at)',
        'DROP INDEX news_created_at',
    ),
]
