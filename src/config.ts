export type Environment = Record<string, string | undefined>;

export interface AppConfig {
  authToken: string;
  databaseUrl: string;
  port: number;
  s3: {
    accessKeyId: string;
    bucketName: string;
    endpoint?: string;
    region: string;
    secretAccessKey: string;
  };
}

const requiredKeys = [
  "DATABASE_URL",
  "HOT_UPDATER_AUTH_TOKEN",
  "S3_REGION",
  "S3_ACCESS_KEY_ID",
  "S3_SECRET_ACCESS_KEY",
  "S3_BUCKET_NAME",
] as const;

const nonEmpty = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

export const loadConfig = (environment: Environment = process.env): AppConfig => {
  const values = Object.fromEntries(
    requiredKeys.map((key) => [key, nonEmpty(environment[key])]),
  ) as Record<(typeof requiredKeys)[number], string | undefined>;
  const missing = requiredKeys.filter((key) => !values[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  const portText = nonEmpty(environment.PORT) ?? "8080";
  const port = Number(portText);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(`PORT must be an integer between 1 and 65535; received "${portText}"`);
  }

  const endpoint = nonEmpty(environment.S3_ENDPOINT);

  return {
    authToken: values.HOT_UPDATER_AUTH_TOKEN!,
    databaseUrl: values.DATABASE_URL!,
    port,
    s3: {
      accessKeyId: values.S3_ACCESS_KEY_ID!,
      bucketName: values.S3_BUCKET_NAME!,
      ...(endpoint ? { endpoint } : {}),
      region: values.S3_REGION!,
      secretAccessKey: values.S3_SECRET_ACCESS_KEY!,
    },
  };
};
