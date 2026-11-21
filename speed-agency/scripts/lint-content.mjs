// Content rules from the spec:
//  - banned brand-voice words anywhere in public pages/content
//  - each Insights post links to /websites and to its industry page with descriptive anchor text
//  - industry pages are 500–800 words
//  - no "click here" anchors
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const errors = [];
const BANNED = /\b(unlock|elevate|supercharge|revolutioni[sz]e|cutting-edge|synergy|leverage|seamless(ly)?)\b|digital landscape/i;
const publicFiles = walk('src').filter((f) => /\.(astro|md|ts)$/.test(f) && !f.includes('/admin') && !f.includes('/dev/') && !f.endsWith('schema.ts'));
for (const f of publicFiles) {
  readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
    if (BANNED.test(line)) errors.push(`${f}:${i + 1}: banned word "${line.match(BANNED)[0]}"`);
    if (/>\s*click here\s*</i.test(line) || /\[click here\]/i.test(line)) errors.push(`${f}:${i + 1}: "click here" anchor`);
  });
}

const fm = (s) => Object.fromEntries([...s.split(/^---$/m)[1].matchAll(/^(\w+):\s*"?(.*?)"?$/gm)].map((m) => [m[1], m[2]]));
const body = (s) => s.split(/^---$/m).slice(2).join('---');
for (const f of walk('src/content/insights').filter((f) => f.endsWith('.md'))) {
  const s = readFileSync(f, 'utf8');
  const { industry } = fm(s);
  if (!/\]\(\/websites\)/.test(s)) errors.push(`${f}: must link to /websites`);
  if (!new RegExp(`\\]\\(/websites/${industry}\\)`).test(s)) errors.push(`${f}: must link to /websites/${industry}`);
  const words = body(s).split(/\s+/).filter(Boolean).length;
  if (words < 800 || words > 1500) errors.push(`${f}: ${words} words (spec: 800–1,500)`);
}
for (const f of walk('src/content/industries').filter((f) => f.endsWith('.md'))) {
  const s = readFileSync(f, 'utf8');
  const faqWords = [...s.matchAll(/^\s+(?:- )?[qa]: (.*)$/gm)].map((m) => m[1]).join(' ').split(/\s+/).length;
  const { lede = '' } = fm(s);
  const words = body(s).split(/\s+/).filter(Boolean).length + faqWords + lede.split(/\s+/).length;
  if (words < 500 || words > 800 + 250) errors.push(`${f}: ${words} words (spec: 500–800 page copy)`);
}
if (errors.length) {
  console.error(errors.map((e) => `✗ ${e}`).join('\n'));
  process.exit(1);
}
console.log('✓ Content lint passed');
