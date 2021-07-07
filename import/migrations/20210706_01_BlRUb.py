"""

"""

from yoyo import step

__depends__ = {'20210705_02_70Gn4'}

steps = [
    step(
        "CREATE TABLE answer ( id SERIAL, url VARCHAR(255), answer TEXT )",
        "DROP TABLE answer",
    )
]
