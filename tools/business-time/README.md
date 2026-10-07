# Business Time sources

The active application lives in the [TimeScribe fork](https://github.com/23Maestro/TimeScribe).
Local checkout: `/Users/singleton23/Documents/Development/business-time-intelligence-fork`.
The fork owns the NativePHP desktop application and Swift financial service.

The retired Glaze prototype and its service build/test wrappers are preserved at
`/Users/singleton23/.codex/worktree-backups/2026-10-07-glaze-retirement`.
They are outside this repository and its website checks.

## Retained native agent

`native-agent/`, `scripts/build-agent.mjs` and `tests/agent-lifecycle.test.mjs`
retain the independent Swift agent experiment. Collection stays disabled.
These files do not implement the fork's active tracker.

```sh
node tools/business-time/scripts/build-agent.mjs
node --test tools/business-time/tests/agent-lifecycle.test.mjs
```

The [fork plans](../../docs/planning/business-time-intelligence/) retain the
architecture history and locked layout reference.
