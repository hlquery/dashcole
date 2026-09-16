# hlquery Web (dashboard)

Frontend Vue 3 del dashboard escolar hlquery. Habla con la API Express del monorepo (`api/`) y se publica en **dashboard.hlquery.com**.

Stack: **Vue 3**, **Vite**, **Vuetify**, SPA centrada en `App.vue` + componentes de módulo, cliente HTTP propio en `src/api/`.

## Requisitos

- Node.js 20+
- API local en marcha (puerto del `.env`, por defecto `6666`) o proxy de Vite hacia ella

## Desarrollo local

Desde la raíz del monorepo (recomendado):

```bash
./etc/scripts/x2
```

Solo el dashboard:

```bash
cd web
npm ci
npm run dev
```

Abre [http://localhost:5174](http://localhost:5174).

En desarrollo, Vite define `VITE_API_URL=/api` y hace proxy a la API:

```text
navegador → http://localhost:5174/api/* → http://127.0.0.1:$PORT
```

(`PORT` se lee del `.env` de la raíz; ver `vite.config.js`.)

Cuentas típicas tras `x3` / `x4` (contraseña `admin`):

- `admin@hlquery.com` — dirección
- `demo@hlquery.com` — demo
- `super@hlquery.com` — plataforma
- `profesor@hlquery.com`, `manager@hlquery.com`, `finanzas@hlquery.com`, …

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor Vite en `0.0.0.0:5174` |
| `npm run build` | Build de producción → `dist/` |
| `npm run preview` | Sirve el build localmente |
| `npm run install:clean` | `npm ci` |
| `npm test` | Tests en `test/*.test.mjs` |

Build de producción apuntando a la API pública:

```bash
NODE_ENV=production VITE_API_URL=https://api.hlquery.com/api npm run build
```

`./etc/scripts/sync2` ya hace ese build y publica `web/dist/` en `/home/web/www/dashboard/`.

## Estructura

```text
web/
  index.html
  vite.config.js
  src/
    main.js              # Bootstrap Vue + Vuetify
    App.vue              # Shell: login, navegación, módulos
    styles.css           # Estilos globales del dashboard
    api/
      client.js          # fetch + credenciales / Accept vnd.dashcole
      auth.js, courses.js, students.js, grades.js, …
    components/          # Módulos de UI (Attendance, Payroll, Platform*, …)
    composables/         # notify, pagination, …
    design/              # tokens CSS, format helpers, components.css
    data/                # datos estáticos (p. ej. comunas)
  dist/                  # salida de build (no versionar en deploy manual)
```

## Módulos principales (UI)

Según rol y permisos:

- Resumen / dashboard y gráficos
- Estudiantes, cursos, calificaciones, asistencia, libro de clases
- Aula, planificación, tareas docentes
- Postulaciones, apoderados, comunicaciones
- Finanzas, remuneraciones, permisos
- Integraciones (SIGE, Webpay, WhatsApp, SMTP)
- Consola de plataforma (tenants, cuentas, sesiones, billing, demo)

La postulación pública vive en el mismo SPA: `/postular/{colegioId}`  
(ejemplo producción: `https://dashboard.hlquery.com/postular/1`).

## Autenticación en el cliente

- Login contra `POST /api/auth/login`
- Token Bearer en memoria / almacenamiento prefijado `dashcole_`
- Cabecera `Accept: application/vnd.dashcole.v1+json`
- Modo demo: si la API marca `demoMode`, la UI pasa a solo lectura (banner) — pensado para **dashboard.hlquery.com** cuando se desplegó con `sync2 --demo`

## Diseño

- Color institucional principal: `#0067b2`
- Tokens y componentes compartidos en `src/design/`
- Tipografía y patrones alineados al resto del monorepo

## Producción

| Destino | Valor |
| --- | --- |
| Build | `web/dist/` |
| Servidor | `/home/web/www/dashboard/` (Nginx) |
| URL | `https://dashboard.hlquery.com` |
| API | `https://api.hlquery.com/api` |

Publicar con el monorepo:

```bash
./etc/scripts/sync2           # dashboard + landing + guias + api
./etc/scripts/sync2 --demo    # igual; dashboard en solo lectura
```

`--demo` **no** afecta a `www.hlquery.com` ni a `guias.hlquery.com`; solo el dashboard.

## Relación con el monorepo

| Paquete | Rol |
| --- | --- |
| `web/` | Este dashboard |
| `api/` | Backend REST |
| `landing/` | Marketing (`www.hlquery.com`) — el botón **Demo** apunta aquí |
| `guias/` | Guías de instalación |

Documentación general: `README.md` de la raíz y el sitio de guías.
