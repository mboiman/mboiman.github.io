/**
 * Lightweight markdown-to-HTML converter for inline TOML strings.
 * Ported from scripts/lib/markdown-utils.js
 */
export function formatMarkdown(text: string): string {
  if (!text) return '';

  return text
    // Bold: **text** → <strong>text</strong>
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic: *text* → <em>text</em>
    .replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
    // Unordered list items: - item → • item
    .replace(/^- (.+)$/gm, '• $1')
    // Links: [text](url) → <a>
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-accent underline hover:no-underline">$1</a>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
}

export function formatToHTML(text: string): string {
  if (!text) return '';
  const formatted = formatMarkdown(text.trim());
  return `<p>${formatted}</p>`;
}
