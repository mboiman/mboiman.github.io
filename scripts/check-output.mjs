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

  // ── No dash as punctuation, anywhere a reader can see it ──────────────────
  // Both forms, em or en dash and the spaced double hyphen, come out of the one
  // shared rule module and name themselves in `kind`.
  for (const { where, kind, snippet } of findDashes(html)) {
    errors.push(`${file} (${where}): ${kind} in "${snippet}"`);
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

// ── The root must offer both languages, not just redirect to one ───────────
// It used to carry a bare <meta http-equiv="refresh" content="0;url=/de/">, so
// every visitor landed on German, including one whose browser announces no
// German at all. GitHub Pages cannot read Accept-Language, so the decision has
// to happen in the page, and the page has to keep working without JavaScript.
//
// The link check reads the BODY only. Scanning the whole file was no check at
// all: <link rel="canonical" href=".../de/"> and the two hreflang alternates in
// the head satisfy an href="…/de/" search on their own, so a root page with no
// visible language navigator anywhere passed. What has to exist is an <a> a
// reader can click, with something written in it.
const rootFile = join(dist, 'index.html');
try {
  const root = readFileSync(rootFile, 'utf8');
  const bodyStart = root.search(/<body\b/i);
  const body = bodyStart === -1 ? '' : root.slice(bodyStart);
  if (!body) {
    errors.push(`${rootFile}: no <body>. The language choice has to be visible, not only in the head.`);
  }
  for (const target of ['/de/', '/en/']) {
    const link = body.match(new RegExp(`<a\\b[^>]*href="[^"]*${target}"[^>]*>([\\s\\S]*?)</a>`, 'i'));
    const label = link ? link[1].replace(/<[^>]+>/g, '').trim() : '';
    if (!link) {
      errors.push(`${rootFile}: no <a href="${target}"> in the body. The root has to offer both languages, not pick one for everyone.`);
    } else if (!label) {
      errors.push(`${rootFile}: the link to ${target} has no text, so there is nothing to click or read out.`);
    }
  }
  if (!/navigator\.languages?/.test(root)) {
    errors.push(`${rootFile}: no language detection. A fixed redirect sends every visitor to the same language.`);
  }
  // The inverse of the old rule. A <noscript> here used to be mandatory, and the
  // one that satisfied it was <meta http-equiv="refresh" content="0;url=/de/">:
  // every visitor without JavaScript was sent to German and never saw the
  // navigator, which is the exact defect the root page was rebuilt to remove.
  // The visible links ARE the fallback, so a noscript is optional; what it must
  // not do is decide the language.
  for (const m of root.matchAll(/<noscript[^>]*>([\s\S]*?)<\/noscript>/gi)) {
    const refresh = m[1].match(/<meta[^>]+http-equiv=["']?refresh["']?[^>]*>/i);
    if (refresh && /url=[^"'>]*\/(de|en)\//i.test(refresh[0])) {
      errors.push(`${rootFile}: <noscript> redirects to one language: ${refresh[0].trim()}. Without JavaScript the visible links are the fallback; a refresh here picks for everyone.`);
    }
  }
} catch (err) {
  if (err instanceof Error && err.code === 'ENOENT') {
    errors.push(`${rootFile}: missing. The root page is the entry point.`);
  } else {
    throw err;
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
