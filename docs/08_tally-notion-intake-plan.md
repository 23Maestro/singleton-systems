# Tally To Notion Intake Plan

## Decision

Use Tally as the public intake form and Notion / Opportunity HQ as the response
inbox.

Do not build a custom webhook receiver yet. Native Tally-to-Notion plus email
backup is enough until there is a repeated downstream action worth automating.

## Target Form

```text
Free Workflow Audit
https://tally.so/r/obgLaX
```

## Target Notion Surface

Create or reuse one database:

```text
Workflow Audit Requests
```

Suggested properties:

```text
Name
Email
Company / Team
Explain Path
Workflow to Review
Notes / Transcript
Helpful Link
What Am I Looking At
Pay Attention To
Useful Return
Status
Submitted At
Source
```

Suggested status values:

```text
New
Reviewed
Reply Drafted
Sent
Archived
```

## Execution Checklist

1. Create or pick the Notion database for audit requests.
2. Open the Tally form integrations for `obgLaX`.
3. Connect the native Notion integration.
4. Map all visible and conditional fields to the database properties.
5. Turn on self email notification as backup.
6. Submit one test response.
7. Confirm the Notion row has the expected fields and status.

## Definition Of Done

One test submission from the public Tally form creates a usable Notion row in
`Workflow Audit Requests`, and an email notification is received as backup.

## Later

Add a webhook only after there is a repeated action that Notion cannot cover,
such as routing by answer, creating a drafted reply, notifying another channel,
or triggering a custom app endpoint.
