#!/usr/bin/env node
/**
 * The link preview of the project match: public/images/og-match-<lang>.png,
 * 1200 × 630, the net diagram of a stored example run beside the question.
 *
 * Michael wants to share /match/ on LinkedIn, and a preview shows og:image,
 * so the diagram has to be in that picture (2026-09-26). Rendered with the
 * site's own IBM Plex through a real browser, then committed: a CI runner on
 * Linux would lay the same text out with other metrics.
 *
 * Run again after measuring the examples:  npm run og:match
 * (CHROME_PATH=/path/to/chrome when puppeteer has no browser of its own)
 */
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import { AXES, scoreMatch, verdictOf, DEFAULT_WEIGHTS } from '../src/lib/match.ts';
import { DEMOS } from '../src/lib/match-demos.ts';
import { i18n } from '../src/lib/i18n.ts';

const root = new URL('..', import.meta.url);
const DEMO = DEMOS[0].id;
const font = (w) => new URL(`public/fonts/ibm-plex-sans/IBMPlexSans-${w}.woff2`, root).href;

function page(lang) {
  const t = i18n[lang].match;
  const run = JSON.parse(fs.readFileSync(new URL(`src/data/match/demo-${DEMO}.${lang}.json`, root), 'utf8'));
  const prof = JSON.parse(fs.readFileSync(new URL(`src/data/match/profile.${lang}.json`, root), 'utf8'));
  const s = scoreMatch(run.requirements, run.project.demand, prof.depth, DEFAULT_WEIGHTS);
  const R = 160; const cx = 288; const cy = 305;
  const at = (i, f) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / AXES.length;
    return [cx + R * f * Math.cos(a), cy + R * f * Math.sin(a)];
  };
  const poly = (vals) => vals.map((v, i) => at(i, Math.max(0, Math.min(1, v))).map(n => n.toFixed(1)).join(',')).join(' ');
  const rings = [1 / 3, 2 / 3, 1].map(f => `<polygon points="${poly(AXES.map(() => f))}" class="ring"/>`).join('');
  const spokes = AXES.map((_, i) => { const [x, y] = at(i, 1); return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" class="ring"/>`; }).join('');
  const labels = AXES.map((a, i) => {
    const [x, y] = at(i, 1.12);
    const anchor = Math.abs(x - cx) < 4 ? 'middle' : x > cx ? 'start' : 'end';
    return `<text x="${x}" y="${y + (y > cy + 4 ? 16 : y < cy - 4 ? -4 : 6)}" text-anchor="${anchor}">${a.label[lang]}</text>`;
  }).join('');
  const dots = AXES.map((a, i) => { const [x, y] = at(i, s.perAxis[a.key].cover); return `<circle cx="${x}" cy="${y}" r="5" class="dot"/>`; }).join('');
  const verdict = t.verdicts[verdictOf(s.total)];
  const example = DEMOS[0].title[lang];
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><style>
    @font-face { font-family: Plex; src: url(${font('Light')}); font-weight: 300; }
    @font-face { font-family: Plex; src: url(${font('Regular')}); font-weight: 400; }
    @font-face { font-family: Plex; src: url(${font('Medium')}); font-weight: 500; }
    * { margin: 0; box-sizing: border-box; }
    body { width: 1200px; height: 630px; overflow: hidden; font-family: Plex, sans-serif; color: #eef2f6;
      background: radial-gradient(ellipse 55% 70% at 78% 50%, rgba(96,165,250,0.16), transparent 70%), #0b1120; display: flex; }
    .left { width: 560px; padding: 64px 0 56px 72px; display: flex; flex-direction: column; }
    .kicker { font-size: 17px; font-weight: 500; letter-spacing: 0.16em; text-transform: uppercase; color: #60a5fa; }
    h1 { margin-top: 22px; font-size: 62px; font-weight: 300; letter-spacing: -0.035em; line-height: 1.02; }
    .lead { margin-top: 22px; max-width: 430px; font-size: 22px; line-height: 1.45; color: #bcc5cf; }
    .score { margin-top: auto; display: flex; align-items: center; gap: 22px; }
    .num { font-size: 64px; font-weight: 300; letter-spacing: -0.04em; line-height: 1; color: #fff; }
    .meta { display: grid; gap: 4px; }
    .verdict { font-size: 22px; font-weight: 500; }
    .ex { font-size: 16px; color: #93a0ad; }
    .who { margin-top: 26px; font-size: 18px; color: #93a0ad; }
    .who b { color: #eef2f6; font-weight: 500; }
    svg { width: 640px; height: 630px; }
    .ring { fill: none; stroke: rgba(188,197,207,0.18); stroke-width: 1.2; }
    .demand { fill: rgba(251,191,36,0.07); stroke: #fbbf24; stroke-width: 2.4; stroke-dasharray: 8 6; }
    .cover { fill: rgba(96,165,250,0.24); stroke: #60a5fa; stroke-width: 3; }
    .dot { fill: #60a5fa; }
    text { font-size: 17px; fill: #93a0ad; }
  </style></head><body>
    <div class="left">
      <p class="kicker">${t.kicker}</p>
      <h1>${t.title}</h1>
      <p class="lead">${t.seoDescription}</p>
      <div class="score"><span class="num">${s.total}</span><span class="meta"><span class="verdict">${verdict}</span><span class="ex">${example}</span></span></div>
      <p class="who"><b>Michael Boiman</b> · mboiman.github.io</p>
    </div>
    <svg viewBox="-20 0 640 630">${rings}${spokes}
      <polygon points="${poly(AXES.map(a => s.perAxis[a.key].demand))}" class="demand"/>
      <polygon points="${poly(AXES.map(a => s.perAxis[a.key].cover))}" class="cover"/>${dots}${labels}</svg>
  </body></html>`;
}

const browser = await puppeteer.launch({ headless: 'new', executablePath: process.env.CHROME_PATH || undefined });
for (const lang of ['de', 'en']) {
  const tab = await browser.newPage();
  await tab.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  const file = fileURLToPath(new URL(`.og-match-${lang}.html`, root));
  fs.writeFileSync(file, page(lang));
  await tab.goto(`file://${file}`, { waitUntil: 'networkidle0' });
  await tab.evaluate(() => document.fonts.ready);
  const out = new URL(`public/images/og-match-${lang}.png`, root);
  await tab.screenshot({ path: fileURLToPath(out), type: 'png' });
  fs.rmSync(file);
  console.log(`wrote public/images/og-match-${lang}.png`);
}
await browser.close();
