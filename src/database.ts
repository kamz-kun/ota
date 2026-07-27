import { SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";

import * as schema from "./db/hot-updater-schema";

export const createDatabase = (databaseUrl: string) => {
  const client = new SQL(databaseUrl, { max: 10 });
  const db = drizzle({ client, schema });

  return {
    client,
    db,
    close: () => client.close({ timeout: 5 }),
  };
};
