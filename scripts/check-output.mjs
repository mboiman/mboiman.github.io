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

/*
 * A title or description that gets cut off in the result list.
 *
 * Google truncates on PIXEL width, not on characters, and the two disagree:
 * "WWWW" and "iiii" are the same four characters and nowhere near the same
 * width. Measured on 2026-09-04, the German title ran 749 px against a budget
 * of roughly 580, and what fell off the end was "· Frankfurt am Main", the one
 * part a regional search needs to read. The descriptions ran 1144 px and, on
 * the story pages, 1366 px against roughly 920.
 *
 * So this measures width, not length. The table below is Arial\'s advance width
 * per character at font-size 1, read out of a real canvas once; the sum ignores
 * kerning, which cost 0.23 percent on the longest string on this site. The
 * budgets carry that error plus a margin.
 *
 * Arial because that is what the result list is set in. A character the table
 * does not know falls back to a middling width, and too many unknowns fail the
 * check rather than passing it: a measurement that cannot see its own subject
 * must not report all-clear.
 */
const ARIAL = {
  ' ':0.2778, '!':0.2778, '"':0.355, '#':0.5562, '$':0.5562, '%':0.8892, '&':0.667, '\'':0.1909,
  '(':0.333, ')':0.333, '*':0.3892, '+':0.584, ',':0.2778, '-':0.333, '.':0.2778, '/':0.2778,
  '0':0.5562, '1':0.5562, '2':0.5562, '3':0.5562, '4':0.5562, '5':0.5562, '6':0.5562, '7':0.5562,
  '8':0.5562, '9':0.5562, ':':0.2778, ';':0.2778, '<':0.584, '=':0.584, '>':0.584, '?':0.5562,
  '@':1.0151, 'A':0.667, 'B':0.667, 'C':0.7222, 'D':0.7222, 'E':0.667, 'F':0.6108, 'G':0.7778,
  'H':0.7222, 'I':0.2778, 'J':0.5, 'K':0.667, 'L':0.5562, 'M':0.833, 'N':0.7222, 'O':0.7778,
  'P':0.667, 'Q':0.7778, 'R':0.7222, 'S':0.667, 'T':0.6108, 'U':0.7222, 'V':0.667, 'W':0.9438,
  'X':0.667, 'Y':0.667, 'Z':0.6108, '[':0.2778, '\\':0.2778, ']':0.2778, '^':0.4692, '_':0.5562,
  '`':0.333, 'a':0.5562, 'b':0.5562, 'c':0.5, 'd':0.5562, 'e':0.5562, 'f':0.2778, 'g':0.5562,
  'h':0.5562, 'i':0.2222, 'j':0.2222, 'k':0.5, 'l':0.2222, 'm':0.833, 'n':0.5562, 'o':0.5562,
  'p':0.5562, 'q':0.5562, 'r':0.333, 's':0.5, 't':0.2778, 'u':0.5562, 'v':0.5, 'w':0.7222,
  'x':0.5, 'y':0.5, 'z':0.5, '{':0.334, '|':0.2598, '}':0.334, '~':0.584, '·':0.333,
  'Ä':0.667, 'Ö':0.7778, 'Ü':0.7222, 'ß':0.6108, 'ä':0.5562, 'ö':0.5562, 'ü':0.5562, '–':0.5562,
  '—':1, '’':0.2222, '“':0.333, '”':0.333, '„':0.333, '…':1, '€':0.5562,
};
const TITLE_BUDGET_PX = 580;   // ~600 px in the SERP, minus margin for kerning
const DESC_BUDGET_PX = 920;    // two lines of description at 14px
const UNKNOWN_TOLERANCE = 0.05;

function textWidth(text, size) {
  let width = 0;
  let unknown = 0;
  for (const ch of text) {
    const w = ARIAL[ch];
    if (w === undefined) { unknown += 1; width += 0.55 * size; } else { width += w * size; }
  }
  return { px: Math.round(width), unknownRatio: text.length ? unknown / text.length : 0 };
}

for (const file of htmlFiles(dist)) {
  const html = readFileSync(file, 'utf8');
  const title = decodeEntities((html.match(/<title>([^<]*)<\/title>/) ?? [])[1] ?? '');
  const desc = decodeEntities((html.match(/<meta name="description" content="([^"]*)"/) ?? [])[1] ?? '');
  if (!title) errors.push(`${file}: no <title>. Every page needs one, it is the headline of its search result.`);
  if (!desc) errors.push(`${file}: no meta description, so the result list quotes whatever it finds on the page.`);
  for (const [what, text, size, budget] of [
    ['title', title, 20, TITLE_BUDGET_PX],
    ['description', desc, 14, DESC_BUDGET_PX],
  ]) {
    if (!text) continue;
    const { px, unknownRatio } = textWidth(text, size);
    if (unknownRatio > UNKNOWN_TOLERANCE) {
      errors.push(`${file}: the ${what} uses characters the width table does not know (${Math.round(unknownRatio * 100)}%). Add them to ARIAL in scripts/check-output.mjs rather than trusting a guessed width.`);
    } else if (px > budget) {
      errors.push(`${file}: the ${what} measures ${px}px against a budget of ${budget}px, so the end is cut off in the result list. Shorten it, or move what matters to the front.`);
    }
  }
}

/*
 * An internal link that costs a redirect on every click.
 *
 * Astro emits the legal pages as directories, so their address ends in a slash,
 * and canonical, sitemap and hreflang all spell them that way. Seven links in
 * four files spelled them without one. Measured against the live site on
 * 2026-09-04: /de/impressum answers 301 to /de/impressum/, /de/impressum/
 * answers 200. Nobody sees a broken page, everybody pays a round trip, and the
 * two spellings of the same page sat in the markup for as long as the site has
 * had legal pages.
 *
 * The rule is narrow on purpose: a link into this site, no file extension, no
 * query, no fragment, must end in a slash. Anything pointing outward, at an
 * asset or at an anchor is none of this check's business.
 */
{
  const internalNoSlash = /href="(\/(?!\/)[^"#?]*)"/g;
  for (const file of htmlFiles(dist)) {
    const html = readFileSync(file, 'utf8');
    for (const m of html.matchAll(internalNoSlash)) {
      const href = m[1];
      if (href.endsWith('/')) continue;
      if (/\.[a-z0-9]{2,5}$/i.test(href)) continue;   // /pdfs/x.pdf, /favicon.ico
      errors.push(`${file}: internal link "${href}" has no trailing slash, so it costs a 301 on every click. Canonical and sitemap spell it "${href}/".`);
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
