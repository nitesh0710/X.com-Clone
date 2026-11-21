// Runs after `astro build`. Fails the build on any hard error.
//  1. Builds the CSP (with sha256 hashes for every inline script) into dist/_headers
//  2. SEO: unique <title> 50–60 chars and meta description 140–160 chars, one <h1>, canonical
//  3. Placeholders: lists every unfilled {{PLACEHOLDER}}; FAILS in strict mode
//     (Cloudflare Pages `main` branch or STRICT_PLACEHOLDERS=1)
//  4. Fabricated-proof grep (stars, ratings, testimonials markup, "clients served", % claims)
//  5. No secrets in the client bundle
//  6. Home page budgets: JS ≤ 30 KB gzipped, total weight ≤ 500 KB
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';

const DIST = 'dist';
const strict = process.env.CF_PAGES_BRANCH === 'main' || process.env.STRICT_PLACEHOLDERS === '1';
const errors = [];
const warnings = [];

const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
const files = walk(DIST);
const html = files.filter((f) => f.endsWith('.html'));
const route = (f) => '/' + relative(DIST, f).replace(/\\/g, '/').replace(/(index)?\.html$/, '').replace(/\/$/, '');

// ── 1. CSP with inline-script hashes ─────────────────────────────────────────
const hashes = new Set();
for (const f of html) {
  const s = readFileSync(f, 'utf8');
  for (const m of s.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/type=["']?application\/ld\+json/.test(m[1])) continue;
    if (!m[2].trim()) continue;
    hashes.add(`'sha256-${createHash('sha256').update(m[2]).digest('base64')}'`);
  }
}
const csp = [
  "default-src 'self'",
  `script-src 'self' ${[...hashes].join(' ')} https://challenges.cloudflare.com https://static.cloudflareinsights.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self' https://cloudflareinsights.com",
  'frame-src https://challenges.cloudflare.com https://cal.com https://app.cal.com',
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');
const headersPath = join(DIST, '_headers');
writeFileSync(headersPath, readFileSync(headersPath, 'utf8').replace('__CSP__', csp));
console.log(`✓ CSP written with ${hashes.size} inline script hash(es)`);

// ── 2. SEO ────────────────────────────────────────────────────────────────────
const decode = (s) =>
  s.replace(/&amp;/g, '&').replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const titles = new Map();
const descs = new Map();
for (const f of html) {
  const r = route(f);
  const s = readFileSync(f, 'utf8');
  const noindex = /<meta name="robots" content="noindex/.test(s);
  const title = decode(s.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '');
  const desc = decode(s.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '');
  if (r.startsWith('/dev') || r.startsWith('/admin')) continue;
  const h1s = (s.match(/<h1[\s>]/g) ?? []).length;
  if (h1s !== 1) errors.push(`${r}: expected exactly one <h1>, found ${h1s}`);
  if (!/<link rel="canonical" href="https:\/\/speedagency\.online/.test(s)) errors.push(`${r}: missing canonical`);
  if (noindex) continue;
  if (title.length < 50 || title.length > 60) errors.push(`${r}: <title> is ${title.length} chars (needs 50–60): "${title}"`);
  if (desc.length < 140 || desc.length > 160) errors.push(`${r}: meta description is ${desc.length} chars (needs 140–160)`);
  if (titles.has(title)) errors.push(`${r}: duplicate <title> with ${titles.get(title)}`);
  if (descs.has(desc)) errors.push(`${r}: duplicate description with ${descs.get(desc)}`);
  titles.set(title, r);
  descs.set(desc, r);
}

// ── 3. Placeholders ───────────────────────────────────────────────────────────
const ph = new Map();
for (const f of html) {
  const r = route(f);
  if (r.startsWith('/dev')) continue;
  for (const m of readFileSync(f, 'utf8').matchAll(/\{\{([A-Z0-9_]+)\}\}/g)) {
    if (!ph.has(m[1])) ph.set(m[1], new Set());
    ph.get(m[1]).add(r);
  }
}
if (ph.size) {
  const list = [...ph.entries()].map(([k, pages]) => `  {{${k}}}  (${pages.size} page${pages.size > 1 ? 's' : ''})`).join('\n');
  const msg = `${ph.size} unfilled placeholder(s):\n${list}`;
  if (strict) errors.push(`Production build blocked. ${msg}`);
  else warnings.push(msg);
}

// ── 4. Fabricated proof ───────────────────────────────────────────────────────
const proof = [
  [/AggregateRating|"Review"|reviewRating/, 'review/rating structured data'],
  [/[★⭐]/, 'star characters'],
  [/clients served|\d+\+ (clients|customers|businesses)/i, 'customer-count claim'],
  [/\b\d+(\.\d+)?x (more|reply|faster|leads|calls)/i, '"Nx" performance claim'],
  [/\b\d{1,3}% (more|increase|higher|of (our )?clients|reply|conversion)/i, 'percentage claim'],
  [/0 spam complaints|100% consented|reply rate/i, 'claim from the old site'],
];
for (const f of html) {
  const r = route(f);
  const s = readFileSync(f, 'utf8').replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, (m) => (/AggregateRating|"Review"/.test(m) ? m : ''));
  const text = s.replace(/<[^>]+>/g, ' ');
  for (const [re, what] of proof) if (re.test(what === 'review/rating structured data' ? s : text)) errors.push(`${r}: possible fabricated proof (${what})`);
}

// ── 5. Secrets in client bundle ───────────────────────────────────────────────
const secretNames = /RESEND_API_KEY|TURNSTILE_SECRET|IP_HASH_SALT|CAL_WEBHOOK_SECRET|CRM_WEBHOOK_URL|ALERT_WEBHOOK_URL|re_[A-Za-z0-9]{20,}/;
for (const f of files.filter((f) => /\.(js|html|css)$/.test(f))) {
  if (secretNames.test(readFileSync(f, 'utf8'))) errors.push(`${relative(DIST, f)}: references a server secret`);
}

// ── 6. Home page budgets ──────────────────────────────────────────────────────
{
  const s = readFileSync(join(DIST, 'index.html'), 'utf8');
  const local = (u) => join(DIST, u.split('?')[0]);
  const scriptSrcs = [...s.matchAll(/<script[^>]+src="(\/[^"]+)"/g)].map((m) => m[1]);
  // follow static imports one level deep (shared chunks)
  const jsFiles = new Set();
  const addJs = (p) => {
    if (jsFiles.has(p) || !existsSync(p)) return;
    jsFiles.add(p);
    for (const m of readFileSync(p, 'utf8').matchAll(/from\s*"\.\/([^"]+\.js)"|import\s*"\.\/([^"]+\.js)"/g)) addJs(join(DIST, '_astro', m[1] ?? m[2]));
  };
  scriptSrcs.forEach((u) => addJs(local(u)));
  const inline = [...s.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]).join('');
  const jsGz = [...jsFiles].reduce((n, p) => n + gzipSync(readFileSync(p)).length, 0) + gzipSync(inline).length;
  const css = [...s.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="(\/[^"]+)"/g)].map((m) => local(m[1]));
  const fonts = [...s.matchAll(/<link[^>]+rel="preload"[^>]+href="(\/[^"]+)"/g)].map((m) => local(m[1]));
  const imgs = [...s.matchAll(/<img[^>]+src="(\/[^"]+)"/g)].map((m) => local(m[1]));
  const weight =
    gzipSync(s).length +
    [...jsFiles].reduce((n, p) => n + gzipSync(readFileSync(p)).length, 0) +
    css.reduce((n, p) => n + gzipSync(readFileSync(p)).length, 0) +
    // all font files the page can use (worst case: every weight loads)
    readdirSync(join(DIST, 'fonts')).reduce((n, f) => n + statSync(join(DIST, 'fonts', f)).size, 0) +
    imgs.filter(existsSync).reduce((n, p) => n + gzipSync(readFileSync(p)).length, 0);
  console.log(`✓ Home: JS ${(jsGz / 1024).toFixed(1)} KB gz (budget 30), total ≈ ${(weight / 1024).toFixed(0)} KB (budget 500), ${fonts.length} preloaded font(s)`);
  if (jsGz > 30 * 1024) errors.push(`Home JS is ${(jsGz / 1024).toFixed(1)} KB gzipped (budget 30 KB)`);
  if (weight > 500 * 1024) errors.push(`Home weight is ${(weight / 1024).toFixed(0)} KB (budget 500 KB)`);
}

// ── Report ────────────────────────────────────────────────────────────────────
for (const w of warnings) console.warn(`⚠ ${w}`);
if (errors.length) {
  console.error(`\n✗ ${errors.length} postbuild check(s) failed:\n` + errors.map((e) => `  - ${e}`).join('\n'));
  process.exit(1);
}
console.log(`✓ Postbuild checks passed (${html.length} pages${strict ? ', strict mode' : ''})`);
