## List Reminders

`GET /reminders`

Experimental: list block reminders within this connection's document scope. See the Reminders section for availability and ownership.

### Parameters

- **status** (query): string
  List filter. Defaults to incomplete, including Save for later and overdue reminders. Upcoming includes incomplete reminders with a future time or no time (Save for later). All includes incomplete and completed reminders within this connection's scope.
- **limit** (query): integer
  Page size, defaults to 50. Results are ordered by creation time, then ID.
- **cursor** (query): string
  Continuation cursor from the previous response; keep the same status filter. If the cursor becomes invalid, restart without it.

### Responses

#### 200
Success

**Content-Type:** `application/json`

```json
{
  "items": [
    {
      "id": "string",
      "title": "string",
      "blockId": "string",
      "remindAt": "2024-01-01T00:00:00Z",
      "isCompleted": false,
      "completedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "cursor": "string"
  }
}
```

---


## Create Reminders

`POST /reminders`

Experimental: set or replace reminders on blocks within this connection's document scope. Omit the time to Save for later.

### Request Body

**Content-Type:** `application/json`


**Example: scheduled**

Schedule a notification (replace the example block ID)

```json
{
  "reminders": [
    {
      "blockId": "7348bd60-cd1b-4c45-81e3-73301dd8e073",
      "remindAt": "2030-01-15T10:00:00+01:00"
    }
  ]
}
```


**Example: saved**

Save for later without a notification

```json
{
  "reminders": [
    {
      "blockId": "7348bd60-cd1b-4c45-81e3-73301dd8e073"
    }
  ]
}
```

### Responses

#### 200
Successfully created resource

**Content-Type:** `application/json`


**Example: scheduled**

Scheduled reminder

```json
{
  "items": [
    {
      "id": "a6fa0c88-3aba-49a5-9cd2-8a5f63d29b40",
      "blockId": "7348bd60-cd1b-4c45-81e3-73301dd8e073",
      "title": "Call Alex",
      "isCompleted": false,
      "remindAt": "2030-01-15T09:00:00Z"
    }
  ]
}
```

**Example: saved**

Saved for later

```json
{
  "items": [
    {
      "id": "a6fa0c88-3aba-49a5-9cd2-8a5f63d29b40",
      "blockId": "7348bd60-cd1b-4c45-81e3-73301dd8e073",
      "title": "Call Alex",
      "isCompleted": false
    }
  ]
}
```

---


## Delete Reminders

`DELETE /reminders`

Experimental: delete block reminders within this connection's document scope. The blocks themselves are not deleted.

### Request Body

**Content-Type:** `application/json`

```json
{
  "idsToDelete": [
    "a6fa0c88-3aba-49a5-9cd2-8a5f63d29b40"
  ]
}
```

### Responses

#### 200
Successfully deleted resource

**Content-Type:** `application/json`

```json
{
  "items": [
    "string"
  ]
}
```

---


## Update Reminders

`PUT /reminders`

Experimental: update block reminders within this connection's document scope. Only provided fields are changed.

### Request Body

**Content-Type:** `application/json`


**Example: clear**

Clear the notification time, keeping Save for later

```json
{
  "remindersToUpdate": [
    {
      "id": "a6fa0c88-3aba-49a5-9cd2-8a5f63d29b40",
      "remindAt": null
    }
  ]
}
```


**Example: complete**

Complete without changing the time

```json
{
  "remindersToUpdate": [
    {
      "id": "a6fa0c88-3aba-49a5-9cd2-8a5f63d29b40",
      "isCompleted": true
    }
  ]
}
```


**Example: reschedule**

Change the notification time

```json
{
  "remindersToUpdate": [
    {
      "id": "a6fa0c88-3aba-49a5-9cd2-8a5f63d29b40",
      "remindAt": "2030-01-15T10:00:00+01:00"
    }
  ]
}
```

### Responses

#### 200
Successfully updated resource

**Content-Type:** `application/json`


**Example: saved**

Time cleared

```json
{
  "items": [
    {
      "id": "a6fa0c88-3aba-49a5-9cd2-8a5f63d29b40",
      "blockId": "7348bd60-cd1b-4c45-81e3-73301dd8e073",
      "title": "Call Alex",
      "isCompleted": false
    }
  ]
}
```

**Example: scheduled**

Time updated

```json
{
  "items": [
    {
      "id": "a6fa0c88-3aba-49a5-9cd2-8a5f63d29b40",
      "blockId": "7348bd60-cd1b-4c45-81e3-73301dd8e073",
      "title": "Call Alex",
      "isCompleted": false,
      "remindAt": "2030-01-15T09:00:00Z"
    }
  ]
}
```

---


## Get Tasks

`GET /tasks`

