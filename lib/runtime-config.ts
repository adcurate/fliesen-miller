import { env } from "cloudflare:workers";

export type RuntimeConfig = {
  SMTP_USERNAME?: string;
  SMTP_PASSWORD?: string;
  INQUIRY_EMAIL_TO?: string;
  INQUIRY_EMAIL_FROM?: string;
  SITE_URL?: string;
  SEO_INDEXING_ENABLED?: string;
};

export function getRuntimeConfig(): RuntimeConfig {
  const workerEnv = env as unknown as RuntimeConfig;
  const processEnv: Record<string, string | undefined> = typeof process === "undefined" ? {} : process.env;
  const read = (key: keyof RuntimeConfig) => workerEnv[key] || processEnv[key] || undefined;
  return {
    SMTP_USERNAME: read("SMTP_USERNAME"),
    SMTP_PASSWORD: read("SMTP_PASSWORD"),
    INQUIRY_EMAIL_TO: read("INQUIRY_EMAIL_TO"),
    INQUIRY_EMAIL_FROM: read("INQUIRY_EMAIL_FROM"),
    SITE_URL: read("SITE_URL"),
    SEO_INDEXING_ENABLED: read("SEO_INDEXING_ENABLED"),
  };
}

export function hasMailConfig() {
  const config = getRuntimeConfig();
  return Boolean(config.SMTP_USERNAME?.trim() && config.SMTP_PASSWORD);
}
