# ---------- Builder ----------
FROM node:20-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps ./apps
COPY packages ./packages

RUN pnpm install
RUN pnpm --filter @repo/db run prisma:generate
RUN pnpm --filter @repo/db build
RUN pnpm --filter @repo/game-server build

# ---------- Production ----------
FROM node:20-alpine

WORKDIR /app

# copy entire built workspace
COPY --from=builder /app ./

WORKDIR /app/apps/game-server

EXPOSE 4001

CMD ["node", "dist/main.js"]