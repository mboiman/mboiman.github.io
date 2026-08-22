/**
 * The reader-visible text of an HTML document, and the dash rule that applies
 * to it (em dash, en dash, and the spaced double hyphen that replaces them). Shared, not copied: scripts/check-output.mjs walks dist/ with it, and
 * scripts/html_to_pdf.js runs it over the HTML it is about to hand to
 * Puppeteer. Two artifacts, two callers, one rule.
 *
 * Why the PDF needs its own gate: config.cv.toml carries clean date ranges
 * ("01/2024-04/2025") and check-i18n.mjs proves it, but the PDF renderer used
 * to rewrite every one of them into "01/2024 – 04/2025" on the way out. Ten en
 * dashes per PDF, none of them in any source file, invisible to a guard that
 * only reads sources or only reads HTML pages.
 */

/** Strip scripts, styles, comments and tags. What is left is what a reader sees. */
function visibleText(html) {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ');
}

/** Title and meta description are read too, just not inside the page. */
function metaText(html) {
  const bits = [];
  const title = String(html).match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (title) bits.push(title[1]);
  for (const m of String(html).matchAll(/<meta[^>]+content="([^"]*)"[^>]*>/gi)) bits.push(m[1]);
  return bits.join('\n');
}

/**
 * Dashes used as punctuation, deduplicated per document because one title lands
 * in <title>, og:title and twitter:title and three identical lines about one
 * dash only make the report harder to read.
 *
 * Two forms, one rule: the em or en dash itself, and the spaced double hyphen
 * that is its ASCII stand-in. The second one was missing here, so
 * "Testautomatisierung -- der Weg" passed both the site and the PDF while the
 * rule this guard cites forbids it. A hyphen inside a word and a CLI flag stay
 * untouched, because both forms require whitespace or a real dash character.
 *
 * Returns [{ where, kind, snippet }]. Empty means clean.
 */
function findDashes(html, { includeMeta = true } = {}) {
  const seen = new Set();
  const hits = [];
  const sources = includeMeta
    ? [['text', visibleText(html)], ['meta', metaText(html)]]
    : [['text', visibleText(html)]];
  const forms = [
    ['em or en dash', /[^\n]{0,40}[—–][^\n]{0,40}/g],
    ['double hyphen', /[^\n]{0,40}\s--+\s[^\n]{0,40}/g],
  ];
  for (const [where, text] of sources) {
    for (const [kind, rx] of forms) {
      for (const m of text.matchAll(rx)) {
        const snippet = m[0].trim().replace(/\s+/g, ' ');
        const key = `${kind}:${snippet}`;
        if (seen.has(key)) continue;
        seen.add(key);
        hits.push({ where, kind, snippet });
      }
    }
  }
  return hits;
}

module.exports = { visibleText, metaText, findDashes };
