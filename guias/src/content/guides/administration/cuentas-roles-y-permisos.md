---
slug: cuentas-roles-y-permisos
category: Administración
categorySlug: administration
title: Cuentas, roles y permisos
shortTitle: Cuentas y roles
summary: Cómo administrar usuarios del colegio, roles (director, manager, profesor, finanzas) y flags de permiso en DashCole.
level: Principiante
duration: 15 min
updated: septiembre 2026
accent: purple
order: 30
eyebrow: Administración
authorName: Equipo DashCole
authorDescription: Equipo que mantiene el dashboard escolar, la API Express y los scripts de despliegue.
---

La sección **Administración** está disponible para dirección. Desde allí se crean cuentas, se asignan cargos y se activan o desactivan accesos.

## Cuentas iniciales locales

Tras un arranque normal (contraseña `admin`):

| Rol | Correo |
| --- | --- |
| Director | `admin@hlquery.com` |
| Demo | `demo@hlquery.com` |
| Plataforma | `super@hlquery.com` |

Con `x4` también quedan manager, jefe UTP, profesor, finanzas, estudiante y apoderado (`*@hlquery.com` / `admin`).

## Roles del colegio

- **Director**: todos los permisos del colegio.
- **Manager**: crea profesores, estudiantes y apoderados según flags; puede estructurar cursos si tiene flag de colegio.
- **Profesor**: solo cursos, estudiantes y calificaciones de sus asignaturas; puede subir materiales y registrar notas; sin Finanzas ni RRHH.
- **Agente de finanzas**: acceso a Finanzas y RRHH.
- **Estudiante / apoderado**: portal familiar y académico según matrícula.

## Flags de permiso

Las cuentas usan flags independientes, por ejemplo:

- administrar usuarios
- administrar notas
- consultar reportes
- configurar el colegio

El director inicial recibe los cuatro. El profesor inicial suele poder administrar notas. Los flags se validan en la interfaz y en la API.

## Crear una cuenta

1. Entra como director a **Administración**.
2. Crea la cuenta con el correo como acceso.
3. Define una contraseña temporal o genera una segura.
4. Asigna rol, cargo y flags.
5. Si SMTP está configurado, DashCole envía las credenciales al correo indicado.

Al modificar una cuenta se revocan sus sesiones anteriores. Cada usuario puede cambiar su propia contraseña desde el perfil confirmando la clave actual.

## Sesiones

Las sesiones no usan JWT. La API emite tokens Bearer aleatorios, los guarda en Redis con TTL y permite revocarlos al cerrar sesión o al cambiar la cuenta. El login tiene límite de intentos por IP.

## Siguiente paso

- [Colegios, tenants y plataforma](/administration/colegios-y-plataforma)
- [Cómo instalar DashCole](/installation/como-instalar-dashcole)
