export interface Env {
  DB: D1Database;
  RESEND_API_KEY?: string;
  TURNSTILE_SECRET?: string;
  OWNER_ALERT_EMAIL?: string;
  /** e.g. "Speed Agency <hello@mail.speedagency.online>" */
  FROM_EMAIL?: string;
  /** Monitored inbox customers' replies go to (CONTACT_EMAIL). Defaults to OWNER_ALERT_EMAIL. */
  REPLY_TO_EMAIL?: string;
  IP_HASH_SALT?: string;
  CAL_WEBHOOK_SECRET?: string;
  ALERT_WEBHOOK_URL?: string;
  CRM_WEBHOOK_URL?: string;
  SENTRY_DSN?: string;
  /** Cloudflare Access: team domain, e.g. "yourteam.cloudflareaccess.com", and the app's AUD tag. */
  ACCESS_TEAM_DOMAIN?: string;
  ACCESS_AUD?: string;
  /** Local development only. Never set these in production. */
  ALLOW_NO_TURNSTILE?: string;
  ALLOW_ADMIN_WITHOUT_ACCESS?: string;
}

export type Ctx<P extends string = string> = EventContext<Env, P, Record<string, unknown>>;
