## Get Collection Items

`GET /collections/{collectionId}/items`

Get all items from a collection

### Parameters

- **maxDepth** (query): number
  The maximum depth of nested content to fetch for each collection item. Default is -1 (all descendants). With a depth of 0, only the item properties are fetched without nested content.
- **collectionId** (required) (path): string

### Responses

#### 200
Successfully retrieved data

**Content-Type:** `application/json`

```json
{
  "items": [
    {
      "id": "item1",
      "title": "Task 1",
      "properties": {
        "status": "In Progress",
        "priority": "High",
        "assignee": "John Doe"
      },
      "content": [
        {
          "id": "1",
          "type": "text",
          "markdown": "Detailed description of the task."
        }
      ]
    },
    {
      "id": "item2",
      "title": "Task 2",
      "properties": {
        "status": "Done",
        "priority": "Low",
        "assignee": "Jane Smith"
      }
    }
  ]
}
```

---


## Add Collection Items

`POST /collections/{collectionId}/items`

Add new items to a collection. Two-way relations are synced automatically in the background - only set one side for consistency.

### Parameters

- **collectionId** (required) (path): string

### Request Body

**Content-Type:** `application/json`

```json
{
  "items": [
    {
      "title": "Space Task",
      "properties": {
        "status": "Todo",
        "priority": "High"
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
      "id": "item3",
      "title": "New Task",
      "properties": {
        "status": "Todo",
        "priority": "Medium"
      }
    }
  ]
}
```

---


## Delete Collection Items

`DELETE /collections/{collectionId}/items`

Delete collection items (also deletes content inside items)

### Parameters

- **collectionId** (required) (path): string

### Request Body

**Content-Type:** `application/json`

```json
{
  "idsToDelete": [
    "item1",
    "item2",
    "item3"
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
      "id": "item1"
    },
    {
      "id": "item2"
    },
    {
      "id": "item3"
    }
  ]
}
```

---


## Update Collection Items

`PUT /collections/{collectionId}/items`

Update collection items. Two-way relations are synced automatically in the background - only set one side for consistency.

### Parameters

- **collectionId** (required) (path): string

### Request Body

**Content-Type:** `application/json`

```json
{
  "itemsToUpdate": [
    {
      "id": "item1",
      "properties": {
        "status": "Done"
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
      "id": "item1",
      "title": "Updated Task",
      "properties": {
        "status": "Done",
        "priority": "High"
      }
    }
  ]
}
```

---


## Set Active Collection View

`PUT /collections/{collectionId}/active-view`

Set the collection-level activeViewId to one existing collection view ID. This only changes which stored view is marked active; it does not execute the view or change collection items.

### Parameters

- **collectionId** (required) (path): string

### Request Body

**Content-Type:** `application/json`

```json
{
  "viewId": "view-board"
}
```

### Responses

#### 200
Success

**Content-Type:** `application/json`

```json
{
  "id": "view-board",
  "name": "Delivery Board",
  "type": "kanban",
  "filters": [],
  "sortBy": [],
  "groupBy": [
    {
      "propertyId": "prop_status",
      "propertyKey": "status",
      "propertyName": "Status",
      "ascending": true
    }
  ],
  "hiddenProperties": [],
  "customPropertyOrder": [],
  "columnWidth": {},
  "calculations": {},
  "kanban": {
    "columnOrder": [
      "Todo",
      "Doing",
      "Done"
    ]
  },
  "isActive": true
}
```

---


## List Collection Views

`GET /collections/{collectionId}/views`

List table, gallery, and kanban view definitions for a collection. This returns configuration only; it does not execute filters/sorts/groups or return collection items. If activeViewId is missing or invalid, the first stored view is treated as active.

### Parameters

- **collectionId** (required) (path): string

### Responses

#### 200
Success

**Content-Type:** `application/json`

```json
{
  "collectionBlockId": "collection1",
  "activeViewId": "view-board",
  "views": [
    {
      "id": "view-table",
      "name": "Table",
      "type": "table",
      "filters": [],
      "sortBy": [],
      "groupBy": [],
      "hiddenProperties": [],
      "customPropertyOrder": [],
      "columnWidth": {},
      "calculations": {},
      "isActive": false
    },
    {
      "id": "view-board",
      "name": "Delivery Board",
      "type": "kanban",
      "filters": [],
      "sortBy": [],
      "groupBy": [
        {
          "propertyId": "prop_status",
          "propertyKey": "status",
          "propertyName": "Status",
          "ascending": true
        }
      ],
      "hiddenProperties": [],
      "customPropertyOrder": [],
      "columnWidth": {},
      "calculations": {
        "prop_estimate": {
          "propertyId": "prop_estimate",
          "propertyKey": "estimate",
          "propertyName": "Estimate",
          "type": "number_sum"
        }
      },
      "isCalculationsRowVisible": true,
      "kanban": {
        "columnOrder": [
          "Todo",
          "Doing",
          "Done"
        ],
        "visibleFields": [
          {
            "propertyId": "prop_owner",
            "propertyKey": "owner",
            "propertyName": "Owner"
          }
        ]
      },
      "isActive": true
    }
  ]
}
```

