---
name: instagram-thumbnail
description: Check and adjust Instagram Reel thumbnails for profile-grid cropping. Draw measured crop guides, compare full covers with the grid view, and move editable text groups while preserving photo scale, type sizes, and alignment.
---

# Instagram thumbnail

Make one Reel cover work in the full Reel view and the tested profile grid.

## Measure

Read the current proposed cover from its source. For Figma, load `figma-use` and inspect the exact Reel frame, visible text, backplates, and overrides. Preserve the user's latest edits.

Record the source size, the grid rectangle in source pixels, and where it was observed. Use a fresh Instagram test or a supplied confirmed measurement. With no measured crop, a centered 3:4 window may be a labeled proposal for testing; do not call it verified.

Jerami's October 22, 2026 test showed a centered **1080 × 1440** window in a **1080 × 1920** cover: **x = 0, y = 240 through 1680**. This is evidence from that test, not a rule for every Instagram view or future version. A changed upload crop or grid shape needs a new rectangle.

## Draw guides

Use [thumbnail_grid.py](scripts/thumbnail_grid.py) with a cover PNG and measured layout JSON. Start from [the example](references/layout.example.json), replacing its groups with current source bounds. Resolve `SKILL_DIR` to this skill's absolute folder. Use the video-storage gate for client review media.

```bash
python3 "$SKILL_DIR/scripts/thumbnail_grid.py" \
  --image "$COVER_PNG" --layout "$LAYOUT_JSON" --out-dir "$REVIEW_DIR"
```

The helper draws cyan crop boundaries and amber buffer guides. It shows the full cover beside the grid crop and reports exact group translations. It never changes source artwork. Guides are review files, not delivery covers.

## Adjust

When asked to fix the cover, apply the measured move to its editable source. An inspection or preview request stops at the review.

- Move text and its backing card together. Preserve relative spacing, alignment, line breaks, fonts, colors, and shadows. Measure their union, including visible effects where relevant. Exclude hidden alternates.
- Prefer translation over resizing. Keep the native cover size. Preserve photo scale, crop, position, cutouts, and grade unless the user asks otherwise.
- Use an explicit buffer. **80 px vertically** is the starting design choice for the tested 1080-wide cover. Keep horizontal placement unless it clips. Adapt the buffer explicitly for another source size.
- Compute each group's move from its bounds. Do not apply a fixed offset blindly. John's block at y = 1332…1856 needs **−256 px**, ending at y = 1600 with 80 px below it.
- If a group cannot fit unchanged, or moving it overlaps a face or another text group, show that conflict. Reflow or resize only within the user's direction. A fit calculation does not prove the composition looks good.

In Figma, load the current fonts before moving text, even for position-only changes. Move the existing wrapper if it contains the whole group; otherwise apply the same delta to its member nodes. Preserve instance links. Do not rebuild or detach covers. Record original node positions and deltas so a retry cannot apply the move twice.

If Auto Layout controls that position, change the owning layout's padding or alignment value that produces the measured translation. Do not fight a computed y position. If an instance blocks the change, inspect its component and all affected instances first. A shared master change is appropriate for an authorized batch only when its uses match that scope. For a bottom-aligned cover, increasing bottom padding from 64 to 320 moves the text up 256 px. Preserve absolute photo and series-label positions. Keep a full-width background fade anchored to the cover when it sits inside the moving wrapper; its local offset may need compensation. Read back after the layout change to confirm the actual result.

Render the adjusted source, measure the same groups again, and rerun the helper. Check that the new bounds fit, the photo and type are unchanged, and the full cover still reads well. Keep a calculated crop preview separate from actual Instagram testing. Check each distinct layout before repeating a batch move.

## Deliver

Export only requested covers at native size, without guides. Jerami's naming is one PNG per video: `COVER_{Video Title}.png`. Separate Grid exports, new Drive folders, video edits, uploads, and replacements require that scope in the user's request. For authorized replacements, retain the file ID and verify the actual destination folder after the write.
