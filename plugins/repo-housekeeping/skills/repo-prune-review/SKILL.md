---
name: repo-prune-review
description: Review a repository folder for stale documents, unused code, and cleanup candidates before changing files. Trace callers and installed skills, separate useful sections from stale sections, and report Keep, Update, Archive candidate, or Check first with evidence. Read-only by default.
---

# Repo prune review

Review one named folder at a time. Start with the folder already open in the
user's review. Read the repository's agent guide and preserve dirty work.
Audit findings and review picks do not authorize deletion or publication.

## Find what depends on it

Resolve `REVIEW_REPO` to the verified repository. If it provides the canonical
`.agents/skills/repo-prune-review` alias, use that directory for
`PRUNE_SKILL_ROOT`; its hook requires the registered source path. Otherwise use
the absolute installed directory containing this skill. Run the bundled helper for selected documents:

```bash
node "$PRUNE_SKILL_ROOT/scripts/doc-evidence.mjs" --repo "$REVIEW_REPO" file.md
```

The helper reads files and prints JSON. It never runs document commands.
Add verified installed skill directories with `--extra-root PATH` when external
callers matter. Report searched roots and skipped surfaces.

For documents, read each whole file. Trace rules to the current guide, route,
hook, check, or owner skill. Classify sections when a file mixes useful and
stale material. A test requiring old wording proves that the test depends on
it; it does not prove that the wording is correct.

For code, inspect routes, imports, package scripts, assets, fixtures, hooks,
and dynamic loading. Use an existing analyzer only when its entry points cover
the project. Read findings before proposing changes. Search hits prove a
reference, not execution. Zero hits and age never prove that something is unused.

## Give a small decision

- **Keep:** Current work depends on it. Name that work.
- **Update:** Useful parts stay. Name stale sections and their replacement.
- **Archive candidate:** A replacement covers the useful parts and no active
  caller was found in the checked scope. Show remaining review gaps.
- **Check first:** A caller, replacement, or behavior remains unclear.

Show the file, a short reason, what could break, and the test result. Put long
evidence behind a link. Record source hashes, scope, and check times. Separate
historical mentions from active callers. Do not convert search counts into
automatic archive decisions.

## Test the exact change

Inspect checks for publishing or writes before running them. Record baseline
failures first. Test a proposed removal or section rewrite in an isolated copy
or temporary read overlay. Never hide or rename originals to simulate removal.
Compare relevant checks with the baseline. Inspect agent and manual workflows
that compilation cannot test. Passing covers only the tested behavior.

After explicit approval, apply only named changes and verify again. Prefer a
recoverable archive before deletion. Under a delete-nothing request, retain
originals. Return results to the owning review batch only when that handoff
exists; otherwise provide JSON and state that sending is pending.
