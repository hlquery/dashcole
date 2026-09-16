---
id: collections
label: Collections
eyebrow: API REFERENCE
title: Collections API
summary: Define the fields and capabilities that shape how your documents are stored and searched.
order: 2
---

## Create a collection

`POST /collections` creates a collection and defines its searchable fields.

```bash
curl -X POST http://localhost:9200/collections \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "products",
    "fields": [
      {"name": "title", "type": "string"},
      {"name": "description", "type": "string"},
      {"name": "price", "type": "float", "facet": true}
    ]
  }' | jq .
```

## List collections

```bash
curl --fail --silent \
  http://localhost:9200/collections | jq .
```

## Field types

Declare the shape of your data before indexing. Use string fields for text, numeric fields for ranges and sorting, booleans for flags, and vector fields for embeddings.

| Type | Use |
| --- | --- |
| `string` | Text and exact-value fields |
| `int32` / `float` | Numeric ranges and sorting |
| `bool` | True or false flags |
| `vector` | Embedding values for semantic search |