---


## Create Collection View

`POST /collections/{collectionId}/views`

Create a collection view definition. Use type table for the regular/default table layout, gallery for card layouts, or kanban for grouped boards. This creates configuration only; it does not create or return collection items. Kanban requires exactly one group rule.

### Parameters

- **collectionId** (required) (path): string

### Request Body

**Content-Type:** `application/json`


**Example: kanban**

Create a kanban collection view

Creates a stored view definition only. Kanban views require exactly one groupBy rule; collection items are fetched through the item endpoints.

```json
{
  "view": {
    "name": "Delivery Board",
    "type": "kanban",
    "filters": [
      {
        "property": "status",
        "filterType": "select_isNoneOf",
        "filterValue": [
          "Done"
        ]
      }
    ],
    "sortBy": [
      {
        "property": "dueDate",
        "ascending": true
      }
    ],
    "groupBy": [
      {
        "property": "status",
        "ascending": true
      }
    ],
    "fields": {
      "order": [
        "title",
        "status",
        "owner",
        "estimate"
      ],
      "hidden": [
        "notes"
      ],
      "widths": {
        "estimate": "120"
      }
    },
    "calculations": {
      "estimate": "number_sum",
      "owner": "count_unique"
    },
    "isCalculationsRowVisible": true,
    "kanban": {
      "columnOrder": [
        "Todo",
        "Doing",
        "Done"
      ],
      "hiddenGroupValues": [
        "Archived"
      ],
      "showsColumnColors": true,
      "visibleFields": [
        "owner",
        "estimate"
      ]
    }
  }
}
```


**Example: gallery**

Create a gallery collection view

Creates a stored gallery view definition only. The gallery object is only valid when type is gallery.

```json
{
  "view": {
    "name": "Gallery",
    "type": "gallery",
    "sortBy": [
      {
        "property": "created",
        "ascending": false
      }
    ],
    "gallery": {
      "cardSize": "large",
      "previewType": "fill",
      "visibleFields": [
        "status",
        "owner"
      ]
    }
  }
}
```

### Responses

#### 200
Successfully created resource

**Content-Type:** `application/json`

```json
{
  "id": "view1",
  "name": "Delivery Board",
  "type": "kanban",
  "filters": [
    {
      "propertyId": "prop_status",
      "propertyKey": "status",
      "propertyName": "Status",
      "filterType": "select_isNoneOf",
      "filterValue": [
        "status-done"
      ]
    }
  ],
  "sortBy": [
    {
      "propertyId": "prop_due",
      "propertyKey": "dueDate",
      "propertyName": "Due Date",
      "ascending": true
    }
  ],
  "groupBy": [
    {
      "propertyId": "prop_status",
      "propertyKey": "status",
      "propertyName": "Status",
      "ascending": true
    }
  ],
  "hiddenProperties": [
    {
      "propertyId": "prop_notes",
      "propertyKey": "notes",
      "propertyName": "Notes"
    }
  ],
  "customPropertyOrder": [
    {
      "propertyId": "com.craft.title",
      "propertyKey": "title",
      "propertyName": "Title"
    },
    {
      "propertyId": "prop_status",
      "propertyKey": "status",
      "propertyName": "Status"
    },
    {
      "propertyId": "prop_owner",
      "propertyKey": "owner",
      "propertyName": "Owner"
    },
    {
      "propertyId": "prop_estimate",
      "propertyKey": "estimate",
      "propertyName": "Estimate"
    }
  ],
  "columnWidth": {
    "estimate": "120"
  },
  "calculations": {
    "prop_estimate": {
      "propertyId": "prop_estimate",
      "propertyKey": "estimate",
      "propertyName": "Estimate",
      "type": "number_sum"
    },
    "prop_owner": {
      "propertyId": "prop_owner",
      "propertyKey": "owner",
      "propertyName": "Owner",
      "type": "count_unique"
    }
  },
  "isCalculationsRowVisible": true,
  "kanban": {
    "columnOrder": [
      "Todo",
      "Doing",
      "Done"
    ],
    "hiddenGroupValues": [
      "Archived"
    ],
    "showsColumnColors": true,
    "visibleFields": [
      {
        "propertyId": "prop_owner",
        "propertyKey": "owner",
        "propertyName": "Owner"
      },
      {
        "propertyId": "prop_estimate",
        "propertyKey": "estimate",
        "propertyName": "Estimate"
      }
    ]
  },
  "isActive": true
}
```

