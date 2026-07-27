FROM oven/bun:1.3.14 AS install

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

FROM oven/bun:1.3.14-slim AS release

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY --from=install /app/node_modules ./node_modules
COPY package.json ./
COPY drizzle ./drizzle
COPY src ./src

USER bun

EXPOSE 8080/tcp

CMD ["bun", "src/container.ts"]
