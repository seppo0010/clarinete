"""

"""

from yoyo import step

__depends__ = {'20210713_01_NnMik', '20210713_01_SEuqI'}

steps = [
    step(
        "ALTER TABLE news ALTER COLUMN canonical_url TYPE VARCHAR(511)",
        "ALTER TABLE news ALTER COLUMN canonical_url TYPE VARCHAR(255)",
    )
]
