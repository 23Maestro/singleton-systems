---
name: video-storage
description: Route video project files between Git and MediaSSD, including intake, renders, proxies, storage migration, retention, and safe cleanup. Use for video-media storage; use dev-storage for dependencies, caches, runtimes, and worktrees.
---

# Video Storage

Keep the reusable edit system in Git and the heavy media package on MediaSSD.

## Ownership

- Keep source code, Git metadata, manifests, lockfiles, scripts, project
  configuration, and small intentional website-delivery assets in the repository
  on the internal SSD.
- Put raw footage, source media, renders, proxies, snapshots, previews, and
  analysis media under
  `/Volumes/MediaSSD/02_EDITING/CLIENTS/<CLIENT>/<PROJECT>/`.
- Keep each video's working media and generated outputs together. Use
  project-relative paths where the editor supports them.
- Treat Eagle as a separate catalog. Confirm whether an import creates another
  file before using Eagle as a working-media destination.
- Use `dev-storage` for dependencies, caches, runtimes, and Git worktrees. It
  does not organize or retire video media.

## Volume Gate

Before downloading, generating, migrating, or rendering large artifacts:

1. Verify that MediaSSD is mounted as a physical volume, not merely present as
   a directory.
2. Verify its expected volume UUID
   `AE796278-38CF-438E-8C7E-BBEE1CC1A327`.
3. Verify write access and sufficient free space for the operation.
4. Stop if any check fails. Do not use the internal SSD as a fallback.

## Project Setup

- Use upper snake case for new client and project directories. Preserve
  tool-managed folder names such as `assets`, `renders`, and `snapshots`.
- Configure each tool's output and cache directory directly when supported.
  Otherwise use a clearly named project pointer or symlink to the verified
  MediaSSD location.
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

Report the verified volume, chosen project root, files kept in Git, media paths
kept on MediaSSD, exceptions, and any migration or retirement still awaiting
approval.
