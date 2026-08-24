# syntax=docker/dockerfile:1

# ---- Builder: install everything, generate Prisma client, build ----
FROM node:22-bookworm-slim AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@11.15.0 --activate
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json pnpm-lock.yaml .npmrc* ./
# Cache pnpm store across builds for superfast installs
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --config.ignore-scripts=true

COPY . .
# Cache Next.js compilation artifact cache across builds
RUN --mount=type=cache,id=next-cache,target=/app/.next/cache \
    pnpm prisma generate && pnpm build

# ---- Runner: minimal image that runs the built app ----
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

# Prisma needs OpenSSL at runtime.
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl \
 && rm -rf /var/lib/apt/lists/*

# Complete production dependency tree
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/prisma ./prisma

EXPOSE 8080
CMD ["sh", "-c", "node_modules/.bin/next start -H 0.0.0.0 -p ${PORT:-8080}"]
