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
- Format descriptions as CommonMark. Use one `#` title only for a standalone
  document; otherwise start at `##`. Put real blank lines around headings,
  bullets, and fenced code blocks. Never print escaped `\n` as layout.
- Do not create a new Asana project for a client. Use the correct project and
  section.

## Development workflow

- `Backlog`: captured but not accepted.
- `Todo`: accepted and unclaimed.
- `In Progress`: claimed during the current work session.
- `In Review`: an answer or artifact awaits Jerami's review.
- `Done`: reviewed and observable.
- Due dates represent real deadlines only.
- Format Linear bodies with the same CommonMark and blank-line contract used
  for Asana descriptions.

For Development, prefer the server-side Linear GraphQL gateway. Use the Linear
connector only when the gateway lacks the required operation. For AI Consulting
or Content Editor, use the connected Asana tool and read the task back after a
write. Stop when Asana is not connected.

`ready-for-build` means a Development issue is specified enough for Jerami to
begin or approve implementation. It does not start an agent, sub-agent, branch,
or background task.
