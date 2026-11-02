FROM oven/bun:1.3.14 AS install

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

FROM oven/bun:1.3.14-slim AS release

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3036

COPY --from=install /app/node_modules ./node_modules
COPY package.json ./
COPY drizzle ./drizzle
COPY src ./src

USER bun

EXPOSE 3036

CMD ["bun", "src/container.ts"]
