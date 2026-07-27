# Hot Updater custom server

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/eoTRRQ?referralCode=slvssb&utm_medium=integration&utm_source=template&utm_campaign=generic)

A self-hosted [Hot Updater](https://hot-updater.dev/docs/custom/overview)
metadata server built with Bun, Hono, Drizzle, PostgreSQL, and S3-compatible
storage. Update checks are public; bundle management requires a bearer token.

## Run with Docker

1. Copy the example environment and replace every placeholder:

   ```sh
   cp .env.example .env
   ```

2. Start the server and PostgreSQL:

   ```sh
   docker compose up --build
   ```

3. Check the public diagnostic endpoint:

   ```sh
   curl http://localhost:8080/hot-updater/version
   ```

The container applies committed Drizzle migrations before serving requests.
PostgreSQL data is retained in the `postgres_data` volume. S3 or R2 remains an
external service and must already have a bucket and credentials.

## Run with Bun

With PostgreSQL available at `DATABASE_URL` and `.env` configured:

```sh
bun install
bun run db:migrate
bun run dev
```

The default server URL is `http://localhost:8080/hot-updater`. Set `PORT` to
override `8080` outside Docker.

## Database workflow

Regenerate the official Hot Updater Drizzle schema and create a migration after
upgrading Hot Updater:

```sh
bun run db:generate
```

Review the generated SQL in `drizzle/`, then apply it:

```sh
bun run db:migrate
```

`db:schema` only refreshes `src/db/hot-updater-schema.ts`; `db:generate` also
asks Drizzle Kit to create a SQL migration. Commit both generated artifacts.

## React Native CLI configuration

The CLI storage plugin must use the same bucket, endpoint, and region as this
server. Send the management token with every standalone repository request:

```ts
import { s3Storage } from "@hot-updater/aws";
import { bare } from "@hot-updater/bare";
import { defineConfig } from "@hot-updater/core";
import { standaloneRepository } from "@hot-updater/standalone";

const storage = s3Storage({
  region: process.env.S3_REGION!,
  endpoint: process.env.S3_ENDPOINT || undefined,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  bucketName: process.env.S3_BUCKET_NAME!,
});

export default defineConfig({
  build: bare(),
  storage,
  database: standaloneRepository({
    baseUrl: "http://localhost:8080/hot-updater",
    commonHeaders: {
      Authorization: `Bearer ${process.env.HOT_UPDATER_AUTH_TOKEN}`,
    },
  }),
});
```

## React Native client

Point the application at the public update-check routes; it does not need the
management bearer token:

```tsx
import { HotUpdater } from "@hot-updater/react-native";

export default HotUpdater.wrap({
  baseURL: "http://localhost:8080/hot-updater",
  updateStrategy: "appVersion",
})(App);
```

Use an HTTPS production URL in shipped applications.

## Routes

- Public: `/hot-updater/version`, `/hot-updater/app-version/*`, and
  `/hot-updater/fingerprint/*`.
- Bearer protected: every route under `/hot-updater/api/*`.

Run checks with `bun run typecheck` and `bun test`.
