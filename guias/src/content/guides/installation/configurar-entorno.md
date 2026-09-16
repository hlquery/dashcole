---
slug: configurar-entorno
category: Instalación
categorySlug: installation
title: Configurar el archivo .env
shortTitle: Archivo .env
summary: Variables esenciales de MySQL, Redis, API, SMTP, respaldos y multi-tenant para operar DashCole.
level: Intermedio
duration: 12 min
updated: septiembre 2026
accent: blue
order: 3
eyebrow: Instalación
authorName: Equipo DashCole
authorDescription: Equipo que mantiene el dashboard escolar, la API Express y los scripts de despliegue.
---

DashCole usa un único `.env` en la raíz del repositorio. Se crea desde `.env.example` solo cuando falta y **no** se sobrescribe al reinstalar.

## Variables locales típicas

| Área | Variables |
| --- | --- |
| MySQL del colegio | `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD` |
| Redis | `REDIS_URL` o host/puerto según ejemplo |
| API | `PORT`, `API_HOST` |
| CORS / marca | `WEB_ORIGIN`, `SCHOOL_NAME`, `PLATFORM_ADMIN_EMAIL` |
| Archivos | `UPLOAD_DIR` |
| Respaldos | `BACKUP_ROOT`, `BACKUPS_ENABLED` |
| Correo | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` |
| Secretos de integración | `CONFIG_ENCRYPTION_KEY` |
| Demo | `DEMO_RESET_ENABLED`, `DEMO_RESET_EVERY_HOURS` |

Deja `SMTP_HOST` vacío si no quieres enviar correo. Sin SMTP, las cuentas se crean igual; solo no se envían credenciales temporales.

## Plano de control multi-tenant

Opcionalmente puedes aislar identidades globales, membresías y planes en otra base con `CONTROL_MYSQL_*`. Si no las defines, todo permanece en la base principal.

Cuando el plano de control está separado, cada respaldo incluye también `dashcole_control.sql`.

## Puerto HTTPS móvil

Para un listener TLS adicional (apps nativas):

```dotenv
MOBILE_PORT=6667
MOBILE_HOST=0.0.0.0
MOBILE_TLS_CERT=/ruta/privada/fullchain.pem
MOBILE_TLS_KEY=/ruta/privada/privkey.pem
```

Sin certificados válidos, ese puerto no arranca. Ambos listeners comparten las mismas rutas `/api` y sesiones Bearer.

## Producción

Completa `.env.production` desde `etc/deploy/production.env.example` antes del primer `sync2`. El script copia ese archivo al servidor con permisos `600` solo si el `.env` remoto aún no existe.

Variables habituales de despliegue:

- `SYNC_TARGET` — alias SSH (por defecto `web`)
- `SYNC_PATH` — ruta remota (por defecto `/home/web/www`)
- `BACKUP_ROOT` — en producción se recomienda `/home/web/www/backups`

## Buenas prácticas

1. No subas `.env` a Git.
2. Respalda `CONFIG_ENCRYPTION_KEY` por un canal secreto: cifra WhatsApp y secretos de integración.
3. Tras el primer login, cambia la contraseña de `admin`.
4. Enumera orígenes HTTPS reales en `WEB_ORIGIN` para clientes web de producción.

## Siguiente paso

- [Desplegar a producción](/deployment/desplegar-produccion)
- [Respaldos y restauración](/operations/respaldos-y-restauracion)
