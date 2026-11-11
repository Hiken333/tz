FROM oven/bun:1.4-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
COPY apps/api/package.json ./apps/api/package.json
RUN HUSKY=0 bun install --frozen-lockfile --filter @istinny/api

FROM oven/bun:1.4-alpine
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json bun.lock ./
COPY apps/api ./apps/api
WORKDIR /app/apps/api
ENV NODE_ENV=production
EXPOSE 3001
ENTRYPOINT ["sh", "./docker-entrypoint.sh"]
