# Shared delivery gate

## Goal

Use one routing and review contract across writing, client updates, Linear,
Notion, and Supabase delivery.

## Glossary

- Lane: the front-facing work category. Valid values are the four initiatives
  plus Writing Review and System Maintenance.
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

## Locked decisions

- The gate owns route, Lane, Bucket resolution, review result, delivery result,
  and the pointer to the owning record.
- Linear owns task and status state.
- Notion owns client and portfolio records.
- Supabase holds integration receipts and temporary drafts when the workflow
  needs them.
- Repo docs and skills own policy.
- `config/cerebral-registry.json` is the machine-readable gate contract.
- A delivery outcome uses `pending`, `delivered`, or `failed`. It names the
  owner and includes the record ID, record URL, and error fields.
- A receipt uses `not_required`, `recorded`, or `failed`.
- `all_buckets` is retired as a Lane value.
- The Raycast Linear fork stays outside this pass.

## Open decision

- Which client flow proves the first audience-specific writing mold.
