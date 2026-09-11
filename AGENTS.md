# AGENTS.md

Read `CODEX.md` before exploring or changing this repository. It owns the
architecture, commands, conventions, required references, and verification.
Codex drives implementation in the current task. Do not dispatch sub-agents,
create AFK work, or start background implementation unless Jerami explicitly
asks. Preserve unrelated changes and honor Jerami's scope, delivery, and
external-change gates.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
