import { migrate } from "drizzle-orm/bun-sql/migrator";

import type { Environment } from "./config";
import { createDatabase } from "./database";

const getDatabaseUrl = (environment: Environment): string => {
  const databaseUrl = environment.DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new Error("Missing required environment variable: DATABASE_URL");
  }
  return databaseUrl;
};

export const runMigrations = async (
  environment: Environment = Bun.env,
): Promise<void> => {
  const database = createDatabase(getDatabaseUrl(environment));

  try {
    await migrate(database.db, {
      migrationsFolder: new URL("../drizzle", import.meta.url).pathname,
    });
    console.log("Database migrations completed.");
  } finally {
    await database.close();
  }
};

if (import.meta.main) {
  await runMigrations();
}
