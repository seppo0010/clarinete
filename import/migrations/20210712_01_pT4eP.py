"""

"""

from yoyo import step

__depends__ = {'20210709_05_isAqS'}

steps = [
    step(
        "ALTER TABLE section ADD COLUMN category VARCHAR(255)",
        "ALTER TABLE section DROP COLUMN category",
    )
]
