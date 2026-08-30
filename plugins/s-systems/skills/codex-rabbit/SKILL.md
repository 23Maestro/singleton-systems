---
name: codex-rabbit
description: Review an active repository diff twice and record a fail-closed, commit-bound receipt when CodeRabbit or a pull request is unavailable.
---

# Codex Rabbit

Use for code review before commit or merge. Work in the current task. Do not
create a pull request just to run this gate.

## Review

1. Read the repository contract and active diff.
2. Check external writes, durable state, receipt binding, timeouts, preserved
   errors, schema drift, and recovery tests.
3. Record each finding with file, line, risk, proof, fix, verification, and
   status. Use `references/finding-contract.md`.
4. Run the initial pass. An open finding is expected to leave it incomplete.
5. Apply valid fixes within the approved scope.
6. Run the verification pass with every prior finding marked resolved or left
   open. Missing findings remain open.
7. Show the state path and receipt hashes. Stop for human approval.

## Commands

```bash
npm run review:codex-rabbit -- --pass initial --findings /tmp/findings.json --allow-incomplete
npm run review:codex-rabbit -- --pass verification --findings /tmp/findings.json --allow-incomplete
```

After Jerami approves the exact scope:

```bash
npm run review:codex-rabbit -- --approve --reviewer Jerami --evidence "Reviewed current scope"
```

Never report clean or done while a check, finding, current-scope readback, or
human approval is pending. Commit, push, merge, release, and live connector
writes keep their own approval gates.
