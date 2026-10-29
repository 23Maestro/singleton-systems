# CAD storage

CAD runtime files live at
`/Volumes/HomeSSD/Generated/SINGLETON_SYSTEMS/source/cad-tooling`.
This includes its uv cache, Python runtime, tools, model cache and temp files.
Source models and small CAD settings stay in their current locations.

The small `uvx` launcher routes only cadgen calls to HomeSSD. Other uvx calls
use the normal uv command without checking the drive. The small `cadgen`
launcher uses the registered installation with the same external paths.
The plugin's own files stay unchanged, so plugin version updates keep this route.

CAD checks the mounted volume's identity and write access before it starts.
There is no free-space quota on normal launches and no extra prompt. If the
drive is absent, CAD exits with 1 short error. It never downloads internally.
Use the normal storage gate before a large new install or download.

## Updates and checks

uv's updater replaces its uvx launcher. Use this command to update uv and put
the CAD route back in the same operation:

```sh
python3 ~/.codex/skills/dev-storage/scripts/cad_storage.py update-uv
python3 ~/.codex/skills/dev-storage/scripts/cad_storage.py health
cadgen +0.8.2 status
```

The storage guard reports an overwritten launcher. Restore the reviewed route
with `cad_storage.py install` before starting CAD. Do not move the global uv
cache or set global external-cache variables for ordinary Python development.

## Migration and restore

Verify the new installation with `cadgen doctor`, a model build, and an export.
Check that its Python and geometry kernel paths are on HomeSSD. Stop old CAD
helpers only after checking that they have no active model builds. Use native
uv cleanup for the old internal cache, after confirming no process uses it.
Never prune the external runtime while CAD uses it.

The original small launchers and installation records are kept under
`~/.local/state/singleton-systems/cad-storage`. They are a restore reference,
not another copy of the large runtime. If restoring internal CAD is explicitly
requested, restore the launchers and reinstall the pinned cadgen version with
uv. Do not restore old registry paths that point at a removed environment.
