# Speed Agency — speedagency.online

Website for Speed Agency: conversion-focused websites for US trade businesses. It's a static Astro site on Cloudflare Pages, with Pages Functions for forms and Cloudflare D1 for data. Everything runs on free tiers. You pay only for the domain.

- **Before launch:** read [`LAUNCH.md`](./LAUNCH.md). It lists every unfilled placeholder, every deviation from the spec, and the QA results.
- **Prices and business facts:** change them in **one file**, [`src/config/site.ts`](./src/config/site.ts).

> ⚠️ **Repository layout.** This project currently lives in `speed-agency/` inside the `X.com-Clone` repository. That repo's root `package.json` is broken: it contains a GitHub Actions workflow, not JSON. Wrangler's bundler reads parent folders and fails on it when it builds `functions/`, so **Cloudflare Pages deploys of the functions will fail from this layout.** Fix this before deploying. Best: move `speed-agency/` into its own repository (preferred, and what the spec asks for). Otherwise, repair the root `package.json`. Local testing for this handover was done from a copy outside the repo.

---

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Astro 7 (static output) + TypeScript (strictest) |
| Styling | Plain CSS with custom properties (`src/styles/tokens.css`, `base.css`) |
| Content | Markdown content collections (`src/content/`) |
| Hosting | Cloudflare Pages (`main` → production, other branches → preview URLs) |
| Server code | Pages Functions (`functions/api/*`) |
| Database | Cloudflare D1 (`migrations/`) |
| Spam | Cloudflare Turnstile + honeypot + 5/hour/IP rate limit |
| Email | Resend HTTP API (free tier) |
| Booking | Cal.com (free), embedded on `/book`, webhook → `/api/booking` |
| Analytics | Cloudflare Web Analytics (cookieless) + first-party events in D1 |
| Admin | `/admin` and `/admin/stats`, behind Cloudflare Access |

Shipped JavaScript: about 2 KB gzipped on most pages. The contact form adds the shared Zod schema.

## Project structure

```
src/
  config/site.ts      ← prices + owner facts (the one file to edit)
  components/         Header (+ mobile menu), StickyBar, Footer, PricePanel, DemoCard, ProcessSteps,
                      FaqList, EnquiryForm, Testimonials, FounderCard, CtaBand, F (fact/placeholder) …
  layouts/            BaseLayout (meta, JSON-LD, skip link, scripts), ArticleLayout, AdminLayout
  content/            insights/ work/ industries/ (Markdown) · faq/faq.ts · testimonials/testimonials.json
  pages/              all routes (see sitemap below); dev/[page].astro = style guide (previews only)
  lib/                schema.ts (Zod, shared client/server), seo.ts, events.ts, fill.ts, nav.ts, offer.ts
  styles/             tokens.css, base.css
  assets/concepts/    concept screenshots (currently PLACEHOLDERS)
functions/
  api/enquiry.ts      POST: validate → rate limit → Turnstile → store → emails/alerts/CRM webhook
  api/booking.ts      POST: Cal.com webhook (HMAC verified) → stored as a 'booking' enquiry
  api/event.ts        POST: allow-listed analytics events → 204
  api/health.ts       GET: D1 connectivity (for uptime monitoring)
  api/admin/*         leads list/CSV, PATCH status/notes, stats (Access-protected + JWT verified)
  admin/_middleware   protects the /admin pages too
migrations/0001_init.sql
scripts/              postbuild-checks, check-links, lint-content, asset generators, sql/retention.sql
public/               fonts (self-hosted, Latin subset), _headers, _redirects, robots.txt, icons, og/
```

## Local setup

Requires Node 22.23.4 or newer.

```bash
cd speed-agency
npm install
cp .dev.vars.example .dev.vars            # local-only secrets; never commit
npm run db:migrate:local                  # creates the local D1 tables
npm run dev                               # Astro dev server (pages only) at http://localhost:4321
npm run preview                           # full stack: build + wrangler pages dev (forms, API, D1) at :8788
```

`.dev.vars.example` sets `ALLOW_NO_TURNSTILE=1` and `ALLOW_ADMIN_WITHOUT_ACCESS=1`, so forms and `/admin` work locally. **Never set these in Cloudflare.**

### Useful scripts

| Command | What it does |
| --- | --- |
| `npm run build` | Astro build, then `scripts/postbuild-checks.mjs` (see below) |
| `npm run typecheck` | `astro check` + typecheck of `functions/` |
| `npm run lint` | Content rules: banned words, Insights links, industry page length |
| `npm run check:links` | Every internal link and redirect target resolves |

**Postbuild checks** fail the build on any of these:

