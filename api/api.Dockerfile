########################################
# BASE
########################################
FROM node:22-alpine AS base

ENV NODE_ENV=production
ENV PORT=3001
ENV NEXT_TELEMETRY_DISABLED=1

RUN corepack enable && corepack prepare pnpm@latest --activate

RUN apk add --no-cache curl bash openssl

WORKDIR /app

RUN mkdir -p /pnpm-store && chown -R node:node /pnpm-store /app


########################################
# DEV RUNNER (Development with hot reload)
########################################
FROM base AS development
ENV NODE_ENV=development
WORKDIR /app

USER node

RUN pnpm config set store-dir /pnpm-store

COPY --chown=node:node package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm-store,uid=1000,gid=1000 \
    rm -rf node_modules && \
    pnpm install --frozen-lockfile

COPY --chown=node:node . .

CMD ["sh", "-lc", "pnpm prisma generate && pnpm prisma db push && pnpm run db:sync && pnpm run start:dev"]
