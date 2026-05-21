# ──────────────────────────────────────────────
# ScoutPrice Frontend – Production Dockerfile
# Node.js 20 (build) → Nginx Alpine (serve)
# ──────────────────────────────────────────────

# ---------- Stage 1: Build React App ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for layer caching
COPY package.json package-lock.json* ./

# Install all dependencies (including devDeps needed for build)
RUN npm ci

# Copy source code
COPY . .

# Build the Vite production bundle
RUN npm run build

# ---------- Stage 2: Serve with Nginx ----------
FROM nginx:1.25-alpine AS runner

# Copy custom nginx configuration for SPA routing
COPY --from=builder /app/dist /usr/share/nginx/html

# Add SPA fallback configuration
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    gzip on; \
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /assets/ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
