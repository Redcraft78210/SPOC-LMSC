# Base image with Node.js
FROM node:22 AS base

# Set the working directory
WORKDIR /usr/src/app

# Stage 1: Dependencies installation
FROM base AS dependencies

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy package manifests
COPY package.json package-lock.json ./

RUN npm install -g npm@latest

# Install root dependencies (production + dev)
RUN npm install

# Copy server and client package manifests
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install server dependencies
WORKDIR /usr/src/app/server
RUN npm install -g npm@latest
RUN npm install

# Install client dependencies
WORKDIR /usr/src/app/client
RUN npm install -g npm@latest
RUN npm install

# Copy source code
WORKDIR /usr/src/app
COPY . .

# Stage 2: Build the application
FROM base AS build

RUN npm install -g npm@latest
# Copy dependencies and source code
COPY --from=dependencies /usr/src/app /usr/src/app

# Build the frontend
WORKDIR /usr/src/app/client
RUN npm run build

# Stage 3: Production-ready image
FROM node:22-slim AS final

# Set the working directory
WORKDIR /usr/src/app
RUN npm install -g npm@latest

# Copy necessary artifacts
COPY --from=build /usr/src/app/package*.json /usr/src/app/
COPY --from=build /usr/src/app/db /usr/src/app/

COPY --from=build /usr/src/app/server /usr/src/app/server
COPY --from=build /usr/src/app/client/build /usr/src/app/client/build

# Install Backend bind dependencies
RUN npm install 

# Set environment to production
ENV NODE_ENV=production

# Expose the application port
EXPOSE 3000

# Start the backend server
WORKDIR /usr/src/app/server
CMD ["npm", "start"]
