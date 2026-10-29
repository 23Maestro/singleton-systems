## Upload File

`POST /upload`

Upload a file (image, video, or document) and insert it at the specified position. Requires explicit target (pageId, siblingId, or date). Send raw binary data in request body with Content-Type header.

### Parameters

- **fileName** (query): string
  Optional filename, including extension (for example, report.pdf), used as the file attachment title. Left empty when omitted. Does not change the file type determined by Content-Type; ignored for image and video blocks.
- **position** (required) (query): string
  Where to insert: 'start' or 'end' for page/date positions, 'before' or 'after' for sibling positions.
- **pageId** (query): string
  Page block ID to insert into. Required when position is 'start' or 'end' (unless date is specified).
- **date** (query): string
  Daily note date. Accepts 'today', 'yesterday', 'tomorrow', or ISO date (YYYY-MM-DD). Use with position 'start' or 'end'.
- **siblingId** (query): string
  Block ID to insert relative to. Required when position is 'before' or 'after'.

### Request Body

**Content-Type:** `application/octet-stream`

```text
string
```

### Responses

#### 200
Success

**Content-Type:** `application/json`

```json
{
  "blockId": "string",
  "assetUrl": "string"
}
```

---


## Create Whiteboard

`POST /whiteboards`

Create a new empty whiteboard block at the specified position. Returns the whiteboard block ID. Use whiteboardElements_add to populate it.

### Request Body

**Content-Type:** `application/json`

```json
{
  "position": {
    "position": "start",
    "pageId": "string"
  }
}
```

### Responses

#### 200
Successfully created resource

**Content-Type:** `application/json`

```json
{
  "whiteboardBlockId": "string"
}
```

---


## Get Whiteboard Elements

`GET /whiteboards/{whiteboardBlockId}/elements`

Get all Excalidraw elements and appState from a whiteboard block.

### Parameters

- **whiteboardBlockId** (required) (path): string

### Responses

#### 200
Successfully retrieved data

**Content-Type:** `application/json`

```json
{
  "elements": [
    {
      "id": "string",
      "type": "string",
      "x": 0,
      "y": 0,
      "width": 0,
      "height": 0,
      "text": "string",
      "points": [
        [
          0
        ]
      ],
      "additionalProp": "<any>"
    }
  ],
  "assets": {
    "additionalProp": "<any>"
  },
  "appState": {
    "additionalProp": "<any>"
  }
}
```

---


## Add Whiteboard Elements

`POST /whiteboards/{whiteboardBlockId}/elements`

Append elements to an existing whiteboard without removing existing ones.

### Parameters

- **whiteboardBlockId** (required) (path): string

### Request Body

**Content-Type:** `application/json`

```json
{
  "elements": [
    {
      "id": "string",
      "type": "string",
      "x": 0,
      "y": 0,
      "width": 0,
      "height": 0,
      "text": "string",
      "points": [
        [
          0
        ]
      ],
      "additionalProp": "<any>"
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
  "elements": [
    {
      "id": "string",
      "type": "string",
      "x": 0,
      "y": 0,
      "width": 0,
      "height": 0,
      "text": "string",
      "points": [
        [
          0
        ]
      ],
      "additionalProp": "<any>"
    }
  ],
  "assets": {
    "additionalProp": "<any>"
  },
  "appState": {
    "additionalProp": "<any>"
  }
}
```

---


## Delete Whiteboard Elements

`DELETE /whiteboards/{whiteboardBlockId}/elements`

Remove elements from a whiteboard by their Excalidraw element IDs.

### Parameters

- **whiteboardBlockId** (required) (path): string

### Request Body

**Content-Type:** `application/json`

```json
{
  "elementIds": [
    "string"
  ]
}
```

### Responses

#### 200
Successfully deleted resource

**Content-Type:** `application/json`

```json
{
  "deletedCount": 0,
  "remainingCount": 0
}
```

---


## Update Whiteboard Elements

`PUT /whiteboards/{whiteboardBlockId}/elements`

Update specific elements in a whiteboard by their ID. Elements not included in the request remain unchanged.

### Parameters

- **whiteboardBlockId** (required) (path): string

### Request Body

**Content-Type:** `application/json`

```json
{
  "elements": [
    {
      "id": "string",
      "type": "string",
      "x": 0,
      "y": 0,
      "width": 0,
      "height": 0,
      "text": "string",
      "points": [
        [
          0
        ]
      ],
      "additionalProp": "<any>"
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
  "elements": [
    {
      "id": "string",
      "type": "string",
      "x": 0,
      "y": 0,
      "width": 0,
      "height": 0,
      "text": "string",
      "points": [
        [
          0
        ]
      ],
      "additionalProp": "<any>"
    }
  ],
  "assets": {
    "additionalProp": "<any>"
  },
  "appState": {
    "additionalProp": "<any>"
  }
}
```

---
