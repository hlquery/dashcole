# hlquery API docs

Standalone Vue/Vite documentation site for hlquery's HTTP API and integration
workflows.

## Add a page

Add a Markdown file to `src/content/pages/` with frontmatter like this:

```md
---
id: vector-search
label: Vector search
eyebrow: API REFERENCE
title: Vector Search API
summary: Search documents by embedding similarity.
order: 7
---

## Search by vector

Write the page content in normal GitHub-flavored Markdown.
```

The content loader parses frontmatter, creates heading anchors, renders fenced
code blocks with copy buttons, and automatically includes new pages in search
and navigation according to their `order` value.

## Local development

```bash
npm install
npm run dev
```

The site runs at `http://localhost:5177`.

Set `VITE_API_URL` when the management API is not at its local default:

```bash
VITE_API_URL=https://api.example.com npm run dev
```

The site records page visits through `POST /api/track/visit`. Tracking is
anonymous by default, includes the `source_app: docs` marker, and fails
silently if the API is unavailable.

## Build

```bash
npm run build
npm run preview
```
