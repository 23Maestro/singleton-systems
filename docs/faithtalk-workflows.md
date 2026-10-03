# FaithTalk reusable workflows

Git keeps the intro and logo compositions, production notes, timing checks,
phrase-level duck mix, and current outro assembly script. The 745 Creative
client/lane contracts remain in `config/745-creative`; John, Ben, and Eric keep
their separate batch directions.

The completed intro source is `videos/faithtalk-drawn-seed-preview/review-v23-36_5.html`.
Earlier HTML reviews, diagnostic frames, raw footage, audio, renders, and local
HyperFrames state stay outside normal history. Existing media links remain
unchanged; the primary project supplies its ignored assets.

Use `scripts/faithtalk-media-links-check.py` before retiring any linked media.
`--list-inputs` on `scripts/faithtalk-outro-assemble.sh` lists the assembly inputs
without rendering.

The mix, timing-sheet, and outro scripts verify the physical HomeSSD and output
path before writing. Outputs stay under `/Volumes/HomeSSD/Generated/FAITHTALK/`.
Run `npm run check:faithtalk:storage` to check rejection of internal destinations
and symlink escapes.

The September 2026 10/15-frame transition discussion has no repository policy
diff. Keep those choices in their original Premiere projects; this closeout
does not set a universal transition duration.
