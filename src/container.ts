import { runMigrations } from "./migrate";

await runMigrations();

const [{ app }, { config }] = await Promise.all([
  import("./index"),
  import("./hotUpdater"),
]);

const server = Bun.serve({
  fetch: app.fetch,
  port: config.port,
});

console.log(`Hot Updater server listening on http://localhost:${server.port}`);
