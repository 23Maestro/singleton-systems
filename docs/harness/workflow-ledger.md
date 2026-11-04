# Video Workflow Pipeline

Former name: Workflow Ledger. The system is now Video Workflow Pipeline.

The [pipeline table](../workflow-ledger.md) shows the working parts of each workflow.
Its [JSON records](../../config/workflow-ledger.json) drive both the repository
table and a private web view. Skills and client contracts still own instructions.
Linear and Asana still own task state. Cerebral still owns runtime routing.

## Update a record

1. Find the canonical skill, code, checks and real example.
2. Add the workflow under its stable ID. Give each component a stable ID,
   plain purpose, source links, check links, example links and evidence note.
3. Use a repository ID and relative source path. Repository roots are relative
   to the JSON file. Mark unpublished sources `localOnly`; the web view labels
   them instead of creating a broken code link. Browser links must use HTTPS.
4. Run the commands below. Review both views before publishing the private page.

```sh
npm run check:workflow-ledger
npm run workflow-ledger:generate
```

The generator writes `docs/workflow-ledger.md` and
`sites/workflow-ledger/dist/index.html`. Both include the same record SHA-256.
Do not edit a generated table by hand. The private Site's buildless entrypoint
is the generated HTML. Sites controls private access; a local HTML file has no
access control. Keep source changes, private preview publication and production
website publication separate.

## Read evidence

- `documented`: the source was found. This does not claim a fresh test.
- `checked`: the note links a test result and names the revision it covers.
- `awaiting-review`: a result needs a human decision.
- `approved`: the note links the human decision and its exact scope.
- `blocked`: the note states the missing input or proof.

Code links use a recorded published revision. Current local edits can differ.
Keep those differences clear in the note. A production example can show a useful
method while its final review or delivery is still open.

## Current coverage

The local records map Lineups and Intent Keys to matching component roles.
Intent Keys links to its own sources and marks unverified safeguards as gaps.
The checker validates record structure and local source paths. Other client
workflows and automatic evidence freshness checks remain open. A passing check
does not approve creative quality, run every linked test or close a client task.
