import { describe, expect, spyOn, test } from "bun:test";

import { createApp } from "../src/app";

const authToken = "test-auth-token";
const createTestApp = () =>
  createApp({
    authToken,
    hotUpdaterHandler: async (request) =>
      Response.json({ path: new URL(request.url).pathname }),
  });

describe("Hot Updater Hono app", () => {
  test("keeps update and diagnostic routes public", async () => {
    const response = await createTestApp().request("/hot-updater/version");

    expect(response.status).toBe(200);
  });

  test("rejects management requests without authentication", async () => {
    const response = await createTestApp().request(
      "/hot-updater/api/bundles",
    );

    expect(response.status).toBe(401);
  });

  test("rejects management requests with the wrong token", async () => {
    const response = await createTestApp().request(
      "/hot-updater/api/bundles",
      { headers: { Authorization: "Bearer wrong-token" } },
    );

    expect(response.status).toBe(401);
  });

  test("passes authenticated management requests to Hot Updater", async () => {
    const response = await createTestApp().request(
      "/hot-updater/api/bundles",
      { headers: { Authorization: `Bearer ${authToken}` } },
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      path: "/api/bundles",
    });
  });

  test("returns JSON for routes outside the Hot Updater mount", async () => {
    const response = await createTestApp().request("/unknown");

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Not Found" });
  });

  test("hides unexpected handler errors", async () => {
    const consoleError = spyOn(console, "error").mockImplementation(() => {});
    const app = createApp({
      authToken,
      hotUpdaterHandler: async () => {
        throw new Error("database details must not leak");
      },
    });

    try {
      const response = await app.request("/hot-updater/version");

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({
        error: "Internal Server Error",
      });
    } finally {
      consoleError.mockRestore();
    }
  });
});
