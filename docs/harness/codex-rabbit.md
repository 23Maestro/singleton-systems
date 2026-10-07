# Codex Rabbit review gate

## Contract

`npm run review:codex-rabbit` reviews one repository scope. The scope binds the
HEAD commit, active diff, untracked files, base ref, and repository contract.

The initial pass records findings. The verification pass must resolve each open
finding and pass every configured command. Human approval is the final receipt.
Any later diff or contract change makes that approval stale.

The state file is resumable and locked. Each completed pass adds a chained
SHA-256 receipt. A changed config, broken chain, timeout, missing pass, open
finding, or stale scope leaves the review incomplete.

This is a local review transaction. It does not promise ACID behavior across
GitHub, Linear, plugin runtimes, or other apps.

## Retained state

The default is `~/.local/state/singleton-systems/reviews/<hash>.json`. The hash
binds the real repository path, review ID and optional task/run binding. The
directory uses mode 0700; files use mode 0600. Locks, atomic replacement and
receipt chains remain active. Explicit `--state` paths retain their meaning.
Old OS temporary state stays in place. No automatic migration occurs.

## Code delivery declarations

The Cerebral prompt hook supplies the active session and turn IDs. Bind both
review passes to those IDs and the same task:

```bash
npm run review:codex-rabbit -- --task H10 --session SESSION --run TURN --pass initial --findings /tmp/findings.json --allow-incomplete
npm run review:codex-rabbit -- --task H10 --session SESSION --run TURN --pass verification --findings /tmp/findings.json --allow-incomplete
```

Declare a local code result with one standalone line in the final reply:

```text
[code-delivery] {"taskId":"H10","sessionId":"SESSION","runId":"TURN","outcome":"ready"}
```

Include `statePath` when using explicit state. The Stop bridge always reads
`config/reviews/singleton-systems.json` from the current repository. Custom
`--config` reviews cannot replace that delivery contract.

`ready` requires passing execution evidence, resolved findings, valid bound
receipts, and a fresh scope readback. The verification receipt expires after
24 hours. `approved` also requires the current human approval receipt; it
does not claim that a release happened. `incomplete` and `cancelled` can end
without passing evidence. Research, review and progress replies need no
declaration. Plain prose is not classified as a delivery claim.

Use the same `--task`, `--session`, `--run` and optional `--state` flags with
`--approve`. Approval in a later Codex turn does not make an older turn's
evidence reusable for a new delivery claim; rerun the bound review for that
turn. Existing unbound reviews remain readable through the review CLI.

Missing, failed, stale or altered evidence requests one correction turn. If
`stop_hook_active` is already true, the bridge ends with an incomplete notice.
It runs no checks or external writes. Cancellation starts no repair work.

The [Codex hook contract](https://developers.openai.com/codex/hooks) supplies
`session_id`, `turn_id`, `last_assistant_message` and `stop_hook_active`.
Local fixtures exercise the configured Python hook and Node bridge. Production
Stop delivery and human cancellation in the desktop app remain unverified.

## Adoption

| Lane | Ready now | Needed next | Human review |
| --- | --- | --- | --- |
| System Maintenance | Singleton Systems repository | Add a config file and package command in each repo | Required before commit, merge, release, or live writes |
| Development | Any Git repository with declared checks | Add repo-specific contract files and checks | Required for accepted risk and delivery |
| Content Editor | Script and plugin repositories | Add media-app readback adapters when code mutates external apps | Required before Premiere, Eagle, or Figma writes |
| AI Consultant and Portfolio | Code changes only | Keep AI Consulting task truth in Asana and portfolio truth in Notion; link the code receipt | Required before client or public delivery |

CodeRabbit comments are test inputs. They do not become universal rules until a
fixture proves the failure class belongs in this repository.
