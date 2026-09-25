/**
 * One print design for both PDFs of an application: the cover letter
 * (scripts/application_to_pdf.js) and the CV (scripts/html_to_pdf.js).
 *
 * The two renderers used to carry a stylesheet each, and they had drifted into
 * two different documents: the letter set the name in teal Georgia with emoji
 * contact symbols, the CV in light blue IBM Plex with chips, cards and a green
 * availability pill. Stapled together they read as two authors. Everything a
 * reader sees twice (font, colours, header, contact line) now comes from here,
 * so the letter and the CV cannot disagree again.
 *
 * The register is a printed business document, not the website: black text,
 * one restrained accent for rules and headings, no tinted boxes, no pills, no
 * icons. Contacts print as readable addresses, because on paper a label such
 * as "BKS-Lab Homepage" cannot be clicked.
 */
const fs = require('fs');
const path = require('path');

const FONT_DIR = path.join(__dirname, '..', '..', 'public', 'fonts', 'ibm-plex-sans');
const FONT_FILES = [
  ['IBMPlexSans-Light.woff2', 300],
  ['IBMPlexSans-Regular.woff2', 400],
  ['IBMPlexSans-Medium.woff2', 500],
  ['IBMPlexSans-SemiBold.woff2', 600],
  ['IBMPlexSans-Bold.woff2', 700],
];

function fontDataUrl(file) {
  return `data:font/woff2;base64,${fs.readFileSync(path.join(FONT_DIR, file)).toString('base64')}`;
}

function fontFaceCss() {
  return FONT_FILES.map(([file, weight]) => `
    @font-face {
      font-family: "IBM Plex Sans";
      src: url("${fontDataUrl(file)}") format("woff2");
      font-weight: ${weight};
      font-style: normal;
    }`).join('');
}

/** Tokens and the shared header. Each renderer appends its own layout rules. */
const BASE_CSS = `
  :root {
    --font: "IBM Plex Sans", Helvetica, Arial, sans-serif;
    --ink: #1B1F24;
    --text: #2B3036;
    --muted: #5B636C;
    --rule: #C8CDD3;
    --rule-soft: #E3E6EA;
    --accent: #1F3A5F;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: var(--font);
    color: var(--text);
    background: #FFFFFF;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
    font-variant-numeric: tabular-nums;
  }

  a { color: inherit; text-decoration: none; }
  strong { font-weight: 600; color: var(--ink); }

  .doc-header {
    display: grid;
    grid-template-columns: 24mm 1fr;
    column-gap: 6mm;
    align-items: center;
    padding-bottom: 4mm;
    border-bottom: 0.8pt solid var(--accent);
  }

  .doc-photo {
    width: 24mm; height: 24mm;
    object-fit: cover;
    border-radius: 1.5mm;
    display: block;
  }

  .doc-name {
    font-size: 20pt;
    font-weight: 600;
    color: var(--ink);
    letter-spacing: -0.01em;
    line-height: 1.1;
  }

  .doc-tagline {
    font-size: 10pt;
    font-weight: 400;
    color: var(--accent);
    margin-top: 1.2mm;
  }

  .doc-meta {
    font-size: 8pt;
    color: var(--muted);
    margin-top: 1mm;
  }

  .doc-contacts {
    font-size: 8pt;
    color: var(--text);
    margin-top: 2mm;
    line-height: 1.55;
  }

  .doc-contacts a, .doc-contacts span { white-space: nowrap; }
  .doc-contacts .sep, .doc-meta .sep { color: var(--rule); padding: 0 1.6mm; }

  .section-title {
    font-size: 8.5pt;
    font-weight: 600;
    color: var(--accent);
    text-transform: uppercase;
    letter-spacing: 0.09em;
    padding-bottom: 1.2mm;
    border-bottom: 0.5pt solid var(--rule);
    margin: 6mm 0 3mm 0;
    break-after: avoid;
    page-break-after: avoid;
  }
`;

/**
 * The second print style, matching the minimal view of the website
 * (src/components/CVMinimal.astro): grey ink instead of the blue accent, the
 * name set large, section headings as plain words instead of spaced capitals,
 * and a greyscale round portrait. Only tokens and a few header rules change;
 * layout and page logic stay the same, so both styles break pages alike.
 */
const MINIMAL_CSS = `
  :root {
    --ink: #2F3133;
    --text: #45484C;
    --muted: #6A6E73;
    --rule: #D9DBDE;
    --rule-soft: #E8E9EB;
    --accent: #45484C;
  }
  .doc-header { border-bottom: 0.5pt solid var(--rule); grid-template-columns: 20mm 1fr; }
  .doc-photo { width: 20mm; height: 20mm; border-radius: 50%; filter: grayscale(100%); }
  .doc-name { font-size: 28pt; font-weight: 500; letter-spacing: -0.03em; line-height: 1; }
  .doc-tagline { font-size: 11.5pt; color: var(--ink); margin-top: 2mm; }
  .section-title {
    font-size: 14pt;
    font-weight: 500;
    text-transform: none;
    letter-spacing: -0.02em;
    color: var(--ink);
    border-bottom: none;
    padding-bottom: 0;
    margin: 6mm 0 2.5mm 0;
  }
`;

const STYLES = ['classic', 'minimal'];

/**
 * Which print style a document uses. An application names it in its JSON
 * (`"style": "minimal"`); the site PDFs get it from CV_PDF_STYLE, which
 * generate_cv.sh sets from `--style=minimal`. Anything unknown fails loudly,
 * because a typo would otherwise ship the other style without a word.
 */
