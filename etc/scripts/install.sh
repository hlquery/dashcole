#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd -- "${SCRIPT_DIR}/../.." && pwd)"

command -v node >/dev/null 2>&1 || { echo "Error: instala Node.js 20 o superior."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "Error: npm no está disponible."; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "Error: instala Docker."; exit 1; }
if docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose)
else
  echo "Error: instala Docker Compose."
  exit 1
fi

NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if (( NODE_MAJOR < 20 )); then
  echo "Error: se requiere Node.js 20 o superior (actual: $(node --version))."
  exit 1
fi

cd "${PROJECT_DIR}"
if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "Se creó .env con la configuración local."
fi

for project in api web landing; do
  echo "Instalando dependencias de ${project}..."
  if [[ "${project}" == "landing" ]]; then
    (cd "${PROJECT_DIR}/${project}" && npm install)
  else
    (cd "${PROJECT_DIR}/${project}" && npm install --legacy-peer-deps)
  fi
done

echo "Descargando servicios MySQL y Redis..."
"${COMPOSE[@]}" pull

echo "Instalación completa, incluyendo Sequelize. Ejecuta: ./etc/scripts/run.sh"
