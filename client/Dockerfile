# ==============================================================================
# CodeSync Client — Production Multi-Stage Dockerfile
# Stage 1: Build React 19 SPA with Vite
# Stage 2: Serve static files with Nginx
# ==============================================================================

# --- Stage 1: Build SPA ---
# client/Dockerfile
FROM node:20-bookworm-slim AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN rm -rf node_modules package-lock.json && npm install

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
