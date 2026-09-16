---
slug: colegios-y-plataforma
category: Administración
categorySlug: administration
title: Colegios, tenants y plataforma
shortTitle: Colegios y plataforma
summary: Administrar la consola global, aprovisionar colegios desde demos, servidores SQL y routing multi-tenant.
level: Avanzado
duration: 18 min
updated: septiembre 2026
accent: purple
order: 31
eyebrow: Administración
authorName: Equipo DashCole
authorDescription: Equipo que mantiene el dashboard escolar, la API Express y los scripts de despliegue.
---

Además del dashboard de un colegio, DashCole incluye una consola de plataforma para operar múltiples establecimientos.

## Consola de plataforma

Los administradores de plataforma pueden:

- convertir solicitudes de demo del landing en un colegio operativo
- aprovisionar base de datos, identidad de dirección y plan
- revisar matrícula activa y cobro mensual estimado
- impersonar o auditar acciones sensibles

Cada plan registra estudiantes incluidos, tarifa base, precio por estudiante adicional, moneda y si es un acuerdo personalizado.

## Servidores SQL

En **Infraestructura → Servidores SQL**:

- la conexión `MYSQL_*` del entorno se registra como `Current / Default` (contraseña solo en el entorno)
- servidores adicionales se prueban antes de guardarse y cifran la clave con `CONFIG_ENCRYPTION_KEY`
- `tenants` guarda `database_server_id` y `database_name`

El routing se resuelve desde el plano de control, se cachea cinco minutos en Redis y vuelve a MySQL si Redis no está disponible. Los pools se reutilizan por servidor/base.

Una conexión fallida marca el servidor `offline`, bloquea nuevas asignaciones y conserva los tenants para diagnóstico. Cambiar el routing exige que la base destino **ya contenga** ese colegio.

## Plano de control

Con `CONTROL_MYSQL_*` puedes aislar identidades globales, membresías, sesiones de plataforma, dominios, planes e impersonaciones en `dashcole_control`. Si no defines esas variables, todo permanece en la base principal.

## Integraciones sensibles

Credenciales de Meta WhatsApp y secretos similares se cifran con AES-256-GCM usando `CONFIG_ENCRYPTION_KEY`. Esa clave no vive en MySQL: respáldala fuera del repositorio.

## SIGE / MINEDUC

En **Administración → MINEDUC / SIGE** hay una base de integración desacoplada (config por RBD, outbox, estados, locks). Mientras no exista documentación oficial del proveedor remoto, las capacidades remotas permanecen deshabilitadas. DashCole **nunca** bloquea la creación local de alumnos, cursos, matrículas, asistencia o notas por SIGE.

## Siguiente paso

- [Cuentas, roles y permisos](/administration/cuentas-roles-y-permisos)
- [Respaldos y restauración](/operations/respaldos-y-restauracion)
- [Desplegar a producción](/deployment/desplegar-produccion)
