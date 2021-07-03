"""

"""

from yoyo import step

__depends__ = {'20210702_01_DeQyx'}

steps = [
    step("ALTER TABLE news ADD COLUMN summary TEXT"),
    step("ALTER TABLE news ADD COLUMN sentiment INTEGER"),
]
