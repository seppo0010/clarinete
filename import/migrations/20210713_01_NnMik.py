"""

"""

from yoyo import step

__depends__ = {'20210712_01_pT4eP'}

steps = [
    step(
        "ALTER TABLE source ADD COLUMN language CHAR(2) DEFAULT 'es'",
        "ALTER TABLE source DROP COLUMN language CHAR(2)",
    )
]
