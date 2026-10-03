# ==============================================================================
# CodeSync Client — Production Multi-Stage Dockerfile
# Stage 1: Build React 19 SPA with Vite
# Stage 2: Serve static files with Nginx
# ==============================================================================

# --- Stage 1: Build SPA ---
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build Vite static bundle
RUN npm run build

# --- Stage 2: Serve with Nginx ---
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
