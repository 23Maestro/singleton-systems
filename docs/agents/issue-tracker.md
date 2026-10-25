# Task systems

Singleton Systems uses task systems by Lane.

## Ownership

- Linear owns Development tasks, status, priority, assignment, blockers, and
  resolution.
- Asana owns AI Consulting and Content Editor tasks and project state.
- GitHub holds linked implementation evidence such as branches, commits, and
  pull requests.
- GitHub Issues do not duplicate Linear or Asana tasks.
- Notion owns client and portfolio records.
- Supabase holds integration receipts and temporary drafts when needed.

## Asana

Use the `singleton-systems.com` workspace.

- `AI Consulting` (`1218884867598641`) uses `To Do`, `In Progress`, and `Done`.
- `Content Editor` (`1218890014545436`) groups tasks under client sections.
- Project names are one to three words.
- Task and parent-task names are two to four words: a verb plus the object.
- Put context, links, dates, and any former Linear link in the description.
- Draft with grouped sections and real blank lines. Send formatted Asana
  descriptions through `html_notes`, using supported XML-compatible HTML in
  a `<body>` root. Use `<h2>`, `<strong>`, `<ul>/<li>`, `<a href="...">`, and
  `<pre>` as needed; escape text and close every tag. `notes` is plain text
  and does not render CommonMark. Do not send both fields in one update.
  Read back `notes` and `html_notes` after writing. Use subtasks for actionable
  work; Markdown checkbox syntax is not an interactive Asana checklist.
- Do not create a new Asana project for a client. Use the correct project and
  section.

## Development workflow

- `Backlog`: captured but not accepted.
- `Todo`: accepted and unclaimed.
- `In Progress`: claimed during the current work session.
- `In Review`: an answer or artifact awaits Jerami's review.
- `Done`: reviewed and observable.
- Due dates represent real deadlines only.
- Format Linear bodies as CommonMark with headings, bullets, fenced code when
  useful, and real blank lines. Asana uses the HTML transport defined above.

For Development, prefer the server-side Linear GraphQL gateway. Use the Linear
connector only when the gateway lacks the required operation. For AI Consulting
or Content Editor, use the connected Asana tool and read the task back after a
write. Stop when Asana is not connected.

`ready-for-build` means a Development issue is specified enough for Jerami to
begin or approve implementation. It does not start an agent, sub-agent, branch,
or background task.

## shared task closeout

### Development task entry

`scripts/task-lifecycle.mjs` uses the same Linear owner and closeout path.
Review a JSON plan with `plan --file PLAN`. Create its tasks with
`create --file PLAN --approved-hash HASH` only after scope review. The plan
needs stable request and task keys, finish checks, local blocker keys, and
separate `attentionMinutes`, `toolMinutes` and `waitingMinutes` estimates.
Use `null` for an unknown estimate. Parent totals summarize the children;
count each child once when planning a day.

Use `context --id TASK` to read current details, children, comments and blockers.
Use `start --id TASK --session SESSION --turn TURN` to read that context and
bind the exact owner ID. Then use `check`, `finish` or `defer` with those same
IDs. Entry does not run task instructions or start an agent. Private receipts
under `~/.local/state/singleton-systems/task-lifecycle/` prevent duplicate
retries and keep failed writes open. Changed records need review.

### closeout steps

Use this during normal selected work. No named skill is needed.

1. Find the existing task in its owning system. Match the outcome and project,
   not just a similar title. Resolve unclear matches before changing state.
2. Bind its exact ID to the chat. State what will count as finished. Read a
   task already marked Done before repeating its work.
3. Test the result or use Jerami's clear confirmation. A file name, an export,
   a completed chat or a passed test does not supply a missing client approval.
4. Close only the proven subtasks. Close the parent after every required
   child and the parent's own finish check pass. Use Jerami's current, explicit
   completion confirmation when it supersedes an older review note. Keep that
   confirmation scoped to the named batch or episode.
   Put a short current result above earlier task notes so old pending-review
   text cannot read as the next step. Keep source links and earlier context.
   Read the completion state and saved result back before closing the parent.
5. If work or approval remains, leave the task open. Record that next step
   with `defer`. Keep the link for resume.

Task upkeep is part of the selected work. It does not authorize publishing,
client messages or changes outside that task. Keep research and unrelated
backlog items outside this closeout. Readback failure stays pending.

## saved command notes for Codex

The existing hooks call `scripts/task-closeout.mjs hook` on prompt, resume and
Stop. The command shares the Command Center's server-only Asana and Linear
transport. Asana uses its configured token or Composio proxy. Missing access
leaves work open; do not switch accounts or request new access silently.

Use the active hook's session and turn IDs. These are agent commands; Jerami
does not need to run them:

```bash
npm run task:closeout -- bind --session SESSION --turn TURN --owner asana --id TASK --done-when "Jerami approves the exports"
npm run task:closeout -- check --session SESSION --turn TURN --owner asana --id TASK
npm run task:closeout -- finish --session SESSION --turn TURN --owner asana --id TASK --children CHILD1,CHILD2 --evidence "Jerami confirmed completion in this chat"
npm run task:closeout -- defer --session SESSION --turn TURN --owner asana --id TASK --reason "Playback approval is still pending"
```

Use `--owner linear` for Development. Linear accepts its issue key or stable
ID; `--children` uses exact child IDs. Omit children when none need closing.
`finish` saves the evidence as a current completion summary, keeps the earlier
description below an `Earlier task notes` heading, and verifies both summary
and completion through native readback. Use `--summary TEXT` when the short
reader-facing result should differ from the evidence. Asana uses `html_notes`
and verifies both saved description fields; Linear uses CommonMark. Repeating
the same summary does not add it twice. A missing summary keeps closeout pending.
The command never assumes an open child is finished. The hook does not judge
media, test coverage or approval.

Bindings and readback hashes stay in private local state under
`~/.local/state/singleton-systems/task-closeout/`. They retain links and proof,
not another backlog. Asana and Linear remain the task owners. Prompt/resume
shows pending bindings. Stop checks only work bound in the active turn and
allows a clear deferred result. It never retries writes or runs a backlog sweep.
