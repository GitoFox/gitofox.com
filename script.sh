#!/bin/bash
cd C:\Users\rubio\Encuestadores API
docker-compose down
docker-compose build
docker-compose up -d
