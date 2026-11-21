interface ImportMetaEnv {
  readonly PUBLIC_TURNSTILE_SITEKEY?: string;
  readonly PUBLIC_CF_ANALYTICS_TOKEN?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
