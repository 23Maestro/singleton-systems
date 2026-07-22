# SSystems Plugin

Versioned source for the Singleton Systems Codex plugin.

- Skills: `skills/*/SKILL.md`
- Reusable system contract: `../../docs/harness/README.md`
- Routing registry: `../../config/cerebral-registry.json`

Installed Codex and Claude copies are release outputs. Do not edit them as a
source of truth.

Run `npm run plugins:sync` to review the generated-mirror change, then
`npm run plugins:sync:apply` to update the local Codex and Claude development
sources. Refresh each installed plugin after that release step.
