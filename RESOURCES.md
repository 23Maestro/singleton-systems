# Transcript-timed motion resources

## Knowledge

- [Manim building blocks](https://docs.manim.community/en/stable/tutorials/building_blocks.html)
  Official guide to scenes, animations, `run_time`, and `wait()`. Use it when writing or checking timed motion.
- [Manim Scene reference](https://docs.manim.community/en/stable/reference/manim.scene.scene.Scene.html)
  Official reference for `play()`, `wait()`, and scene time. Use it when exact cue execution matters.
- [Manim configuration reference](https://docs.manim.community/en/stable/reference/manim._config.utils.ManimConfig.html)
  Official reference for frame rate and output size. Use it when matching a Premiere sequence.
- [Lineups enforcement hook](./.codex/hooks/lineups_enforcement.py)
  Local contract for transcript anchors, entrances, Figma skills, export proof, and Premiere placement.
- [Bo Jackson Manim proof](./tmp/lineups-manim-pilot/bo_jackson_pilot.py)
  Current raster proof. Use it to see the approved frame split into timed image layers.

## Wisdom (communities)

The two client assignments on September 2, 2026 are the first field test. Record timing error, repair time, and render attempts before adding a community step.

## Gaps

- The Lineups manifest has no renderer-neutral cue list yet.
- The current hook checks supplied timing. It does not derive cue times from word timestamps.
