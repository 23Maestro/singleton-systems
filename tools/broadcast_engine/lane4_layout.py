"""Lineups 4A template rules approved on the Packers trio (2026-11-12).
Plain Python with no Blender import, so the rules are testable and shared by the builder."""


def canvas_box(points, full_width, tol=1e-3):
    """A logo's background canvas is a full-width rectangle: every point sits on a bounding-box corner.
    A full-width oval (the Green Bay gold ring has 6 points) is real artwork and stays."""
    xs, ys = [p[0] for p in points], [p[1] for p in points]
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    t = tol * max(x1 - x0, y1 - y0, 1e-6)
    if x1 - x0 < full_width * 0.999:
        return False
    return all(min(abs(x - x0), abs(x - x1)) < t and min(abs(y - y0), abs(y - y1)) < t for x, y in points)


HOLD_FROM = 150  # camera moves end by 6 s at 25 fps; frames after this copy the last render unless something changes


def active_frames(curves, end, hold_from=HOLD_FROM):
    """Frames that must render. curves = [(data_path, [(frame, value), ...])] from objects AND materials.
    Every frame before the hold renders; later frames render only where a key changes a value or a
    visibility switch lands. Material keys (card fades, cutout fade-ins) count the same as object keys."""
    import math
    active = set(range(1, min(hold_from, end) + 1))
    for path, keys in curves:
        keys = sorted(keys)
        if path == "hide_render":
            active.update(max(1, min(end, math.ceil(x))) for x, _ in keys)
            continue
        for (xa, ya), (xb, yb) in zip(keys, keys[1:]):
            if abs(ya - yb) > 1e-7:
                active.update(range(max(1, math.floor(xa)), min(end, math.ceil(xb)) + 1))
    return {f for f in active if f <= end}


CARD = {"plate_top": -2.7, "row_gap": 0.9, "pad": 0.52, "value_size": 0.78, "unit_size": 0.5, "radius": 0.22}


def stat_card(rows, plate_top=CARD["plate_top"]):
    """Mini stat card geometry in card space. The bottom edge sits on the nameplate top; extra rows grow
    upward. Dividers are relative to the first row, halfway between rows."""
    gap, pad = CARD["row_gap"], CARD["pad"]
    return {"first_row_z": plate_top + pad + (rows - 1) * gap, "bottom": plate_top,
            "top_rel": pad, "bottom_rel": -(rows - 1) * gap - pad,
            "dividers": [-(i - 0.5) * gap for i in range(1, rows)]}


CALLOUT = {"bottom": -2.8, "gap": 0.98, "size": 0.86, "radius": 0.2}


def callout_z(count, bottom=CALLOUT["bottom"], gap=CALLOUT["gap"]):
    """Centered callout lines, top first. The lowest line sits just above the nameplates."""
    return [bottom + (count - 1 - i) * gap for i in range(count)]


def helmet_top(alpha_rows, z, height, min_pixels=3, threshold=0.5):
    """World z of a cutout's top edge. alpha_rows[0] is the bottom row of the image; empty headroom
    above the helmet does not count. The plane is `height` tall and centered at `z`."""
    filled = [i for i, row in enumerate(alpha_rows) if sum(a > threshold for a in row) > min_pixels]
    return z - height / 2 + (max(filled) + 1) / len(alpha_rows) * height


def helmet_shifts(players):
    """players = [(alpha_rows, z, height)], first one is the reference. Returns the z shift that puts
    every helmet top on the reference line."""
    tops = [helmet_top(*p) for p in players]
    return [tops[0] - t for t in tops]


def swap_frames(cue):
    """Approved player swap: the old player and card drop out from the cue, the new player whips in from
    the right 3 frames later with an overshoot, the nameplate flips mid-move, then the new card lands."""
    return {"out": (cue, cue + 9), "in": (cue + 3, cue + 16), "old_name_squeeze": cue + 5,
            "old_name_gone": cue + 8, "new_name_starts": cue + 8, "new_name_full": cue + 11,
            "card": cue + 21}
