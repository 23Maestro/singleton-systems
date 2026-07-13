# Personal Ops Google Systems Handoff

## Prompt

You are building the pending Personal Ops layer for Singleton Systems. Start with a read-only discovery pass. Do not create or modify Google Sheets, Forms, Apps Script, Notion databases, or task records until the current sources and ownership are reported.

### System boundary

```text
Google = Personal Ops source data
Notion Opportunity HQ = durable work and project truth
Excalidraw = visual review, sequencing, and promotion surface
Obsidian = optional local capture only
Shortcuts = later mobile and desktop start/stop logging surface
```

### Chores system: smallest useful shape

Build a simple Google Form and Google Sheet kanban-style task list for chores.

The only durable chore fields are:

```text
Room
Task
```

Allowed room options:

```text
Office
Bathroom
Laundry
Auto
Kitchen
Living Room
Garage
```

Do not add priority, status, duration, due date, assignee, notes, category, recurring rules, or extra metadata in this first slice. The board may use visual columns or a lightweight derived view, but the source data remains only Room and Task.

The form should route one submitted chore into the sheet. Preserve the exact Room and Task values. Do not create a second chores database.

### Finance system: separate design lane

Do not mix finance with chores. First discover the existing `23 Space` finance page, databases, sheets, forms, and Apps Script surfaces. Report:

- current source of truth
- existing tables or databases
- current inputs and outputs
- duplicate or stale surfaces
- what a future Excalidraw finance review should display

Do not redesign finance during the chores build. Finance needs its own goal, data contract, review flow, and game plan.

### Excalidraw role

Create only a setup concept for two future visual surfaces:

```text
Personal Ops chores review
23 Space finance review
```

The visual surface may link to Google Sheets, Forms, Apps Script pages, or Notion tasks. It is not the source database and must not silently write changes.

### Notion alignment

Opportunity HQ remains the source for durable work tasks. Its current priority contract is:

```text
Critical = immediate money, deadline, survival, or consequence pressure
Later = valid future-horizon work, not selected for the current horizon
Someday = intentionally uncommitted ideas or experiments
```

Do not use `Strategic` as a new value. Treat any existing `Strategic` values as legacy and report them for review before migration.

### Required discovery report

Return:

1. Existing Google files, sheets, forms, and Apps Script projects.
2. Existing `23 Space` finance pages/databases and their current relationships.
3. Existing Notion task/project schema relevant to promotion.
4. Exact proposed chores form and sheet layout.
5. What can be built safely now.
6. What requires a separate finance design.
7. What must remain manual until the Excalidraw review flow is proven.

### Verification gate

Before mutation, show the source map and the proposed chores data shape. After mutation, verify one test form submission, one sheet row, and one linked visual review item. Do not populate real finance data during the chores test.
