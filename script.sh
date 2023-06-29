#!/bin/bash
# Navega hasta el directorio de tu aplicación
cd /app

# Descarga los últimos cambios
git pull

# Reconstruye la imagen Docker
docker-compose build

# Reinicia el contenedor Docker
docker-compose down
docker-compose up -d
