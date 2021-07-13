"""

"""

from yoyo import step

__depends__ = {'20210712_01_pT4eP'}

steps = [
    step(
        "DROP TABLE answer",
        "CREATE TABLE answer ( id SERIAL, url VARCHAR(255), answer TEXT )",
    )
]
