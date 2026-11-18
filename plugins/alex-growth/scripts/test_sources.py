"""Reject evidence upgrades and broken source pointers."""
import copy
import json
import unittest
from check_sources import INDEX, validate


class SourceTests(unittest.TestCase):
    def setUp(self):
        self.index = json.loads(INDEX.read_text())

    def row(self, status):
        return next(row for row in self.index["constructs"] if row["status"] == status)

    def test_real_index(self):
        self.assertGreater(validate(self.index), 0)

    def test_false_pairing(self):
        self.row("pdf-only")["status"] = "paired"
        with self.assertRaisesRegex(ValueError, "misleading"):
            validate(self.index)

    def test_missing_pdf(self):
        self.row("paired")["pdf"]["sourceId"] = "not-recovered"
        with self.assertRaisesRegex(ValueError, "missing PDF"):
            validate(self.index)

    def test_impossible_page(self):
        self.row("paired")["pdf"]["pages"] = [9999]
        with self.assertRaisesRegex(ValueError, "invalid PDF page"):
            validate(self.index)

    def test_missing_captions(self):
        row = self.row("paired")
        self.index["videos"][row["video"]["sourceId"]]["captionCount"] = 0
        with self.assertRaisesRegex(ValueError, "invalid caption"):
            validate(self.index)

    def test_reupload(self):
        row = self.row("paired")
        self.index["videos"][row["video"]["sourceId"]]["uploader"]["channelId"] = "reupload"
        with self.assertRaisesRegex(ValueError, "unverified uploader"):
            validate(self.index)

    def test_false_timestamp(self):
        self.row("paired")["video"]["url"] = "https://www.youtube.com/watch?v=other&t=0s"
        with self.assertRaisesRegex(ValueError, "timestamp link"):
            validate(self.index)

    def test_missing_gap(self):
        self.row("lesson-only").pop("gap")
        with self.assertRaisesRegex(ValueError, "explain missing"):
            validate(self.index)

    def test_duplicate(self):
        self.index["constructs"].append(copy.deepcopy(self.index["constructs"][0]))
        with self.assertRaisesRegex(ValueError, "Duplicate"):
            validate(self.index)


if __name__ == "__main__":
    unittest.main()
