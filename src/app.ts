import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { HTTPException } from "hono/http-exception";

export interface AppOptions {
  authToken: string;
  hotUpdaterHandler: (request: Request) => Promise<Response>;
}

export const createApp = ({ authToken, hotUpdaterHandler }: AppOptions) => {
  const app = new Hono();

  app.use("/hot-updater/api/*", bearerAuth({ token: authToken }));
  app.mount("/hot-updater", hotUpdaterHandler);

  app.notFound((context) =>
    context.json({ error: "Not Found" }, 404),
  );
  app.onError((error, context) => {
    if (error instanceof HTTPException) {
      return error.getResponse();
    }
    console.error(error);
    return context.json({ error: "Internal Server Error" }, 500);
  });

  return app;
};