---


## Delete Collection View

`DELETE /collections/{collectionId}/views/{viewId}`

Delete one collection view definition by view ID. Cannot delete the last stored view in a collection. If the active view is deleted, the first remaining stored view becomes active.

### Parameters

- **collectionId** (required) (path): string
- **viewId** (required) (path): string

### Responses

#### 200
Successfully deleted resource

**Content-Type:** `application/json`

```json
{
  "deletedViewId": "view-board",
  "activeViewId": "view-table"
}
```

---


## Update Collection View

`PUT /collections/{collectionId}/views/{viewId}`

Update one collection view definition by view ID. Omitted settings are preserved. Pass empty arrays or objects to clear list-like settings. Gallery settings are only valid for gallery views; kanban settings are only valid for kanban views.

### Parameters

- **collectionId** (required) (path): string
- **viewId** (required) (path): string

### Request Body

**Content-Type:** `application/json`

```json
{
  "view": {
    "name": "Delivery Board",
    "sortBy": [
      {
        "property": "dueDate",
        "ascending": true
      }
    ],
    "kanban": {
      "columnOrder": [
        "Todo",
        "Doing",
        "Done"
      ],
      "showsColumnColors": true
    }
  }
}
```

### Responses

#### 200
Successfully updated resource

**Content-Type:** `application/json`

```json
{
  "id": "view-board",
  "name": "Delivery Board",
  "type": "kanban",
  "filters": [],
  "sortBy": [
    {
      "propertyId": "prop_due",
      "propertyKey": "dueDate",
      "propertyName": "Due Date",
      "ascending": true
    }
  ],
  "groupBy": [
    {
      "propertyId": "prop_status",
      "propertyKey": "status",
      "propertyName": "Status",
      "ascending": true
    }
  ],
  "hiddenProperties": [],
  "customPropertyOrder": [],
  "columnWidth": {},
  "calculations": {},
  "kanban": {
    "columnOrder": [
      "Todo",
      "Doing",
      "Done"
    ],
    "showsColumnColors": true
  },
  "isActive": true
}
```

---


## List Collections

`GET /collections`

List all collections across the entire space. Returns collections from all documents regardless of their location.

### Parameters

- **documentIds** (query): string
  The document IDs to filter. If not provided, collections in all documents will be listed. Can be a single string or array of strings.

### Responses

#### 200
Success

**Content-Type:** `application/json`

```json
{
  "items": [
    {
      "id": "col1",
      "name": "Tasks",
      "itemCount": 5,
      "documentId": "doc1"
    },
    {
      "id": "col2",
      "name": "Notes",
      "itemCount": 3,
      "documentId": "doc2"
    }
  ]
}
```

---


## Create Collection

`POST /collections`

Create a new collection (structured table) in any document in the space. Define the schema with columns and their types.

### Request Body

**Content-Type:** `application/json`

```json
{
  "schema": {
    "name": "Tasks",
    "contentPropDetails": {
      "name": "Title"
    },
    "properties": [
      {
        "name": "Status",
        "type": "singleSelect",
        "options": [
          {
            "name": "Not Started"
          },
          {
            "name": "In Progress"
          },
          {
            "name": "Completed"
          }
        ]
      },
      {
        "name": "Priority",
        "type": "singleSelect",
        "options": [
          {
            "name": "Low"
          },
          {
            "name": "Medium"
          },
          {
            "name": "High"
          }
        ]
      },
      {
        "name": "Due Date",
        "type": "date"
      }
    ]
  },
  "position": {
    "position": "end"
  }
}
```

### Responses

#### 200
Successfully created resource

**Content-Type:** `application/json`

```json
{
  "collectionBlockId": "abc123",
  "name": "Tasks",
  "schema": {
    "name": "Tasks",
    "contentPropDetails": {
      "key": "title",
      "name": "Title"
    },
    "properties": [
      {
        "key": "status",
        "name": "Status",
        "type": "singleSelect",
        "options": [
          {
            "name": "Not Started",
            "color": "yellow"
          },
          {
            "name": "In Progress",
            "color": "sky-blue"
          },
          {
            "name": "Completed",
            "color": "mint-green"
          }
        ]
      },
      {
        "key": "priority",
        "name": "Priority",
        "type": "singleSelect",
        "options": [
          {
            "name": "Low",
            "color": "gray"
          },
          {
            "name": "Medium",
            "color": "yellow"
          },
          {
            "name": "High",
            "color": "red"
          }
        ]
      },
      {
        "key": "dueDate",
        "name": "Due Date",
        "type": "date"
      }
    ]
  }
}
```

