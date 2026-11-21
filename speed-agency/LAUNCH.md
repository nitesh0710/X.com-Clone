# Launch handover — Speed Agency rebuild

Status: **phases 1–4 built and tested locally.** It isn't deployed yet: it needs the owner's Cloudflare and Resend accounts, and the facts below. The production build is **blocked on purpose** until every placeholder is filled.

## 1. Unfilled placeholders

Fill these in `src/config/site.ts`, unless the row says otherwise. Nothing has been invented. Each one renders as a dashed orange `{{MARK}}` until it's filled, and the production build fails while any remain.

### Blocks launch

| Placeholder | Where it appears | Notes |
| --- | --- | --- |
| `FOUNDER_NAME` | Hero card, Home, About, articles, auto-reply signature | |
| `FOUNDER_BIO` | About (about 150 words, true) | Separate paragraphs with a blank line |
| `FOUNDER_BIO_SHORT` | Home "Why Speed Agency" block (2–3 sentences) | Added to support §4.7 |
| `FOUNDER_PHOTO` | Hero card, Home, About | Put the file in `public/images/`, set e.g. `/images/founder.jpg` |
| `LOCATION_STATEMENT` | Footer (every page), About, FAQ, Contact, Privacy | Say plainly where you're based and the hours you work |
| `LOCATION_STATEMENT_SHORT` | Hero founder card | |
| `PRICE_STARTER`, `PRICE_GROWTH`, `PRICE_CARE_MONTHLY`, `PRICE_GET_FOUND`, `PRICE_AUTOMATION` | Home, Pricing, Websites, industry pages, service pages, FAQ | Test them on 5–10 real prospect conversations first. `Service` structured data gets `offers` only once a price is set |
| `PAYMENT_TERMS` | Pricing | Suggested: "50% to start and 50% on approval of the preview, before launch." |
| `PAYMENT_METHODS` | Pricing, About, FAQ | |
| `CONTACT_EMAIL` | Footer, final CTA "Email me instead", Contact, legal pages, form error messages | Also set `REPLY_TO_EMAIL` (secret) to the same inbox |
| `OWNER_ALERT_EMAIL` | **Secret**, not `site.ts` | |
| `BOOKING_URL` | `/book` calendar embed | Cal.com 15-minute event in US time zones |
| `DEMO_1`, `DEMO_2`, `DEMO_3` | Concept cards and detail pages (plumber, electrician, roofer) | Replace the placeholder screenshots in `src/assets/concepts/`, then delete `placeholderKey` in each `src/content/work/*.md`. Add `previewUrl` if the demo is hosted |
| `LEGAL_NAME`, `GOVERNING_LAW` | Privacy, Terms | |
| `POSTAL_ADDRESS` | (config only) | Needed in tips emails (CAN-SPAM/PECR). No tips emails are sent yet |
| `RETENTION_MONTHS` | Privacy | Also set the `RETENTION_MONTHS` GitHub repository variable (suggested 24) |
| `LEGAL_PAGES_REVIEWED` | Draft banner on Privacy, Terms, Cookies | Set `gates.LEGAL_PAGES_REVIEWED = true` **only after professional review** |
| `SMS_COMPLIANCE_REVIEWED` | `/automation` | Set `gates.SMS_COMPLIANCE_REVIEWED = true` once the provider and 10DLC registration are confirmed and the wording is reviewed |
| `DIRECTORY_LIST` | `/get-found` | The directories you'll actually clean up |
| `LEGAL_ENTITY_DISCLOSURE` | Footer | Optional. Hidden when empty |

### Strongly recommended

| Placeholder | Notes |
| --- | --- |
| `US_PHONE` (`optional.US_PHONE`) | Hidden when empty. Turns on the call button and the "Text us" sticky-bar button. Only add it if the number is reliably answered |
| `REVIEW_TURNAROUND` | `/thanks` (e.g. "2 business days"). Also decide whether to offer free video reviews at all |
| `BUDGET_LOW`, `BUDGET_HIGH` | Project brief form (`/contact?brief=1`) |
| `optional.SOCIAL.*` | LinkedIn at minimum, and only if active. Feeds the footer and `Organization.sameAs` |
| `ALERT_WEBHOOK_URL` (secret) | ntfy topic or Telegram bot URL for phone alerts |
| `GBP_ELIGIBLE` | A decision, not site text: whether Speed Agency itself can honestly have a Google Business Profile |

