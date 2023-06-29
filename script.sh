#!/bin/bash
const path = require('path');
const currentFilePath = __filename;
const currentDirectory = path.dirname(currentFilePath);

console.log('Path del archivo actual:', currentDirectory);


# Navega hasta el directorio de tu aplicación
cd /app

# Descarga los últimos cambios
git pull

# Reconstruye la imagen Docker
docker-compose build

# Reinicia el contenedor Docker
docker-compose down
docker-compose up -d
