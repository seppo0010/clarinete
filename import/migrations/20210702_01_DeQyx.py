"""

"""

from yoyo import step

__depends__ = {'20210701_01_Q4cu3'}

steps = [
    step("CREATE TABLE source (id SERIAL, name VARCHAR(255))", "DROP TABLE source"),
    step("CREATE UNIQUE INDEX source_name ON source (name)", "DROP INDEX source_name"),
    step("ALTER TABLE news ADD COLUMN source_id INTEGER")
]
