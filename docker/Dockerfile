# syntax=docker/dockerfile:1.4

# Build arguments for registry prefix and namespace
ARG REGISTRY=docker.io/library
ARG NAMESPACE="library"

####################################
# Stage “base”
####################################
FROM ${REGISTRY:+${REGISTRY}/}${NAMESPACE:+${NAMESPACE}/}node:22 AS base

# Update npm globally in the base image to avoid redundancy
RUN npm install -g npm@latest

# Set the working directory
WORKDIR /usr/src/app

####################################
# Stage “dependencies”
####################################
FROM base AS dependencies

# Install build-time system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy package manifests
COPY package.json package-lock.json ./

# Install root dependencies (production + dev)
RUN npm install --legacy-peer-deps

# Copy server and client package manifests
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install server dependencies
WORKDIR /usr/src/app/server
RUN npm install --legacy-peer-deps

# Install client dependencies
WORKDIR /usr/src/app/client
RUN npm install --legacy-peer-deps

# Copy source code
WORKDIR /usr/src/app
COPY . .

####################################
# Stage “build”
####################################
FROM base AS build

# Copy dependencies and source code
COPY --from=dependencies /usr/src/app /usr/src/app

# Build the frontend
WORKDIR /usr/src/app/client
RUN npm run build

####################################
# Stage “final”
####################################
FROM ${REGISTRY:+${REGISTRY}/}${NAMESPACE:+${NAMESPACE}/}node:22-slim AS final

# Set the working directory
WORKDIR /usr/src/app

# Install runtime system dependencies first for better caching
RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy necessary artifacts
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/db ./db
COPY --from=build /usr/src/app/server ./server
COPY --from=build /usr/src/app/client/dist ./client/dist

# Install production dependencies (omit devDependencies)
RUN npm install --production --legacy-peer-deps

# Set environment to production
ENV NODE_ENV=production

# Expose the application port
EXPOSE 3000

# Start the backend server
WORKDIR /usr/src/app/server
CMD ["npm", "start"]
