---
name: eagle
description: Use when searching, organizing, tagging, or managing assets in the local Eagle library.
allowed-tools: Bash(node *)
---

# Eagle API Skill

Eagle owns proof and client assets. It must be running at `127.0.0.1:41596`.

```bash
node scripts/eagle-api-cli.js list
node scripts/eagle-api-cli.js help <tool>
node scripts/eagle-api-cli.js call <tool> --json '{"key":"value"}'
```

Use `list` to discover tools and `help <tool>` for the exact parameters.

Before a mutation, identify the selected asset and intended metadata change.
Never use Eagle as task state or a code runtime. For client video asset placement,
Premiere boundaries, review staging, or Remotion handoff, use
`docs/portfolio/eagle-client-edit.md` in the Singleton Systems repository.
