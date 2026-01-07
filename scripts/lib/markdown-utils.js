/**
 * Shared markdown formatting utilities for PDF generation
 */

/**
 * Convert markdown-style formatting to HTML
 * @param {string} text - Text with markdown formatting
 * @returns {string} HTML formatted text
 */
function formatMarkdownToHTML(text) {
  if (!text) return '';

  let formatted = text;

  // Bold text: **text** -> <strong>text</strong>
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Convert bullet points and list items
  formatted = formatted.replace(/^[\*\-]\s+(.+)/gm, '• $1');

  // Convert numbered lists
  formatted = formatted.replace(/^\d+\.\s+(.+)/gm, '• $1');

  // Convert section headers (lines starting with **)
  formatted = formatted.replace(/^\*\*([^*]+)\*\*$/gm, '<strong>$1</strong>');

  // Convert lines that end with : to be bold (section headers)
  formatted = formatted.replace(/^([^•\n]+):$/gm, '<strong>$1:</strong>');

  // Handle emojis and preserve them
  // No changes needed - emojis should work as-is

  return formatted;
}

/**
 * Split text into paragraphs and format as HTML
 * @param {string} text - Text to format
 * @returns {string} HTML with paragraphs and lists
 */
function formatTextToParagraphs(text) {
  if (!text) return '';

  const formatted = formatMarkdownToHTML(text);

  // Split by double line breaks for paragraphs
  const paragraphs = formatted.split('\n\n').filter(p => p.trim());

  return paragraphs.map(p => {
    const trimmed = p.trim();
    if (!trimmed) return '';

    // Check if paragraph contains bullet points
    if (trimmed.includes('•')) {
      const lines = trimmed.split('\n');
      let html = '';
      let inList = false;

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('•')) {
          if (!inList) {
            html += '<ul>';
            inList = true;
          }
          html += `<li>${trimmedLine.substring(1).trim()}</li>`;
        } else {
          if (inList) {
            html += '</ul>';
            inList = false;
          }
          if (trimmedLine) {
            html += `<p>${trimmedLine}</p>`;
          }
        }
      }

      if (inList) {
        html += '</ul>';
      }

      return html;
    } else {
      // Regular paragraph
      return `<p>${trimmed}</p>`;
    }
  }).join('');
}

module.exports = {
  formatMarkdownToHTML,
  formatTextToParagraphs
};
