import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./db/hot-updater-schema";

export const createDatabase = (databaseUrl: string) => {
  const client = postgres(databaseUrl, { max: 10 });
  const db = drizzle(client, { schema });

  return {
    client,
    db,
    close: () => client.end({ timeout: 5 }),
  };
};
