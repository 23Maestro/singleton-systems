---
name: implement
description: "Implement a piece of work based on a spec or set of tickets. Use only when the user explicitly names this skill."
---

## Invocation contract

Use this skill only when the user explicitly names it. Keep all analysis and execution in the current session. Recommend related skills or a separate task when useful, and leave every launch to the user. Leave agent hooks and model settings unchanged. Stage, commit, push, branch, and worktree actions require a separate explicit request from the user.

Implement the work described by the user in the spec or tickets.
Apply the `tdd` red-green method where possible, at pre-agreed seams.

## Tracer-bullet execution

Start with the thinnest user-visible behavior that crosses the real layers in
the ticket. Name that slice and its completion signal before broad edits.

1. Build only that slice, including its real integration path where one is in
   scope. A schema-only, endpoint-only, or test-only change is not a complete
   tracer bullet for a cross-layer feature.
2. Run the narrowest trustworthy verification immediately: a test, browser
   readback, integration check, or other observable demonstration.
3. Record what is verified, what failed, and what remains unknown.
4. Stop at the slice boundary. Let the user review or redirect before
   expanding; continue with the next slice in a fresh `implement` session.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

Once done, recommend `code-review` as the next explicit skill invocation.

Report the verified changes and stop. Stage or commit only when the user explicitly requests that Git action.
