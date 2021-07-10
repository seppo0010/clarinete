"""

"""

from yoyo import step

__depends__ = {'20210709_01_V1auV'}

steps = [
    step(
        "ALTER TABLE source ADD COLUMN country CHAR (2)",
        "ALTER TABLE source DROP COLUMN country",
    ),
    step(
        "UPDATE source SET country = 'AR' WHERE name = 'Clarín'",
    ),
    step(
        "UPDATE source SET country = 'AR' WHERE name = 'La Nación'",
    ),
    step(
        "UPDATE source SET country = 'AR' WHERE name = 'Ambito Financiero'",
    ),
    step(
        "UPDATE source SET country = 'AR' WHERE name = 'Página 12'",
    ),
]
