"""

"""

from yoyo import step

__depends__ = {'20210726_01_JjxwD'}

steps = [
    step(
        "ALTER TABLE news ADD COLUMN created_at TIMESTAMP",
        "ALTER TABLE news DROP COLUMN created_at",
    ),
    step(
        "ALTER TABLE news ALTER COLUMN created_at SET DEFAULT now();",
    ),
]
