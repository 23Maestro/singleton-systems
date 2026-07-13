# Google Workspace CLI

Owner account:

```text
flow@singleton-systems.com
```

This repo has two Google control paths:

```text
clasp
  Apps Script source, deploys, triggers, FormApp.setDestination, Excalidraw JSON feed.

Google Workspace CLI
  Direct Sheets API and Forms API setup from local commands.
```

## Turn On

Use the same Google Cloud project for the OAuth client.

Enable:

- Google Forms API:
  `https://console.cloud.google.com/apis/library/forms.googleapis.com`
- Google Sheets API:
  `https://console.cloud.google.com/apis/library/sheets.googleapis.com`
- Google Drive API:
  `https://console.cloud.google.com/apis/library/drive.googleapis.com`

Create a Desktop OAuth client:

```text
https://console.cloud.google.com/apis/credentials
```

Download the OAuth JSON and save it locally as:

```text
config/google-workspace/oauth-client.json
```

That file is gitignored. Use this template for shape only:

```text
config/google-workspace/oauth-client.example.json
```

## Commands

Authorize:

```bash
npm run gws:auth
```

Verify the active Google user:

```bash
npm run gws:whoami
```

Create a fresh Personal Ops Chores spreadsheet and form:

```bash
npm run gws:chores:setup
```

The command writes result metadata to:

```text
.google-workspace/personal-ops-chores.json
```

## Boundary

The Google Forms API creates and updates the form. The Google Sheets API creates
and updates the spreadsheet. Apps Script still owns linking form responses to a
spreadsheet because `FormApp.setDestination()` is exposed there.

After `gws:chores:setup`, either use the Apps Script setup function or a small
linking function with the returned form and spreadsheet IDs.
