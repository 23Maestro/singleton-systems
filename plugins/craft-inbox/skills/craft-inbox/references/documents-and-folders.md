## List Documents

`GET /documents`

List documents in the space. Without location or folderIds filters, returns ALL documents (may be large). Recommended: use GET /folders first to see available locations and document counts.

### Parameters

- **location** (query): string
  Filter by virtual location: 'unsorted', 'trash', 'templates', or 'daily_notes'. Cannot be used together with 'folderId' or 'documentIds'. If neither 'location' nor 'folderId' is specified, searches/lists all documents.
- **folderId** (query): string
  Filter by specific folder (includes subfolders recursively). Cannot be used together with 'location' or 'documentIds'. If neither 'location' nor 'folderId' is specified, lists all documents.
- **fetchMetadata** (query): boolean
  Whether to include metadata (lastModifiedAt, createdAt, clickableLink) in the response. Default is false.
- **createdDateGte** (query): string
  Only include documents created on or after this date. Accepts ISO format YYYY-MM-DD or relative dates: 'today', 'tomorrow', 'yesterday'.
- **createdDateLte** (query): string
  Only include documents created on or before this date. Accepts ISO format YYYY-MM-DD or relative dates: 'today', 'tomorrow', 'yesterday'.
- **lastModifiedDateGte** (query): string
  Only include documents modified on or after this date. Accepts ISO format YYYY-MM-DD or relative dates: 'today', 'tomorrow', 'yesterday'.
- **lastModifiedDateLte** (query): string
  Only include documents modified on or before this date. Accepts ISO format YYYY-MM-DD or relative dates: 'today', 'tomorrow', 'yesterday'.
- **dailyNoteDateGte** (query): string
  Only include daily notes on or after this date. Accepts ISO format YYYY-MM-DD or relative dates: 'today', 'tomorrow', 'yesterday'.
- **dailyNoteDateLte** (query): string
  Only include daily notes on or before this date. Accepts ISO format YYYY-MM-DD or relative dates: 'today', 'tomorrow', 'yesterday'.

### Responses

#### 200
Success

**Content-Type:** `application/json`


**Example: unsorted**

Documents in unsorted

```json
{
  "items": [
    {
      "id": "doc-123",
      "title": "Meeting Notes"
    },
    {
      "id": "doc-456",
      "title": "Project Ideas"
    }
  ]
}
```

**Example: dailyNotes**

Daily notes with dates

```json
{
  "items": [
    {
      "id": "dn-123",
      "title": "Wednesday, January 15, 2025",
      "dailyNoteDate": "2025-01-15"
    },
    {
      "id": "dn-456",
      "title": "Tuesday, January 14, 2025",
      "dailyNoteDate": "2025-01-14"
    }
  ]
}
```

**Example: withMetadata**

Documents with metadata

```json
{
  "items": [
    {
      "id": "doc-123",
      "title": "Meeting Notes",
      "lastModifiedAt": "2025-01-15T14:30:00Z",
      "createdAt": "2025-01-10T09:00:00Z",
      "clickableLink": "craftdocs://open?spaceId=space-uuid&documentId=doc-uuid-123"
    }
  ]
}
```

---


## Create Documents

`POST /documents`

Create one or more documents in the space. Specify location as 'unsorted' (default), 'templates' (in-app template docs), or provide a folderId. Cannot create in 'trash'.

### Request Body

**Content-Type:** `application/json`


**Example: unsorted**

Create documents in unsorted

```json
{
  "documents": [
    {
      "title": "New Document 1"
    },
    {
      "title": "New Document 2"
    }
  ]
}
```


**Example: folder**

Create documents in a folder

```json
{
  "documents": [
    {
      "title": "Project Plan"
    }
  ],
  "destination": {
    "folderId": "abc123"
  }
}
```


**Example: templates**

Create template documents

```json
{
  "documents": [
    {
      "title": "Weekly Report Template"
    }
  ],
  "destination": {
    "destination": "templates"
  }
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
      "id": "doc-new-1",
      "title": "New Document 1",
      "clickableLink": "craftdocs://open?spaceId=space-uuid&documentId=doc-uuid-1"
    },
    {
      "id": "doc-new-2",
      "title": "New Document 2",
      "clickableLink": "craftdocs://open?spaceId=space-uuid&documentId=doc-uuid-2"
    }
  ]
}
```

---


## Delete Documents

`DELETE /documents`

Soft-delete documents by moving them to trash. Use documents_move to restore.

