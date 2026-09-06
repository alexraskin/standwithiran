/**
 * Regenerates the favicon set from a single source: the fist mark drawn below.
 *
 * The mark is a white clenched fist on the flag red (`--flag-red`, #9b2230),
 * built from a 32x32 grid so every edge lands on a whole or half pixel at
 * 16/32/64px. It carries exactly two pieces of internal detail (three knuckle
 * grooves and the thumb) so it degrades to a clean silhouette when a browser
 * renders it at 16px.
 *
 * Outputs (all in public/):
 *   favicon.svg          rounded tile, what modern browsers use in the tab
 *   favicon.ico          same tile at 16/32/48 for legacy consumers
 *   apple-touch-icon.png 180px, full-bleed square (iOS applies its own mask)
 *   icon-192/512.png     full-bleed square, referenced by site.webmanifest
 *
 * Run:  npm i --no-save sharp png-to-ico && node scripts/generate-icons.mjs
 */
import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');
const BG = '#9b2230';

/** @param {number} rx tile corner radius on the 32-unit grid; 0 for full-bleed. */
function mark(rx) {
  const W = 2.95;
  const GAP = 1.4;
  const tops = [8.0, 7.4, 7.6, 8.4];
  const fingers = tops
    .map(
      (t, i) =>
        `<rect x="${(8 + i * (W + GAP)).toFixed(2)}" y="${t}" width="${W}" height="${(15 - t).toFixed(2)}" rx="${W / 2}"/>`
    )
    .join('\n    ');
  const grooves = [0, 1, 2]
    .map(
      (i) =>
        `<rect x="${(8 + W + i * (W + GAP)).toFixed(2)}" y="4" width="${GAP}" height="7.4" rx="${GAP / 2}"/>`
    )
    .join('\n    ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" role="img" aria-label="Stand With Iran">
  <rect width="32" height="32"${rx ? ` rx="${rx}"` : ''} fill="${BG}"/>
  <g fill="#fff">
    ${fingers}
    <path d="M8 10.4H24V20.1A4.5 4.5 0 0 1 19.5 24.6H12.5A4.5 4.5 0 0 1 8 20.1Z"/>
  </g>
  <g fill="${BG}">
    ${grooves}
  </g>
  <path d="M7.2 17.7H15.6A2.3 2.3 0 0 0 17.9 15.4" fill="none" stroke="${BG}" stroke-width="1.55" stroke-linecap="round"/>
</svg>
`;
}

const rounded = mark(7.2);
const square = mark(0);

const png = (src, size) =>
  sharp(Buffer.from(src), { density: 3200 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

fs.writeFileSync(path.join(OUT, 'favicon.svg'), rounded);
fs.writeFileSync(path.join(OUT, 'favicon.ico'), await pngToIco(await Promise.all([16, 32, 48].map((s) => png(rounded, s)))));

for (const [file, size] of [
  ['apple-touch-icon.png', 180],
  ['icon-192.png', 192],
  ['icon-512.png', 512],
]) {
  fs.writeFileSync(path.join(OUT, file), await png(square, size));
}

console.log('icons written to public/');
