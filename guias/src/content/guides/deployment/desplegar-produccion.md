---
slug: desplegar-produccion
category: Despliegue
categorySlug: deployment
title: Desplegar DashCole a producción
shortTitle: Despliegue
summary: Preparar MySQL, Redis y Nginx, publicar con sync2 y verificar la API con PM2.
level: Intermedio
duration: 20 min
updated: septiembre 2026
accent: navy
order: 10
eyebrow: Operación
authorName: Equipo DashCole
authorDescription: Equipo que mantiene el dashboard escolar, la API Express y los scripts de despliegue.
---

El despliegue oficial publica API, dashboard (`dashboard.hlquery.com`), landing (`www.hlquery.com` → carpeta `web/`) y guías (`guias.hlquery.com`) con `./etc/scripts/sync2`. Siempre re-sube `dashboard/`, `web/` y `guias/`. No re-siembra la base: solo mueve código compilado y reinicia el proceso.

## Preparación del servidor

1. Instala MySQL 8, Redis, Node.js 20+, pm2, mysqldump, rsync, ssh y Nginx.
2. Completa `.env.production` localmente desde `etc/deploy/production.env.example`.
3. Configura Nginx con:
   - `etc/deploy/hlquery-api.nginx`
   - `etc/deploy/hlquery-dashboard.nginx`
   - `etc/deploy/hlquery-landing.nginx`
   - `etc/deploy/hlquery-guias.nginx`

La API pública es `api.hlquery.com` (proxy a `127.0.0.1:7000`). Dashboard, landing y guías son estáticos bajo `/home/web/www/`.

## Publicar

```bash
./etc/scripts/sync2 --check   # valida SSH y variables pendientes
./etc/scripts/sync2           # build + rsync + npm ci + pm2 + health
./etc/scripts/sync2 --demo    # igual, pero dashboard.hlquery.com en solo lectura
```

Destino por defecto: alias SSH `web`, ruta `/home/web/www` (`dashboard`, `web`, `guias`, `api`).

`--demo` crea `dashboard/.demo` y deja **solo** el dashboard en modo lectura. La landing y las guías se publican igual y siguen operando con normalidad (formularios de contacto, etc.).

Antes de sobrescribir una API existente, `sync2`:

1. Crea un respaldo SQL + uploads en el servidor.
2. Lo descarga a `backups/remote/` y verifica checksums.
3. Cancela la publicación si el respaldo falla.

Conserva `.env`, uploads, respaldos y bases locales. No ejecuta seed ni reset.

## Primera instalación remota

Si falta el `.env` remoto, `sync2` copia `.env.production` con modo `600`. Asegura que MySQL y Redis ya acepten las credenciales de ese archivo.

## PM2

La app se llama `dashcole-api` (`ecosystem.config.cjs`). Comprueba salud:

```bash
curl -sS http://127.0.0.1:7000/api/health
pm2 logs dashcole-api --lines 100 --nostream
```

Si PM2 está `online` pero el contador de reinicios sube y `sync2` recibe `ECONNREFUSED`, la API está en crash loop: revisa logs y credenciales `MYSQL_*` reales (el cargador lee `.env` antes de crear pools).

## Instalación limpia remota

```bash
./etc/scripts/sync2 --fresh
```

Hace el deploy normal, pero borra `api/node_modules` remoto, vacía `api/uploads` (después del respaldo) y reinstala con `npm ci`. Conserva `.env`, SQL y respaldos.

## Descarga de respaldos

```bash
./etc/scripts/sync    # remoto → este PC
./etc/scripts/sync2   # este PC → producción
```

## Siguiente paso

- [Respaldos y restauración](/operations/respaldos-y-restauracion)
- [Diagnóstico de salud y PM2](/operations/salud-y-pm2)
