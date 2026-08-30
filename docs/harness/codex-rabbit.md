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

## Adoption

| Lane | Ready now | Needed next | Human review |
| --- | --- | --- | --- |
| System Maintenance | Singleton Systems repository | Add a config file and package command in each repo | Required before commit, merge, release, or live writes |
| Development | Any Git repository with declared checks | Add repo-specific contract files and checks | Required for accepted risk and delivery |
| Content Editor | Script and plugin repositories | Add media-app readback adapters when code mutates external apps | Required before Premiere, Eagle, or Figma writes |
| AI Consultant and Portfolio | Code changes only | Keep business truth in Linear or Notion; link the code receipt | Required before client or public delivery |

CodeRabbit comments are test inputs. They do not become universal rules until a
fixture proves the failure class belongs in this repository.