### Request Body

**Content-Type:** `application/json`

```json
{
  "documentIds": [
    "doc-123",
    "doc-456"
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
    "doc-123",
    "doc-456"
  ]
}
```

---


## Move Documents

`PUT /documents/move`

Move documents between locations in the space. Destination cannot be 'trash' - use documents_delete instead. Use this to restore documents from trash. Note: Daily notes cannot be moved.

### Request Body

**Content-Type:** `application/json`


**Example: toFolder**

Move documents to a folder

```json
{
  "documentIds": [
    "doc-123",
    "doc-456"
  ],
  "destination": {
    "folderId": "abc123"
  }
}
```


**Example: toUnsorted**

Move documents to unsorted

```json
{
  "documentIds": [
    "doc-789"
  ],
  "destination": {
    "destination": "unsorted"
  }
}
```


**Example: restoreFromTrash**

Restore documents from trash

```json
{
  "documentIds": [
    "doc-deleted"
  ],
  "destination": {
    "destination": "unsorted"
  }
}
```

### Responses

#### 200
Successfully moved resource

**Content-Type:** `application/json`

```json
{
  "items": [
    {
      "id": "doc-123",
      "destination": {
        "folderId": "abc123"
      }
    },
    {
      "id": "doc-456",
      "destination": {
        "folderId": "abc123"
      }
    }
  ]
}
```

---


## List Folders

`GET /folders`

Get all locations in the space with document counts. Returns built-in locations (Unsorted, Trash, Templates) and user-created folders with their hierarchical structure.

### Responses

#### 200
Success

**Content-Type:** `application/json`

```json
{
  "items": [
    {
      "id": "unsorted",
      "name": "Unsorted",
      "documentCount": 42,
      "folders": []
    },
    {
      "id": "trash",
      "name": "Recently Deleted",
      "documentCount": 3,
      "folders": []
    },
    {
      "id": "templates",
      "name": "Templates",
      "documentCount": 5,
      "folders": []
    },
    {
      "id": "abc123",
      "name": "Projects",
      "documentCount": 10,
      "folders": [
        {
          "id": "def456",
          "name": "Work",
          "documentCount": 5,
          "folders": []
        }
      ]
    }
  ]
}
```

---


## Create Folders

`POST /folders`

Create one or more folders. Supports creating at root level or nested inside existing folders. Cannot create inside built-in locations.

### Request Body

**Content-Type:** `application/json`


**Example: createRootFolder**

Create folder at root level

```json
{
  "folders": [
    {
      "name": "New Project"
    }
  ]
}
```


**Example: createNestedFolder**

Create nested folder inside another folder

```json
{
  "folders": [
    {
      "name": "Subproject",
      "parentFolderId": "abc123"
    }
  ]
}
```


**Example: createMultipleFolders**

Create multiple folders at once

```json
{
  "folders": [
    {
      "name": "Marketing"
    },
    {
      "name": "Engineering"
    },
    {
      "name": "Q1 Planning",
      "parentFolderId": "abc123"
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
      "id": "xyz789",
      "name": "New Project"
    },
    {
      "id": "mno345",
      "name": "Subproject",
      "parentFolderId": "abc123"
    }
  ]
}
```

---


## Delete Folders

`DELETE /folders`

Delete folders. Documents and subfolders are moved to the parent folder, or Unsorted if deleting a top-level folder. Cannot delete built-in locations.

### Request Body

**Content-Type:** `application/json`

```json
{
  "folderIds": [
    "abc123",
    "def456"
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
    "abc123",
    "def456"
  ]
}
```

---


## Move Folders

`PUT /folders/move`

Move folders within the hierarchy. Supports moving to root or inside another folder. Cannot move built-in locations.

### Request Body

**Content-Type:** `application/json`


**Example: moveToRoot**

Move folders to root level

```json
{
  "folderIds": [
    "abc123"
  ],
  "destination": "root"
}
```


**Example: moveToParent**

Move folders inside another folder

```json
{
  "folderIds": [
    "abc123",
    "def456"
  ],
  "destination": {
    "parentFolderId": "xyz789"
  }
}
```

### Responses

#### 200
Successfully moved resource

**Content-Type:** `application/json`

```json
{
  "items": [
    {
      "id": "abc123",
      "destination": "root"
    },
    {
      "id": "def456",
      "destination": {
        "parentFolderId": "xyz789"
      }
    }
  ]
}
```

---

