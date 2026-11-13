"""Lineups 4A template rules approved on the Packers trio (2026-11-12). Plain Python; no Blender."""
import unittest

from tools.broadcast_engine import lane4_layout as L


class LogoCanvas(unittest.TestCase):
    # Green Bay's gold ring: a full-width oval with 6 Bezier points (from the GB.svg import audit).
    GB_RING = [(0.0, 0.5), (0.25, 1.0), (0.75, 1.0), (1.0, 0.5), (0.75, 0.0), (0.25, 0.0)]
    # Kansas City's background: a full-width rectangle whose points all sit on its corners.
    KC_BOX = [(0.0, 0.0), (1.0, 0.0), (1.0, 1.0), (0.0, 1.0)]

    def test_full_width_oval_is_artwork(self):
        self.assertFalse(L.canvas_box(self.GB_RING, full_width=1.0))

    def test_full_width_rectangle_is_canvas(self):
        self.assertTrue(L.canvas_box(self.KC_BOX, full_width=1.0))

    def test_narrow_rectangle_is_artwork(self):
        self.assertFalse(L.canvas_box([(0, 0), (0.4, 0), (0.4, 1), (0, 1)], full_width=1.0))


class RenderFrames(unittest.TestCase):
    def test_material_fade_frames_render(self):
        # A card fades on its material from frame 252 to 260, long after the 6-second camera hold.
        curves = [("nodes[\"Alpha\"].outputs[0].default_value", [(252, 1.0), (260, 0.0)])]
        active = L.active_frames(curves, end=300)
        self.assertTrue({252, 256, 260} <= active)
        self.assertNotIn(280, active)

    def test_visibility_switch_renders_its_frame(self):
        active = L.active_frames([("hide_render", [(1, 1.0), (363, 0.0)])], end=400)
        self.assertIn(363, active)

    def test_camera_window_always_renders(self):
        self.assertEqual(L.active_frames([], end=40), set(range(1, 41)))


class StatCards(unittest.TestCase):
    # Approved C07-v13: card bottom sits on the nameplate top (z -2.7 at card depth); rows 0.9 apart.
    def test_one_row_card_sits_on_the_nameplate(self):
        card = L.stat_card(rows=1)
        self.assertAlmostEqual(card["first_row_z"], -2.18)
        self.assertAlmostEqual(card["bottom"], -2.7)
        self.assertEqual(card["dividers"], [])

    def test_two_row_card_grows_upward_with_one_divider(self):
        card = L.stat_card(rows=2)
        self.assertAlmostEqual(card["first_row_z"], -1.28)
        self.assertAlmostEqual(card["bottom"], -2.7)
        self.assertEqual([round(d, 2) for d in card["dividers"]], [-0.45])


class Callouts(unittest.TestCase):
    # Approved C06-v11: lowest line just above the nameplates at z -2.8, lines stack upward 0.98 apart.
    def test_single_callout_sits_above_the_nameplates(self):
        self.assertEqual(L.callout_z(count=1), [-2.8])

    def test_two_lines_stack_upward_without_overlap(self):
        top, bottom = L.callout_z(count=2)
        self.assertAlmostEqual(bottom, -2.8)
        self.assertAlmostEqual(top - bottom, 0.98)


class HelmetLine(unittest.TestCase):
    # A 4-row cutout (row 0 = bottom). Rows 0-2 hold the player; row 3 is empty headroom.
    ALPHA = [[1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [0, 1, 1, 1, 1], [0, 0, 0, 0, 0]]

    def test_top_ignores_empty_headroom(self):
        # Plane 8 tall centered at z 0: bottom -4, the player fills 3 of 4 rows -> top at +2.
        self.assertAlmostEqual(L.helmet_top(self.ALPHA, z=0.0, height=8.0), 2.0)

    def test_shift_puts_every_top_on_the_first_players_line(self):
        shifts = L.helmet_shifts([(self.ALPHA, 0.0, 8.0), ([[1, 1, 1, 1]] * 4, 0.0, 8.0)])
        self.assertEqual(shifts[0], 0.0)
        self.assertAlmostEqual(shifts[1], -2.0)


class PlayerSwap(unittest.TestCase):
    # Approved C07-v12 swap on cue frame 363 (14.48 s).
    def test_swap_starts_on_the_cue(self):
        s = L.swap_frames(363)
        self.assertEqual(s["out"], (363, 372))
        self.assertEqual(s["in"], (366, 379))

    def test_one_name_per_frame(self):
        s = L.swap_frames(363)
        self.assertEqual(s["old_name_gone"], s["new_name_starts"])
        self.assertLess(s["old_name_squeeze"], s["old_name_gone"])

    def test_new_card_lands_after_the_player_settles(self):
        s = L.swap_frames(363)
        self.assertGreater(s["card"], s["in"][1])


if __name__ == "__main__":
    unittest.main()
