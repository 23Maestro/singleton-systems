---
name: eagle
description: Use when searching, organizing, tagging, or managing assets in the local Eagle library.
allowed-tools: Bash(node *)
---

# Eagle API Skill

Eagle owns portfolio and client assets. It must be running at `127.0.0.1:41596`.

```bash
node scripts/eagle-api-cli.js list
node scripts/eagle-api-cli.js help <tool>
node scripts/eagle-api-cli.js call <tool> --json '{"key":"value"}'
```

For a public Frame.io folder that must land on an external-drive watch path,
use `scripts/frameio-share-download.mjs`. It reads the public share manifest,
downloads originals with resume support, and keeps completion state without
storing signed URLs.

Use `list` to discover tools and `help <tool>` for the exact parameters.

Before a mutation, identify the selected asset and intended metadata change.
Never use Eagle as task state or a code runtime. For client video asset placement,
Premiere boundaries, or review staging, read `references/client-edit-boundaries.md`.
To pick the motion engine for a beat and record the delivery envelope, read
`references/motion-engine-routing.md`.