- a title that isn't 50–60 characters, or a description that isn't 140–160
- a duplicate title or description, or anything other than exactly one `<h1>`
- a missing canonical
- fabricated-proof patterns (stars, ratings markup, "Nx" or % claims, customer counts)
- server secret names in client files
- Home JS over 30 KB gzipped, or Home weight over 500 KB

The same script also writes the Content-Security-Policy, with a sha256 hash for each inline script, into `dist/_headers`.

**Placeholder gate.** Unfilled `{{PLACEHOLDERS}}` show as dashed orange marks in development and on preview deploys. The build **fails** when `CF_PAGES_BRANCH=main` (Cloudflare production) or `STRICT_PLACEHOLDERS=1` is set and any placeholder remains.

## Environment variables

Set these in Cloudflare Pages → Settings → Variables and Secrets, separately for Production and Preview. Never put them in git.

| Name | Type | Purpose |
| --- | --- | --- |
| `RESEND_API_KEY` | secret | Sending email |
| `FROM_EMAIL` | secret | e.g. `Speed Agency <hello@mail.speedagency.online>` (verified Resend domain) |
| `REPLY_TO_EMAIL` | secret | Where customer replies go (your monitored `CONTACT_EMAIL`) |
| `OWNER_ALERT_EMAIL` | secret | New-lead alerts |
| `TURNSTILE_SECRET` | secret | Turnstile server key |
| `IP_HASH_SALT` | secret | Long random string. IPs are stored only as SHA-256(salt + IP) |
| `CAL_WEBHOOK_SECRET` | secret | Same secret as the Cal.com webhook |
| `ACCESS_TEAM_DOMAIN` | secret | e.g. `yourteam.cloudflareaccess.com` |
| `ACCESS_AUD` | secret | The Access application's AUD tag |
| `ALERT_WEBHOOK_URL` | optional | Phone push: an ntfy topic URL, or `https://api.telegram.org/bot<token>/sendMessage?chat_id=<id>` |
| `CRM_WEBHOOK_URL` | optional | n8n webhook; each new enquiry is POSTed as JSON |
| `SENTRY_DSN` | optional | Reserved. Errors currently go to Workers Logs (`console.error` with a request ID) |
| `PUBLIC_TURNSTILE_SITEKEY` | build variable | The only public key. Read at build time |
| `PUBLIC_CF_ANALYTICS_TOKEN` | build variable | Optional. Leave empty if Web Analytics is enabled from the Pages dashboard |
| `NODE_VERSION` | build variable | `22.23.4` (or newer) |

## Deploying to Cloudflare Pages

1. **D1:**
   - Run `npx wrangler d1 create speed-agency` and `npx wrangler d1 create speed-agency-preview`.
   - Put both IDs in `wrangler.toml`.
   - Run `npm run db:migrate:remote`, then `npx wrangler d1 migrations apply speed-agency-preview --remote --env preview`.
2. **Pages project:** connect the GitHub repo, with these settings:
   - Root directory: `speed-agency`
   - Build command: `npm run build`
   - Output directory: `dist`
   - Production branch: `main`

   Bind D1 as `DB`: production uses `speed-agency`, preview uses `speed-agency-preview`.
3. **Secrets:** add the variables above.
4. **Turnstile:** create a widget for `speedagency.online` (managed mode). Put the site key in `PUBLIC_TURNSTILE_SITEKEY` and the secret key in `TURNSTILE_SECRET`.
5. **Resend:** verify `mail.speedagency.online`, and add the DKIM/SPF records it gives you. **Leave the existing Zoho MX, SPF, DKIM and DMARC records unchanged.**
6. **Cloudflare Access** (Zero Trust → Access → Applications → Self-hosted):
   - Domain: `speedagency.online`, with paths `/admin*` and `/api/admin*`.
   - Policy: allow your email only.
   - Copy the AUD tag into `ACCESS_AUD`.
   - Functions also verify the Access JWT. If those secrets are missing, admin returns 503.
7. **Cal.com:** create a 15-minute event in US time zones and set `BOOKING_URL` in `site.ts`. Then add a webhook (Settings → Developers → Webhooks):
   - URL: `https://speedagency.online/api/booking`
   - Trigger: *Booking created*
   - Secret: the value of `CAL_WEBHOOK_SECRET`
8. **Domain:** add `speedagency.online` and `www.speedagency.online` to the project. Then create a Redirect Rule (Rules → Redirect Rules) from `www.speedagency.online/*` to `https://speedagency.online/${1}`, status 301. Turn on "Always Use HTTPS".
9. **Monitoring:** in UptimeRobot (free), add keyword monitors on `https://speedagency.online/` and `https://speedagency.online/api/health` (keyword `"ok":true`).
10. **Search:** submit `https://speedagency.online/sitemap-index.xml` in Google Search Console and Bing Webmaster Tools. Validate the structured data with the Rich Results Test.

