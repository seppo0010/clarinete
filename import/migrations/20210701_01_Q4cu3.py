"""

"""

from yoyo import step

__depends__ = {'20210630_01_1ydRO'}

steps = [
    step(
        "CREATE TABLE updated ( time DATETIME PRIMARY KEY )",
        "DROP TABLE updated",
    )
]
