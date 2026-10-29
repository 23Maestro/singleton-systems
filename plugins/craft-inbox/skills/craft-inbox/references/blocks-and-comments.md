## Fetch Blocks

`GET /blocks`

Fetches content from any document in the space. Use 'id' query parameter to specify which block to fetch.

Use `Accept` header `application/json` for structured data, `text/markdown` for rendered content.

**Content Rendering:** Text blocks contain markdown formatting and may include Craft-specific structural tags (e.g. `<page>`, `<callout>`, `<highlight>`). See the **Craft Markdown Extensions** section in the API description for the full list of tags.

**Full Space Access:** This connection has access to all documents across all locations in the space. Block links and relations within the space are preserved.

**Tip:** Start with GET /folders to see all locations, then GET /documents to list documents by location. Use the returned rootBlockIds as the 'id' parameter to fetch content.

### Parameters

- **date** (query): string
  Fetches the root page of a Daily Note for the specified date. Accepts ISO format YYYY-MM-DD or relative dates: 'today', 'tomorrow', 'yesterday'.
Mutually exclusive with 'id' - use this to fetch a Daily Note's root page, or use 'id' to fetch a specific block.
- **id** (required) (query): string
  Fetches a specific page block by its ID. Use this when you want to retrieve a particular block directly.
Mutually exclusive with 'date' - omit 'date' entirely when using this parameter.
- **maxDepth** (query): number
  The maximum depth of blocks to fetch. Default is -1 (all descendants). With a depth of 0, only the specified block is fetched. With a depth of 1, only direct children are returned.
- **fetchMetadata** (query): boolean
  Whether to fetch metadata (comments, createdBy, lastModifiedBy, lastModifiedAt, createdAt) for the blocks. Default is false.

### Responses

#### 200
Successfully retrieved data

**Content-Type:** `application/json`

```json
{
  "id": "0",
  "type": "page",
  "textStyle": "page",
  "markdown": "<page>Document Title</page>",
  "content": [
    {
      "id": "1",
      "type": "text",
      "textStyle": "h1",
      "markdown": "# Main Section"
    },
    {
      "id": "2",
      "type": "text",
      "markdown": "This is some content in the document."
    },
    {
      "id": "3",
      "type": "page",
      "textStyle": "card",
      "markdown": "Subsection",
      "content": [
        {
          "id": "4",
          "type": "text",
          "markdown": "Nested content inside subsection."
        }
      ]
    }
  ]
}
```

---


## Insert Blocks

`POST /blocks`

Insert content into any document in the space. Content can be provided as structured JSON blocks. Use position parameter to specify where to insert (via parent blockId, sibling blockId, or daily-note date). Returns the inserted blocks with their assigned block IDs for later reference.

### Request Body

**Content-Type:** `application/json`


**Example: textBlock**

Insert block into document

```json
{
  "blocks": [
    {
      "type": "text",
      "markdown": "## Section Header\n\nContent."
    }
  ],
  "position": {
    "position": "end",
    "pageId": "doc-123"
  }
}
```


**Example: markdown**

Insert markdown into daily note

```json
{
  "markdown": "## Meeting Notes\n\nDiscussed topics",
  "position": {
    "position": "end",
    "date": "today"
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
      "id": "15",
      "type": "text",
      "textStyle": "body",
      "markdown": "## Second Level Header\n\n- **List Item A**: Description text\n- **List Item B**: Description text"
    },
    {
      "id": "16",
      "type": "image",
      "url": "https://res.luki.io/user/full/space-id/doc/doc-id/uuid",
      "altText": "Alt text for accessibility",
      "markdown": "![Image](https://res.luki.io/user/full/space-id/doc/doc-id/uuid)"
    }
  ]
}
```

---


## Delete Blocks

`DELETE /blocks`

Delete content from any document in the space. Removes specified blocks by their IDs.

### Request Body

**Content-Type:** `application/json`

```json
{
  "blockIds": [
    "7",
    "9",
    "12"
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
      "id": "7"
    },
    {
      "id": "9"
    },
    {
      "id": "12"
    }
  ]
}
```

---


## Update Blocks

`PUT /blocks`

Update content in any document in the space. For text blocks, provide updated markdown content. Only the fields that are provided will be updated.

### Request Body

**Content-Type:** `application/json`

```json
{
  "blocks": [
    {
      "id": "5",
      "markdown": "## Updated Section Title\n\nThis content has been updated with new information.",
      "font": "serif"
    },
    {
      "id": "8",
      "markdown": "# New Heading"
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
      "id": "5",
      "type": "text",
      "textStyle": "body",
      "markdown": "## Updated Section Title\n\nThis content has been updated with new information.",
      "font": "serif"
    },
    {
      "id": "8",
      "type": "text",
      "textStyle": "h2",
      "markdown": "# New Heading"
    }
  ]
}
```

---


## Move Blocks

`PUT /blocks/move`

Move blocks to reorder them or move them between any documents across all locations in the space. Returns the moved block IDs.

### Request Body

**Content-Type:** `application/json`


**Example: moveToDoc**

Move blocks to document

```json
{
  "blockIds": [
    "5",
    "6"
  ],
  "position": {
    "position": "end",
    "pageId": "doc-123"
  }
}
```


**Example: moveToDailyNote**

Move blocks to daily note

```json
{
  "blockIds": [
    "7",
    "8"
  ],
  "position": {
    "position": "end",
    "date": "today"
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
      "id": "5"
    },
    {
      "id": "6"
    }
  ]
}
```

---


## Add comments

`POST /comments`

Add comments to blocks.

### Request Body

**Content-Type:** `application/json`

```json
{
  "comments": [
    {
      "blockId": "abc123",
      "content": "This is a comment."
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
      "commentId": "abc123-def456"
    }
  ]
}
```

---

