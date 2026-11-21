// Checks every internal href/src in dist resolves to a built file or a known route.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';

const DIST = 'dist';
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const html = walk(DIST).filter((f) => f.endsWith('.html'));
const API = new Set(['/api/enquiry', '/api/event', '/api/booking', '/api/health', '/api/admin/leads', '/api/admin/stats']);
const redirects = readFileSync(join(DIST, '_redirects'), 'utf8')
  .split('\n')
  .filter((l) => l.trim() && !l.startsWith('#'))
  .map((l) => l.trim().split(/\s+/));

const exists = (p) => {
  if (API.has(p)) return true;
  if (p === '/' ) return existsSync(join(DIST, 'index.html'));
  const clean = p.replace(/\/$/, '');
  return [clean, `${clean}.html`, `${clean}/index.html`].some((c) => existsSync(join(DIST, c)) && statSync(join(DIST, c)).isFile());
};

let bad = 0;
let count = 0;
for (const f of html) {
  const page = '/' + relative(DIST, f).replace(/\.html$/, '');
  const s = readFileSync(f, 'utf8');
  for (const m of s.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    let u = m[1];
    if (/^(https?:|mailto:|tel:|sms:|data:|#|javascript:)/.test(u)) continue;
    if (!u.startsWith('/')) u = '/' + join(dirname(relative(DIST, f)), u);
    u = u.split('#')[0].split('?')[0];
    if (!u) continue;
    count++;
    if (!exists(u)) {
      bad++;
      console.error(`✗ ${page}: broken link ${m[1]}`);
    }
  }
}
for (const [from, to] of redirects) {
  if (!exists(to)) {
    bad++;
    console.error(`✗ _redirects: ${from} → ${to} does not exist`);
  }
}
if (bad) {
  console.error(`\n${bad} broken link(s)`);
  process.exit(1);
}
console.log(`✓ ${count} internal links OK across ${html.length} pages; ${redirects.length} redirects OK`);
