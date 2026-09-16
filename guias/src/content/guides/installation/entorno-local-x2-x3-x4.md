---
slug: entorno-local-x2-x3-x4
category: Instalación
categorySlug: installation
title: Entorno local con x2, x3 y x4
shortTitle: x2, x3 y x4
summary: Diferencias entre arranque diario, reinicio limpio de base y sembrado completo con datos de demostración.
level: Principiante
duration: 10 min
updated: septiembre 2026
accent: blue
order: 2
eyebrow: Instalación
authorName: Equipo DashCole
authorDescription: Equipo que mantiene el dashboard escolar, la API Express y los scripts de despliegue.
---

Los scripts `x2`, `x3` y `x4` cubren el ciclo diario de desarrollo. Están en `etc/scripts/` y equivalen al flujo corto documentado en el README.

## Qué hace cada script

| Script | Uso |
| --- | --- |
| `./etc/scripts/x2` | Instala si hace falta, levanta MySQL/Redis, inicia API + web + landing y sigue logs |
| `./etc/scripts/x3` | Borra volúmenes Docker, reinicia el esquema vacío y construye frontends |
| `./etc/scripts/x3 --yes` | Igual que `x3` sin confirmación interactiva |
| `./etc/scripts/x4` | Ejecuta `install.sh` + `x3 --yes`, siembra datos demo y verifica |

## Arranque diario (x2)

```bash
./etc/scripts/x2
```

Úsalo cuando ya tienes `.env` y solo quieres trabajar. Conserva los datos de MySQL/Redis.

## Instalación mínima (x3)

```bash
./etc/scripts/x3 --yes
```

Elimina volúmenes locales de MySQL y Redis. Deja una instalación mínima con:

- `admin@hlquery.com` / `admin`
- Tablas listas, sin el volumen de datos Faker

Sirve para probar el bootstrap o limpiar un entorno corrupto.

## Sembrado completo (x4)

```bash
./etc/scripts/x4
```

Después de `x3`, agrega cursos, estudiantes y módulos ERP de demostración. Además de las cuentas base quedan (todas con contraseña `admin`):

- `manager@hlquery.com`
- `jefeutp@hlquery.com`
- `profesor@hlquery.com`
- `finanzas@hlquery.com`
- `estudiante@hlquery.com`
- `apoderado@hlquery.com`

`x4` imprime la conexión efectiva y falla si no encuentra colegios, usuarios, estudiantes, cursos o calificaciones.

## Comandos de base desde npm

Equivalentes útiles dentro de `api`:

```bash
npm --prefix api run db:bootstrap
npm --prefix api run db:reset
npm --prefix api run db:seed
npm --prefix api run db:faker
npm --prefix api run db:verify
```

## Producción

En producción, con `DEMO_RESET_ENABLED` activo (por defecto), los colegios demo se reinstalan al arrancar la API y se reinician periódicamente. `./etc/scripts/sync2` solo publica código: **no** vuelve a sembrar.

## Siguiente paso

- [Configurar el archivo .env](/installation/configurar-entorno)
- [Desplegar a producción](/deployment/desplegar-produccion)
