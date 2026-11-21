// Generates clearly-marked placeholder screenshots for the concept projects.
// Replace these with real screenshots from the owner ({{DEMO_1..3}}).
import { writeFileSync } from 'node:fs';

const demos = [
  { slug: 'plumber-concept', key: 'DEMO_1', name: 'Plumbing company', banner: '24/7 EMERGENCY · TAP TO CALL', h: 'Burst pipe? Leaking water heater?', sub: 'Licensed local plumbers. Same-day service.' },
  { slug: 'electrician-concept', key: 'DEMO_2', name: 'Electrical contractor', banner: 'FREE ESTIMATES · LICENSED & INSURED', h: 'Panel upgrades, EV chargers and repairs', sub: 'From a dead outlet to a full rewire.' },
  { slug: 'roofer-concept', key: 'DEMO_3', name: 'Roofing company', banner: 'STORM DAMAGE? FREE INSPECTION', h: 'Roof repair and replacement', sub: 'Photos of real jobs. Financing if you need it.' },
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function desktop(d) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">
<rect width="1600" height="1000" fill="#ffffff"/>
<rect width="1600" height="56" fill="#E8590C"/>
<text x="800" y="36" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#16181B" text-anchor="middle">${esc(d.banner)}</text>
<rect y="56" width="1600" height="96" fill="#16181B"/>
<text x="80" y="116" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#ffffff">${esc(d.name)}</text>
<rect x="1240" y="80" width="280" height="48" fill="#E8590C"/>
<text x="1380" y="112" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#16181B" text-anchor="middle">Call (555) 010-0000</text>
<text x="80" y="290" font-family="Arial, sans-serif" font-size="64" font-weight="700" fill="#16181B">${esc(d.h)}</text>
<text x="80" y="350" font-family="Arial, sans-serif" font-size="30" fill="#4A4F57">${esc(d.sub)}</text>
<rect x="80" y="400" width="300" height="64" fill="#16181B"/>
<text x="230" y="441" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#ffffff" text-anchor="middle">Get a free quote</text>
<rect x="1000" y="220" width="520" height="420" fill="#F6F3EC" stroke="#16181B" stroke-width="2"/>
<text x="1030" y="270" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="#16181B">Request a quote</text>
${[310, 380, 450, 520].map((y) => `<rect x="1030" y="${y}" width="460" height="48" fill="#ffffff" stroke="#9aa0a6"/>`).join('')}
<rect x="1030" y="590" width="460" height="34" fill="#16181B"/>
${[0, 1, 2].map((i) => `<rect x="${80 + i * 490}" y="700" width="460" height="220" fill="#ECE7DB"/><rect x="${110 + i * 490}" y="730" width="200" height="22" fill="#9aa0a6"/><rect x="${110 + i * 490}" y="770" width="380" height="14" fill="#c4c8cc"/><rect x="${110 + i * 490}" y="796" width="340" height="14" fill="#c4c8cc"/>`).join('')}
<rect x="400" y="430" width="800" height="150" fill="#fff3d6" stroke="#B4430A" stroke-width="4" stroke-dasharray="14 8"/>
<text x="800" y="495" font-family="Courier New, monospace" font-size="40" font-weight="700" fill="#16181B" text-anchor="middle">PLACEHOLDER SCREENSHOT</text>
<text x="800" y="545" font-family="Courier New, monospace" font-size="26" fill="#16181B" text-anchor="middle">Replace with the real {{${d.key}}} concept site</text>
</svg>`;
}

function mobile(d) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="750" height="1540" viewBox="0 0 750 1540">
<rect width="750" height="1540" fill="#ffffff"/>
<rect width="750" height="70" fill="#E8590C"/>
<text x="375" y="46" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="#16181B" text-anchor="middle">${esc(d.banner.split(' · ')[0])}</text>
<rect y="70" width="750" height="110" fill="#16181B"/>
<text x="40" y="140" font-family="Arial, sans-serif" font-size="38" font-weight="700" fill="#ffffff">${esc(d.name)}</text>
<foreignObject x="40" y="230" width="670" height="300"><div xmlns="http://www.w3.org/1999/xhtml" style="font:700 68px/1.05 Arial,sans-serif;color:#16181B">${esc(d.h)}</div></foreignObject>
<text x="40" y="580" font-family="Arial, sans-serif" font-size="30" fill="#4A4F57">${esc(d.sub.split('.')[0])}.</text>
<rect x="40" y="640" width="670" height="100" fill="#E8590C"/>
<text x="375" y="704" font-family="Arial, sans-serif" font-size="36" font-weight="700" fill="#16181B" text-anchor="middle">Tap to call</text>
<rect x="40" y="770" width="670" height="100" fill="#ffffff" stroke="#16181B" stroke-width="3"/>
<text x="375" y="834" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#16181B" text-anchor="middle">Get a free quote</text>
<rect x="40" y="920" width="670" height="300" fill="#ECE7DB"/>
<rect x="60" y="1000" width="630" height="150" fill="#fff3d6" stroke="#B4430A" stroke-width="4" stroke-dasharray="14 8"/>
<text x="375" y="1065" font-family="Courier New, monospace" font-size="34" font-weight="700" fill="#16181B" text-anchor="middle">PLACEHOLDER</text>
<text x="375" y="1110" font-family="Courier New, monospace" font-size="26" fill="#16181B" text-anchor="middle">{{${d.key}}} screenshot</text>
${[1270, 1310, 1350, 1390].map((y) => `<rect x="40" y="${y}" width="${y % 80 === 30 ? 600 : 520}" height="18" fill="#c4c8cc"/>`).join('')}
</svg>`;
}

for (const d of demos) {
  writeFileSync(`src/assets/concepts/${d.slug}-desktop.svg`, desktop(d));
  writeFileSync(`src/assets/concepts/${d.slug}-mobile.svg`, mobile(d));
}
console.log('placeholder screenshots written');
