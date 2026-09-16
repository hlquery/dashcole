# DashCole

Dashboard escolar para administrar calificaciones, estudiantes y cursos. Usa Vue 3 en el frontend, Express en la API, MySQL como base de datos y Redis para la caché del resumen.

## Inicio rápido

Requisitos: Node.js 20+, npm y Docker con Compose. `x4` instala Sequelize y ejecuta el sembrado desde Node.js.

```bash
./etc/scripts/install.sh
./etc/scripts/run.sh
```

Abre [http://localhost:5173](http://localhost:5173). La primera ejecución normal crea las tablas, el colegio base, la cuenta de dirección `admin@hlquery.com` y los administradores de plataforma `super@hlquery.com` (contraseña `admin`). No es necesario ejecutar Faker para iniciar sesión.

Los dos scripts solicitados están en `etc/scripts`:

- `install.sh`: valida requisitos, crea `.env`, instala los paquetes y descarga las imágenes de MySQL/Redis.
- `run.sh`: levanta MySQL/Redis, espera sus healthchecks y ejecuta API y web en modo desarrollo.

### Flujo corto estilo dashcole-web

También están disponibles los comandos equivalentes a `x2`, `x3` y `x4`:

```bash
./etc/scripts/x2          # instala si hace falta, inicia servicios y sigue logs
./etc/scripts/x3          # reinicia la base, crea el esquema vacío y construye
./etc/scripts/x3 --yes    # lo mismo sin confirmación interactiva
./etc/scripts/x4          # instalación completa con usuarios y datos iniciales
```

`x3` elimina los volúmenes locales de MySQL y Redis y deja una instalación mínima con `admin@hlquery.com / admin`. `x4` ejecuta `x3` y después agrega mediante Faker y Sequelize cursos, estudiantes y datos de demostración para los módulos ERP.

Sin ejecutar `x4` ya puedes iniciar sesión con:

- Director: correo `admin@hlquery.com`, contraseña `admin`.
- Demo: correo `demo@hlquery.com`, contraseña `admin`.
- Plataforma: correo `super@hlquery.com`, contraseña `admin`.

Después de ejecutar el sembrado opcional con `x4` también quedan disponibles (todas con contraseña `admin`):

- Manager: `manager@hlquery.com / admin`
- Jefe UTP: `jefeutp@hlquery.com / admin`
- Profesor: `profesor@hlquery.com / admin`
- Finanzas: `finanzas@hlquery.com / admin`
- Estudiante: `estudiante@hlquery.com / admin`
- Apoderado: `apoderado@hlquery.com / admin`

En este entorno, la base sembrada se consulta directamente con:

```text
host: localhost
puerto: 3306
base: colegio
usuario: colegio
contraseña: colegio
```

`x4` imprime la conexión efectiva y falla si no encuentra colegios, usuarios, estudiantes, cursos o calificaciones después de sembrar. El sembrado repetible incorpora cuentas por rol, 18 estudiantes matriculados, cuatro asignaturas por nivel, horarios, asistencia, notas históricas, aula, planificación diagnóstica, postulaciones, inbox, finanzas, inventario y configuración de remuneraciones. En producción, con `DEMO_RESET_ENABLED` (por defecto activo), esos colegios demo se instalan al arrancar la API y se reinician periódicamente; `./etc/scripts/sync2` solo publica código y no vuelve a sembrar.

Las contraseñas se almacenan con bcrypt en MySQL. Las sesiones no usan JWT: la API emite tokens Bearer aleatorios de 256 bits, los guarda temporalmente en Redis, valida su TTL en cada solicitud y permite revocar sesiones al cerrar sesión o cambiar una cuenta. El login tiene límite de intentos por IP. Por seguridad, cambia la contraseña inicial de `admin` desde **Mi cuenta** después del primer ingreso. El sembrado opcional genera estudiantes ficticios con `@faker-js/faker`, los matricula y agrega calificaciones iniciales editables desde el dashboard.

La cuenta de dirección dispone de una sección **Administración** que no aparece para profesores. Desde allí puede crear cuentas usando el correo como acceso, elegir una contraseña temporal manual o generar una segura automáticamente, filtrar directores y managers por flags, asignar cargos, cambiar contraseñas y activar o desactivar accesos. Si SMTP está configurado, las credenciales temporales de cada cuenta nueva se envían al correo indicado. Cada usuario también puede cambiar su propia contraseña desde el perfil o el menú lateral, confirmando primero su clave actual. Cuando cambia el nombre de un profesor, sus cursos también se actualizan. Las sesiones anteriores de una cuenta modificada se revocan automáticamente.

El director recibe todos los permisos. El rol **manager** puede crear profesores, estudiantes y apoderados según los flags asignados, además de estructurar asignaturas y cursos cuando tiene el flag de colegio. El rol **agente_finanzas** tiene acceso exclusivo a Finanzas y RRHH. Los profesores solo ven los cursos, estudiantes y calificaciones de las asignaturas que tienen asignadas; pueden registrar notas y subir materiales PPT, PPTX o PDF, pero no acceden a Finanzas ni RRHH. Al matricular un estudiante se crean sus credenciales y, opcionalmente, la cuenta del apoderado; si SMTP está configurado, Nodemailer envía las credenciales temporales al correo familiar. Dirección puede configurar el nombre del colegio y registrar sueldos.

Finanzas incluye una **Rendición de cuentas** para dirección y managers. Permite registrar ingresos y egresos por período, origen del recurso, categoría, documento, contraparte y estado de revisión, y exportar un resumen anual en PDF. Es un libro auxiliar interno: no sustituye la declaración oficial ante Mineduc o la Superintendencia de Educación.

Los documentos de cobro permiten adjuntar PDF o imágenes JPG/PNG de hasta 25 MB y descargarlos desde Finanzas. El PDF financiero incluye solo el año calendario actual: cobros por vencimiento, pagos por fecha de pago y gastos por fecha del gasto.

Las asignaturas se crean manualmente y se vinculan a cada curso; una instalación normal no trae asignaturas predeterminadas. Desde la ficha del estudiante puedes asignar asignaturas, eximirlo o reincorporarlo. La exención conserva sus notas anteriores y bloquea nuevas calificaciones en esa asignatura. El historial abre en el año actual (2026); **Todos los años** muestra una tabla para consultar períodos anteriores.

La API programa con BullMQ un respaldo cada 12 horas. En producción se recomienda `BACKUP_ROOT=/home/web/www/backups`; cada carpeta `FECHA/` incluye `BASE.sql`, todos los archivos de `UPLOAD_DIR` dentro de `uploads/` y un manifiesto. Solo se publica la carpeta cuando ambas copias terminan; después se eliminan respaldos de más de seis meses. `BACKUP_ROOT` y `BACKUPS_ENABLED` controlan el destino y la programación. Requiere `mysqldump`. Para restaurar, importa el SQL y copia `uploads/` al `UPLOAD_DIR` de la instalación con la API detenida.

La identidad global, membresías, sesiones, roles de plataforma, dominios, planes e impersonaciones pueden aislarse en `dashcole_control` mediante las variables `CONTROL_MYSQL_*`; si no se definen, se conservan en la base principal para compatibilidad. El arranque rellena las identidades globales desde las cuentas existentes sin modificar historiales. Cuando el plano de control está separado, cada respaldo incluye también `dashcole_control.sql`. El dashboard permite cambiar entre membresías y la administración global registra las acciones sensibles e impersonaciones.

En **Infraestructura → Servidores SQL**, la conexión `MYSQL_*` se registra automáticamente como `Current / Default`; su contraseña continúa únicamente en el entorno. Los servidores adicionales se prueban antes de guardarse y sus contraseñas se cifran con `CONFIG_ENCRYPTION_KEY`. `tenants` conserva `database_server_id` y `database_name`; el routing se resuelve desde el plano de control, se cachea cinco minutos en Redis y vuelve a MySQL si Redis no está disponible. Los pools se reutilizan por servidor/base. Una conexión fallida marca el servidor `offline`, impide nuevas asignaciones y conserva los tenants existentes para diagnóstico. Cambiar el routing de un colegio exige que la base destino ya contenga ese colegio, evitando apuntar accidentalmente a una base vacía. Los respaldos incorporan cada base tenant única.

La administración global recibe las solicitudes de demo del landing y puede convertirlas en un colegio operativo en un paso: aprovisiona su base, crea la identidad directora y asigna el plan. Cada plan registra estudiantes incluidos gratis (10 por defecto), tarifa base, precio mensual por estudiante adicional, moneda y si corresponde a un acuerdo personalizado. El listado de colegios muestra la matrícula activa y el cobro mensual estimado.

En **Académico → Cierre anual MINEDUC**, dirección puede preparar el cierre conforme al Decreto 67/2018: notas finales con un decimal, promedio anual, RUT o IPE, porcentaje de asistencia, situación final y fundamento de decisiones excepcionales. Los cierres quedan bloqueados, las rectificaciones exigen fundamento y todo se registra en auditoría. El sistema exporta una pre-acta PDF y un CSV UTF-8 de preparación para SIGE. Por exigencia del artículo 20, el acta oficial debe generarse y ser firmada por dirección dentro de SIGE; DashCole no presenta sus archivos auxiliares como sustituto del acta ministerial.

En **Administración → MINEDUC / SIGE** existe una base de integración desacoplada: configuración por RBD, permisos separados, mappings por entidad, estados `local_only`, `pending`, `syncing`, `synced` y `error`, outbox SQL, procesamiento BullMQ, locks Redis, idempotencia por SHA-256, conflictos y logs sanitizados. Mientras no exista documentación oficial, `NullSigeAuthProvider` y `UnconfiguredSigeProvider` fallan explícitamente y todas las capacidades remotas permanecen deshabilitadas. DashCole nunca bloquea la creación local de alumnos, cursos, matrículas, asistencia o notas por SIGE.

La vista **Asistencia** permite registrar presencia, ausencia y atraso con hora de llegada, minutos, motivo, justificación y observación interna. Estos datos permanecen locales; el envío a SIGE seguirá deshabilitado hasta confirmar oficialmente esa capacidad.

Para sincronizar una compilación ejecuta `./etc/scripts/sync2`. El destino se puede configurar en `.env` con `SYNC_TARGET` y `SYNC_PATH`; si no están definidos usa el alias SSH `web` y la ruta `/home/web/www`. Para la primera instalación, completa `.env.production` usando `etc/deploy/production.env.example` con las credenciales reales y los dominios publicados; el script copia este archivo con permisos 600 solo si falta el `.env` remoto. Configura previamente MySQL, Redis y Nginx con `etc/deploy/hlquery-api.nginx`, `etc/deploy/hlquery-dashboard.nginx`, `etc/deploy/hlquery-landing.nginx` y `etc/deploy/hlquery-guias.nginx`. La API vive en `api.hlquery.com` (proxy a `:7000`); el dashboard y la landing son estáticos. Antes de actualizar una API existente, `sync2` crea un respaldo SQL + uploads, lo descarga a `backups/remote/` y verifica sus checksums; cualquier fallo cancela la publicación. El script publica `api`, `dashboard`, `web` y `guias` por separado, reinstala las dependencias de la API, reinicia PM2 y comprueba `/api/health`. La sincronización conserva `.env`, uploads, respaldos y cualquier archivo local de base de datos; tampoco ejecuta tareas de reset o seed. MySQL permanece fuera del árbol sincronizado.

Si PM2 aparece `online` pero aumenta continuamente el contador de reinicios y `sync2` recibe `ECONNREFUSED`, la API está en crash loop: Nginx no es la causa. Revisa `pm2 logs dashcole-api --lines 100 --nostream`. El cargador de configuración importa el `.env` antes de construir cualquier pool SQL, por lo que deben verse las credenciales `MYSQL_*` reales y no los valores de fallback.

El color institucional principal es `#0067b2`. Las cuentas incluyen flags independientes para administrar usuarios, administrar notas, consultar reportes y configurar el colegio. El director inicial recibe los cuatro permisos; el profesor inicial puede administrar notas. Estos permisos se validan tanto en la interfaz como en la API.

Para detener también la infraestructura:

```bash
docker compose down
```

Los datos se conservan en volúmenes Docker. Para evitar conflictos con servicios locales, la configuración inicial publica MySQL en `3307` y Redis en `6380`. Puedes cambiar puertos o credenciales editando `.env` antes de iniciar.

## Comandos útiles

```bash
npm run dev       # API y web
npm run build     # build de producción del frontend
npm run check     # sintaxis de API + build web
npm run start     # API sin watch mode
```

El paquete `web` expone cuatro comandos propios: `dev`, `build`, `preview` e `install:clean`.

## API

Los módulos nuevos se encuentran en **Planificación**, **Postulaciones**, **Inbox de contacto**, **Integraciones** y **Plataforma**, según los permisos. La postulación pública está en el dashboard: `/postular/{colegioId}` (por ejemplo `https://dashboard.hlquery.com/postular/1`). El colegio viene en la URL; la familia no elige establecimiento. Previred se exporta desde Remuneraciones después de una prevalidación de los 105 campos de la versión implementada. Las credenciales de Meta WhatsApp se cifran con AES-256-GCM usando `CONFIG_ENCRYPTION_KEY`; esa clave debe respaldarse por un canal secreto porque no se almacena en MySQL.

- `GET /api/health`
- `GET /api/dashboard?courseId=1`
- `GET /api/courses`
- `GET /api/students?courseId=1`
- `GET /api/students/:id`
- `GET /api/grades?courseId=1`
- `POST /api/grades`
- `PUT /api/auth/password`
- `PUT /api/grades/:id`
- `DELETE /api/grades/:id`

Para verificar los flujos de cursos, exenciones, adjuntos, PDF y Faker: `npm --prefix api run test:integration`. Requiere MySQL con permiso para crear una base temporal, Redis con DB 15 disponible y `pdftotext`. La prueba crea y elimina su propia base, sin sembrar la base configurada.

Documentos, Finanzas y RRHH incluyen búsqueda y páginas de diez registros. Las fichas de estudiantes, colaboradores y cuentas permiten consultar documentos asociados; desde Administración también se incluyen los documentos del estudiante o colaborador vinculado a esa cuenta. Los profesores solo consultan documentos de sus estudiantes asignados y los agentes de finanzas solo los de RRHH. Un manager requiere el flag de usuarios o colegio para gestionar documentos. El avatar opcional del estudiante se sube desde su ficha (JPG/PNG, hasta 5 MB).

Las comunicaciones por correo usan SMTP (compatible con Mailgun), incluidos correos registrados de estudiantes y apoderados. Cada destinatario recibe un mensaje separado. Configura `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` y un `SMTP_FROM` autorizado. La interfaz informa cuántos correos aceptó SMTP y cualquier envío parcial; aceptación SMTP no confirma llegada a la bandeja de entrada. Las pruebas locales de envío y respaldo se ejecutan con `npm --prefix api run test:unit`, sin enviar correos externos.

## Aula, matrículas y documentos

En **Cursos → Abrir curso**, el profesor asignado puede crear tareas con fecha de entrega, revisar respuestas y archivos y escribir devoluciones. Los estudiantes activos entregan texto o PDF, Office e imágenes de hasta 25 MB; pueden actualizar su entrega antes del plazo. Los archivos se incluyen en los respaldos. Los foros permiten publicar respuestas y al profesor cerrar o reabrir conversaciones. Los apoderados pueden leer el aula, pero no publicar ni entregar tareas.

La matrícula incorpora todos los módulos del mismo nombre de curso, sección y año académico y respeta las exenciones existentes. Un módulo nuevo incorpora automáticamente a los estudiantes del curso. **Retirar del curso** retira todos sus módulos, conserva notas y entregas y revoca el acceso al aula y materiales. **Eximir** sigue aplicándose solo al módulo elegido.

Los documentos asociados abren en una página propia desde estudiantes, RRHH o Administración. Los documentos de cobro pueden asociarse a un estudiante o a un proveedor.

## Configuración local y API móvil

La configuración local se mantiene en el único `.env` de la raíz, creado desde `.env.example` solo cuando falta. No se sobrescribe al reinstalar. Copia ese archivo por un canal privado al usar otro PC; Git no distribuye credenciales. Los scripts leen el formato dotenv, incluidos nombres con espacios. El dashboard usa `/api` durante desarrollo y Vite redirige al `PORT` del `.env`; abre `http://IP-DEL-PC:5174` desde el teléfono en tu red.

La API HTTP escucha por defecto en `127.0.0.1:7000`, adecuada para el proxy de producción. Para habilitar además un puerto HTTPS dedicado, configura:

```dotenv
MOBILE_PORT=6667
MOBILE_HOST=0.0.0.0
MOBILE_TLS_CERT=/ruta/privada/fullchain.pem
MOBILE_TLS_KEY=/ruta/privada/privkey.pem
```

Usa un certificado válido para el dominio del servidor. Sin certificados, el puerto móvil no se inicia. Ambos puertos usan las mismas rutas `/api`, sesiones Bearer, límites de intentos de login y permisos por colegio, curso y rol. La app inicia sesión en `POST /api/auth/login`, guarda el token en el almacenamiento seguro del dispositivo y envía `Authorization: Bearer TOKEN`; `POST /api/auth/logout` revoca la sesión. Las apps nativas no requieren CORS; para clientes web de producción enumera sus orígenes HTTPS en `WEB_ORIGIN`. Un puerto adicional no garantiza seguridad absoluta: la publicación requiere certificados válidos y configuración del servidor.

## Descargar respaldos

```bash
./etc/scripts/sync    # remoto → este PC: todos los respaldos SQL + uploads
./etc/scripts/sync2   # este PC → producción: compilación y despliegue
```

`sync` consulta `BACKUP_ROOT` en el servidor SSH definido por `SYNC_TARGET` y dentro de `SYNC_PATH` (por defecto `web` y `/home/web/www`), descarga los respaldos completos a `LOCAL_BACKUPS` o `backups/remote/` y verifica checksums. Omite carpetas temporales ocultas y conserva el historial local aunque la retención remota borre copias antiguas. No restaura la base local. `sync2` usa los mismos `SYNC_TARGET` y `SYNC_PATH`, conserva su respaldo previo obligatorio y la publicación en modo producción.

`npm --prefix api run test:unit` verifica TLS y el flujo de `sync` con SSH/rsync simulados, además de respaldos y SMTP. Las pruebas de integración incluyen aula, matrículas, retiro, permisos y proveedores.

`sync2 --check` comprueba el acceso SSH y, si falta el `.env` remoto, valida la configuración local antes de compilar o publicar. Los errores identifican las variables pendientes sin imprimir sus valores. `sync2 --fresh` hace lo mismo que un deploy normal, pero borra `api/node_modules` remoto, vacía `api/uploads` remoto (tras el respaldo verificado) y reinstala dependencias con `npm ci` (conserva `.env`, SQL y respaldos). Para desplegar sin correo, deja `SMTP_HOST` vacío; para habilitar Mailgun completa `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD` y `SMTP_FROM` antes del primer despliegue (o en el `.env` remoto si ya existe).
