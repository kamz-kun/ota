declare module "bun" {
  interface Env {
    DATABASE_URL: string;
    HOT_UPDATER_AUTH_TOKEN: string;
    PORT?: string;
    S3_ACCESS_KEY_ID: string;
    S3_BUCKET_NAME: string;
    S3_ENDPOINT?: string;
    S3_REGION: string;
    S3_SECRET_ACCESS_KEY: string;
  }
}
