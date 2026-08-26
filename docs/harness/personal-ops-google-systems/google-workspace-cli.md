# Google Workspace command architecture

The canonical identity model is:

```text
Primary Google account and file owner: jerami@singleton-systems.com
Business email alias: flow@singleton-systems.com
```

Both addresses reach the same Workspace account. Authentication and Google file
ownership resolve to the primary address. A record that uses the Flow alias
does not imply another account or an ownership transfer.

The shell command `gws` is the Homebrew Google Workspace CLI. It is the
canonical command for general Drive, Gmail, Forms, Sheets, and Docs work. It is
an executable at `/opt/homebrew/bin/gws`, not a shell alias.

Repo npm commands own two custom needs:

- the Personal Ops Sheet and Form contract;
- resumable Drive uploads that keep local session state.

The custom script is `scripts/google-workspace-repo-ops.mjs`. It does not
implement general Drive search, Drive download, or Gmail draft commands.

## general Google Workspace commands

Check the installed CLI and active account:

```bash
command -v gws
gws --version
gws auth status
```

List Drive files:

```bash
gws drive files list \
  --params '{"pageSize":10,"fields":"files(id,name,mimeType)"}'
```

List Gmail drafts without sending or deleting mail:

```bash
gws gmail users drafts list \
  --params '{"userId":"me","maxResults":10}'
```

Use `gws schema <service.resource.method>` before a write when the request body
is unclear.

## repo commands

The repo OAuth token is separate from `gws` authentication. Check its account
before Personal Ops work:

```bash
npm run google:repo:whoami
```

Create or refresh that repo token only when needed:

```bash
npm run google:repo:auth
```

The command writes `.google-workspace/repo-ops-token.json`. Existing
`workspace-token.json` and `flow-token.json` files remain readable during the
local migration.

Create a new Personal Ops Chores Sheet and Form:

```bash
npm run personal-ops:chores:setup
```

Read the live Sheet and Form contract without changing it:

```bash
npm run personal-ops:chores:status
```

Repair the current Chores and Home Tasks source contract:

```bash
npm run personal-ops:chores:repair
```

Resume a large Drive upload after a network break:

```bash
npm run drive:upload:resumable -- \
  --file "/absolute/path/video.mp4" \
  --dest "DRIVE_FOLDER_ID"
```

The upload command records progress in
`.google-workspace/drive-upload-session.json`.

## account and API setup

The repo OAuth client needs the Forms, Sheets, and Drive APIs. Save its Desktop
OAuth JSON at:

```text
config/google-workspace/oauth-client.json
```

That file and all local tokens are gitignored. The OAuth template at
`config/google-workspace/oauth-client.example.json` contains no credentials.

The local clasp profile label is also `flow`. That machine label selects the
same account. The live Sheet and Form owner remains
`jerami@singleton-systems.com`.

## Personal Ops boundary

The Forms API creates and updates the form. The Sheets API creates and updates
the spreadsheet. Apps Script links form responses to the spreadsheet through
`FormApp.setDestination()`.

The setup command writes live IDs and owner metadata to:

```text
.google-workspace/personal-ops-chores.json
```
