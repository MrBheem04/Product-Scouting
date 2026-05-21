# ──────────────────────────────────────────────
# ScoutPrice Backend – Production Dockerfile
# Node.js 20 LTS (Alpine for minimal image size)
# ──────────────────────────────────────────────

# ---------- Stage 1: Dependencies ----------
FROM node:20-alpine AS deps

# Install essential build tools required for native addons (puppeteer, canvas, etc.)
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    dumb-init

WORKDIR /app

# Copy package files first for layer caching
COPY package.json package-lock.json* ./

# Install production dependencies only
RUN npm ci --only=production

# ---------- Stage 2: Production Runner ----------
FROM node:20-alpine AS runner

# Install chromium for Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    dumb-init

# Tell Puppeteer to skip downloading Chromium (use system install)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV NODE_ENV=production

WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 scoutprice

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY --chown=scoutprice:nodejs . .

# Switch to non-root user
USER scoutprice

# Expose API port
EXPOSE 5000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
