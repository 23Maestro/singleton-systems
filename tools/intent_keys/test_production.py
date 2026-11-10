"""Regression tests for the Intent Keys gate, without client media."""
import json
from pathlib import Path
import subprocess
import sys
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

from tools.intent_keys import production


class ProductionTests(unittest.TestCase):
    def test_cut_starting_inside_a_spoken_word_is_rejected(self):
        cues = {"captions": [{"words": [{"text": "word", "start": 0.2, "end": 0.3}]}], "quizzes": []}
        alignment = {"words": [{"text": "word", "alignedStart": 0.2, "alignedEnd": 0.6, "reliable": True}]}
        treatment = production.load_treatment()
        with self.assertRaisesRegex(ValueError, "overlaps spoken audio"):
            production.speech_audit(cues, alignment, [(15, 17, "word tail")], 30, treatment)
        production.speech_audit(cues, alignment, [(18, 20, "quiet after word")], 30, treatment)

    def test_protected_range_needs_an_exact_episode_exception(self):
        protected = [(20, 40)]
        cut = [(24, 30, "paper handling")]
        with self.assertRaisesRegex(ValueError, "protected"):
            production.check_protected_cuts(cut, protected, [])
        production.check_protected_cuts(cut, protected, [{
            "startFrame": 24, "endFrame": 30, "source": "Jerami's review note",
        }])
        with self.assertRaisesRegex(ValueError, "protected"):
            production.check_protected_cuts([(24, 31, "extended trim")], protected, [{
                "startFrame": 24, "endFrame": 30, "source": "Jerami's review note",
            }])

    def test_replacing_art_invalidates_a_part_even_when_html_is_unchanged(self):
        with TemporaryDirectory() as directory:
            folder = Path(directory)
            page = folder / "index.html"
            page.write_text('<img src="sheet.png">')
            image = folder / "sheet.png"
            image.write_bytes(b"approved sheet")
            first = production.page_fingerprint(page)
            image.write_bytes(b"different sheet")
            self.assertNotEqual(first, production.page_fingerprint(page))

    def test_gap_review_is_on_the_final_clock_and_accounts_for_partial_quiz_holds(self):
        words = [{"text": "before", "start": 0, "end": 1}, {"text": "after", "start": 6, "end": 7}]
        cues = {"captions": [{"words": words}], "quizzes": [{"cutaway": [1.5, 5.5]}]}
        aligned = {"words": [dict(w, alignedStart=w["start"], alignedEnd=w["end"], reliable=True)
                             for w in words]}
        gap = production.speech_audit(cues, aligned, [(31, 40, "quiet")], 240,
                                      production.load_treatment())[0]
        self.assertEqual(gap["disposition"], "quiz")
        self.assertEqual((gap["finalStartFrame"], gap["finalEndFrame"]), (30, 171))

    def test_gap_audit_keeps_timer_and_reports_rustle_gaps(self):
        words = [
            {"text": text, "start": start, "end": end}
            for text, start, end in (("your", 0, 1), ("Neovim", 4, 5), ("ready", 6, 7), ("answer", 12, 13))
        ]
        cues = {"captions": [{"words": words}], "quizzes": [{"cutaway": [7.5, 11.5]}]}
        alignment = {"words": [dict(w, alignedStart=w["start"], alignedEnd=w["end"], reliable=True) for w in words]}
        treatment = production.load_treatment()
        cuts = [(34, 111, "Paper rustle")]
        gaps = production.speech_audit(cues, alignment, cuts, 420, treatment)
        self.assertEqual([g["disposition"] for g in gaps], ["trimmed", "listen", "quiz"])
        with self.assertRaisesRegex(ValueError, "crosses a quiz"):
            production.speech_audit(cues, alignment, [(230, 240, "Bad trim")], 420, treatment)
        with self.assertRaisesRegex(ValueError, "removes a word cue"):
            production.speech_audit(cues, alignment, [(34, 121, "Bad trim")], 420, treatment)

    def test_receipt_binds_version_and_current_source_files(self):
        with TemporaryDirectory() as directory:
            media = Path(directory)
            (media / "references").mkdir()
            episode = media / "intent-keys-e99"
            episode.mkdir()
            builder = episode / "build.py"
            builder.write_text("# builder\n")
            production.write_preflight(episode, "v01", [], {}, media)
            self.assertEqual(production.require_preflight(episode, "v01", media)["version"], "v01")
            with self.assertRaises(FileNotFoundError):
                production.require_preflight(episode, "v02", media)
            builder.write_text("# changed\n")
            with self.assertRaisesRegex(ValueError, "stale"):
                production.require_preflight(episode, "v01", media)

    def test_handoff_requires_review_bound_to_the_current_export(self):
        from tools.lineups_motion.contract_gate import digest as record_sha256

        with TemporaryDirectory() as directory:
            media = Path(directory)
            refs = media / "references"
            refs.mkdir()
            (media / "renders").mkdir()
            episode = media / "intent-keys-e99"
            episode.mkdir()
            (episode / "build.py").write_text("# builder\n")
            output = media / "renders/intent-keys-e99-v02.mp4"
            output.write_bytes(b"current export")
            preflight = production.write_preflight(episode, "v02", [], {"gaps": []}, media)
            measured = refs / "measurements.json"
            measured.write_text(json.dumps({
                "file": str(output), "sha256": production.digest(output),
                "fullDecode": True, "frames": 30, "preflightSha256": production.digest(preflight),
            }))
            frame = refs / "frame.png"
            frame.write_bytes(b"review frame fixture")
            ref = lambda p: {"path": str(p), "sha256": production.digest(p)}
            packet = {
                "schemaVersion": 1, "preflight": ref(preflight), "measurements": ref(measured),
                "checks": {key: {"status": "passed", "note": "Reviewed on the v02 playback"}
                           for key in ("speech-and-joins", "brief-exceptions", "sheet-reveals",
                                       "quizzes", "captions", "framing", "privacy")},
                "frames": [{"frame": 0, **ref(frame)}, {"frame": 29, **ref(frame)}],
                "gaps": [],
            }
            review = refs / "intent-keys-e99-v02-handoff.json"
            review.write_text(json.dumps(packet))
            with self.assertRaisesRegex(ValueError, "approval"):
                production.require_handoff(output, media)
            packet["approval"] = {"reviewer": "Jerami", "source": "review transcript",
                                  "sha256": record_sha256(packet)}
            review.write_text(json.dumps(packet))
            production.require_handoff(output, media)
            stale = json.loads(measured.read_text())
            stale["preflightSha256"] = "previous preflight"
            measured.write_text(json.dumps(stale))
            packet["measurements"] = ref(measured)
            packet.pop("approval")
            packet["approval"] = {"reviewer": "Jerami", "source": "review transcript",
                                  "sha256": record_sha256(packet)}
            review.write_text(json.dumps(packet))
            with self.assertRaisesRegex(ValueError, "measurement.*stale"):
                production.require_handoff(output, media)
            output.write_bytes(b"changed export")
            with self.assertRaisesRegex(ValueError, "export.*stale"):
                production.require_handoff(output, media)

    def hook(self, event, **kwargs):
        path = production.ROOT / ".codex/hooks/intent_keys.py"
        result = subprocess.run([sys.executable, str(path)], input=json.dumps({"hook_event_name": event, **kwargs}),
                                capture_output=True, text=True, check=True)
        return json.loads(result.stdout)["hookSpecificOutput"] if result.stdout else {}

    def test_hook_routes_scoped_render_and_allows_prep(self):
        for cmd, cwd in (
            ("python comps/intent-keys-e999/build.py render", "/tmp/motion-studio"),
            ("python ./build.py delivery", "/tmp/intent-keys-e999"),
            ("cd /tmp/intent-keys-e999 && python build.py render", "/tmp"),
        ):
            self.assertEqual(self.hook("PreToolUse", tool_input={"cmd": cmd}, cwd=cwd)["permissionDecision"], "deny")
        prep = self.hook("PreToolUse", tool_input={"command": "python comps/intent-keys-e999/build.py check"}, cwd="/tmp")
        self.assertIn("additionalContext", prep)
        self.assertEqual(self.hook("PreToolUse", tool_input={"command": "python comps/lineups-e999/build.py render"}), {})

    def test_prompt_route_uses_series_name(self):
        self.assertIn("additionalContext", self.hook("UserPromptSubmit", prompt="Edit Intent Keys E03"))
        self.assertEqual(self.hook("UserPromptSubmit", prompt="Describe the intent of this change"), {})

    def test_next_episode_needs_its_own_style_before_motion(self):
        result = self.hook("PreToolUse", tool_input={
            "cmd": "python comps/intent-keys-e999/build.py page",
        }, cwd="/tmp/motion-studio")
        self.assertEqual(result["permissionDecision"], "deny")
        self.assertIn("treatment plan", result["permissionDecisionReason"])

    def test_short_render_and_review_upload_cannot_skip_proof(self):
        for parts, reason in (
            (("hyperframes", "render", "comps/intent-keys-e999/short-v01"), "preflight"),
            (("composio", "execute", "FRAME_IO_V4_CREATE_LOCAL_UPLOAD", "intent-keys-e999-short-v01.mp4"), "handoff"),
            (("curl", "--upload-file", "/tmp/intent-keys-e999-short-v01.mp4", "https://example.test/upload"), "handoff"),
        ):
            result = self.hook("PreToolUse", tool_input={"cmd": " ".join(parts)}, cwd="/tmp/motion-studio")
            self.assertEqual(result["permissionDecision"], "deny")
            self.assertIn(reason, result["permissionDecisionReason"])

    @patch.object(production, "locked_style_sources", return_value=[])
    def test_client_style_keeps_two_camera_layouts_and_selects_counter_from_brief(self, _style_sources):
        with TemporaryDirectory() as directory:
            episode = Path(directory) / "intent-keys-e99"
            episode.mkdir()
            brief = episode / "brief.md"
            brief.write_text("Run a key challenge.")
            manifest = {
                "schemaVersion": 1, "episode": "intent-keys-e99",
                "brief": {"path": "brief.md", "sha256": production.digest(brief)},
                "tracksKeys": True, "components": {
                    "screen": "upper-right", "captions": "max-manrope", "counter": "e03-flubs-keys",
                    "sheet": "e01-sheet-light-leak", "helper": "e01-helper", "quiz": "e02-countdown",
                },
            }
            plan = episode / "treatment-plan.json"
            plan.write_text(json.dumps(manifest))
            with self.assertRaisesRegex(ValueError, "version"):
                production.require_treatment_plan(episode)
            manifest["version"] = "v01"
            plan.write_text(json.dumps(manifest))
            self.assertEqual(production.require_treatment_plan(episode)["components"], manifest["components"])
            manifest["components"]["screen"] = "e01-sheet-light-leak"
            plan.write_text(json.dumps(manifest))
            with self.assertRaisesRegex(ValueError, "screen.*locked"):
                production.require_treatment_plan(episode)
            manifest["components"]["screen"] = "upper-right"
            manifest["tracksKeys"] = False
            plan.write_text(json.dumps(manifest))
            with self.assertRaisesRegex(ValueError, "counter.*locked"):
                production.require_treatment_plan(episode)
            manifest["components"]["counter"] = "e01-flubs"
            plan.write_text(json.dumps(manifest))
            self.assertEqual(production.require_treatment_plan(episode)["components"]["counter"], "e01-flubs")


if __name__ == "__main__":
    unittest.main()
