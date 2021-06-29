"""

"""

from yoyo import step

__depends__ = {'20210629_02_ABiuI'}

steps = [
    step(
        'ALTER TABLE news ADD COLUMN date DATETIME',
    ),
    step(
        'CREATE INDEX news_date ON news (date)',
        'DROP INDEX news_date',
    ),
]
