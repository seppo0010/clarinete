"""

"""

from yoyo import step

__depends__ = {'20210709_04_FkaEE'}

steps = [
    step(
        "ALTER TABLE news ALTER COLUMN url TYPE VARCHAR(511)",
        "ALTER TABLE news ALTER COLUMN url TYPE VARCHAR(255)",
    )
]