---


## Get Collection Schema

`GET /collections/{collectionId}/schema`

Get collection schema in JSON Schema format

### Parameters

- **format** (query): string
  The format to return the schema in. Default: json-schema-items. - 'schema': Returns the collection schema structure that can be edited - 'json-schema-items': Returns JSON Schema for addCollectionItems/updateCollectionItems validation
- **collectionId** (required) (path): string

### Responses

#### 200
Successfully retrieved data

**Content-Type:** `application/json`


**Example: schemaFormat**

Schema format response

```json
{
  "key": "tasks",
  "name": "Tasks",
  "contentPropDetails": {
    "key": "title",
    "name": "Title"
  },
  "properties": [
    {
      "key": "status",
      "name": "Status",
      "type": "select",
      "options": [
        "Not Started",
        "In Progress",
        "Completed"
      ]
    },
    {
      "key": "priority",
      "name": "Priority",
      "type": "select",
      "options": [
        "Low",
        "Medium",
        "High"
      ]
    },
    {
      "key": "dueDate",
      "name": "Due Date",
      "type": "date"
    }
  ],
  "propertyDetails": [
    {
      "key": "status",
      "name": "Status",
      "type": "select",
      "options": [
        "Not Started",
        "In Progress",
        "Completed"
      ]
    },
    {
      "key": "priority",
      "name": "Priority",
      "type": "select",
      "options": [
        "Low",
        "Medium",
        "High"
      ]
    },
    {
      "key": "dueDate",
      "name": "Due Date",
      "type": "date"
    }
  ]
}
```

**Example: jsonSchemaFormat**

JSON Schema format (for validation)

```json
{
  "type": "object",
  "properties": {
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "title": {
            "type": "string",
            "description": "The title of the collection item"
          },
          "properties": {
            "type": "object",
            "properties": {
              "status": {
                "type": "string",
                "enum": [
                  "Not Started",
                  "In Progress",
                  "Completed"
                ],
                "description": "Status"
              },
              "priority": {
                "type": "string",
                "enum": [
                  "Low",
                  "Medium",
                  "High"
                ],
                "description": "Priority"
              },
              "dueDate": {
                "type": "string",
                "description": "Due Date"
              }
            }
          }
        },
        "required": [
          "title"
        ]
      }
    }
  },
  "required": [
    "items"
  ],
  "additionalProperties": false
}
```

---


## Update Collection Schema

`PUT /collections/{collectionId}/schema`

Update the collection schema. Replaces the existing schema entirely - include all fields you want to keep. Keep property keys stable for existing properties.

### Parameters

- **collectionId** (required) (path): string

### Request Body

**Content-Type:** `application/json`

```json
{
  "schema": {
    "name": "Tasks",
    "contentPropDetails": {
      "name": "Title"
    },
    "properties": [
      {
        "key": "status",
        "name": "Status",
        "type": "singleSelect",
        "options": [
          {
            "name": "Not Started"
          },
          {
            "name": "In Progress"
          },
          {
            "name": "Completed"
          },
          {
            "name": "Blocked"
          }
        ]
      },
      {
        "key": "priority",
        "name": "Priority",
        "type": "singleSelect",
        "options": [
          {
            "name": "Low"
          },
          {
            "name": "Medium"
          },
          {
            "name": "High"
          }
        ]
      },
      {
        "key": "dueDate",
        "name": "Due Date",
        "type": "date"
      },
      {
        "name": "Assignee",
        "type": "text"
      }
    ]
  }
}
```

### Responses

#### 200
Successfully updated resource

**Content-Type:** `application/json`

```json
{
  "collectionBlockId": "abc123",
  "schema": {
    "name": "Tasks",
    "contentPropDetails": {
      "key": "title",
      "name": "Title"
    },
    "properties": [
      {
        "key": "status",
        "name": "Status",
        "type": "singleSelect",
        "options": [
          {
            "name": "Not Started",
            "color": "yellow"
          },
          {
            "name": "In Progress",
            "color": "sky-blue"
          },
          {
            "name": "Completed",
            "color": "mint-green"
          },
          {
            "name": "Blocked",
            "color": "red"
          }
        ]
      },
      {
        "key": "priority",
        "name": "Priority",
        "type": "singleSelect",
        "options": [
          {
            "name": "Low",
            "color": "gray"
          },
          {
            "name": "Medium",
            "color": "yellow"
          },
          {
            "name": "High",
            "color": "red"
          }
        ]
      },
      {
        "key": "dueDate",
        "name": "Due Date",
        "type": "date"
      },
      {
        "key": "assignee",
        "name": "Assignee",
        "type": "text"
      }
    ]
  }
}
```

---

