---
status: accepted
---

# Production renders skip the MCP

The Blender MCP is for authoring only. Production renders run
`Blender -b <master> -y --python-exit-code 1 -P fill.py -- <row.json>` with no
MCP in the path. The MCP executes model-written Python with no sandbox, and a
render run must be repeatable from the same lane master and scene row. A
script on the command line gives that and fails loudly. An agent session does
neither.
