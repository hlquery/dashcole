# DashCole API

API Express (ESM) para DashCole: autenticación multi-tenant, academia, finanzas, RRHH, plataforma SaaS, admisiones públicas e integraciones.

Stack: **Node.js 20+**, **Express 5**, **MySQL 8** (mysql2 + Sequelize), **Redis** (sesiones y caché), **BullMQ** (trabajos en segundo plano).

## Requisitos

- Node.js 20+
- MySQL y Redis accesibles (en el monorepo: `./etc/scripts/x2` o Docker Compose)
- Variables en el `.env` de la raíz del monorepo (`api` carga `../../.env`)

## Desarrollo local

Desde la raíz del monorepo (recomendado):

```bash
./etc/scripts/x2
```

Solo la API:

```bash
cd api
npm ci
npm run dev          # node --watch src/server.js
```

Puerto por defecto en desarrollo: `PORT` del `.env` (ejemplo: `6666`). En producción con PM2: **7000** (`api.hlquery.com`).

Comprueba salud:

```bash
curl -sS http://127.0.0.1:${PORT:-6666}/api/health
```

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | API con recarga al guardar |
| `npm start` | API sin watch |
| `npm run check` | Validación de sintaxis |
| `npm run db:bootstrap` | Prepara esquema mínimo |
| `npm run db:reset` | Recrea esquema |
| `npm run db:seed` / `db:faker` | Sembrado / datos demo |
| `npm run db:verify` | Verifica datos esenciales |
| `npm run test:unit` | Tests unitarios (`test/*.test.mjs`) |
| `npm run test:integration` | Tests de integración |

## Estructura

```text
api/
  src/
    server.js          # Entrada HTTP, rutas y middlewares
    config.js          # Carga del .env del monorepo
    auth.js            # Login, sesiones Bearer en Redis, permisos
    database.js        # Pools Sequelize / multi-tenant
    models.js          # Modelos del colegio
    control-models.js  # Plano de control (tenants, planes, demos)
    academics.js       # Cursos, notas, estudiantes, libro de clases
    classroom.js       # Aula / materiales
    erp.js             # Finanzas, inventario, documentos
    payroll.js         # Remuneraciones / Previred
    admissions.js      # Postulaciones y formularios públicos
    platform.js        # Consola de plataforma
    planning.js        # Planificación
    leave.js           # Permisos / licencias
    mineduc.js / sige.js
    backups.js         # Respaldo SQL + uploads
    mailer.js          # SMTP opcional
    demo-mode.js       # Solo lectura para dashboard en modo demo
    uploads.js         # Avatares y archivos
    services/          # PDF, calculadoras, export, etc.
  test/                # Unit + integration
```

## Autenticación

- No usa JWT. Emite tokens Bearer aleatorios, TTL en Redis, revocables.
- Login con límite de intentos por IP.
- Identidad global + membresías por colegio; cambio de tenant con `POST /api/auth/switch-tenant`.
- Rutas públicas (antes de `requireAuth`): health, settings, login, forgot-password, admisiones/demo públicas, contacto.

## Endpoints útiles

- `GET /api/health` — MySQL, control plane, Redis
- `GET /api/settings`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/dashboard`
- `GET|POST /api/courses`, `/api/students`, `/api/grades`, …
- `POST /api/public/admissions`, `/api/public/demo-requests`
- `POST /api/contact/messages`

El contrato completo vive en el código de `server.js` y los módulos `register*Routes`.

## Variables de entorno (resumen)

Definidas en la raíz (ver `.env.example` y `etc/deploy/production.env.example`):

| Variable | Uso |
| --- | --- |
| `PORT` | Puerto HTTP |
| `MYSQL_*` | Base principal del colegio / tenants |
| `CONTROL_MYSQL_*` | Plano de control opcional (separado) |
| `REDIS_URL` | Sesiones y jobs |
| `WEB_ORIGIN` | Orígenes CORS permitidos |
| `BACKUP_ROOT` / `UPLOAD_DIR` | Respaldos y archivos |
| `SMTP_*` | Correo (opcional; vacío = desactivado) |
| `CONFIG_ENCRYPTION_KEY` | Cifrado de secretos de integraciones |
| `DEMO_MODE` / archivo `.demo` | Solo lectura orientada al dashboard |
| `DEMO_RESET_ENABLED` | Reinstalación periódica de colegios demo |

## Modo demo

`sync2 --demo` deja `dashboard/.demo` en el servidor. La API bloquea escrituras **solo** para clientes de `dashboard.hlquery.com` (la landing y las guías siguen pudiendo usar endpoints públicos).

## Producción

- Proceso PM2: `dashcole-api` (`ecosystem.config.cjs` en la raíz), puerto **7000**.
- Publicación: `./etc/scripts/sync2` desde el monorepo (rsync de `api/` a `/home/web/www/api`, `npm ci`, reload PM2, health check).
- Dominio: `https://api.hlquery.com` (Nginx → `127.0.0.1:7000`).

## Tests

```bash
cd api
npm run test:unit
npm run test:integration
```

## Relación con el monorepo

| Paquete | Rol |
| --- | --- |
| `api/` | Esta API |
| `web/` | Dashboard Vue (`dashboard.hlquery.com`) |
| `landing/` | Sitio marketing (`www.hlquery.com`) |
| `guias/` | Documentación (`guias.hlquery.com`) |

Documentación de instalación y despliegue: sitio de guías y el `README.md` de la raíz.
