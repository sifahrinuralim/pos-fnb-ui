# ──────────────────────────────────────────────
# Stage 1: Build
# ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (memanfaatkan Docker layer cache)
COPY package.json package-lock.json ./
RUN npm ci

# Copy seluruh source lalu build
COPY . .
RUN npm run build

# Buang devDependencies agar image runtime ramping
RUN npm prune --omit=dev

# ──────────────────────────────────────────────
# Stage 2: Runtime
# ──────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=8071

# Salin hasil build + dependency production saja
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Jalankan sebagai user non-root
USER node

EXPOSE 8071

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8071/ >/dev/null 2>&1 || exit 1

CMD ["node", "build"]
