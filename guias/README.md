# Guías DashCole

Sitio Vue/Vite con guías en **español** para instalar y administrar DashCole.

Publicación: `./etc/scripts/sync2` construye `guias/` y sube `guias/dist/` a `/home/web/www/guias` → **https://guias.hlquery.com**.

## Desarrollo local

```bash
npm install
npm run dev
```

Servidor de desarrollo: `http://localhost:5176`.

## Agregar una guía

Añade un Markdown en `src/content/guides/` con frontmatter en español:

```md
---
slug: mi-guia
category: Instalación
categorySlug: installation
title: Mi guía
summary: Descripción corta para la tarjeta.
level: Principiante
duration: 10 min
updated: septiembre 2026
accent: blue
order: 2
authorName: Equipo DashCole
authorDescription: Descripción breve del autor.
---

## Primera sección

Escribe la guía en Markdown (español).
```

El loader descubre cada `.md` automáticamente. Los `##` forman el índice.

## Build y sync

```bash
npm run build
# o desde la raíz del monorepo:
./etc/scripts/sync2
```

`sync2` sí publica las guías (junto con dashboard, landing y API). Si ves 404:

1. Confirma la URL: `https://guias.hlquery.com/installation/como-instalar-dashcole` (no `guides.hlquery.com` ni rutas antiguas de hlquery).
2. Vuelve a correr `./etc/scripts/sync2`.
3. En el servidor, el vhost Nginx debe tener `root /home/web/www/guias` y `try_files … /index.html`.
