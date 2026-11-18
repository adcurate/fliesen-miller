declare namespace Cloudflare {
  interface Env {
    // The generic D1 example is kept in the repository; production does not bind a database.
    DB?: D1Database;
    INQUIRY_LIMITER?: RateLimit;
    SMTP_USERNAME?: string;
    SMTP_PASSWORD?: string;
    INQUIRY_EMAIL_TO?: string;
    INQUIRY_EMAIL_FROM?: string;
    SITE_URL?: string;
    SEO_INDEXING_ENABLED?: string;
  }
}
