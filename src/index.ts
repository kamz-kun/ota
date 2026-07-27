import { createApp } from "./app";
import { config, hotUpdater } from "./hotUpdater";

export const app = createApp({
  authToken: config.authToken,
  hotUpdaterHandler: hotUpdater.handler,
});

export default {
  fetch: app.fetch,
  port: config.port,
};
