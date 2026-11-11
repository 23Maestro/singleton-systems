# Shared delivery gate

## Goal

Use one routing and review contract across writing, client updates, Linear,
Notion, and Supabase delivery.

## Glossary

- Lane: the front-facing work category. Routing values are Development,
  Content Editor, AI Consultant and Portfolio, plus Writing Review and System Maintenance.
  Linear initiatives group Development projects; they do not replace Lanes.
- Bucket: the internal tool-harness destination. Its route key is canonical;
  trigger patterns are accepted aliases. It does not replace Lane in
  user-facing language.
- Gate: the shared contract that resolves routing, applies review rules, and
  records delivery results.
- Owner: the system that holds the durable business record.
- Owner graph: the machine-readable owners and dependencies affected by one
  approved intent.
- Transaction: one approved intent carried through every declared owner until
  readback proves completion or leaves the work visibly incomplete.
- Delivery outcome: the result of a delivery attempt, including a visible
  failure and a link to the owning record when one exists.
- Receipt: the Supabase record of an integration attempt when that workflow
  needs one.

### Social content

**Content purpose**:
The value or ask a post is meant to offer its audience. Jab, feint and right
hook are its boxing labels; an opening hook is a separate choice.

**Story lane**:
The part of Jerami's story used to frame a post, such as origins or beliefs.
It is separate from the work Lane and the platform's post format.

**Voice guide**:
Jerami's stated writing preferences and accepted examples of how he speaks.
_Avoid_: trained model, creator persona.

**Voice feedback**:
A specific edit or preference from Jerami, with its source and intended scope.
A suggested lesson from that feedback remains a candidate until accepted.

**Approved draft**:
The exact version Jerami has accepted for a stated use. Draft approval is
separate from permission to publish.

**Illustration**:
A hypothetical example used to explain a point. It is separate from a claim
about Jerami's real work.

## Locked decisions

- The gate owns route, Lane, Bucket resolution, review result, delivery result,
  and the pointer to the owning record.
- Linear owns Development task and status state.
- Asana owns AI Consulting and Content Editor task and status state.
- Supabase is the chosen client-record home. The real-record move and Notion
  intake cutover remain open in 23M-407. Preserve legacy records until verified.
- Eagle owns portfolio assets; keep claims linked to their source evidence.
- Supabase holds integration receipts and temporary drafts when the workflow
  needs them.
- Repo docs and skills own policy.
- `docs/operations/` owns service facts and operating rules; task owners hold plans and progress.
- `config/cerebral-registry.json` is the machine-readable gate contract.
- A delivery outcome uses `pending`, `delivered`, or `failed`. It names the
  owner and includes the record ID, record URL, and error fields.
- A receipt uses `not_required`, `recorded`, or `failed`.
- `all_buckets` is retired as a Lane value.
- The Raycast Linear fork stays outside this pass.

## Open decision

- Which client flow proves the first audience-specific writing mold.
