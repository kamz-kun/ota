import * as v from "valibot";

export type Environment = Partial<Bun.Env>;

const requiredString = (name: string) =>
  v.pipe(
    v.string(`${name} is required`),
    v.trim(),
    v.nonEmpty(`${name} must not be empty`),
  );

const portMessage = "PORT must be an integer between 1 and 65535";

const EnvironmentSchema = v.object({
  DATABASE_URL: requiredString("DATABASE_URL"),
  HOT_UPDATER_AUTH_TOKEN: requiredString("HOT_UPDATER_AUTH_TOKEN"),
  S3_REGION: requiredString("S3_REGION"),
  S3_ACCESS_KEY_ID: requiredString("S3_ACCESS_KEY_ID"),
  S3_SECRET_ACCESS_KEY: requiredString("S3_SECRET_ACCESS_KEY"),
  S3_BUCKET_NAME: requiredString("S3_BUCKET_NAME"),
  S3_ENDPOINT: v.pipe(v.optional(v.string(), ""), v.trim()),
  PORT: v.pipe(
    v.optional(v.string(), "8080"),
    v.trim(),
    v.transform((value) => value || "8080"),
    v.transform(Number),
    v.integer(portMessage),
    v.minValue(1, portMessage),
    v.maxValue(65_535, portMessage),
  ),
});

const ConfigSchema = v.pipe(
  EnvironmentSchema,
  v.transform((environment) => ({
    authToken: environment.HOT_UPDATER_AUTH_TOKEN,
    databaseUrl: environment.DATABASE_URL,
    port: environment.PORT,
    s3: {
      accessKeyId: environment.S3_ACCESS_KEY_ID,
      bucketName: environment.S3_BUCKET_NAME,
      ...(environment.S3_ENDPOINT ? { endpoint: environment.S3_ENDPOINT } : {}),
      region: environment.S3_REGION,
      secretAccessKey: environment.S3_SECRET_ACCESS_KEY,
    },
  })),
);

export type AppConfig = v.InferOutput<typeof ConfigSchema>;

const issueKey = (issue: v.BaseIssue<unknown>): string =>
  String(issue.path?.[0]?.key ?? "environment");

export const loadConfig = (environment: Environment = Bun.env): AppConfig => {
  const result = v.safeParse(ConfigSchema, environment);

  if (!result.success) {
    const invalidKeys = [...new Set(result.issues.map(issueKey))];
    const details = result.issues
      .map((issue) => `${issueKey(issue)}: ${issue.message}`)
      .join("; ");

    throw new Error(
      `Invalid environment variables: ${invalidKeys.join(", ")}. ${details}`,
    );
  }

  return result.output;
};
