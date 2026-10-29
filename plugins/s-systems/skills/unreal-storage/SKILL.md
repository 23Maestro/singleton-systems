---
name: unreal-storage
description: Set up Unreal Engine storage and a local script path for agents. Use for Unreal installs, sample projects, editable graphics projects, caches, and renders. Keep existing Lineups renderer choices until a reviewed Unreal trial passes.
---

# Unreal storage

Use Unreal's native editor, Python tools, and Epic sample projects. A paid AI
plugin is not required. Read [the file map](references/file-map.md) before an
install or project intake.

## Storage rules

- Keep reusable scripts, small manifests, and source records in Git internally.
- Keep the small Epic launcher and Apple-managed Xcode tools in their standard
  system locations. Do not move their internal files or spoof SDK versions.
- Keep large engine installs, pristine sample projects, working projects, and
  rebuildable caches on verified UnrealSSD. Keep each Unreal project complete;
  its Content folder and asset links must travel together.
- An authored `.uasset` or `.umap` is source. It is not a disposable cache.
  Back up original project work internally or on a separate physical device
  before the external X9 becomes its only copy. Use Unreal tools when moving
  assets within a project.
- UnrealSSD must pass its registered UUID, external mount, case-insensitive APFS,
  write, and 50 GiB free-space checks. The file map names the repository record.
  Stop on failure. Never fall back to internal storage for large working data.
- HomeSSD and MediaSSD on this Mac share the same external X9 as UnrealSSD.
  A second volume on that drive is not an independent hardware backup. Keep
  original authored work backed up internally or on another physical device.
- Renders, previews, and research retain the existing HomeSSD media routes.
  Check that gate before those writes. Do not erase or reformat existing volumes.
- Get engine version and package support from the actual launcher and project.
  A working Metal compiler proves only that compiler. Verify the editor by
  opening a project, then run a short render before calling the setup ready.

## Local commands

Resolve this skill's canonical root. Run its bundled helper from there:

```bash
python3 "$UNREAL_SKILL_ROOT/scripts/unreal_workspace.py" route --client CATENA_MEDIA_LINEUPS --kind projects
python3 "$UNREAL_SKILL_ROOT/scripts/unreal_workspace.py" configure --client CATENA_MEDIA_LINEUPS --project /absolute/path/Project.uproject
python3 "$UNREAL_SKILL_ROOT/scripts/unreal_workspace.py" run --client CATENA_MEDIA_LINEUPS --project /absolute/path/Project.uproject --engine /absolute/path/UE_5.8 --script "$UNREAL_SKILL_ROOT/scripts/editor_probe.py" --dry-run
```

`configure` adds Python Editor Script Plugin and Editor Scripting Utilities to
the selected working copy. It saves an exact before copy. Do not configure the
pristine sample. `run` opens the full editor, runs a Python file, and exits.
It directs local DDC and Zen data to UnrealSSD. It adds no remote-control flags.
A project with native MCP autostart enabled can still open its configured port.
Read the editor log to confirm the chosen paths; environment intent alone is
not proof that all caches followed the route. The process exit code alone does
not prove that a Python script ran successfully; inspect its receipt and log.

Keep engine patches out of this first test. Do not enable unreviewed third-party
plugins from downloaded samples. Preserve the source URL, terms, engine version,
and local project path for each package. Mark a sample acquired only after its
actual project files exist. Record license acceptance separately from download.

The Lineups trial uses short 1920 x 1080 scenes. Keep its current approved lane
rules, sources, and renderer until Jerami reviews the new output. A storage route
does not change the renderer or approve a scene.
