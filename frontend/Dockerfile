# Use a Debian-based Node.js image for broader compatibility
FROM node:16-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Copy the rest of the application code
COPY . .

# Install dependencies
RUN npm install

# Expose the port defined in the environment variable
EXPOSE ${FRONTEND_PORT}

# Start the application
CMD ["npm", "run", "dev"]
