# Video storage

The front-facing tool is
[`s-systems:video-storage`](../plugins/s-systems/skills/video-storage/SKILL.md).
Use it for video intake, MediaSSD project placement, renders, proxies, storage
migration, retention, and exact-path cleanup.

## Storage boundary

- Git on the internal SSD owns source code, manifests, scripts, project
  configuration, and small intentional website assets.
- `/Volumes/MediaSSD/02_EDITING/CLIENTS/<CLIENT>/<PROJECT>/` owns raw footage,
  source media, renders, proxies, snapshots, previews, and analysis media.
- `dev-storage` owns dependencies, caches, runtimes, and worktrees. It does not
  organize or retire video media.

The video-storage tool contains the volume gate, migration checks, Git boundary,
and retention contract. Client-specific status and cleanup receipts belong with
that client's project evidence, not in this shared pointer.
