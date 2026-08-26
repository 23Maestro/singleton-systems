# Personal Ops Chores Apps Script

This folder is the local `clasp` project for the Personal Ops chores flow.

Owner account:

```text
jerami@singleton-systems.com
```

Live spreadsheet:

```text
https://docs.google.com/spreadsheets/d/1WixNN_PjxflMoxCjQDfupXVsAJGKZrkiwGzTzXL63go/edit
```

## First-Time Setup

1. Sign into Chrome as `jerami@singleton-systems.com`.
2. Enable Apps Script API for that account:
   `https://script.google.com/home/usersettings`
3. Run:

```bash
npm run gas:login
```

4. Complete OAuth as `jerami@singleton-systems.com`. The npm scripts use the
   local clasp profile label `flow`. That label is not the owner email.
5. Run:

```bash
npm run gas:create:chores
npm run gas:push:chores
npm run gas:open:chores
```

6. In Apps Script, run:

```text
setupPersonalOpsChores
```

Authorize the script. This creates the Google Form, links it to the spreadsheet,
sets validation, and stores the form URLs in script properties.

## Normal Update Loop

Read the live Sheet/Form source contract:

```bash
npm run personal-ops:chores:status
```

Repair the live Sheet/Form source contract after schema edits:

```bash
npm run personal-ops:chores:repair
```

This keeps the user-facing AppSheet table label `Home Tasks` mapped to the
Google Sheet source tab `Chores`.

```bash
npm run gas:push:chores
```

Then open the project if needed:

```bash
npm run gas:open:chores
```

## Excalidraw Feed

Deploy the Apps Script as a web app after the first setup:

```bash
npm run gas:deploy:chores
```

The script includes `doGet()`, which returns JSON from the `Chores` tab for a
future Excalidraw review surface. The visual surface should read from this feed;
it should not silently write changes.

## AppSheet Build Log

The current AppSheet implementation notes live here:

```text
docs/harness/personal-ops-google-systems/appsheet-chores-build-log-2026-07-14.md
```

Use that log as the replayable script for showing how AI plus Google Workspace
can turn a small personal workflow into a usable mobile app.
