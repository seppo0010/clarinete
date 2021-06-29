"""

"""

from yoyo import step

__depends__ = {'20210629_01_295jU'}

steps = [
    step("CREATE TABLE news (url VARCHAR(255) PRIMARY KEY, title VARCHAR(255), volanta VARCHAR(255), section_id INTEGER, image VARCHAR(255), content TEXT )", 'DROP TABLE news')
]
