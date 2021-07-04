"""

"""

from yoyo import step

__depends__ = {'20210630_01_1ydRO'}

steps = [
    step(
        "CREATE TABLE updated ( time TIMESTAMP PRIMARY KEY )",
        "DROP TABLE updated",
    )
]
