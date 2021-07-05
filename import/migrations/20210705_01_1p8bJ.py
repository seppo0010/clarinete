"""

"""

from yoyo import step

__depends__ = {'20210702_02_ekIEY'}

steps = [
    step(
        "ALTER TABLE news ALTER COLUMN title TYPE TEXT",
        "ALTER TABLE news ALTER COLUMN title TYPE VARCHAR(255)",
    ),
    step(
        "ALTER TABLE news ALTER COLUMN volanta TYPE TEXT",
        "ALTER TABLE news ALTER COLUMN volanta TYPE VARCHAR(255)",
    ),
    step(
        "ALTER TABLE news ALTER COLUMN image TYPE TEXT",
        "ALTER TABLE news ALTER COLUMN image TYPE VARCHAR(255)",
    ),
]
