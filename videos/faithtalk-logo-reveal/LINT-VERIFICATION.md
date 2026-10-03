# Lint verification · September 26, 2026

index.html mounts compositions/preview-black.html and compositions/logo.html. Logo artwork and animation live in the logo sub-composition. The word approach uses one sequential keyframe tween with the approved positions and durations.

HyperFrames 0.8.78 check passes with zero errors, warnings and informational findings across lint, runtime and layout. Full-canvas SVG wrappers have explicit intentional-overflow markers.

Nine black-background frames inspected. Five of the six frames compared with the v6.1 reference are pixel-identical. The sixth differs by at most one channel value out of 255. The settled logo is identical. Two additional alpha snapshots verify transparent backgrounds and intact artwork with previewBlack=false.

The reported renders/work-96d46695-097c-4282-8ac6-2a897b106ef3-VQo4Vc/compiled/index.html cache no longer exists. New compilation uses the corrected source.

Previous source: archive/index_v6.1_before_lint_refactor.html.txt.
Proof: /Volumes/MediaSSD/02_EDITING/CLIENTS/FAITHTALK/LOGO_REVEAL_REVIEW_2026_09_26/lint-refactor-check.json.

No new video master exported.
