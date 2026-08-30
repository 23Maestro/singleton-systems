# Client footage manifest contract

Create a UTF-8 JSON array and a CSV with identical rows. Keep the manifest beside
the project preparation artifacts, not inside the Eagle library package.

Required fields:

| Field | Meaning |
| --- | --- |
| `sequence_number` | Global 1-based usable-clip order; blank for excluded clips |
| `premiere_name` | Client-facing project-item name, such as `2026-07-31_HNOC-001` |
| `original_name` | Original source filename with extension |
| `eagle_item_id` | Immutable Eagle item identifier |
| `media_path` | Verified absolute local source path |
| `tour` | Evidence-supported tour group |
| `camera` | Camera or source lane, such as `A CAM` or `B CAM` |
| `destination_bin` | Full intended Premiere bin path |
| `classification` | `usable`, `reject`, or `ambiguous` |
| `confidence` | `high`, `medium`, or `low` |
| `reason` | Short classification evidence or exception note |
| `premiere_item_id` | Filled after import |
| `premiere_tree_path` | Filled after verified placement |
| `status` | `planned`, `imported`, `renamed`, `excluded`, or `failed` |

Validation rules:

- `sequence_number` values are unique and contiguous across usable rows.
- `premiere_name` values are unique and match the client prefix plus zero-padded
  sequence number.
- `eagle_item_id` and canonical `media_path` are unique.
- Every usable path exists and is a regular file before import.
- `destination_bin` exists before its rows are imported.
- A row reaches `renamed` only after its Premiere item ID and tree path are read
  back successfully.
- Rejects and ambiguous rows never receive a sequence number unless the user
  explicitly promotes them.
