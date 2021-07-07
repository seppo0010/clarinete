"""

"""

from yoyo import step

__depends__ = {'20210706_01_BlRUb'}

steps = [
    step("CREATE UNIQUE INDEX answer_url ON answer (url)", "DROP INDEX answer_url"),
]
