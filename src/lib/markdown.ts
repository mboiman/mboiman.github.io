/**
 * Lightweight markdown-to-HTML converter for inline TOML strings.
 * Ported from scripts/lib/markdown-utils.js
 *
 * Two levels, deliberately separated:
 *
 *   formatMarkdown  bold, italic, links. Safe to drop inside an existing <p>.
 *   formatBlocks    paragraphs and REAL lists. Needs a block container.
 *
 * The split exists because the previous single function did both jobs and could
 * therefore do neither properly: it rewrote "- item" into the character "• item"
 * and glued the lines with <br>. The built CV page carried zero <ul> and zero
 * <li>, measured on the live page, while the presentation next door renders real
 * lists. For a document that is almost entirely lists, that is the difference
 * between a screen reader announcing "list, six items" and letting the reader
 * step through them, and one run-on paragraph with bullet characters in it.
 */

/** Bullet markers that occur in config.cv.toml: markdown dashes, and the middot
 *  the project taglines were authored with. Both mean "list item". */
const BULLET = /^\s*(?:[-*]|[•·])\s+(.*)$/;

function inline(text: string): string {
  return text
    // Bold: **text** → <strong>text</strong>
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic: *text* → <em>text</em>
    .replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
    // Links: [text](url) → <a>
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-accent underline hover:no-underline">$1</a>');
}

/**
 * Inline-only formatting. Use wherever the result lands inside an element that
 * may not contain block children (a <p>, a heading, a table cell). Newlines
 * become <br>, the only line break a <p> allows.
 */
export function formatMarkdown(text: string): string {
  if (!text) return '';
  return inline(text).replace(/\n/g, '<br>');
}

/**
 * Block-level formatting: <p> for prose, <ul>/<li> for runs of bullet lines.
 * Needs a block container (a <div>, a <section>). Never put the result inside a
 * <p>: a <ul> in a <p> is invalid and the browser silently unnests it.
 *
 * Grouped per line rather than per blank-line block, because the TOML writes a
 * heading and its bullets with no blank line between them:
 *
 *     **Schwerpunkte**
 *     - erstens
 *     - zweitens
 */
export function formatBlocks(text: string): string {
  if (!text) return '';
  const out: string[] = [];
  let para: string[] = [];
  let items: string[] = [];

  const flushPara = () => {
    if (para.length) out.push(`<p>${inline(para.join('\n')).replace(/\n/g, '<br>')}</p>`);
    para = [];
  };
  const flushList = () => {
    if (items.length) out.push(`<ul>${items.map((i) => `<li>${inline(i)}</li>`).join('')}</ul>`);
    items = [];
  };

  for (const raw of text.trim().split('\n')) {
    const line = raw.trimEnd();
    const bullet = line.match(BULLET);
    if (bullet) {
      flushPara();
      items.push(bullet[1].trim());
    } else if (!line.trim()) {
      flushList();
      flushPara();
    } else {
      flushList();
      para.push(line);
    }
  }
  flushList();
  flushPara();
  return out.join('');
}

/** Back-compatible name. Same contract as formatBlocks: block container only. */
export function formatToHTML(text: string): string {
  return formatBlocks(text);
}
