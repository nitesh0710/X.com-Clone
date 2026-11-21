/**
 * Speed Agency — owner facts and prices.
 *
 * THIS IS THE ONE FILE THE OWNER EDITS TO CHANGE PRICES AND BUSINESS FACTS.
 *
 * Any value left as an empty string ('') renders on the site as a visible
 * {{PLACEHOLDER}} in development. A production build (Cloudflare Pages
 * `main` branch, or STRICT_PLACEHOLDERS=1) FAILS while any placeholder
 * remains in the output. Never type an invented value here to get past it.
 *
 * Optional values (US phone, socials, legal entity disclosure) simply hide
 * when empty: they never show a placeholder.
 */

export const facts = {
  // ── Founder ─────────────────────────────────────────────────────────────
  FOUNDER_NAME: '',
  /** About 150 words, true. Paragraphs separated by a blank line. */
  FOUNDER_BIO: '',
  /** 2–3 sentence version of the bio for the homepage founder block. */
  FOUNDER_BIO_SHORT: '',
  /** Path under /public, e.g. '/images/founder.jpg'. Real, recent, well lit. */
  FOUNDER_PHOTO: '',

  // ── Location (be plain about where you're based and the hours you work) ──
  /** e.g. "I'm based in India and work US business hours for my clients." */
  LOCATION_STATEMENT: '',
  /** e.g. "Based in India · works US hours" */
  LOCATION_STATEMENT_SHORT: '',

  // ── Prices (USD; show the number only, e.g. '$1,200') ────────────────────
  PRICE_STARTER: '',
  PRICE_GROWTH: '',
  /** Monthly figure only, e.g. '$49' (the site adds "/month"). */
  PRICE_CARE_MONTHLY: '',
  PRICE_GET_FOUND: '',
  PRICE_AUTOMATION: '',
  /** Suggested default: "50% to start and 50% on approval of the preview, before launch." */
  PAYMENT_TERMS: '',
  /** e.g. "Stripe invoice, Wise or PayPal" */
  PAYMENT_METHODS: '',

  // ── Contact ─────────────────────────────────────────────────────────────
  /** Lowercase, monitored inbox, e.g. hello@speedagency.online */
  CONTACT_EMAIL: '',
  /** Cal.com 15-minute event, e.g. 'https://cal.com/yourname/15min' */
  BOOKING_URL: '',
  /** e.g. "2 business days" */
  REVIEW_TURNAROUND: '',

  // ── Brief form budget bands (e.g. '$1,000' and '$3,000') ─────────────────
  BUDGET_LOW: '',
  BUDGET_HIGH: '',

  // ── Get found: directories you will actually clean up ───────────────────
  /** e.g. "Google, Bing Places, Apple Business Connect, Yelp, Facebook and Nextdoor" */
  DIRECTORY_LIST: '',

  // ── Legal ───────────────────────────────────────────────────────────────
  LEGAL_NAME: '',
  /** e.g. "the laws of the State of Delaware, USA" */
  GOVERNING_LAW: '',
  POSTAL_ADDRESS: '',
  /** Months to keep 'lost'/'spam' enquiries (suggested 24). Number as text. */
  RETENTION_MONTHS: '',
} satisfies Record<string, string>;

export const optional = {
  /** Real US number you answer or text back. Hidden when empty. Format: '+1 555 123 4567' */
  US_PHONE: '',
  /** e.g. "Speed Agency is a trading name of …". Hidden when empty. */
  LEGAL_ENTITY_DISCLOSURE: '',
  /** Only link profiles that are active. */
  SOCIAL: {
    linkedin: '',
    facebook: '',
    instagram: '',
  },
};

/** Launch gates that are decisions, not text. The strict build fails while false. */
export const gates = {
  /** Texting provider + 10DLC registration confirmed and wording reviewed. */
  SMS_COMPLIANCE_REVIEWED: false,
  /** Privacy, Terms and Cookies reviewed by a qualified professional. */
  LEGAL_PAGES_REVIEWED: false,
};

/** Build-time public env (Astro). This file is also bundled into Pages Functions, where import.meta.env doesn't exist. */
function publicEnv(name: 'PUBLIC_TURNSTILE_SITEKEY' | 'PUBLIC_CF_ANALYTICS_TOKEN'): string {
  const env = (import.meta as { env?: Record<string, string | undefined> }).env;
  if (!env) return '';
  // Literal access so Vite can statically replace each value at build time.
  return (name === 'PUBLIC_TURNSTILE_SITEKEY' ? env.PUBLIC_TURNSTILE_SITEKEY : env.PUBLIC_CF_ANALYTICS_TOKEN) ?? '';
}

/** Public, non-secret config. */
export const config = {
  siteName: 'Speed Agency',
  siteUrl: 'https://speedagency.online',
  /** Cloudflare Turnstile site key (the only public key). */
  turnstileSiteKey: publicEnv('PUBLIC_TURNSTILE_SITEKEY'),
  /** Cloudflare Web Analytics beacon token (public by design). Empty = off. */
  cfAnalyticsToken: publicEnv('PUBLIC_CF_ANALYTICS_TOKEN'),
  /** Bump when the consent wording below changes. Stored with each enquiry. */
  consentTextVersion: '2026-11-21',
  consentText:
    'Send me occasional tips for trade business websites. Unsubscribe anytime.',
  privacyNote: "I'll use these details only to reply about your enquiry.",
  replyPromise: 'within one business day',
};

export type FactKey = keyof typeof facts;

/** The value, or a `{{KEY}}` placeholder string when unfilled. */
export function fact(key: FactKey): string {
  const v = facts[key];
  return v && v.trim() ? v : `{{${key}}}`;
}

export function hasFact(key: FactKey): boolean {
  return Boolean(facts[key] && facts[key].trim());
}

export const year = String(new Date().getUTCFullYear());

export function telHref(phone: string): string {
  return 'tel:' + phone.replace(/[^\d+]/g, '');
}

export function smsHref(phone: string): string {
  return 'sms:' + phone.replace(/[^\d+]/g, '');
}
