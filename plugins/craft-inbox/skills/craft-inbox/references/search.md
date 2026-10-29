## Search in Document

`GET /blocks/search`

Search within a single document. Use documents_search first to find documents, then this tool for more context with before/after blocks.

### Parameters

- **blockId** (required) (query): string
  The block ID (document or page) to search within.
- **pattern** (required) (query): string
  The search patterns to look for. Patterns must follow RE2-compatible syntax, which supports most common regular-expression features (literal text, character classes, grouping alternation, quantifiers, lookaheads, and fixed-width lookbehinds.
- **caseSensitive** (query): boolean
  Whether the search should be case sensitive. Default is false.
- **beforeBlockCount** (query): number
  The number of blocks to include before the matched block.
- **afterBlockCount** (query): number
  The number of blocks to include after the matched block.
- **fetchBlocks** (query): boolean
  Whether to include the full matched blocks with styling in the response. Default is false.

### Responses

#### 200
Successfully retrieved data

**Content-Type:** `application/json`


**Example: withContext**

Search for 'Description' with context blocks

```json
{
  "items": [
    {
      "blockId": "109",
      "markdown": "List Item A: Description text",
      "pageBlockPath": [
        {
          "id": "0",
          "content": "Document Title"
        }
      ],
      "beforeBlocks": [
        {
          "blockId": "108",
          "markdown": "## Second Level Header"
        }
      ],
      "afterBlocks": [
        {
          "blockId": "110",
          "markdown": "List Item B: Description text"
        },
        {
          "blockId": "111",
          "markdown": "List Item C: Description text"
        }
      ]
    }
  ]
}
```

**Example: deeplyNested**

Search in deeply nested structure

```json
{
  "items": [
    {
      "blockId": "15",
      "markdown": "Match found here",
      "pageBlockPath": [
        {
          "id": "0",
          "content": "Document Title"
        },
        {
          "id": "12",
          "content": "Section Card"
        },
        {
          "id": "14",
          "content": "Nested Card"
        }
      ],
      "beforeBlocks": [
        {
          "blockId": "13",
          "markdown": "Previous content"
        }
      ],
      "afterBlocks": [
        {
          "blockId": "16",
          "markdown": "Following content"
        }
      ]
    }
  ]
}
```

---


## Search across Documents

`GET /documents/search`

Search content across all documents in the space using relevance-based ranking. Supports flat date filter fields (createdDateGte, createdDateLte, lastModifiedDateGte, lastModifiedDateLte, dailyNoteDateGte, dailyNoteDateLte) for time-based queries and location object for filtering by folder.

- Searches the entire space (all locations)
- Relevance-based ranking (top 20 results)
- Content snippets with match highlighting
- Filter by date ranges or location

**Example Use Cases:**
- Find all mentions of a topic anywhere in the space
- Search for specific content across all documents
- Search documents within a specific location or folder

### Parameters

- **include** (query): string
  Search terms to include in the search. Can be a single string or array of strings.
- **regexps** (query): string
  Search terms to include in the search. Patterns must follow RE2-compatible syntax, which supports most common regular-expression features (literal text, character classes, grouping alternation, quantifiers, lookaheads, and fixed-width lookbehinds.
- **documentIds** (query): string
  The document IDs to filter. Cannot be used together with 'location' or 'folderIds'. If not provided, all documents will be searched. Can be a single string or array of strings.
- **fetchBlocks** (query): boolean
  Whether to include the full matched blocks with styling and block IDs in each search result. Default is false.
- **location** (query): string
  Filter by virtual location: 'unsorted', 'trash', 'templates', or 'daily_notes'. Cannot be used together with 'folderId' or 'documentIds'. If neither 'location' nor 'folderId' is specified, searches/lists all documents.
- **folderIds** (query): string
  Filter by specific folders (includes subfolders recursively). Cannot be used together with 'location' or 'documentIds'. If neither 'location' nor 'folderIds' is specified, searches all documents. Can be a single string or array of strings.
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
Successfully retrieved data

**Content-Type:** `application/json`


**Example: basicSearch**

Search for 'API' across all documents

```json
{
  "items": [
    {
      "documentId": "doc-123",
      "markdown": "The **API** endpoints are documented...",
      "blockIds": [
        "block-abc-123",
        "block-def-456"
      ]
    },
    {
      "documentId": "doc-456",
      "markdown": "**API** authentication requires...",
      "blockIds": [
        "block-ghi-789"
      ]
    }
  ]
}
```

**Example: filteredSearch**

Search with document filtering

```json
{
  "items": [
    {
      "documentId": "doc-123",
      "markdown": "Authentication **token** is required...",
      "blockIds": [
        "block-jkl-012"
      ]
    }
  ]
}
```

**Example: withMatchedBlocks**

Search with fetchBlocks=true

```json
{
  "items": [
    {
      "documentId": "doc-123",
      "markdown": "The **API** endpoints are documented...",
      "blockIds": [
        "block-abc-123"
      ],
      "blocks": [
        {
          "id": "block-abc-123",
          "type": "text",
          "markdown": "The API endpoints are documented in the developer guide"
        }
      ]
    }
  ]
}
```

---

