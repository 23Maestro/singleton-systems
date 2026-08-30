# Finding contract

Pass a JSON array. Use one record per code risk.

```json
[
  {
    "findingId": "stable-name",
    "file": "path/from/repository/root.mjs",
    "line": 42,
    "risk": "What can fail.",
    "proof": "What in the current code proves the risk.",
    "fix": "Smallest valid repair.",
    "verification": "Exact check that proves the repair.",
    "status": "open"
  }
]
```

Valid status values are `open` and `resolved`. Keep the same `findingId` in the
verification pass. Omitting an open finding does not resolve it.
