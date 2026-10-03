import copy
import importlib.util
import unittest

from tools.lineups_motion.templates import (
    TemplateError, eligible, load_callout_contract, load_registry, resolve,
    validate_callout, validate_manifest_binding, validate_manifest_readback,
    validate_source_identity,
)


def measured_callout(width=598):
    contract = load_callout_contract()
    nodes = copy.deepcopy(contract["protected"])
    for role, node in nodes.items():
        node["id"] = "episode-" + role
    nodes["wrapper"].update(x=0, y=-7, parentId="scene")
    nodes["panel"].update(x=(1920-width-144)/2, y=816, width=width+144, parentId="episode-wrapper")
    nodes["text"].update(x=72, y=56.5, width=width, height=77, parentId="episode-panel")
    return {"rootNodeId": "scene", "rootDimensions": {"width": 1920, "height": 1080}, **nodes}


def bound_manifest():
    contract = load_callout_contract()
    return {"scene": {"lane": "quick stat", "approvedOption": "Single-frame statement"},
            "figma": {"fileKey": load_registry()["fileKey"], "rootNodeId": "scene", "sourceComponentId": "653:184",
                      "templateBinding": {"key": "quick-stat.single", "contractId": contract["id"],
                                          "sourceFingerprint": contract["sourceFingerprint"],
                                          "roleNodeIds": {role: "episode-"+role for role in ("wrapper", "panel", "text")}}}}


class TemplateTests(unittest.TestCase):
    def test_registry_has_unique_exact_sources_and_seven_lanes(self):
        rows = load_registry()["templates"]
        self.assertEqual(len(set(row["key"] for row in rows)), len(rows))
        self.assertEqual(len(set(row["source"]["componentId"] for row in rows)), len(rows))
        self.assertEqual(len(set(row["lane"] for row in rows)), 7)
        for row in rows:
            self.assertEqual(row["source"]["type"], "COMPONENT")
            self.assertEqual((row["source"]["width"], row["source"]["height"]), (1920, 1080))

    def test_display_rename_does_not_break_retrieval(self):
        template = resolve("quick-stat.single")
        readback = {**template["source"], "name": "Operator renamed this"}
        validate_source_identity(template, readback)
        readback["componentId"] = "episode-example"
        with self.assertRaisesRegex(TemplateError, "componentId"):
            validate_source_identity(template, readback)
        with self.assertRaises(TemplateError):
            resolve("Justin Herbert")

    def test_source_on_episode_page_is_rejected(self):
        template = resolve("comparison.simple.2")
        with self.assertRaisesRegex(TemplateError, "pageId"):
            validate_source_identity(template, {**template["source"], "pageId": "episode"})

    def test_copy_can_hug_without_changing_design(self):
        for width in (220, 598, 1016, 1541):
            validate_callout(measured_callout(width))
        validate_manifest_readback(bound_manifest(), measured_callout())

    def test_historical_font_and_hug_height_regressions_fail(self):
        mutations = [
            ("panel", "height", 90), ("panel", "counterAxisSizingMode", "AUTO"),
            ("panel", "paddingLeft", 16), ("panel", "y", 700),
            ("text", "fontName", {"family": "Anton", "style": "Regular"}),
            ("text", "fontSize", 60), ("text", "y", 0),
            ("panel", "topRightRadius", 0), ("panel", "strokes", []),
        ]
        for role, key, value in mutations:
            with self.subTest(role=role, key=key):
                readback = measured_callout()
                readback[role][key] = value
                with self.assertRaises(TemplateError):
                    validate_callout(readback)

    def test_overflow_multiline_and_wrong_node_binding_fail(self):
        with self.assertRaisesRegex(TemplateError, "safe width"):
            validate_callout(measured_callout(1800))
        readback = measured_callout()
        readback["text"].update(height=154, y=18)
        with self.assertRaisesRegex(TemplateError, "1 line"):
            validate_callout(readback)
        readback = measured_callout()
        readback["text"]["id"] = "wrong"
        with self.assertRaisesRegex(TemplateError, "different episode node"):
            validate_manifest_readback(bound_manifest(), readback)

    def test_missing_or_stale_fingerprint_fails(self):
        manifest = bound_manifest()
        del manifest["figma"]["templateBinding"]
        with self.assertRaises(TemplateError):
            validate_manifest_binding(manifest)
        manifest = bound_manifest()
        manifest["figma"]["templateBinding"]["sourceFingerprint"] = "old"
        with self.assertRaisesRegex(TemplateError, "fingerprint"):
            validate_manifest_binding(manifest)

    def test_long_copy_fit_must_prove_overflow_without_changing_panel(self):
        readback = measured_callout(1600)
        readback["text"].update(fontSize=60, height=72, y=59)
        override = {"fontSize": 60, "reason": "long-copy-safe-width", "textWidthAt64": 1600*64/60, "evidence": "Measured copy exceeds safe width at 64 px"}
        validate_callout(readback, fit_override=override)
        override["textWidthAt64"] = 1000
        with self.assertRaisesRegex(TemplateError, "fit override"):
            validate_callout(readback, fit_override=override)

    def test_uncertain_purpose_requires_review(self):
        self.assertEqual(eligible({"evidence": "Mahomes played"})["status"], "needs-review")
        self.assertEqual(eligible({"purpose": "comparison", "evidence": "Both 3-0", "subjects": 2, "rows": 1})["status"], "needs-review")

    def test_team_matchup_uses_logos_without_player_alpha(self):
        result = eligible({"purpose": "comparison", "comparisonKind": "teams", "subjects": 2, "rows": 1, "evidence": "Both teams 3-0"})
        self.assertEqual(result["templates"], ["comparison.simple.2"])

    def test_player_candidates_need_alpha_and_explicit_option(self):
        candidate = {"purpose": "comparison", "comparisonKind": "players", "subjects": 2, "rows": 1, "evidence": "Direct player comparison"}
        self.assertEqual(eligible(candidate)["status"], "asset-blocked")
        candidate["realAlpha"] = True
        self.assertEqual(eligible(candidate)["status"], "needs-review")
        candidate["option"] = "Cinematic 2-up"
        self.assertEqual(eligible(candidate)["templates"], ["comparison.cinematic.2"])

    def test_unregistered_capacity_fails_without_fallback(self):
        result = eligible({"purpose": "stats", "stats": 5, "evidence": "5 values"})
        self.assertEqual(result["status"], "reference-gap")
        self.assertEqual(eligible({"purpose": "cast", "subjects": 3, "realAlpha": True, "evidence": "3 players"})["status"], "reference-gap")
        self.assertEqual(eligible({"purpose": "cast", "subjects": 2, "realAlpha": True, "evidence": "2 players"})["templates"], ["asset-swap.standard"])

    def test_collector_preserves_page_type_and_reads_actual_properties(self):
        from pathlib import Path
        script = Path(__file__).resolve().parents[3] / "scripts/lineups-templates.py"
        spec = importlib.util.spec_from_file_location("template_cli", script)
        cli = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(cli)
        code = cli.collector_code("428:27", [], sources=True)
        self.assertIn("page.type!=='PAGE'", code)
        self.assertIn("owner.type!=='PAGE'", code)
        self.assertIn("out[key]=n[key]", code)
        self.assertNotIn("__PAGE_ID__", code)
        result = eligible({"purpose": "timeline", "periods": 3, "option": "Simple board", "evidence": "3 seasons"})
        self.assertEqual(result["status"], "reference-gap")


if __name__ == "__main__":
    unittest.main()
