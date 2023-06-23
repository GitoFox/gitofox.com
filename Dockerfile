# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the application files to the working directory
COPY . .

# Copia el directorio de imágenes al contenedor
COPY img/ /usr/src/app/img/

# Expose ports 3000 and 3443
EXPOSE 3000

# Run the application
CMD [ "node", "server.js" ]
