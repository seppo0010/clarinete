"""

"""

from yoyo import step

__depends__ = {'20210707_01_xSHG1'}

steps = [
    step(
        "ALTER TABLE news DROP COLUMN sentiment",
        "ALTER TABLE news ADD COLUMN sentiment INTEGER",
    )
]
