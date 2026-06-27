# 03 Task Shape

Owner: Opportunity HQ.

Allowed inputs:

```text
routed task candidate
project lane
goal horizon
link/proof asset
blocker/dependency
sub-task candidate
```

Allowed outputs:

```text
[shape] Opportunity Task
[shape] sub-task
[shape] dependency
[shape] proof link placement
[shape] page-content summary
```

Do not:

```text
create pseudo-project rows
create a new database
use page checkboxes for trackable work
split subtasks without separate status/time/proof value
make Raycast the durable state owner
```

Required task fields:

```text
Status
Goal Horizon
Work Date
Shift
Project
```

Opportunity HQ owns the durable task state. Raycast can create or update that
state, but it does not become the state model.

Next action rule: produce the thinnest reviewed task shape, then send it to `04_tool-scope`.
