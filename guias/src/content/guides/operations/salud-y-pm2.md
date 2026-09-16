---
slug: salud-y-pm2
category: Operaciones
categorySlug: operations
title: Diagnóstico de salud y PM2
shortTitle: Salud y PM2
summary: Comprobar /api/health, interpretar crash loops de dashcole-api y validar la configuración cargada.
level: Intermedio
duration: 10 min
updated: septiembre 2026
accent: green
order: 21
eyebrow: Operaciones
authorName: Equipo DashCole
authorDescription: Equipo que mantiene el dashboard escolar, la API Express y los scripts de despliegue.
---

Cuando el dashboard no responde o `sync2` falla con `ECONNREFUSED`, empieza por la API y PM2 antes de tocar Nginx.

## Health check

```bash
curl -sS http://127.0.0.1:7000/api/health
```

En desarrollo usa el `PORT` de tu `.env`. Una respuesta sana confirma que el proceso Express acepta conexiones.

## Logs de PM2

```bash
pm2 status
pm2 logs dashcole-api --lines 100 --nostream
```

Señales de crash loop:

- estado `online` con reinicios que suben sin parar
- Nginx 502 / `ECONNREFUSED` hacia el puerto de la API
- errores de MySQL o Redis al arrancar

El cargador de configuración importa `.env` **antes** de construir pools SQL. En los logs deben verse las credenciales `MYSQL_*` reales, no valores de fallback.

## Checklist rápido

1. ¿Existe `.env` en la ruta de la API remota?
2. ¿MySQL acepta host/puerto/usuario/clave del `.env`?
3. ¿Redis responde en `REDIS_URL`?
4. ¿`UPLOAD_DIR` y `BACKUP_ROOT` son escribibles?
5. ¿`CONFIG_ENCRYPTION_KEY` está definida si usas integraciones cifradas?

## Validar antes de publicar

```bash
./etc/scripts/sync2 --check
```

Comprueba SSH y variables pendientes sin imprimir secretos ni compilar.

## Pruebas locales útiles

```bash
npm run check
npm --prefix api run test:unit
npm --prefix api run test:integration
```

La integración necesita MySQL con permiso para crear una base temporal, Redis DB 15 y `pdftotext`.

## Siguiente paso

- [Configurar el archivo .env](/installation/configurar-entorno)
- [Respaldos y restauración](/operations/respaldos-y-restauracion)
