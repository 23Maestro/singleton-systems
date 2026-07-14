# Job Search Prep Engine Apps Script

Local `clasp` project for the no-n8n job search prep engine.

Owner account:

```text
flow@singleton-systems.com
```

## Purpose

This creates a Google Sheet that helps find and review jobs before manual
applications. It does not auto-apply, send Gmail, or create a new Opportunity HQ
database.

The sheet is for:

- recent remote-first job leads
- Tampa / Riverview-area local leads when they naturally fit the same role lanes
- direct ATS search URLs
- strict remote verification
- 7-day recency review
- two weekly role caps: 25 AI Specialist findings and 25 Video Editor /
  Content Ops findings
- Gemini 2.5 Flash scoring when a Gemini API key is available
- manual apply prep only

Opportunity HQ remains the durable task state after a lead is selected.

## Comparable-System Pattern

The useful pattern from a fresh web pass is consistent: keep the system in
three simple stages.

```text
find and gate leads -> score and prepare materials -> manually apply and track
```

Most public examples either auto-log Gmail application replies into Sheets,
score jobs against a resume, generate tailored resumes/cover letters, or sync
application state into a tracker. This harness keeps the same good structure
without auto-applying or letting Gmail become the planning surface.

For this setup:

- Google Sheets is the control plane for leads, gates, search URLs, scores, and
  prep queue.
- Apps Script handles repeatable fetch/gate/score actions.
- Gemini scores fit, resume angle, cover angle, keywords, and next action.
- Gemini CLI is a local handoff agent for deeper prep packets when the CLI is
  authenticated and supported.
- Ollama Cloud with `gemma4:31b-cloud` is the preferred local handoff when the
  goal is low-maintenance weekly prep without relying on Gemini Pro quota.
- Opportunity HQ only receives selected work after review.
- Gmail remains optional later for status logging, not application sending.

## Setup

1. Create the Apps Script project:

```bash
npm run gas:create:jobs
```

2. Push source:

```bash
npm run gas:push:jobs
```

3. Deploy the API executable:

```bash
npm run gas:deploy:jobs
```

4. Open the Apps Script editor:

```bash
npm run gas:open:jobs
```

5. Run setup and authorize if prompted:

```bash
npm run gas:setup:jobs
```

The setup function creates or reuses a Google Sheet named `Job Search Prep
Engine`, stores its spreadsheet ID in script properties, creates the tabs,
builds search URLs, and installs a Sheet-open menu trigger when Apps Script
allows it. If remote setup is blocked, run `setupJobSearchPrep` once from the
Apps Script editor and approve the OAuth prompt there.

Current verification note: the project is deployed as an API executable, but
`clasp run setupJobSearchPrep` still returns:

```text
Unable to run script function. Please make sure you have permission to run the script function.
```

That means the original "not API executable" blocker is fixed, and the remaining
blocker is Google execution permission/OAuth for the `flow` clasp account. Run
`setupJobSearchPrep` once in the Apps Script editor to grant the scopes, then
retry `npm run gas:setup:jobs`.

6. Get the Sheet URL:

```bash
npm run gas:url:jobs
```

## Optional Script Properties

Set these in Apps Script Project Settings if available:

```text
GEMINI_API_KEY
GOOGLE_CSE_API_KEY
GOOGLE_CSE_CX
```

`GEMINI_API_KEY` enables scoring rows. `GOOGLE_CSE_API_KEY` and
`GOOGLE_CSE_CX` enable Google Programmable Search for ATS pages. Without CSE,
the sheet still generates clickable Google search URLs for manual past-week
review.

The default model is `gemini-2.5-flash`. Change `GEMINI_MODEL` in the Config
sheet to `gemini-2.5-pro` only when the key/project has Pro quota available.

## Ollama Cloud Handoff

Use this for the slower, more thoughtful prep pass after a lead is already
gated in Sheets. The default model is `gemma4:31b-cloud`, which avoids local
model downloads and worked in the current Ollama free-tier smoke test.

```bash
npm run jobs:ollama-handoff -- --lead-file /path/to/exported-lead.json
```

Override the model only when needed:

```bash
npm run jobs:ollama-handoff -- --model gemma4:31b-cloud --lead-file /path/to/exported-lead.json
```

Current verification note: `gemma4:31b-cloud` and `gpt-oss:120b-cloud` worked
through Ollama Cloud. `glm-5.2:cloud` and `minimax-m2.7:cloud` reached Ollama
Cloud but returned subscription-required errors.

## Gemini CLI Handoff

Use the CLI for the slower, more thoughtful prep pass after a lead is already
gated in Sheets. This keeps Apps Script focused on search, scoring, and queue
state while Gemini CLI acts like a local review agent with repo context.

```bash
npm run jobs:gemini-handoff -- --lead-file /path/to/exported-lead.json
```

The handoff is intentionally read-only:

- no auto-apply
- no Gmail send
- no file mutation by default
- no hidden scheduler
- approval mode is `plan`

Current verification note: `gemini -p` works as the non-interactive entrypoint.
The local Gemini CLI auth selector has been switched from deprecated
`oauth-personal` to `gemini-api-key`. The provided key reaches the API with
`gemini-2.5-flash`; `gemini-2.5-pro` currently returns free-tier quota `0` for
this key/project.

The same smoke test also showed local Gemini config/import drift:

```text
MCP issues detected
Failed to import next_public_supabase_url
Failed to import next_public_supabase_anon_key
Failed to import supabase_service_role
Failed to import embedding_api_key
Failed to import embedding_model
```

Do not schedule this handoff with Pro until quota is fixed:

- `npm run jobs:gemini-handoff` returns a prep packet for a sample lead.
- Pro quota is enabled before changing defaults to `gemini-2.5-pro`.

## Normal Loop

```bash
npm run gas:push:jobs
```

In the sheet menu:

```text
Job Search Prep -> Run Recent Search
Job Search Prep -> Score Unscored Leads
Job Search Prep -> Build Search URLs
```

## Search Policy

- Default recency gate: posted within 7 days.
- Weekly cap is by role lane, not by location: up to 25 accepted `AI
  Specialist` findings and up to 25 accepted `Video Editor / Content Ops`
  findings.
- Remote/local mix is discovery-driven. Do not force 25 remote or 25 local
  leads if the actual market does not support it.
- Remote means truly remote, not hybrid, relocation, travel-heavy, or local
  preference hidden inside a remote label.
- Local means Tampa / Riverview-area roles that fit either the AI Specialist
  lane or the Video Editor / Content Ops lane. These skip the remote gate but
  still keep the 7-day recency and seniority gates.
- State/country restrictions are flagged for review instead of silently treated
  as fully remote.
- Senior, lead, principal, manager, director, and VP roles are rejected unless a
  term is explicitly changed.
- UK-derived search terms are treated as reference input only and paired against
  the white-collar resume lanes here.
