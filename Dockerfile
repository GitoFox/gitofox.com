# Development stage
FROM node:14 as development

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the application files to the working directory
COPY . .

# Copy the image directory to the container
COPY img/ /app/img/

# Expose port 3000
EXPOSE 3000

# Run the application with Nodemon
CMD [ "npm", "run", "dev" ]


# Production stage
FROM node:14-alpine as production

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install --production

# Copy the application files to the working directory
COPY . .

# Copy the image directory to the container
COPY img/ /app/img/

# Expose port 3000
EXPOSE 3000

# Run the application with PM2
CMD [ "npm", "start" ]
