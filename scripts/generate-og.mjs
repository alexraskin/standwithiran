/**
 * Regenerates public/images/og-image.jpg (1200x630) in the site's design:
 * cream ground, the stacked serif slogan, and the burgundy Farsi panel from
 * the home hero.
 *
 * It uses the fonts Astro self-hosts in the build, so build first. The card is
 * rendered by headless Chrome (real text shaping for the Persian) and
 * converted to JPEG with sharp.
 *
 * Run:  npm run build && CHROME=/path/to/chrome node scripts/generate-og.mjs
 *       (CHROME defaults to `chromium`; sharp ships with Astro.)
 */
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const OUT = path.join(ROOT, 'public', 'images', 'og-image.jpg');

const index = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');

/** The built woff2 for a font family, e.g. Newsreader -> _astro/fonts/abc.woff2. */
function fontUrl(family) {
  const m = index.match(new RegExp(`font-family:${family}-[0-9a-f]+;src:url\\("/(_astro/fonts/[^"]+)"`));
  if (!m) throw new Error(`No built font for ${family}; run npm run build first.`);
  return m[1];
}

// Colours mirror the :root tokens in src/styles/main.css.
const html = `<!doctype html>
<meta charset="utf-8">
<style>
  @font-face { font-family: Newsreader; src: url(${fontUrl('Newsreader')}); font-weight: 200 800; }
  @font-face { font-family: Inter; src: url(${fontUrl('Inter')}); font-weight: 100 900; }
  @font-face { font-family: Vazirmatn; src: url(${fontUrl('Vazirmatn')}); font-weight: 100 900; }
  * { box-sizing: border-box; margin: 0; }
  body { width: 1200px; height: 630px; overflow: hidden; background: #f6efe4; color: #1e1416; }
  .card { display: grid; grid-template-columns: 1fr 460px; gap: 56px; height: 100%; padding: 56px; }
  .text { display: flex; flex-direction: column; }
  .eyebrow { color: #851a2b; font: 600 20px/1 Inter; letter-spacing: 0.1em; text-transform: uppercase; }
  h1 { margin-top: 36px; font: 400 128px/0.92 Newsreader; letter-spacing: -0.03em; }
  h1 span { display: block; }
  .url { color: #5a4f4c; font: 500 22px/1 Inter; }
  .brand { margin-top: auto; margin-bottom: 12px; color: #851a2b; font: 600 30px/1 Newsreader; }
  .panel {
    display: flex; flex-direction: column; justify-content: center; align-items: flex-start;
    padding: 48px; border-radius: 12px; background: #851a2b; color: #f6efe4;
    font: 500 104px/1.3 Vazirmatn;
  }
</style>
<div class="card">
  <div class="text">
    <p class="eyebrow">Iran, 1979 to today</p>
    <h1><span>Woman.</span><span>Life.</span><span>Freedom.</span></h1>
    <p class="brand">Stand With Iran</p>
    <p class="url">standwithiran.org</p>
  </div>
  <div class="panel" dir="rtl" lang="fa"><span>زن</span><span>زندگی</span><span>آزادی</span></div>
</div>`;

// Written into dist/ so the relative font URLs resolve over file://.
const page = path.join(DIST, 'og-card.html');
const png = path.join(DIST, 'og-card.png');
fs.writeFileSync(page, html);
try {
  execFileSync(process.env.CHROME || 'chromium', [
    '--headless', '--no-sandbox', '--hide-scrollbars', '--force-device-scale-factor=1',
    '--window-size=1200,630', '--virtual-time-budget=3000', `--screenshot=${png}`, `file://${page}`,
  ], { stdio: 'ignore' });
  await sharp(png).flatten({ background: '#f6efe4' }).jpeg({ quality: 88, mozjpeg: true }).toFile(OUT);
  console.log(`Wrote ${path.relative(ROOT, OUT)}`);
} finally {
  fs.rmSync(page, { force: true });
  fs.rmSync(png, { force: true });
}
