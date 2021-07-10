"""

"""

from yoyo import step

__depends__ = {'20210709_03_BMDk2'}

steps = [
    step(
        "INSERT INTO source (name, country) VALUES ('La Tercera', 'CL') ON CONFLICT (name) DO UPDATE SET country = 'CL'",
    ),
]