function resolveStyle(explicit) {
  const style = explicit || process.env.CV_PDF_STYLE || 'classic';
  if (!STYLES.includes(style)) throw new Error(`Unknown PDF style "${style}", expected one of: ${STYLES.join(', ')}`);
  return style;
}

/** Fonts, tokens and header for one style. */
function themeCss(style) {
  return fontFaceCss() + BASE_CSS + (resolveStyle(style) === 'minimal' ? MINIMAL_CSS : '');
}

/**
 * The printable form of a contact entry. The TOML titles are written for the
 * website ("Persönliches GitHub", "michael-boiman"), where the link carries the
 * address; on paper the address itself has to be visible.
 */
function contactDisplay(item) {
  const url = item.url || '';
  if (url.startsWith('mailto:')) return url.slice('mailto:'.length);
  if (url.startsWith('tel:')) return item.title;
  if (/^https?:\/\//.test(url)) {
    return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
  }
  return item.title;
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Pictographs are for chat, not for a document someone files. */
function stripEmoji(text) {
  if (!text) return '';
  // ©, ® and ™ are Extended_Pictographic too, and belong in names such as
  // "ISTQB®". Only spaces after a pictograph go, never a line break.
  return String(text).replace(/(?![©®™])\p{Extended_Pictographic}\uFE0F?[ \t]*/gu, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

/**
 * Letter prose to HTML: escaped first, so "List<String>" stays text, then only
 * **bold** and line breaks. Deliberately none of the list or heading rewriting
 * of markdown-utils, which turned "1. Oktober 2026 ..." into a bullet.
 */
function prose(text) {
  return escapeHtml(stripEmoji(text))
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

/**
 * The header both documents open with. `meta` is an optional line under the
 * tagline (location, availability), rendered as plain text.
 */
function renderHeader(langConfig, photoDataUrl) {
  const ui = langConfig.ui || {};
  const contacts = (langConfig.contact && langConfig.contact.list) || [];
  const contactHtml = contacts.map((item) => {
    const label = escapeHtml(contactDisplay(item));
    return item.url ? `<a href="${escapeHtml(item.url)}">${label}</a>` : `<span>${label}</span>`;
  }).join('<span class="sep">|</span>');

  const metaParts = [ui.location, ui.availability].filter(Boolean).map(escapeHtml);
  const tagline = stripEmoji(langConfig.profile.tagline || ui.tagline || '');

  return `
    <header class="doc-header">
      ${photoDataUrl ? `<img class="doc-photo" src="${photoDataUrl}" alt="${escapeHtml(langConfig.profile.name)}">` : '<div></div>'}
      <div>
        <div class="doc-name">${escapeHtml(langConfig.profile.name)}</div>
        ${tagline ? `<div class="doc-tagline">${escapeHtml(tagline)}</div>` : ''}
        ${metaParts.length ? `<div class="doc-meta">${metaParts.join('<span class="sep">|</span>')}</div>` : ''}
        <div class="doc-contacts">${contactHtml}</div>
      </div>
    </header>`;
}

/** Footer for page.pdf(); it renders in its own context, so it embeds the font. */
function footerTemplate(text) {
  return `<style>@font-face{font-family:'IBM Plex Sans';src:url('${fontDataUrl('IBMPlexSans-Regular.woff2')}') format('woff2');font-weight:400;}</style>` +
    `<div style="font-size:7pt;color:#8A9199;width:100%;padding:0 16mm;display:flex;justify-content:space-between;font-family:'IBM Plex Sans',Helvetica,Arial,sans-serif;">` +
    `<span>${escapeHtml(text)}</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`;
}


/**
 * Per-application overrides from the cover letter JSON, applied to the letter
 * AND the CV so both carry the same identity. `contactInfo` was part of the
 * JSON contract of the job-application skill all along, but no renderer read
 * it: an application sent through an employer printed the private address and
 * "Freiberuflich · verfügbar" on top of a letter that said "angestellt".
 *
 *   contactInfo: { email, phone, linkedin, website }   replaces those entries
 *   header:      { tagline, location, availability }  replaces the header lines
 *
 * Returns a copy; the parsed TOML is never mutated.
 */
function applyApplicationOverrides(langConfig, data) {
  if (!data) return langConfig;
  const cfg = JSON.parse(JSON.stringify(langConfig));
  const ci = data.contactInfo || {};
  const list = (cfg.contact && cfg.contact.list) || [];
  const setEntry = (cls, url, title) => {
    const i = list.findIndex((e) => e.class === cls);
    const entry = { class: cls, url, title };
    if (i >= 0) list[i] = { ...list[i], ...entry }; else list.push(entry);
  };
  if (ci.email) setEntry('email', `mailto:${ci.email}`, ci.email);
  if (ci.phone) setEntry('phone', `tel:${ci.phone.replace(/[^+\d]/g, '')}`, ci.phone);
  if (ci.website) setEntry('website', ci.website, ci.website);
  if (ci.linkedin) setEntry('linkedin', ci.linkedin, ci.linkedin);
  if (cfg.contact) cfg.contact.list = list;

  const h = data.header || {};
  if (h.tagline) cfg.profile.tagline = h.tagline;
  if (h.location !== undefined) cfg.ui.location = h.location;
  if (h.availability !== undefined) cfg.ui.availability = h.availability;
  if (data.style) cfg.pdf_style = resolveStyle(data.style);
  return cfg;
}

module.exports = {
  prose,
  applyApplicationOverrides,
  fontFaceCss,
  BASE_CSS,
  themeCss,
  resolveStyle,
  renderHeader,
  contactDisplay,
  stripEmoji,
  escapeHtml,
  footerTemplate,
};
