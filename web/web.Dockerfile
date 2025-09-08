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
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

COPY . .

RUN chown -R node:node /app

USER node

EXPOSE 3000
CMD ["pnpm", "dev"]