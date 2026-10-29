# Storage guard

The guard adds machine-wide checks to Hazel's project scan. Run it every
6 hours. Check actual free space, growth since the last run, and Hazel health.
Warn below 60 GB free; mark below 30 GB as critical. Flag a location that grows
by 2 GB between fresh checks. These are review limits, not deletion quotas.

## Cleanup rules

The default is report-only. `run --maintain chrome-clones,uv-prune` enables
only these 2 rules after user approval:

- Chrome: owned direct `code_sign_clone.*` children in the current user's macOS
  clone root. Require the real Chrome bundle identity, no open files, unchanged
  directory identity, and 48 observed idle hours. Reject symlink roots and
  unknown contents. Recheck before removal.
- uv: use native `uv cache prune` after 48 observed idle hours for the entire
  cache, with no uv process or cached tool running. Check every cache entry's
  latest change time before pruning. Require uv's in-use lock support. Use a
  short lock timeout and never `--force`, `--ci`, or direct cache deletion.

The first run starts the idle clock. Active use or a gap over 12 hours resets
it. An incomplete scan defers cleanup. The guard never kills a tool or restarts
an app. uv 0.13.6 has no age filter; continued daily cache activity therefore
defers its whole-cache prune. The report keeps that reason visible.

## Coverage and limits

Whisper is retained on HomeSSD under
`Generated/SINGLETON_SYSTEMS/source/whisper-models/ggml-medium.en.bin`.
Its original `~/.cache/whisper-models/ggml-medium.en.bin` path stays a symlink.
Both paths are protected from cleanup, including parent-folder removal.
The guard checks the drive identity, file size and link. Missing or changed
routing produces an alert, never an internal download or automatic migration.
Age and size do not permit removal. A new request naming Whisper is required.

Watch uv, npm, pip, Homebrew, pnpm, Chrome copies, Codex temporary data,
worktrees and history, browser engines, Claude's VM, HyperFrames, Whisper,
background-removal and Audio Hijack models, Premiere cache, and Apple assets.
Find project dependencies, build output, scratch copies, and Git data within
3 directory levels of Development and Codex worktrees.

Source, Git, worktrees, history, media, models, and app data require separate
review. Size alone never permits deletion. A linked path is reported without
following it. Folder sizes can share APFS blocks; use the observed free-space
change after cleanup and do not add overlapping rows.

State lives in the native private local-state folder. Keep 1 latest report and
120 compact history records. A lock prevents overlapping runs. `health` fails
when the last complete run is older than 12 hours. A Codex heartbeat runs only
when its scheduler can execute; a missed check must remain visible.

## Sources checked on October 29, 2026

- [uv cache policy](https://docs.astral.sh/uv/concepts/cache/): native pruning,
  shared-cache locks, and APFS accounting. Firecrawl SHA-256:
  `6ffe29b1e1b931b4e8447866b58e41761c00008a501f6bb75d825e89d5edc3cd`.
- [uv tool environments](https://docs.astral.sh/uv/concepts/tools/): cached
  tool environments persist between calls.
- [Chrome clone implementation](https://chromium.googlesource.com/chromium/src/+/refs/heads/main/chrome/browser/mac/code_sign_clone_manager.mm):
  copy creation, bundle identity, and shutdown cleanup. Firecrawl SHA-256:
  `799dbb4b6eab5fbedc8c05ba8e57c9b2df63811f5af3523e8666c105086dfac1`.
- [Git worktrees](https://git-scm.com/docs/git-worktree): shared repository
  data and guarded worktree removal.
- [uv upgrades](https://docs.astral.sh/uv/getting-started/installation/):
  the standalone installer supports `uv self update`.
