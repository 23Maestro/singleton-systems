#!/usr/bin/env python3
"""Draw crop guides and calculate translations without editing source artwork."""
import argparse
import hashlib
import json
import math
from pathlib import Path


def rect(data):
    r = {k: data[k] for k in ("x", "y", "width", "height")}
    if any(isinstance(n, bool) or not isinstance(n, (int, float)) or not math.isfinite(n) for n in r.values()):
        raise ValueError("Coordinates must be finite numbers")
    if r["width"] <= 0 or r["height"] <= 0:
        raise ValueError("Rectangle size must be positive")
    return r


def contains(outer, inner):
    return (outer["x"] <= inner["x"] and outer["y"] <= inner["y"]
            and inner["x"] + inner["width"] <= outer["x"] + outer["width"]
            and inner["y"] + inner["height"] <= outer["y"] + outer["height"])


def plan(layout):
    canvas = rect({"x": 0, "y": 0, "width": layout["canvas"]["width"], "height": layout["canvas"]["height"]})
    crop = rect(layout["crop"])
    if not contains(canvas, crop):
        raise ValueError("Crop must be inside the source")
    source = layout["crop"].get("source", "").strip()
    status = layout["crop"].get("status")
    if not source or status not in ("observed", "proposed"):
        raise ValueError("Crop needs its source and observed/proposed status")
    inset = {k: layout.get("inset", {}).get(k, 0) for k in ("left", "right", "top", "bottom")}
    if any(isinstance(v, bool) or not isinstance(v, (int, float)) or not math.isfinite(v) or v < 0 for v in inset.values()):
        raise ValueError("Insets must be finite nonnegative numbers")
    safe = rect({"x": crop["x"] + inset["left"], "y": crop["y"] + inset["top"],
                 "width": crop["width"] - inset["left"] - inset["right"],
                 "height": crop["height"] - inset["top"] - inset["bottom"]})
    groups = []
    seen = set()
    for group in layout.get("groups", []):
        gid = group["id"]
        if not isinstance(gid, str) or not gid.strip() or gid in seen:
            raise ValueError("Each group needs a unique string ID")
        seen.add(gid)
        b = rect(group["bounds"])
        g = {"id": gid, "node_ids": group.get("node_ids", []), "before": b,
             "inside_crop_before": contains(crop, b), "inside_inset_before": contains(safe, b)}
        if b["width"] > safe["width"] or b["height"] > safe["height"]:
            g.update(fits=False, dx=None, dy=None, reason="Group needs a layout change to fit")
        else:
            dx = max(safe["x"] - b["x"], min(0, safe["x"] + safe["width"] - b["x"] - b["width"]))
            dy = max(safe["y"] - b["y"], min(0, safe["y"] + safe["height"] - b["y"] - b["height"]))
            g.update(fits=True, dx=dx, dy=dy, after={**b, "x": b["x"] + dx, "y": b["y"] + dy})
        groups.append(g)
    return {"canvas": canvas, "crop": {**crop, "source": source, "status": status}, "safe": safe,
            "groups": groups, "all_groups_can_fit": bool(groups) and all(g["fits"] for g in groups),
            "scope": "Geometry only. Source edits, collisions and Instagram testing are not verified."}


def render(image, report, output):
    from PIL import Image, ImageDraw
    original = Image.open(image)
    original.load()
    if original.size != (report["canvas"]["width"], report["canvas"]["height"]):
        raise ValueError("Image size differs from canvas; do not resize the source")
    output.mkdir(parents=True, exist_ok=True)
    base = Image.alpha_composite(Image.new("RGBA", original.size, "#202020"), original.convert("RGBA")).convert("RGB")
    guided = base.copy()
    draw = ImageDraw.Draw(guided)
    for box, color in ((report["crop"], "#00FFFF"), (report["safe"], "#FFC857")):
        x, y, w, h = (box[k] for k in ("x", "y", "width", "height"))
        draw.rectangle((x, y, x + w - 1, y + h - 1), outline=color, width=max(2, round(base.width / 360)))
    guided.save(output / "cover-guides.png")
    c = report["crop"]
    crop = base.crop(tuple(round(n) for n in (c["x"], c["y"], c["x"] + c["width"], c["y"] + c["height"])))
    if min(crop.size) < 1:
        raise ValueError("Crop must contain at least 1 raster pixel on each axis")
    crop.save(output / "grid-preview.png")
    pw = 360
    fh, ch = round(base.height * pw / base.width), round(crop.height * pw / crop.width)
    sheet = Image.new("RGB", (pw * 2 + 30, max(fh, ch) + 100), "#202020")
    sheet.paste(guided.resize((pw, fh)), (0, 45))
    sheet.paste(crop.resize((pw, ch)), (pw + 30, 45))
    labels = ImageDraw.Draw(sheet)
    labels.text((8, 12), "Full Reel / cyan crop / amber buffer", fill="white")
    labels.text((pw + 38, 12), report["crop"]["status"].capitalize() + " grid crop", fill="white")
    labels.text((8, sheet.height - 30), "Guides only. See report.json for editable group moves.", fill="white")
    sheet.save(output / "review.png")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--image", type=Path, required=True)
    parser.add_argument("--layout", type=Path, required=True)
    parser.add_argument("--out-dir", type=Path, required=True)
    args = parser.parse_args()
    try:
        reserved = {args.image.resolve(), args.layout.resolve()}
        outputs = [args.out_dir / name for name in ("cover-guides.png", "grid-preview.png", "review.png", "report.json")]
        if any(p.resolve() in reserved for p in outputs):
            raise ValueError("Output paths must not overwrite inputs")
        report = plan(json.loads(args.layout.read_text()))
        report["source_image_sha256"] = hashlib.sha256(args.image.read_bytes()).hexdigest()
        render(args.image, report, args.out_dir)
        (args.out_dir / "report.json").write_text(json.dumps(report, indent=2) + "\n")
        print(json.dumps({"review": str((args.out_dir / "review.png").resolve()), "groups": report["groups"]}))
    except (ValueError, KeyError, TypeError, AttributeError, OSError) as error:
        parser.exit(2, f"thumbnail-grid: {error}\n")


if __name__ == "__main__":
    main()
