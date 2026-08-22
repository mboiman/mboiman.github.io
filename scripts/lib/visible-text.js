/**
 * The reader-visible text of an HTML document, and the dash rule that applies
 * to it. Shared, not copied: scripts/check-output.mjs walks dist/ with it, and
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
 * Em and en dashes used as punctuation, deduplicated per document because one
 * title lands in <title>, og:title and twitter:title and three identical lines
 * about one dash only make the report harder to read.
 *
 * Returns [{ where, snippet }]. Empty means clean.
 */
function findDashes(html, { includeMeta = true } = {}) {
  const seen = new Set();
  const hits = [];
  const sources = includeMeta
    ? [['text', visibleText(html)], ['meta', metaText(html)]]
    : [['text', visibleText(html)]];
  for (const [where, text] of sources) {
    for (const m of text.matchAll(/[^\n]{0,40}[—–][^\n]{0,40}/g)) {
      const snippet = m[0].trim().replace(/\s+/g, ' ');
      if (seen.has(snippet)) continue;
      seen.add(snippet);
      hits.push({ where, snippet });
    }
  }
  return hits;
}

module.exports = { visibleText, metaText, findDashes };
