"""

"""

from yoyo import step

__depends__ = {}

steps = [
    step("CREATE TABLE section (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(255))", "DROP TABLE section"),
    step("CREATE UNIQUE INDEX section_name ON section (name)", "DROP INDEX section_name"),
]
