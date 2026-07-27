import { describe, expect, test } from "bun:test";

import { loadConfig, type Environment } from "../src/config";

const validEnvironment: Environment = {
  DATABASE_URL: "postgresql://user:password@localhost:5432/hot_updater",
  HOT_UPDATER_AUTH_TOKEN: "secret-token",
  S3_ACCESS_KEY_ID: "access-key",
  S3_BUCKET_NAME: "updates",
  S3_REGION: "auto",
  S3_SECRET_ACCESS_KEY: "secret-key",
};

describe("loadConfig", () => {
  test("uses port 8080 by default", () => {
    expect(loadConfig(validEnvironment).port).toBe(8080);
  });

  test("accepts an explicit valid port", () => {
    expect(loadConfig({ ...validEnvironment, PORT: "9090" }).port).toBe(9090);
  });

  test("reports every missing required variable", () => {
    expect(() => loadConfig({})).toThrow(
      "DATABASE_URL, HOT_UPDATER_AUTH_TOKEN, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET_NAME",
    );
  });

  test("rejects an invalid port", () => {
    expect(() => loadConfig({ ...validEnvironment, PORT: "0" })).toThrow(
      "PORT must be an integer between 1 and 65535",
    );
  });
});
