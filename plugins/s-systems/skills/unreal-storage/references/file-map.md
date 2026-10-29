# Unreal file map

Placement follows file purpose and size. These are setup rules, not an inferred
preference for one disk.

| Files | Home | Reason |
| --- | --- | --- |
| Epic launcher | Applications | Small app with normal updates |
| Xcode and Metal tools | Apple-managed locations | SDK and toolchain links |
| Scripts, control data, provenance | Internal Git workspace | Small, reviewable source |
| Unreal engine | UnrealSSD / SINGLETON_SYSTEMS / source / unreal / engines | Large runtime on compatible APFS |
| Pristine Epic packages | UnrealSSD / SINGLETON_SYSTEMS / source / unreal / samples | Downloadable reference sources |
| Editable project with Content and maps | UnrealSSD / CLIENT / source / unreal / projects | Keep linked binary assets together |
| Local DDC and Zen | UnrealSSD / SINGLETON_SYSTEMS / source / unreal / cache | Rebuildable data shared by projects |
| Video outputs | HomeSSD / CLIENT / renders or previews / unreal | Existing media route |
| Original authored project backup | Internal disk or another physical device | External volumes share one physical X9 |

The registered volume record is `config/unreal/storage.json` in Singleton
Systems. Resolve the repository through the bundled helper before using it.

All UnrealSSD paths above are inside `/Volumes/UnrealSSD/Generated/`. Media
outputs retain `/Volumes/HomeSSD/Generated/`. Use the helper to resolve paths
after the matching volume gate. Keep `.uasset`, `.umap`, and large package
content out of normal repository history. A source-control choice for authored
binary assets is separate from this first setup.

Do not split a downloaded package across disks by replacing Content folders
with arbitrary links. Keep the pristine package and a separate editable copy.
Exclude only proven rebuildable data from a backup: DerivedDataCache,
Intermediate, and generated builds. Saved may hold recovery work and must be
reviewed before removal.

## First packages

- [Sports Broadcast: Motion Design Sample](https://www.fab.com/listings/a7a18cf4-1020-4d84-921f-949b8c9233e9)
- [Broadcast Hype Chamber](https://dev.epicgames.com/documentation/unreal-engine/broadcast-esports-hype-chamber-sample-with-motion-graphics-in-unreal-engine)

Use the launcher-supported version for each package. Do not upgrade a pristine
sample in place. Record terms from the actual acquisition screen.

## Cache and agent sources

- [Local DDC](https://dev.epicgames.com/documentation/unreal-engine/using-derived-data-cache-in-unreal-engine)
- [Zen paths](https://dev.epicgames.com/documentation/unreal-engine/using-zen-storage-server-as-cooked-output-store-for-unreal-engine)
- [Editor Python](https://dev.epicgames.com/documentation/unreal-engine/scripting-the-unreal-editor-using-python)
- [Official Unreal MCP](https://dev.epicgames.com/documentation/unreal-engine/unreal-mcp-in-unreal-editor)
- [Epic agent skill](https://github.com/EpicGames/unreal-engine-skills-for-claude-code-plugin)

Use `UE-LocalDataCachePath` and `UE-ZenDataPath` for the launched editor process.
The helper also sets their Mac environment aliases. Check actual
`LogDerivedDataCache` and Zen messages after launch. Launcher-started sessions
need the same cache settings saved outside the helper. On this Mac, the global
Local DDC path is saved through Editor Preferences. Zen DataPath is saved in
Epic's user key-value store. Both point to the cache folders above. The helper
still checks the mounted volume before each launch. Small Apple and Epic runtime
records can remain internal.

## Live editor connection

Unreal 5.8 provides the experimental `ModelContextProtocol` and `AllToolsets`
plugins. Epic's `unreal-mcp` skill includes Codex setup instructions. The source
and install record lives in `config/unreal/agent-tools.json` in this repository.
Installing the skill does not start a server or enable project plugins.

After the engine is installed, check that both plugins exist in that build.
Use a named working copy for the connection. Preserve any existing Codex config;
Epic's config writer will not overwrite an existing `.codex/config.toml`.
Keep the server on the local loopback interface. Read the live tool schemas
before calls, run dependent edits in order, and save before asset changes.
Confirm the connection with a read-only editor call before any test scene edit.
The Python runner remains available for builds without these plugins.

The LineupsAgentTrial working copy has both native plugins enabled and MCP
autostart set to port 18180 at `/mcp`. Its HTTP listener binds to `127.0.0.1`.
Codex has `unreal-mcp` configured at `http://127.0.0.1:18180/mcp`. Start that
working project before using the connection. A live actor creation and label
readback passed. Sample intake and a short render remain open.

The installed engine is registered with Epic at the UnrealSSD engine path.
Its internal duplicate and the incompatible HomeSSD duplicate were removed
after file checks and a successful external launch. Launcher registration and
cache-setting backups are retained in private local setup state.

## Mac filesystem and speed check

The installed UE 5.8.3 rejects case-sensitive filesystems at startup. UnrealSSD
is a separate, ordinary APFS volume in MediaSSD's existing APFS container. The
existing HomeSSD and MediaSSD volumes keep their formats and data. All three
volumes use one X9 2 TB (`CT2000X9SSD9`), so they share device bandwidth.

An 8 GiB test with macOS file caching disabled measured 838–856 MB/s sequential
reads and 907–944 MB/s writes across three passes. A separate physical-device
counter check measured a 590 MB/s read of an existing 3 GB Unreal file and a
950 MB/s write of 8 GiB. The latter checks confirmed actual device I/O. These
are short-transfer measurements, not a sustained full-drive write benchmark.
The USB connection reports 10 Gb/s. A scene and render test still governs use.

Sources: <!-- writing-source:start -->[Crucial X9](https://www.crucial.com/ssd/x9/ct2000x9ssd9)<!-- writing-source:end -->,
[Apple APFS formats](https://support.apple.com/guide/disk-utility/file-system-formats-dsku19ed921c/mac),
and [Apple APFS volumes](https://support.apple.com/guide/disk-utility/add-delete-or-erase-apfs-volumes-dskua9e6a110/mac).
