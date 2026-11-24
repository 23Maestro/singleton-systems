# Video storage

The front-facing tool is
[`s-systems:video-storage`](../plugins/s-systems/skills/video-storage/SKILL.md).
Use it for video intake, HomeSSD working-media placement, renders, previews,
retention, and exact-path cleanup.

## Storage boundary

- Git on the internal SSD owns source code, manifests, scripts, project
  configuration, and small intentional website assets.
- `/Volumes/HomeSSD/Active Work/<CLIENT>/<TYPE>/` holds open-job media.
  Valid types are `source`, `audio`, `renders`, `previews` and `references`.
- `/Volumes/HomeSSD/Media Library/<CLIENT>/<TYPE>/` holds kept media.
  Use `Templates`, `References` and `Deliverables` as needed.
- `/Volumes/MediaSSD/05_FINISHED/<Product>/` holds finished videos, once
  confirmed done. Example: `05_FINISHED/Product-Ads/`.
- Plans and research notes are not media. They live in their Lane folder in
  the repo: `docs/operations/<lane>/<plan>/`. They never go to HomeSSD.
- `/Volumes/HomeSSD/Generated/` is the disposable boundary. The gate routes
  no new work there. Legacy contents stay protected until verified migration.
- Missing client context uses `_INBOX`.
- Eagle or MediaSSD owns the durable copy of irreplaceable raw footage and
  client source. HomeSSD is unencrypted and cannot be the only copy.
- `dev-storage` owns dependencies, runtimes, worktrees, and general developer
  caches. The HyperFrames extracted-frame media cache is the explicit exception
  owned by this gate. `dev-storage` does not organize or retire video media.
- `s-systems:unreal-storage` owns Unreal engine installs, complete project
  placement, and Unreal caches. Its renders still use this client/type gate.
  Original authored Unreal assets need a durable backup internally or on a
  separate physical device. UnrealSSD, HomeSSD, and MediaSSD share one X9 here.

Run `npm run storage:gate -- route --client "<name>" --kind <kind>` before
placing new work. The command verifies HomeSSD UUID
`0EB7E204-D359-47B2-B9B1-89B2DC77BC5A`, write access, and at least 50 GiB free.
HyperFrames renders must use the returned client `renders` directory, and its
extracted-frame cache belongs at
`/Volumes/HomeSSD/Active Work/hyperframes/cache/extracted-frames`.

Use `--area library --kind templates|references|deliverables` to route kept media.
Use `route --kind plan|research --lane content-editor|ai-consulting|development --name <plan>`
for a plan folder. Without a Lane and name, the gate refuses and names that home.
Use `route --kind finished --product <name>` for a confirmed-done video. It checks MediaSSD UUID
`AE796278-38CF-438E-8C7E-BBEE1CC1A327`, write access and 50 GiB free. It
prints `/Volumes/MediaSSD/05_FINISHED/<Product>`. It never falls back to the internal SSD.
Use `check-output --path "<path>"` to validate a supplied active output without
writing media. The matching library check adds `--area library`.

The video-storage tool contains the volume gate, migration checks, Git boundary,
and retention contract. Client-specific status and cleanup receipts belong with
that client's project evidence, not in this shared pointer. Existing media is
not migrated or retired by this tracer bullet.

## Clear only after closeout

Copy the confirmed final to `05_FINISHED` first. Finals and receipts must be
verified and retained. Reusable source must have a
known owner. List exact disposable files only after those checks. Active caches
stay with the open job. Cleanup owns migration, relinks and exact deletion;
changing this gate does not make legacy Generated files safe to clear.
