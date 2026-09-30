---
name: video-storage
description: Route video working copies and generated outputs to HomeSSD while preserving irreplaceable source in Eagle or MediaSSD. Use for video-media storage; use dev-storage for dependencies, runtimes, and Git worktrees.
---

# Video Storage

Keep the reusable edit system in Git, generated and working media on HomeSSD,
and the durable copy of irreplaceable source in Eagle or MediaSSD.

## Ownership

- Keep source code, Git metadata, manifests, lockfiles, scripts, project
  configuration, and small intentional website-delivery assets in the repository
  on the internal SSD.
- Put generated media and replaceable working copies under
  `/Volumes/HomeSSD/Generated/<CLIENT>/<TYPE>/`, where `<TYPE>` is `source`,
  `audio`, `renders`, `previews`, or `references`.
- Keep the sole durable copy of raw footage or other irreplaceable client
  source in Eagle or MediaSSD. HomeSSD is unencrypted and must not be its only
  home.
- Treat Eagle as a separate catalog. Confirm whether an import creates another
  file before using Eagle as a working-media destination.
- Use `dev-storage` for dependencies, runtimes, Git worktrees, and general
  developer caches. This gate owns the HyperFrames extracted-frame media cache;
  `dev-storage` does not organize or retire video media.

## Volume Gate

Before downloading, generating, copying, or rendering large artifacts:

1. Verify that HomeSSD is mounted as a physical volume, not merely present as
   a directory.
2. Verify its expected volume UUID
   `0EB7E204-D359-47B2-B9B1-89B2DC77BC5A`.
3. Verify write access and at least 50 GiB of free space.
4. Stop if any check fails. Do not use the internal SSD as a fallback.

Use `npm run storage:gate -- route --client "<name>" --kind <kind>` to apply
this gate, create the destination, and print its absolute path. Normalize client
names to upper snake case. If client context is unavailable, route to `_INBOX`;
never guess a client and never fall back to the internal disk.

## Project Setup

- Use the shallow client/type structure. Do not add a project layer unless a
  later approved policy changes the contract.
- Configure HyperFrames render output under the client's `renders` directory
  and extracted frames at
  `/Volumes/HomeSSD/Generated/hyperframes/cache/extracted-frames`.
- Record source URL, license, checksum, and project-relative path for selected
  assets in the project manifest.
- Start preview and render tools from the real project root so links and output
  locations remain predictable.

## Existing Projects

Do not move an active project automatically. Inventory open processes, editor
links, project registrations, Git state, and a restore path first. Copy the
complete media package without changing its structure, then verify file counts
and checksums. Relink absolute paths, open the edit, confirm playback, and run a
short render. Retire the original only after those checks and explicit approval.

## Git Boundary

Do not add raw media or generated outputs to normal Git history. Do not blanket
ignore `/videos/**`; that can hide manifests, compositions, and reusable
workflow code. Use exact output paths or file classes when an ignore rule is
actually needed, and review staged files before committing.

An optimized website asset may remain in Git only when the site ships it and
the file is 25 MiB or smaller. Anything larger requires an explicit CDN,
object-storage, or Git LFS decision.

## Retention

Retain the current approved export, review copy, named milestones, licenses,
and irreplaceable source. Review superseded renders and comparison frames by
exact path. Never delete source, active media, or editor-linked files solely
because they are large or old.

Report the verified volume, chosen client/type path, files kept in Git, durable
source location, exceptions, and any migration or retirement still awaiting
approval.
