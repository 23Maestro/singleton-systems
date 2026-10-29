# Documentation of the Craft Full Space API


## Craft – API for API for All Documents

**Version:** 1.0.0

### Overview
The Craft Space API provides programmatic access to your entire Craft space - the top-level container for all your documents and organizational structure.

### Space Structure
A Craft space organizes content through:
- **Folders**: Hierarchical folders to organize documents
- **Documents**: Individual documents within locations
- **Blocks**: The content within documents (text, pages, collections, media)
- **Tasks**: Task management across inbox, daily notes, and documents

### Key Concepts
**Locations**: Documents exist in locations. A location is either a folder or one of the built-in locations: 'unsorted' (default for new documents), 'templates' (documents shown in Craft's Templates area and usable in-app to create new documents), or 'trash' (recently deleted).

**Document IDs**: A document ID is the same as its root block ID. Use a document ID with `GET /blocks` to fetch the document's content.

**Space Discovery**: Use `GET /folders` to see all locations, then `GET /documents` to list documents within a specific location.

**Document Organization**: Documents can be created in, moved between, and deleted from locations. Use folder and document management endpoints to organize your space.

**Tasks**: Tasks can be managed across the space. Use `GET /tasks` with scope filters (inbox, active, upcoming, logbook) to retrieve tasks, and other task endpoints to create, update, or delete them.

### Rate Limits
Rate limits apply at both public IP and Craft space scopes. The first limit reached returns HTTP `429`.

| Limit | Scope | Allowance |
|-------|-------|-----------|
| API requests | Public source IP, shared across API links and MCP connections | 50 requests per 10 seconds |
| API requests | Craft space | 100 requests per 60 seconds |
| Blocks read or written | Craft space | 20,000 blocks per 60 seconds |

Clients behind the same public IP share the per-IP limit. Space limits are shared across all API links, MCP connections, and clients in that space; they are not allocated separately per link or session. Each paginated request and retry counts separately.

Application responses expose the Craft space request budget, when available, through `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset`. Responses rejected at the public-IP limit may omit these headers.

REST block operations expose the corresponding `X-BlockBudget-*` headers after the space has recorded block usage in the current window; the first read in a new window may omit them. MCP responses do not expose the block budget as HTTP headers.

Application-generated HTTP `429` responses include `Retry-After`. MCP request-limit responses also repeat the retry delay in the error message because some MCP clients do not expose response headers. If `Retry-After` is absent, use exponential backoff with jitter.

### Reminders
Block reminders are experimental. With a Craft OAuth connection, reminders belong to the signed-in user and are available in single-user and multi-user spaces. With an ordinary link, reminders belong to the link creator and require that creator to be the space's only active participant. Document scope always applies; custom (blockless) reminders are not exposed.

Unavailable reminder endpoints are omitted from this documentation. Direct requests return an explicit availability error. Task dates notify in-app; they are not a substitute for a requested timed reminder. A reminder can schedule a notification on any block, or save it for later without a notification. These operations are available only under the conditions above.

### Craft Link Formats
| Type | Format | Description |
|------|--------|-------------|
| `clickableLink` | `craftdocs://open?spaceId={spaceId}&documentId={documentId}` | Returned in document metadata when `fetchMetadata=true`. |
| Web editor | https://docs.craft.do/editor/d/{spaceId}/{documentId} | Construct using the `spaceId` and `documentId` values from `clickableLink`. |

### Craft Markdown Extensions
The `markdown` field on blocks uses standard Markdown with the following Craft-specific extensions. These tags can appear in both input (when creating/updating blocks) and output (when reading blocks), unless noted otherwise.

#### Page Structure
| Tag | Description |
|-----|-------------|
| `<page>...<\/page>` | A nested page (sub-document). Optional attributes: `textStyle` (e.g. `"card"`), `cardLayout`, `id`. |
| `<card>...<\/card>` | Shorthand for `<page textStyle="card">`. |
| `<pageTitle>...<\/pageTitle>` | The title of a `<page>`. Always the first child inside `<page>`. |
| `<content>...<\/content>` | The body content of a `<page>`, following `<pageTitle>`. |

#### Block-Level Formatting
| Tag | Description |
|-----|-------------|
| `<callout>...<\/callout>` | Wraps blocks in a visually distinct callout box (similar to an admonition or aside). |
| `<caption>...<\/caption>` | Renders text in a smaller, muted caption style. |

#### Inline Formatting
| Tag | Description |
|-----|-------------|
| `<highlight color="...">...<\/highlight>` | Colored text highlight. Accepts hex colors, light/dark hex pairs, or names: yellow, green, mint, cyan, blue, purple, pink, red, gray, gradient-blue, gradient-purple, gradient-red, gradient-yellow, gradient-brown. |
| `==text==` | Shorthand for `<highlight color="yellow">`. |
| `<comment id="...">...<\/comment>` | Marks text that has a comment thread attached. The `id` references the comment thread. |
| `$formula$` or `$$formula$$` | LaTeX math formula, rendered inline or as a block. |

Markdown supports inline background highlights in text and table cells: `<highlight color="yellow">text</highlight>`. Custom highlights use `<highlight color="#123456" colorDark="#abcdef">text</highlight>`; omit dark to use light in both modes. Reads retain legacy names; custom colors use both attributes. Pair input remains accepted (light hex, then dark hex); do not combine pairs with colorDark, including in gradient stops. Gradients color the text rather than its background; clients may render a solid fallback. Use `#start;#end;g` per appearance; a dark gradient requires a light gradient. Inline text-color markup is not supported; use block color for whole-block text. Use adjacent, not nested, `<highlight>` spans for different colors; keep spaces inside spans, e.g. `<highlight color="yellow">Keep </highlight><highlight color="pink">**bold**</highlight><highlight color="yellow"> word</highlight>`.

#### Links and Indentation
| Syntax | Description |
|--------|-------------|
| `[text](block://blockId)` | Cross-reference to another block by ID. Appears as `[text](invalid:out_of_scope)` when the target block is outside the current API scope. |
| `[text](date://YYYY-MM-DD)` | Link to a daily note for the given date. |
| 2+ leading spaces | Nesting level. Every 2 spaces represents one level of indentation. |

#### Collection Tags (output-only)
These tags appear only in responses, when the result contains collection data. They are not accepted as input.

| Tag | Description |
|-----|-------------|
| `<collection>...<\/collection>` | A collection (structured database). Contains `<title>`, `<properties>`, and either `<content>` (with items) or `<itemsPreview>`. |
| `<title>...<\/title>` | The name of a collection or collection item. |
| `<properties>...<\/properties>` | Comma-separated list of property (column) keys defined on the collection. |
| `<collectionItem>...<\/collectionItem>` | A single row/item in a collection. Contains `<property>` tags, a `<title>`, and optionally `<content>` or `<contentPreview>`. |
| `<property name="key">value<\/property>` | A property value on a collection item, where `name` is the property key. |
| `<contentPreview>...<\/contentPreview>` | A truncated preview of nested content, included when the response depth limit is reached instead of the full `<content>`. |
| `<itemsPreview>...<\/itemsPreview>` | A truncated preview of collection items, included when the response depth limit is reached instead of the full item list. |

### Development Tips
- Start with `GET /folders` to discover all locations in the space
- Use `GET /documents` with a location filter to list documents in a specific location
- Create new locations with `POST /folders`
- Use `POST /documents` to create new documents in a specific location
- Access document content with `GET /blocks?id={documentId}`
- Search across the entire space with `GET /documents/search`
- Use `PUT /documents/move` to move documents between locations
- Manage tasks with `GET /tasks?scope=active` to retrieve due tasks, or use other scopes (inbox, upcoming, logbook)

### Note for AI
When implementing functionality using this API, always make actual calls to these endpoints and verify the responses. Do not simulate or mock the API interactions or use hard-coded values on the client-side - use the real endpoints to ensure proper functionality and data handling.

**IMPORTANT: This is a production server connected to real user data.** Only perform testing operations that can be safely rolled back:

- Safe: Reading data (`GET` requests), creating test content that you delete immediately after
- Safe: Modifying content if you can restore it to its original state
- Safe: Moving blocks if you can move them back to their original position
- Unsafe: Permanent deletions, modifications without backup, or any changes you cannot reverse

Always verify rollback operations work before considering a test complete.

### Servers

- https://connect.craft.do/links/{connection}/api/v1
  API Server for API for All Documents

---



## Endpoints


## Get Connection Info

`GET /connection`

Returns connection metadata including space ID, space name, timezone, current time, and URL templates for constructing deep links to blocks.

### Responses

#### 200
Successfully retrieved data

**Content-Type:** `application/json`

```json
{
  "space": {
    "id": "string",
    "name": "string",
    "timezone": "string",
    "time": "string",
    "friendlyDate": "string"
  },
  "utc": {
    "time": "string"
  },
  "urlTemplates": {
    "app": "string"
  }
}
```

---

