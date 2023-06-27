#!/bin/bash
cd /ruta/a/tu/repositorio
docker-compose down
docker-compose build
docker-compose up -d
