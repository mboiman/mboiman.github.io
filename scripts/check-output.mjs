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
import { findDashes, visibleText, metaText } from './lib/visible-text.js';

/**
 * Entities back to characters before anything counts them.
 *
 * This matters in ONE direction and it is the dangerous one: a `&#x10D;` reads
 * as seven ASCII characters in the raw file, all of them inside the range, so a
 * counter that skips this step would wave through exactly the character the
 * range does not cover.
 */
const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0' };
const decodeEntities = (text) =>
  String(text).replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (whole, body) => {
    if (body[0] === '#') {
      const cp = body[1] === 'x' || body[1] === 'X'
        ? parseInt(body.slice(2), 16)
        : parseInt(body.slice(1), 10);
      return Number.isFinite(cp) && cp > 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : whole;
    }
    return NAMED[body.toLowerCase()] ?? whole;
  });

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
    // Two spellings of the same thing. Astro's <Image alt=""> serialises the
    // empty string as a BARE `alt`, which HTML parses as alt="" and every
    // screen reader treats as the explicit skip instruction it is. The first
    // version of this check only knew the quoted form and failed a decorative
    // image that was marked correctly, which is a check measuring the
    // serialisation instead of the meaning. Absent still fails, and empty still
    // needs aria-hidden or role=presentation: neither of those got looser.
    const quoted = tag.match(/\salt="([^"]*)"/);
    const bare = /\salt(?=[\s/>])/.test(tag);
    const altValue = quoted ? quoted[1] : (bare ? '' : null);
    const hidden = /\saria-hidden="true"/.test(tag) || /\srole="presentation"/.test(tag);
    if (altValue === null) errors.push(`${file}: <img> without an alt attribute: ${tag.slice(0, 110)}`);
    else if (!altValue.trim() && !hidden) {
      errors.push(`${file}: <img alt=""> without aria-hidden. Say what is on it, or mark it decorative: ${tag.slice(0, 110)}`);
    }
  }
}

/**
 * Every character the pages set has to be inside a face's unicode-range.
 *
 * The six faces are subset (scripts/subset-fonts.sh): 928 glyphs down to 405,
 * 383 kB down to 143 kB. That trade is only safe while the content stays inside
 * the range that was cut, and content is the half that moves. A German CV that
 * gains a Czech customer name, a Greek letter in a formula or a bullet from a
 * different block would not fail anything: the character simply renders from the
 * system stack, in a different face, and nobody notices for months.
 *
 * Checked against the DECLARED range rather than the font binary, which is the
 * weaker of the two and worth saying out loud. The declaration is generated from
 * the same list as the subset command and both name each other, so a drift
 * between them is a deliberate edit in two files, not an accident. What this
 * catches is the accident: new text outside the cut.
 */
{
  const cssFiles = [];
  const walkCss = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, entry.name);
      if (entry.isDirectory()) walkCss(p);
      else if (entry.name.endsWith('.css')) cssFiles.push(p);
    }
  };
  try { walkCss(dist); } catch { /* no dist, the caller already failed */ }

  const spans = [];
  for (const f of cssFiles) {
    for (const m of readFileSync(f, 'utf8').matchAll(/unicode-range:\s*([^;}]+)/g)) {
      for (const part of m[1].split(',')) {
        const token = part.trim();
        // THREE spellings, and the third is the one that bit. The build rewrites
        // `U+0000-00FF` into the wildcard form `U+??`, which is the same range
        // and perfectly legal CSS. A parser that only knew the explicit forms
        // read the shipped sheet as if Latin-1 were not covered and then flagged
        // "<", "\\" and "^" as unrenderable. Source and artifact disagreed, and
        // the artifact was right.
        const wild = token.match(/^U\+([0-9A-Fa-f]*)(\?+)$/);
        if (wild) {
          const lo = wild[1] + '0'.repeat(wild[2].length);
          const hi = wild[1] + 'F'.repeat(wild[2].length);
          spans.push([parseInt(lo, 16), parseInt(hi, 16)]);
          continue;
        }
        const r = token.match(/^U\+([0-9A-Fa-f]+)(?:-([0-9A-Fa-f]+))?$/);
        if (r) { spans.push([parseInt(r[1], 16), parseInt(r[2] ?? r[1], 16)]); continue; }
        errors.push(`unicode-range token "${token}" in ${f} is in a spelling this check does not know. Teach it rather than ignoring it: an unparsed token silently narrows what counts as covered.`);
      }
    }
  }

  if (!spans.length) {
    errors.push('no unicode-range in any built stylesheet. The faces are subset; without the declaration the browser downloads them for text they cannot render.');
  } else {
    const outside = new Map();
    for (const file of htmlFiles(dist)) {
      const html = readFileSync(file, 'utf8');
      // Same reach as the dash rule: visible text plus the strings inside the
      // inline scripts, because the i18n labels travel as JSON in there.
      const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]).join(' ');
      const text = decodeEntities(`${visibleText(html)} ${metaText(html)} ${scripts}`);
      for (const ch of text) {
        const cp = ch.codePointAt(0);
        if (cp <= 32) continue;
        if (!spans.some(([a, b]) => cp >= a && cp <= b)) {
          outside.set(ch, (outside.get(ch) ?? 0) + 1);
        }
      }
    }
    for (const [ch, n] of outside) {
      errors.push(
        `character "${ch}" (U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}) appears ${n}x ` +
        `but sits outside every declared unicode-range, so it renders from the system font. ` +
        `Either widen the range in src/styles/global.css AND scripts/subset-fonts.sh, or drop the character.`,
      );
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
