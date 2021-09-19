"""

"""

from yoyo import step

__depends__ = {'20210806_01_136dJ'}

steps = [
    step(
        'CREATE INDEX news_created_at ON news (created_at)',
    ),
    step(
        'DROP INDEX news_created_at',
    ),
]
