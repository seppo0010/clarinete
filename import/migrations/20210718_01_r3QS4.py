"""

"""

from yoyo import step

__depends__ = {'20210717_01_8NUSR'}

steps = [
    step(
        "CREATE INDEX news_search_title ON news USING GIN (to_tsvector('spanish', title))",
        "DROP INDEX news_search_title",
    ),
    step(
        "CREATE INDEX news_search_content ON news USING GIN (to_tsvector('spanish', content))",
        "DROP INDEX news_search_content",
    ),
]
