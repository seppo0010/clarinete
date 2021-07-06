"""

"""

from yoyo import step

__depends__ = {'20210705_01_1p8bJ'}

steps = [
    step(
        "ALTER TABLE news ADD COLUMN canonical_url VARCHAR(255)",
        "ALTER TABLE news DROP COLUMN canonical_url",
    )
]