Trailing slashes: URLs have none. `/websites/` and `/websites.html` both 308 to `/websites`.

### Redirects

`public/_redirects` maps likely old URLs (services, case studies, newsletter, lead-gen, etc.) to the nearest new page with 301s. **Check this list against the old site's real URLs before launch.** Old `#anchor` links can't be redirected server-side; they land on the homepage, which is the nearest page anyway.

## Editing content (no developer needed)

### Change prices or business facts
Edit `src/config/site.ts`, then commit. The empty strings are the placeholders.

### Add an Insights post
Create `src/content/insights/my-post-slug.md`:

```markdown
---
title: How to get more Google reviews without being pushy
seoTitle: How to Get More Google Reviews Without Being Pushy   # 50–60 characters
description: 140–160 characters describing the post for search results and link previews, in plain English.
published: 2027-01-15
industry: plumbers            # plumbers | electricians | hvac | roofers | painters
---

Article body in Markdown. It must link to [websites for plumbers](/websites/plumbers)
and to [a website built for trade businesses](/websites), with descriptive link text.
```

Set `draft: true` to hide a post. `npm run lint` checks the links and the 800–1,500 word length.

### Add a concept project
1. Put screenshots in `src/assets/concepts/`: a desktop one (around 1600×1000) and a mobile one (around 750×1540), PNG or JPG. They're converted to WebP or AVIF automatically.
2. Create `src/content/work/<slug>.md`, using `plumber-concept.md` as the template.
3. Delete the `placeholderKey` line once the screenshots are real.

A real client project uses `kind: client`, `verified: true` and a `permission_note` that records the client's written permission. The build refuses `kind: client` without both.

### Add a testimonial
See `src/content/testimonials/README.md`. Nothing renders until an entry is verified, with a name, business, town and permission note.

### Add an industry page
Copy a file in `src/content/industries/`, change it, and add the trade to `src/lib/nav.ts` and the footer.

## Admin

- **`/admin`:** all enquiries and bookings. Change a lead's status (new → contacted → quoted → won / lost / spam), add notes, filter, and export CSV.
- **`/admin/stats`:** for 7, 30 or 90 days, shows CTA clicks by button, form starts vs submits, enquiries by need and by `utm_campaign`, bookings and the status funnel. Visits are in Cloudflare Web Analytics (linked from the page).

## Analytics events

Events are sent to `/api/event` with `navigator.sendBeacon`. There are no cookies. The session ID is random per page load and kept in memory only.

| Event | Where it fires |
| --- | --- |
| `cta_click` | Any element with `data-cta="…"` (label = the ID) |
| `call_click` | `tel:` / `sms:` links |
| `email_click` | `mailto:` links |
| `form_start` | First input in a form |
| `pricing_view` | `/pricing` |
| `demo_view` | `/work/[slug]` |
| `form_submit` | Recorded **server-side** when an enquiry is stored (label `form_type:need`) |
| `form_error` | Recorded **server-side** when validation or the spam check fails (label = first field) |
| `booking_made` | Recorded **server-side** from the Cal.com webhook |

UTM parameters are captured on landing into `sessionStorage` and attached to the enquiry.

## Backups and restore

`.github/workflows/speed-agency-maintenance.yml` runs weekly. It exports D1, encrypts the dump with `BACKUP_PASSPHRASE` (GPG AES-256), stores it as a 90-day artifact, then deletes `lost`/`spam` enquiries older than `RETENTION_MONTHS` and events older than 13 months.

It needs these repository settings:

- **Secrets:** `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `BACKUP_PASSPHRASE`
- **Variable:** `RETENTION_MONTHS`

**Restore from an artifact:**

```bash
gpg --decrypt backup-2027-01-04.sql.gpg > restore.sql
npx wrangler d1 create speed-agency-restore            # restore into a fresh DB first and check it
npx wrangler d1 execute speed-agency-restore --remote --file restore.sql
# then point the Pages D1 binding at the restored DB, or re-import into production
```

D1 Time Travel also covers the last 30 days: `npx wrangler d1 time-travel restore speed-agency --timestamp <ISO time>`.

## CI

`.github/workflows/speed-agency-ci.yml` runs on pull requests that touch `speed-agency/`:

- `npm audit` (high severity)
- typecheck, lint and build (with the postbuild checks)
- link check
- Lighthouse CI against the mobile budgets in `lighthouserc.json`

Make the check required in branch protection so failing PRs can't merge. Dependabot is configured in `.github/dependabot.yml`.
