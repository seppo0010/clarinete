import unittest
from . import deduplicator

class DeduplicatorTest(unittest.TestCase):
    def test_alternatives(self):
        title = "boca ganó 3-0"
        alternatives = ["river perdió 0-3", "boca goleó a river", "la inflación de junio fue del 3%", "murió diego maradona"]
        cos_simer = lambda x, y: [0.6537, 0.2956, 0.3567, 0.4146]
        deduplicator(title, alternatives, cos_simer=cos_simer)
