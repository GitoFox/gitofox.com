# Establecer la imagen base
FROM node:14

# Instalar Nginx
RUN apt-get update && apt-get install -y nginx

# Crear el directorio de la aplicación en el contenedor
WORKDIR /usr/src/app

# Copiar el archivo de las dependencias del proyecto
COPY package*.json ./

# Instalar las dependencias del proyecto
RUN npm install

# Copiar el resto del código de la aplicación al contenedor
COPY . .

# Copiar el archivo de configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos de certificados SSL (Asegúrate de que los archivos de certificados están en tu directorio de proyecto)
COPY ./ssl/cert.pem /etc/nginx/ssl/server.crt
COPY ./ssl/key.pem /etc/nginx/ssl/server.key

# Exponer el puerto que la aplicación utilizará
EXPOSE 80
EXPOSE 443

# Comando para iniciar Nginx y la aplicación
CMD service nginx start && node server.js