### Accounts and settings needed (see README → Deploying)
Cloudflare Pages + D1 (×2), Turnstile, Resend (verified sending subdomain), Cloudflare Access, Cal.com and its webhook, UptimeRobot, Search Console and Bing, the GitHub secrets for backups, and the `www` → apex Redirect Rule.

### Removed from the old site
The "3x reply rate" stat, "100% consented, opt-in leads", "0 spam complaints to date", the four unnamed case studies, the "permission-based growth" newsletter and the lead-gen services list are **not present**. The build fails if text like that reappears. Old URLs 301 to the nearest page (`public/_redirects`). **Confirm that list against the real old URL list.**

## 2. Deviations from the spec, and why

1. **Astro 7 instead of Astro 5.** Astro 5 (5.18.2) has open critical and high advisories (XSS, SSRF, an image-pipeline RCE) that are only fixed in Astro 6/7. The CI rule "`npm audit` on high severity" would fail on Astro 5. The architecture is unchanged (static output, content collections, islands of vanilla JS). `npm audit` reports 0 vulnerabilities.
2. **Zod 4** (not 3) for the same reason. It runs in "jitless" mode so the strict CSP needs no `'unsafe-eval'`.
3. **Project lives in `speed-agency/` inside the `X.com-Clone` repository.** That was the only repository in this session, and I didn't overwrite the existing app. Its root `package.json` is broken (it contains YAML), which breaks Wrangler's Functions build from this layout. **Move this folder into its own repository** before connecting Cloudflare Pages (see README).
4. **Data retention runs from the weekly GitHub Action**, not a separate scheduled Worker. It's the same SQL on the same schedule, with one less thing to deploy. It sits alongside the D1 backup job.
5. **One shared OG image** (`public/og/default.png`, generated from the brand template by `scripts/make-brand-assets.mjs`), not one per page. Per-page generation would add a build dependency (satori/resvg) for little gain at this size. Any page can pass its own `ogImage`.
6. **Analytics session ID is per page load**, not per tab. The spec asks for "memory only, no cookie", and JavaScript memory resets on each navigation. Persisting it would need storage, which the cookie stance rules out.
7. **`form_submit` and `form_error` are recorded server-side** when the server accepts or rejects, rather than sent by the browser. They fire exactly once per action and can't be faked by the client. The other client events are sent with `sendBeacon` as specified.
8. **Admin protection is layered.** Cloudflare Access sits in front, *and* Functions verify the Access JWT (`ACCESS_TEAM_DOMAIN`, `ACCESS_AUD`), so a mis-set Access policy can't expose leads.
9. **Rate limit** counts every non-honeypot POST to `/api/enquiry` per IP per hour, invalid ones included. The 6th attempt returns 429.
10. **`www` → apex** is a Cloudflare Redirect Rule (host-based). `_redirects` can't do host redirects.
11. **Old `#anchor` links** can't be 301'd, because browsers never send fragments to the server. They land on the homepage.
12. **HVAC and painters** pages show the plumbing and roofing concepts respectively, clearly labelled, until trade-specific concepts exist. The spec asks for only 3 demos (plumber, electrician, roofer).
13. **Sentry** isn't wired in. Errors are logged as JSON with a request ID to Workers Logs, and email-sending failures alert the owner (push alert, plus email when email itself isn't the failure). `SENTRY_DSN` is reserved.
14. **Extra owner fact `FOUNDER_BIO_SHORT`.** The homepage asks for "2–3 sentences from `FOUNDER_BIO`". A separate field avoids auto-truncating the real bio.
15. **Industry H1 for HVAC** reads "Websites for HVAC companies" (the pattern "Websites for HVACs" doesn't read naturally).

## 3. QA results (local, `wrangler pages dev` + local D1)

### Lighthouse, mobile (simulated Moto G Power, slow 4G)
Reports: `reports/lighthouse-*-mobile.report.html`

| Page | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT | Weight |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Home | 100 | 100 | 100 | 100 | 1.7 s | 0 | 0 ms | 141 KB |
| `/websites` | 100 | 100 | 100 | 100 | 1.2 s | 0 | 0 ms | 139 KB |
| `/contact` | 99 | 100 | 100 | 100 | 1.9 s | 0 | 0 ms | 164 KB |

Home JS: 2.0 KB gzipped (budget 30 KB). These were measured locally; re-run against the production URL after deploy (CI does this on every PR).

### Accessibility (axe-core 4.10, WCAG 2.0/2.1 A + AA + best practices)
**0 violations** on all 24 page variants (every template, plus `/contact?topic=review`, `/contact?brief=1`, 404 and the style guide), at 375px and 1280px.

Every token text pairing passes AA:

| Pairing | Contrast |
| --- | --- |
| ink / paper | 16.0 |
| ink-2 / paper | 7.4 |
| ink-2 / paper-2 | 6.7 |
| signal-ink / paper | 5.1 |
| signal-ink / paper-2 | 4.5 |
| placeholder text | 5.1 |
| error | 6.6 |

### Responsive
No horizontal scroll on any page at 360, 375, 414, 768, 1024, 1280 or 1440px. At 375px wide, the hero H1 ends at 211px, the subhead at 390px and the primary button at 462px, all inside the 600px requirement.

### Behaviour verified

- **Mobile menu:** opens as a modal, traps focus, Esc closes it and returns focus to the button.
- **Services dropdown:** opens, and closes on Esc or click outside.
- **Sticky bar:** appears after the hero scrolls out, and hides while a form field has focus.
- **Contact form:**
  - Empty submit shows an error summary (focused) and an inline error on each field.
  - A valid submit redirects to `/thanks`.
  - `?topic=review` pre-selects "Free video review" and swaps the intro.
  - `?brief=1` shows the brief fields.
- **`/api/enquiry`:**

  | Case | Result |
  | --- | --- |
  | Valid submit | 200, row stored with consent version, UTM campaign and IP hash (no raw IP) |
  | Missing or invalid fields | 400 with per-field errors |
  | Message over 3,000 characters | 400 |
  | Honeypot filled | Silent 200, not stored |
  | Cross-origin POST | 403 |
  | 6th attempt in an hour | 429 |
  | Failed Turnstile (Cloudflare's always-fail test key) | 400 |
  | No-JS form post | 303 redirect |
- **Cal.com webhook:** valid signature → stored + `booking_made`; invalid signature → 401; a duplicate delivery is ignored.
- **Admin:** list, PATCH status and notes (invalid status rejected), CSV export (with formula-injection guard), stats endpoint.
- **Email failure:** with no Resend key, the failure is logged with a request ID and the owner-alert path runs.
- **Security headers:** HSTS, CSP (hash-based, no `unsafe-inline` or `unsafe-eval` for scripts), `frame-ancestors 'none'`, nosniff, Referrer-Policy and Permissions-Policy are all served.
- **Build checks:** no secrets in the client bundle; no fabricated-proof patterns; all 1,564 internal links and 25 redirects resolve.

### Not yet verified (needs the live accounts or real devices)

- Real email delivery: the owner alert and the auto-reply, per `form_type`
- A live Cal.com booking end to end
- Turnstile success with a real site key
- Cloudflare Access login
- securityheaders.com grade on the production URL
- Rich Results Test
- VoiceOver (iOS) and NVDA passes
- Real-device `tel:`/`mailto:` checks
- Safari, Firefox, Edge and Samsung Internet (local testing was Chromium only)
- Uptime monitor and backup job runs

These are on the launch checklist below.

## 4. Launch checklist

- [ ] Move `speed-agency/` to its own repo (or fix the root `package.json`)
- [ ] Fill every placeholder in section 1; `STRICT_PLACEHOLDERS=1 npm run build` passes
- [ ] Legal pages professionally reviewed → `gates.LEGAL_PAGES_REVIEWED = true`
- [ ] SMS compliance confirmed → `gates.SMS_COMPLIANCE_REVIEWED = true`
- [ ] Real concept screenshots replace the placeholders
- [ ] Cloudflare: Pages project, D1 (prod + preview) migrated, secrets, Turnstile, Access, `www` redirect rule, HTTPS
- [ ] Resend domain verified; Zoho email DNS untouched
- [ ] Cal.com event + webhook
- [ ] Test enquiry of each `form_type`: owner alert, auto-reply and D1 row all confirmed
- [ ] Booking creates an enquiry; an invalid signature is rejected
- [ ] UptimeRobot on `/` and `/api/health`
- [ ] Backup workflow run once by hand; restore tested into a scratch DB
- [ ] `_redirects` checked against the old site's URLs
- [ ] Search Console + Bing sitemap submission; Rich Results Test
- [ ] Device and browser pass (iOS Safari, Android Chrome, Samsung Internet, Firefox, Edge, macOS Safari) and screen-reader pass
