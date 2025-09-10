########################################
# BASE
########################################
FROM node:22-alpine AS base
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

########################################
# DEV RUNNER (Development with hot reload)
########################################
FROM base AS development
ENV NODE_ENV=development

# 1) /app tulajdon átadása még az install előtt
USER root
RUN mkdir -p /app && chown -R node:node /app /home/node

# 2) PNPM store a user home-ban (nem /app alatt)
ENV PNPM_STORE_DIR=/home/node/.pnpm-store

# 3) Innentől node user telepít és futtat
USER node
WORKDIR /app

# 4) Manifestek bemásolása node tulajdonban
COPY --chown=node:node package.json pnpm-lock.yaml ./

# 5) Install: cache mount a store-ra mutasson (írható a node usernek)
RUN --mount=type=cache,id=pnpm-store,target=/home/node/.pnpm-store \
    pnpm install --frozen-lockfile

# 6) Forrás bemásolása
COPY --chown=node:node . .

EXPOSE 3000
CMD ["pnpm", "dev"]
