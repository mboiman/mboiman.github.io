/**
 * Post-build guard: checks what actually ships, not what a source file says.
 *
 * scripts/check-i18n.mjs reads src/lib/i18n.ts and config.cv.toml, which is where
 * most of the copy lives — but not all of it. The two legal pages are hand-written
 * .astro and passed through no check at all; they shipped nine em dashes, four of
 * them in <title>, on a site whose author does not write dashes. Widening the
 * source-side guard file by file would just repeat the mistake with the next file
 * someone adds.
 *
 * So this one runs after `astro build` and reads dist/. Every page, every source,
 * including ones that do not exist yet. It sees rendered text, so code comments
 * (which legitimately use dashes) are invisible to it.
 *
 * Usage: node scripts/check-output.mjs [distDir]
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
// One rule, two artifacts: scripts/html_to_pdf.js runs the same findDashes over
// the HTML it hands to Puppeteer, because the PDF is never an HTML page in dist/
// and no guard here would ever see it. Two regexes for one rule stay in sync
// exactly as long as nobody edits one of them.
import { findDashes } from './lib/visible-text.js';

const dist = process.argv[2] ?? 'dist';
const errors = [];

function htmlFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...htmlFiles(p));
    else if (entry.endsWith('.html')) out.push(p);
  }
  return out;
}

let pages = 0;
let images = 0;
for (const file of htmlFiles(dist)) {
  pages += 1;
  const html = readFileSync(file, 'utf8');

  // ── No em or en dash as punctuation, anywhere a reader can see it ─────────
  for (const { where, snippet } of findDashes(html)) {
    errors.push(`${file} (${where}): em or en dash in "${snippet}"`);
  }

  // ── An image is either content with an alt, or explicitly hidden ───────────
  // alt="" is an instruction to skip, valid ONLY for decoration, which must also
  // carry aria-hidden. The CV cards used to say alt="" on the very screenshots
  // they offer as evidence.
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    images += 1;
    const tag = m[0];
    const alt = tag.match(/\salt="([^"]*)"/);
    const hidden = /\saria-hidden="true"/.test(tag) || /\srole="presentation"/.test(tag);
    if (!alt) errors.push(`${file}: <img> without an alt attribute: ${tag.slice(0, 110)}`);
    else if (!alt[1].trim() && !hidden) {
      errors.push(`${file}: <img alt=""> without aria-hidden. Say what is on it, or mark it decorative: ${tag.slice(0, 110)}`);
    }
  }
}

if (!pages) {
  console.error(`output check failed: no HTML found under ${dist}/. Did the build run?`);
  process.exit(1);
}
if (errors.length) {
  console.error('output check failed:');
  for (const e of errors) console.error('  -', e);
  process.exit(1);
}
console.log(`output check ok: ${pages} pages, ${images} images, no dashes in visible text, every image accounted for`);
