FROM oven/bun:1.4 AS build
WORKDIR /app
COPY package.json bun.lock ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
RUN HUSKY=0 bun install --frozen-lockfile
COPY apps/api ./apps/api
COPY apps/web ./apps/web
ARG API_URL=http://api:3001
ENV API_URL=${API_URL}
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run --filter @istinny/web build

FROM oven/bun:1.4-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV API_URL=http://api:3001
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
EXPOSE 3000
CMD ["bun", "apps/web/server.js"]
