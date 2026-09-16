---
id: overview
label: Welcome
eyebrow: GET STARTED
title: Welcome to hlquery
summary: A fast, modular search engine for full-text, hybrid, and vector search through a straightforward REST API.
order: 1
---

## Welcome to hlquery

hlquery is an open-source, modular search engine built for modern applications. It is written in C++ and exposes a compact HTTP/JSON surface, so your application can index, query, and manage search data without learning a large platform first.

The engine is designed to stay lightweight while handling the search features teams reach for most often: fast indexing, low-latency queries, full-text relevance, hybrid retrieval, vector similarity, filters, and operational endpoints for running a service in production.

## How hlquery fits together

Your application sends requests to an hlquery server. Documents are stored inside collections, each collection defines the fields that can be indexed, and search requests return ranked JSON results that your application can render or process.

| Layer | Responsibility |
| --- | --- |
| **Collections** | Define the fields, types, and capabilities of a searchable dataset. |
| **Documents** | Store the records your application wants to index and retrieve. |
| **Search** | Match text, combine signals, apply filters, and rank results. |
| **HTTP API** | Provide a predictable JSON interface for clients, scripts, and services. |

## Build search into your application

hlquery keeps the search stack lightweight while giving you the building blocks for full-text search, hybrid ranking, vector similarity, and configurable runtime features. Work with collections and documents through predictable REST endpoints, then grow from local development to larger deployments as your needs change.

1. **Create a collection** — Define the fields your application needs.
2. **Index documents** — Store structured records with stable IDs.
3. **Search your data** — Query, rank, filter, and retrieve results.

## Choose the search model you need

Start with lexical search when users search by words, names, or exact fields. Add filters and numeric fields when results need to be narrowed by price, status, category, or other attributes.

For semantic retrieval, store vectors alongside your document fields and use vector search to find similar content. Hybrid search combines lexical and vector signals when matching both language and meaning matters.

This lets you begin with a straightforward keyword endpoint and evolve toward richer retrieval without changing the way your application manages collections and documents.

## Request basics

Requests use JSON and default to `http://localhost:9200`. If authentication is enabled, send your API key with every request.

```bash
curl --fail --silent --show-error \
  http://localhost:9200/health | jq .
```

> **Tip**
> Use stable document IDs whenever an ingestion job may be retried. This keeps your merge runs repeatable.

## A practical path forward

If you are new to hlquery, start with the **Collections API** to define a small schema and then index a few representative documents. Once the data is available, test searches against real user language rather than only idealized examples.

From there, explore filters, ranking, vectors, and client integrations as your use case grows. Keep the server health endpoint in your deployment checks and treat collection schemas as part of your application contract.
