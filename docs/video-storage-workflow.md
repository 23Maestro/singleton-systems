# Video storage

The front-facing tool is
[`s-systems:video-storage`](../plugins/s-systems/skills/video-storage/SKILL.md).
Use it for video intake, HomeSSD working-media placement, renders, previews,
retention, and exact-path cleanup.

## Storage boundary

- Git on the internal SSD owns source code, manifests, scripts, project
  configuration, and small intentional website assets.
- `/Volumes/HomeSSD/Generated/<CLIENT>/<TYPE>/` owns generated media and
  replaceable working copies. Valid types are `source`, `audio`, `renders`,
  `previews`, and `references`; missing client context uses `_INBOX`.
- Eagle or MediaSSD owns the durable copy of irreplaceable raw footage and
  client source. HomeSSD is unencrypted and cannot be the only copy.
- `dev-storage` owns dependencies, runtimes, worktrees, and general developer
  caches. The HyperFrames extracted-frame media cache is the explicit exception
  owned by this gate. `dev-storage` does not organize or retire video media.

Run `npm run storage:gate -- route --client "<name>" --kind <kind>` before
placing new work. The command verifies HomeSSD UUID
`0EB7E204-D359-47B2-B9B1-89B2DC77BC5A`, write access, and at least 50 GiB free.
HyperFrames renders must use the returned client `renders` directory, and its
extracted-frame cache belongs at
`/Volumes/HomeSSD/Generated/hyperframes/cache/extracted-frames`.

The video-storage tool contains the volume gate, migration checks, Git boundary,
and retention contract. Client-specific status and cleanup receipts belong with
that client's project evidence, not in this shared pointer. Existing media is
not migrated or retired by this tracer bullet.
