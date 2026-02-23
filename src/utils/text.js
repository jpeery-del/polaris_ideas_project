/**
 * Strip HTML tags to plain text (e.g. for citations, PDF export, previews).
 * Uses regex so it works in Node (no document).
 * @param {string} html
 * @returns {string}
 */
export function stripHtml(html) {
  if (typeof html !== 'string') return ''
  return html.replace(/<[^>]*>/g, '').trim()
}
