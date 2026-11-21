// Generates favicon.ico, apple-touch-icon.png, images/logo.png and og/default.png
// with the brand template. Run once locally (needs Playwright + Chromium): node scripts/make-brand-assets.mjs
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { readFileSync, writeFileSync } from 'node:fs';

const font = (f) => `data:font/woff2;base64,${readFileSync(`public/fonts/${f}`).toString('base64')}`;
const css = `
@font-face{font-family:B;src:url(${font('barlow-condensed-latin-700-normal.woff2')})}
@font-face{font-family:I;src:url(${font('inter-latin-500-normal.woff2')})}
@font-face{font-family:M;src:url(${font('jetbrains-mono-latin-500-normal.woff2')})}
*{margin:0;box-sizing:border-box}body{background:#F6F3EC;color:#16181B}`;

const og = `<html><head><style>${css}
.og{width:1200px;height:630px;padding:64px 72px;display:flex;flex-direction:column;justify-content:space-between;border:0}
.top{display:flex;justify-content:space-between;align-items:center;border-top:2px solid #16181B;padding-top:16px;font:500 22px M;letter-spacing:.06em;text-transform:uppercase;color:#4A4F57}
h1{font:700 128px/0.92 B;max-width:900px}
.bottom{display:flex;justify-content:space-between;align-items:center;font:500 28px I;color:#4A4F57}
.logo{display:flex;align-items:center;gap:16px;font:700 44px B;color:#16181B}.sq{width:22px;height:22px;background:#E8590C}
</style></head><body><div class="og"><div class="top"><span>Websites for trade businesses</span><span>01</span></div>
<h1>Websites that make the phone ring.</h1>
<div class="bottom"><span class="logo"><span class="sq"></span>Speed Agency</span><span>Built for trades · Live in about a week · Priced up front</span></div></div></body></html>`;

const logo = `<html><head><style>${css}.l{width:600px;height:600px;display:grid;place-items:center;background:#F6F3EC}
.w{display:flex;align-items:center;gap:20px;font:700 92px B}.sq{width:32px;height:32px;background:#E8590C}</style></head>
<body><div class="l"><div class="w"><span class="sq"></span>Speed<br>Agency</div></div></body></html>`;

const icon = (size) => `<html><head><style>${css}.i{width:${size}px;height:${size}px;background:#16181B;position:relative;display:grid;place-items:center}
.s{font:700 ${size * 0.78}px/1 B;color:#F6F3EC;margin-top:${size * 0.06}px}.sq{position:absolute;right:${size * 0.16}px;top:${size * 0.16}px;width:${size * 0.2}px;height:${size * 0.2}px;background:#E8590C}</style></head>
<body><div class="i"><span class="s">S</span><span class="sq"></span></div></body></html>`;

const browser = await chromium.launch();
const shot = async (html, w, h, path) => {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await page.setContent(html);
  await page.evaluate(() => document.fonts.ready);
  const buf = await page.screenshot({ type: 'png' });
  await page.close();
  if (path) writeFileSync(path, buf);
  return buf;
};
await shot(og, 1200, 630, 'public/og/default.png');
await shot(logo, 600, 600, 'public/images/logo.png');
await shot(icon(180), 180, 180, 'public/apple-touch-icon.png');
const png32 = await shot(icon(32), 32, 32);
// Minimal ICO wrapper around a 32×32 PNG.
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
header.writeUInt8(32, 6);
header.writeUInt8(32, 7);
header.writeUInt8(0, 8);
header.writeUInt8(0, 9);
header.writeUInt16LE(1, 10);
header.writeUInt16LE(32, 12);
header.writeUInt32LE(png32.length, 14);
header.writeUInt32LE(22, 18);
writeFileSync('public/favicon.ico', Buffer.concat([header, png32]));
await browser.close();
console.log('brand assets written');
