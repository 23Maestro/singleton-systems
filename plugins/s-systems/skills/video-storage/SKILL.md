---
name: video-storage
description: Route active media to Active Work and kept media to Media Library on HomeSSD. Keep Generated for reviewed disposable files. Preserve sole originals in Eagle or MediaSSD. Use for video-media storage; use dev-storage for dependencies, runtimes, and Git worktrees.
---

# Video Storage

Keep the reusable edit system in Git. Active Work holds open jobs. Media Library
holds kept media. Generated holds only reviewed disposable files after migration.
Keep the durable copy of irreplaceable source in Eagle or MediaSSD.

## Ownership

- Keep source code, Git metadata, manifests, lockfiles, scripts, project
  configuration, and small intentional website-delivery assets in the repository
  on the internal SSD.
- Put new working media under `/Volumes/HomeSSD/Active Work/<CLIENT>/<TYPE>/`.
  Types are `source`, `audio`, `renders`, `previews` and `references`.
- Put kept media under `/Volumes/HomeSSD/Media Library/<CLIENT>/<TYPE>/`.
  Types are `Templates`, `References` and `Deliverables`.
- Generated accepts no new jobs, renders, receipts or active caches through the gate.
  Existing files there remain protected until the cleanup owner verifies migration.
  A folder name alone never makes an existing file disposable.
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

Use `npm run storage:gate -- route --client "<name>" --kind <kind>` for active work.
Use `npm run storage:gate -- route --area library --client "<name>" --kind templates|references|deliverables`
for kept media. Use `check-output --path "<absolute path>"` before a producer writes
a supplied output path; use `--area library` for a library output. These commands apply
this gate, create the destination, and print its absolute path. Normalize client
names to upper snake case. If client context is unavailable, route to `_INBOX`;
never guess a client and never fall back to the internal disk.

## Project Setup

- Use the shallow client/type structure. Do not add a project layer unless a
  later approved policy changes the contract.
- Configure HyperFrames render output under the client's Active Work `renders` directory
  and extracted frames at
  `/Volumes/HomeSSD/Active Work/hyperframes/cache/extracted-frames`.
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

## 14-Day Review

Every 14 days, inventory generated-media candidates by exact path and size.
Check project and task state, workflow references, editor links, open processes,
and whether a verified replacement or durable original exists. Identify reusable
examples and their existing home before proposing cleanup. Keep reusable workflow
source in Git. Route open-job media to Active Work and kept media to Media Library. Use `dev-storage` for developer caches and worktrees. Use Jev to rank
explicit, evidence-backed options and Graphify only for scoped code relationships
when its output storage gate passes. Neither tool establishes deletion safety.

Report each candidate's purpose, dependencies, size, proposed home or disposal,
and unknowns. Preserve source, active work, approved exports, milestones and
uncertain files. Obtain explicit approval for exact paths before retiring existing
copies. After approved cleanup, measure the actual free-space change.

Report the verified volume, chosen client/type path, files kept in Git, durable
source location, exceptions, and any migration or retirement still awaiting
approval.

## Closeout and migration

Use each Lane's existing operations entry. Check the final file and receipt,
keep reusable source, and list exact disposable byproducts. Only those reviewed
byproducts may enter Generated after required approval. This gate does not move
or delete files, approve delivery, or certify the old Generated inventory.

The cleanup chat owns the old-to-new map, copy hashes, editor relinks, playback
and source retirement. Keep existing input paths until those checks pass. New
output paths use this gate now. Do not leave obsolete pointer files after a
verified move. Supabase receipt links and task links must follow the real file.

Codex and Claude register the same gate for Bash and exec_command. It checks
direct HyperFrames render commands. Native producers must use route or
check-output; this hook is not a filesystem-wide write monitor.
