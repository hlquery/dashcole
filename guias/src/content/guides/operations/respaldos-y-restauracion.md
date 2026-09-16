---
slug: respaldos-y-restauracion
category: Operaciones
categorySlug: operations
title: Respaldos y restauración
shortTitle: Respaldos
summary: Cómo programa DashCole respaldos SQL + uploads, retención, descarga remota y restauración segura.
level: Intermedio
duration: 15 min
updated: septiembre 2026
accent: green
order: 20
eyebrow: Operaciones
authorName: Equipo DashCole
authorDescription: Equipo que mantiene el dashboard escolar, la API Express y los scripts de despliegue.
---

La API programa con BullMQ un respaldo cada 12 horas cuando `BACKUPS_ENABLED` no es `false`. Requiere `mysqldump` en el PATH del proceso.

## Contenido de cada respaldo

Con `BACKUP_ROOT` apuntando a un directorio writable (en producción se recomienda `/home/web/www/backups`), cada carpeta `FECHA/` incluye:

- dump SQL de la base del colegio
- copia de `UPLOAD_DIR` dentro de `uploads/`
- `manifest.json`

Solo se publica la carpeta cuando ambas copias terminan. Después se eliminan respaldos de más de seis meses.

Si usas plano de control separado (`CONTROL_MYSQL_*`), el respaldo incluye también `dashcole_control.sql` y cada base tenant única.

## Controles

| Variable | Efecto |
| --- | --- |
| `BACKUP_ROOT` | Destino de las carpetas de respaldo |
| `BACKUPS_ENABLED` | Desactiva la programación si es `false` |

## Descargar desde producción

```bash
./etc/scripts/sync
```

Consulta `BACKUP_ROOT` en el servidor SSH (`SYNC_TARGET` / `SYNC_PATH`), descarga a `LOCAL_BACKUPS` o `backups/remote/` y verifica checksums. No restaura la base local automáticamente.

## Restaurar

1. Detén la API (`pm2 stop dashcole-api` o el proceso local).
2. Importa el SQL correspondiente a la base destino.
3. Copia `uploads/` al `UPLOAD_DIR` de la instalación.
4. Arranca de nuevo y verifica `/api/health`.

No apuntes un tenant a una base vacía: el routing multi-tenant exige que la base destino ya contenga ese colegio.

## Antes de un deploy

`sync2` crea un respaldo obligatorio y lo descarga antes de publicar. Si falla la verificación, cancela el despliegue.

## Siguiente paso

- [Desplegar a producción](/deployment/desplegar-produccion)
- [Colegios, tenants y plataforma](/administration/colegios-y-plataforma)
