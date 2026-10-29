# SSystems Plugin

Versioned source for the Singleton Systems Codex plugin.

- Skills: `skills/*/SKILL.md`
- Reusable system contract: `../../docs/harness/README.md`
- Routing registry: `../../config/cerebral-registry.json`

Installed Codex and Claude copies are release outputs. Do not edit them as a
source of truth.

## Video skill ownership

`client-video-storyboard` owns shared intake, reference analysis and storyboard
handoff. `lineups-editor` owns Catena Media Lineups lanes, assets, engine routes,
timing and delivery gates. Figma mechanics stay in `singleton-figma-system`.
Frame annotations, online batches and source-chat delivery belong to the shared
review engine.

The old Lineups reference and helper paths in `client-video-storyboard` forward
to `lineups-editor`. They preserve existing hooks and saved chats. These entries
contain no duplicate policy or validation. Keep them until the hook
and saved entry points have a reviewed migration.

Use the repo-owned release command after changing this plugin:

```bash
npm run plugins:release -- --dry-run
npm run plugins:release
```

The release command validates the canonical skills and Cerebral contracts,
bumps all three plugin manifests, syncs the local Codex and Claude mirrors,
refreshes the installed Codex plugin, verifies exact parity, moves stale cache
versions to Trash, and prints the fresh-task notice.

An explicit version is allowed when needed:

```bash
npm run plugins:release -- --version 0.2.1+codex.YYYYMMDDHHMMSS
```

Installed copies are release outputs. Never edit a mirror or cache as a source
of truth. A release does not change the skill catalog of an open Codex task.
