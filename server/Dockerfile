# ==============================================================================
# CodeSync Server — Production Dockerfile
# Multi-stage lightweight Node.js container
# ==============================================================================

FROM node:20-alpine AS base

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache dumb-init

WORKDIR /app

# Install dependencies with caching
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

# Expose API port
EXPOSE 5000

# Use dumb-init to properly handle PID 1 and UNIX signal forwarding (SIGTERM, SIGINT)
USER node
CMD ["dumb-init", "node", "server.js"]
