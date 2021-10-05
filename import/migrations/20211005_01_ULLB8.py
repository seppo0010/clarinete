"""

"""

from yoyo import step

__depends__ = {'20210918_02_XjT2u'}

steps = [
    step(
        "ALTER TABLE entities ALTER COLUMN entity_type TYPE VARCHAR(50)",
        "ALTER TABLE entities ALTER COLUMN entity_type TYPE VARCHAR(10)",
    )
]