Retrieve tasks from across the space. Use scope='document' with documentId to get tasks from a specific document. scope='all' returns every task block in the full space, across all documents and states; it is not a union of active, upcoming, inbox, and logbook.

### Parameters

- **scope** (required) (query): string
  Filter tasks by scope: - 'active': Open tasks whose task date (schedule date when present, otherwise deadline date) is on or before today - 'upcoming': Open tasks whose task date (schedule date when present, otherwise deadline date) is tomorrow or later - 'inbox': Tasks in the task inbox - 'logbook': Tasks in the task logbook (completed/cancelled) - 'document': Tasks in a specific document (requires documentId) - 'all': Every task block in the full space, across all documents and states, including unscheduled document tasks and completed/cancelled tasks. It is not the union of active, upcoming, inbox, and logbook.
- **documentId** (query): string
  Required when scope is 'document'. The ID of the document to list tasks from.

### Responses

#### 200
Successfully retrieved data

**Content-Type:** `application/json`

```json
{
  "items": [
    {
      "id": "task-doc-1",
      "markdown": "Review launch checklist",
      "taskInfo": {
        "state": "todo"
      },
      "location": {
        "type": "document",
        "title": "Project Plan",
        "documentId": "doc-123"
      }
    },
    {
      "id": "task-daily-1",
      "markdown": "Send weekly update",
      "taskInfo": {
        "state": "done",
        "scheduleDate": "2025-01-15"
      },
      "location": {
        "type": "dailyNote",
        "date": "2025-01-15"
      },
      "completedAt": "2025-01-15T09:30:00.000Z"
    },
    {
      "id": "task-inbox-1",
      "markdown": "Triage partner feedback",
      "taskInfo": {
        "state": "canceled"
      },
      "location": {
        "type": "inbox"
      },
      "canceledAt": "2025-01-16T17:45:00.000Z"
    }
  ]
}
```

---


## Add Tasks

`POST /tasks`

Create new tasks in inbox, daily notes, or specific documents. Location types: 'inbox', 'dailyNote' (with date), or 'document' (with documentId). Tasks can include schedule dates and deadlines.

### Request Body

**Content-Type:** `application/json`


**Example: addToInbox**

Add task to inbox

```json
{
  "tasks": [
    {
      "markdown": "Prepare presentation slides",
      "taskInfo": {
        "scheduleDate": "tomorrow"
      },
      "location": {
        "type": "inbox"
      }
    }
  ]
}
```


**Example: addToDailyNote**

Add task to a daily note

```json
{
  "tasks": [
    {
      "markdown": "Follow up on meeting action items",
      "taskInfo": {
        "scheduleDate": "2025-01-20",
        "deadlineDate": "2025-01-22"
      },
      "location": {
        "type": "dailyNote",
        "date": "today"
      }
    }
  ]
}
```


**Example: addToDocument**

Add task to a specific document

```json
{
  "tasks": [
    {
      "markdown": "Research findings task",
      "location": {
        "type": "document",
        "documentId": "doc-456"
      }
    }
  ]
}
```

### Responses

#### 200
Successfully created resource

**Content-Type:** `application/json`

```json
{
  "items": [
    {
      "id": "task-new-1",
      "markdown": "Prepare presentation slides",
      "taskInfo": {
        "state": "todo",
        "scheduleDate": "2025-01-16"
      }
    }
  ]
}
```

---


## Delete Tasks

`DELETE /tasks`

Delete tasks by their IDs from any location in the space.

### Request Body

**Content-Type:** `application/json`

```json
{
  "idsToDelete": [
    "task-1",
    "task-2"
  ]
}
```

### Responses

#### 200
Successfully deleted resource

**Content-Type:** `application/json`

```json
{
  "items": [
    {
      "id": "task-1"
    },
    {
      "id": "task-2"
    }
  ]
}
```

---


## Update Tasks

`PUT /tasks`

Update existing tasks across the space. Can modify task content, state, schedule dates, deadlines, and location (to move tasks). Location types: 'inbox', 'dailyNote' (with date), or 'document' (with documentId). Marking inbox tasks as done/canceled moves them to logbook.

### Request Body

**Content-Type:** `application/json`


**Example: markDone**

Mark task as done

```json
{
  "tasksToUpdate": [
    {
      "id": "task-1",
      "taskInfo": {
        "state": "done"
      }
    }
  ]
}
```


**Example: updateContent**

Update task content and schedule

```json
{
  "tasksToUpdate": [
    {
      "id": "task-2",
      "markdown": "Updated task description",
      "taskInfo": {
        "scheduleDate": "2025-01-20"
      }
    }
  ]
}
```

### Responses

#### 200
Successfully updated resource

**Content-Type:** `application/json`

```json
{
  "items": [
    {
      "id": "task-1",
      "taskInfo": {
        "state": "done"
      }
    }
  ]
}
```

---

