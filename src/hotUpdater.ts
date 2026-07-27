import { s3Storage } from "@hot-updater/aws";
import { createHotUpdater } from "@hot-updater/server";
import { drizzleAdapter } from "@hot-updater/server/adapters/drizzle";

import * as schema from "./db/hot-updater-schema";
import { loadConfig } from "./config";
import { createDatabase } from "./database";

export const config = loadConfig();
const database = createDatabase(config.databaseUrl);

export const hotUpdater = createHotUpdater({
  basePath: "/hot-updater",
  database: drizzleAdapter({
    db: database.db,
    provider: "postgresql",
    schema,
  }),
  routes: {
    bundles: true,
    updateCheck: true,
  },
  storages: [
    s3Storage({
      bucketName: config.s3.bucketName,
      credentials: {
        accessKeyId: config.s3.accessKeyId,
        secretAccessKey: config.s3.secretAccessKey,
      },
      ...(config.s3.endpoint ? { endpoint: config.s3.endpoint } : {}),
      region: config.s3.region,
    }),
  ],
});

export const closeDatabase = database.close;
