"""

"""

from yoyo import step

__depends__ = {'20210718_02_7mTwA'}

steps = [
    step(
        'ALTER TABLE entities ADD COLUMN summary TEXT',
        'ALTER TABLE entities DROP COLUMN summary',
    ),
]
