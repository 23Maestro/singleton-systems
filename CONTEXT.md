# Shared delivery gate

## Goal

Use one routing and review contract across writing, client updates, Linear,
Notion, and Supabase delivery.

## Glossary

- Lane: the front-facing work category.
- Bucket: a trigger word and tool-harness destination. It does not replace
  Lane in user-facing language.
- Gate: the shared contract that resolves routing, applies review rules, and
  records delivery results.
- Owner: the system that holds the durable business record.
- Delivery outcome: the result of a delivery attempt, including a visible
  failure and a link to the owning record when one exists.

## Locked decisions

- The gate owns route, Lane, Bucket resolution, review result, delivery result,
  and the pointer to the owning record.
- Linear owns task and status state.
- Notion owns client and portfolio records.
- Supabase holds integration receipts and temporary drafts when the workflow
  needs them.
- Repo docs and skills own policy.
- `config/cerebral-registry.json` is the machine-readable gate contract.
- The Raycast Linear fork stays outside this pass.

## Open decisions

- Whether `all_buckets` remains a Lane value or becomes Bucket metadata.
- Which client flow proves the first end-to-end slice.
