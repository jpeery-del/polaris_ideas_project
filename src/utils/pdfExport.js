/**
 * PDF export: formatting and export only. No AI rewriting.
 * Supports MLA, APA, and Chicago citation styles.
 */
import { jsPDF } from 'jspdf'
import {
  getSummaryChapters,
  getKeyArguments,
  getQuotations,
  getSummaryForExport,
} from '../data/books'
import { stripHtml } from './text'

export const CITATION_STYLES = [
  { id: 'mla', label: 'MLA' },
  { id: 'apa', label: 'APA' },
  { id: 'chicago', label: 'Chicago' },
]

export const BOOK_EXPORT_TYPES = [
  { id: 'full', label: 'Full book notes' },
  { id: 'notes', label: 'Notes only' },
  { id: 'summary', label: 'Summary only' },
  { id: 'keyArguments', label: 'Key arguments only' },
  { id: 'quotations', label: 'Quotations only' },
]

const MARGIN = 20
const PAGE_WIDTH_MM = 210
const PAGE_HEIGHT_MM = 297
const CONTENT_WIDTH = PAGE_WIDTH_MM - 2 * MARGIN
const LINE_HEIGHT = 5
const TITLE_FONT_SIZE = 16
const HEADING_FONT_SIZE = 12
const BODY_FONT_SIZE = 10
const FOOTER_FONT_SIZE = 9

/**
 * Format a book citation for a quotation (works-cited style).
 * @param {Object} book - { title, author, year, publisher, translator }
 * @param {string} style - 'mla' | 'apa' | 'chicago'
 */
export function formatBookCitation(book, style) {
  const author = (book?.author ?? '').trim()
  const title = (book?.title ?? '').trim()
  const year = (book?.year ?? '').toString().trim()
  const publisher = (book?.publisher ?? '').trim()
  const translator = (book?.translator ?? '').trim()

  if (style === 'mla') {
    const parts = []
    if (author) parts.push(`${author}. `)
    if (title) parts.push(`${title}.`)
    if (translator) parts.push(` Translated by ${translator},`)
    if (publisher) parts.push(` ${publisher},`)
    if (year) parts.push(` ${year}.`)
    return parts.join('').replace(/,\s*$/, '.') || title || 'Untitled'
  }

  if (style === 'apa') {
    const parts = []
    if (author) parts.push(`${author} `)
    if (year) parts.push(`(${year}). `)
    if (title) parts.push(`${title}.`)
    if (translator) parts.push(` (${translator}, Trans.).`)
    if (publisher) parts.push(` ${publisher}.`)
    return parts.join('').replace(/\s+/g, ' ').trim() || title || 'Untitled'
  }

  if (style === 'chicago') {
    const parts = []
    if (author) parts.push(`${author}. `)
    if (title) parts.push(`${title}.`)
    if (translator) parts.push(` Translated by ${translator}.`)
    if (publisher) parts.push(` ${publisher}, `)
    if (year) parts.push(`${year}.`)
    return parts.join('').replace(/\s+/g, ' ').trim() || title || 'Untitled'
  }

  return [author, title].filter(Boolean).join(', ') || title || 'Untitled'
}

/**
 * Format a single quotation line for export (quote + page + source).
 */
export function formatQuotationForExport(quotation, book, style) {
  const quote = stripHtml((quotation?.quoteText ?? '').trim())
  const page = (quotation?.pageNumber ?? '').trim()
  const context = stripHtml((quotation?.context ?? '').trim())
  const whyItMatters = stripHtml((quotation?.whyItMatters ?? '').trim())
  const title = (book?.title ?? '').trim()
  const author = (book?.author ?? '').trim()

  let citation = ''
  if (style === 'mla') {
    citation = page ? `(${author} ${page})` : (author ? `(${author})` : '')
  } else if (style === 'apa') {
    citation = (book?.year ?? '') ? `(${author}, ${book.year}, p. ${page})` : (author ? `(${author}, p. ${page})` : '')
  } else if (style === 'chicago') {
    citation = author && page ? `${author}, ${title}, ${page}.` : (author ? `${author}.` : '')
  } else {
    citation = page ? `(p. ${page})` : ''
    if (author || title) citation += ` — ${[author, title].filter(Boolean).join(', ')}`
  }

  const parts = []
  if (quote) parts.push(`"${quote}"`)
  if (citation) parts.push(citation)
  if (context) parts.push(` Context: ${context}`)
  if (whyItMatters) parts.push(` Why it matters: ${whyItMatters}`)
  return parts.join(' ')
}

/**
 * Add text with wrapping and pagination. Returns final y position.
 */
function addWrappedText(doc, text, x, y, maxWidth, lineHeight = LINE_HEIGHT, fontSize = BODY_FONT_SIZE) {
  if (!text || !String(text).trim()) return y
  doc.setFontSize(fontSize)
  const lines = doc.splitTextToSize(String(text).trim(), maxWidth)
  for (const line of lines) {
    if (y > PAGE_HEIGHT_MM - MARGIN - lineHeight) {
      doc.addPage()
      y = MARGIN
    }
    doc.text(line, x, y)
    y += lineHeight
  }
  return y
}

function addTitlePage(doc, title, subtitle = '') {
  doc.setFontSize(TITLE_FONT_SIZE)
  doc.setFont('helvetica', 'bold')
  const titleLines = doc.splitTextToSize(title || 'Untitled', CONTENT_WIDTH)
  let y = PAGE_HEIGHT_MM / 2 - (titleLines.length * LINE_HEIGHT) / 2 - (subtitle ? LINE_HEIGHT * 2 : 0)
  titleLines.forEach((line) => {
    doc.text(line, MARGIN, y)
    y += LINE_HEIGHT
  })
  if (subtitle) {
    y += LINE_HEIGHT
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(BODY_FONT_SIZE)
    const subLines = doc.splitTextToSize(subtitle, CONTENT_WIDTH)
    subLines.forEach((line) => {
      doc.text(line, MARGIN, y)
      y += LINE_HEIGHT
    })
  }
}

function addPageNumbers(doc) {
  const total = doc.getNumberOfPages()
  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    doc.setFontSize(FOOTER_FONT_SIZE)
    doc.setFont('helvetica', 'normal')
    const pageNum = i === 1 ? '' : String(i - 1) // Skip number on title page; body pages numbered 1, 2, 3...
    if (pageNum) {
      doc.text(pageNum, PAGE_WIDTH_MM / 2, PAGE_HEIGHT_MM - 10, { align: 'center' })
    }
  }
}

// --- Book PDF ---

function addBookFullNotes(doc, book, startY) {
  let y = startY
  const sections = (book.sections || []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  for (const section of sections) {
    const sectionTitle = section.title || 'Untitled section'
    doc.setFontSize(HEADING_FONT_SIZE)
    doc.setFont('helvetica', 'bold')
    const headingLines = doc.splitTextToSize(sectionTitle, CONTENT_WIDTH)
    for (const line of headingLines) {
      if (y > PAGE_HEIGHT_MM - MARGIN - LINE_HEIGHT * 2) {
        doc.addPage()
        y = MARGIN
      }
      doc.text(line, MARGIN, y)
      y += LINE_HEIGHT
    }
    y += 2
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(BODY_FONT_SIZE)
    const notes = (section.notes || []).sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
    for (const note of notes) {
      const typeLabel = (note.type || 'note').replace(/_/g, ' ')
      let content = stripHtml((note.content || '').trim())
      const subentries = (note.subentries || []).map((s) => stripHtml(s.content || '')).filter(Boolean)
      if (subentries.length) content += '\n' + subentries.map((s) => `  • ${s}`).join('\n')
      const block = `[${typeLabel}] ${content}`
      y = addWrappedText(doc, block, MARGIN, y, CONTENT_WIDTH) + 2
    }
    y += 4
  }
  // Summary chapters
  const summaryData = getSummaryForExport(book)
  if (summaryData.chapters?.length) {
    doc.setFontSize(HEADING_FONT_SIZE)
    doc.setFont('helvetica', 'bold')
    y = addWrappedText(doc, 'Summary', MARGIN, y, CONTENT_WIDTH, LINE_HEIGHT, HEADING_FONT_SIZE) + 4
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(BODY_FONT_SIZE)
    for (const ch of summaryData.chapters) {
      if (y > PAGE_HEIGHT_MM - MARGIN - LINE_HEIGHT * 3) {
        doc.addPage()
        y = MARGIN
      }
      y = addWrappedText(doc, ch.title, MARGIN, y, CONTENT_WIDTH) + 1
      if (ch.pageRange) y = addWrappedText(doc, `Pages: ${ch.pageRange}`, MARGIN, y, CONTENT_WIDTH) + 1
      if (ch.mainThesis) y = addWrappedText(doc, `Thesis: ${ch.mainThesis}`, MARGIN, y, CONTENT_WIDTH) + 1
      y = addWrappedText(doc, stripHtml(ch.summaryHtml), MARGIN, y, CONTENT_WIDTH) + 4
    }
  }
  // Key arguments
  const args = getKeyArguments(book)
  if (args.length) {
    doc.setFontSize(HEADING_FONT_SIZE)
    doc.setFont('helvetica', 'bold')
    y = addWrappedText(doc, 'Key Arguments', MARGIN, y, CONTENT_WIDTH, LINE_HEIGHT, HEADING_FONT_SIZE) + 4
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(BODY_FONT_SIZE)
    for (const arg of args) {
      if (y > PAGE_HEIGHT_MM - MARGIN - LINE_HEIGHT * 2) {
        doc.addPage()
        y = MARGIN
      }
      if (arg.title) y = addWrappedText(doc, arg.title, MARGIN, y, CONTENT_WIDTH) + 1
      if (arg.claim) y = addWrappedText(doc, `Claim: ${arg.claim}`, MARGIN, y, CONTENT_WIDTH) + 1
      if (arg.premises?.length) {
        for (const p of arg.premises) if (p) y = addWrappedText(doc, `• ${p}`, MARGIN, y, CONTENT_WIDTH) + 1
      }
      if (arg.conclusion) y = addWrappedText(doc, `Conclusion: ${arg.conclusion}`, MARGIN, y, CONTENT_WIDTH) + 1
      y += 3
    }
  }
  // Quotations
  const quotations = getQuotations(book)
  if (quotations.length) {
    doc.setFontSize(HEADING_FONT_SIZE)
    doc.setFont('helvetica', 'bold')
    y = addWrappedText(doc, 'Quotations', MARGIN, y, CONTENT_WIDTH, LINE_HEIGHT, HEADING_FONT_SIZE) + 4
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(BODY_FONT_SIZE)
    for (const q of quotations) {
      const line = formatQuotationForExport(q, book, 'plain')
      if (line) y = addWrappedText(doc, line, MARGIN, y, CONTENT_WIDTH) + 3
    }
  }
  return y
}

function addBookNotesOnly(doc, book, startY) {
  let y = startY
  const overviewText = (book?.tabContent?.overview ?? '').trim()
  if (overviewText) {
    doc.setFontSize(HEADING_FONT_SIZE)
    doc.setFont('helvetica', 'bold')
    y = addWrappedText(doc, 'Overview notes', MARGIN, y, CONTENT_WIDTH, LINE_HEIGHT, HEADING_FONT_SIZE) + 2
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(BODY_FONT_SIZE)
    y = addWrappedText(doc, overviewText, MARGIN, y, CONTENT_WIDTH) + 4
  }
  const sections = (book.sections || []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  for (const section of sections) {
    const sectionTitle = section.title || 'Untitled section'
    doc.setFontSize(HEADING_FONT_SIZE)
    doc.setFont('helvetica', 'bold')
    const headingLines = doc.splitTextToSize(sectionTitle, CONTENT_WIDTH)
    for (const line of headingLines) {
      if (y > PAGE_HEIGHT_MM - MARGIN - LINE_HEIGHT * 2) {
        doc.addPage()
        y = MARGIN
      }
      doc.text(line, MARGIN, y)
      y += LINE_HEIGHT
    }
    y += 2
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(BODY_FONT_SIZE)
    const notes = (section.notes || []).sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
    for (const note of notes) {
      const typeLabel = (note.type || 'note').replace(/_/g, ' ')
      let content = stripHtml((note.content || '').trim())
      const subentries = (note.subentries || []).map((s) => stripHtml(s.content || '')).filter(Boolean)
      if (subentries.length) content += '\n' + subentries.map((s) => `  • ${s}`).join('\n')
      const block = `[${typeLabel}] ${content}`
      y = addWrappedText(doc, block, MARGIN, y, CONTENT_WIDTH) + 2
    }
    y += 4
  }
  if (!overviewText && sections.length === 0) {
    y = addWrappedText(doc, 'No notes to export.', MARGIN, y, CONTENT_WIDTH) + 4
  }
  return y
}

function addBookSummaryOnly(doc, book, startY) {
  const data = getSummaryForExport(book)
  let y = startY
  if (!data.chapters?.length) {
    y = addWrappedText(doc, 'No summary chapters.', MARGIN, y, CONTENT_WIDTH) + 4
    return y
  }
  for (const ch of data.chapters) {
    if (y > PAGE_HEIGHT_MM - MARGIN - LINE_HEIGHT * 3) {
      doc.addPage()
      y = MARGIN
    }
    doc.setFontSize(HEADING_FONT_SIZE)
    doc.setFont('helvetica', 'bold')
    y = addWrappedText(doc, ch.title, MARGIN, y, CONTENT_WIDTH, LINE_HEIGHT, HEADING_FONT_SIZE) + 1
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(BODY_FONT_SIZE)
    if (ch.pageRange) y = addWrappedText(doc, `Pages: ${ch.pageRange}`, MARGIN, y, CONTENT_WIDTH) + 1
    if (ch.mainThesis) y = addWrappedText(doc, `Thesis: ${ch.mainThesis}`, MARGIN, y, CONTENT_WIDTH) + 1
    y = addWrappedText(doc, stripHtml(ch.summaryHtml), MARGIN, y, CONTENT_WIDTH) + 4
  }
  return y
}

function addBookKeyArgumentsOnly(doc, book, startY) {
  const args = getKeyArguments(book)
  let y = startY
  if (!args.length) {
    y = addWrappedText(doc, 'No key arguments.', MARGIN, y, CONTENT_WIDTH) + 4
    return y
  }
  for (const arg of args) {
    if (y > PAGE_HEIGHT_MM - MARGIN - LINE_HEIGHT * 2) {
      doc.addPage()
      y = MARGIN
    }
    if (arg.title) {
      doc.setFontSize(HEADING_FONT_SIZE)
      doc.setFont('helvetica', 'bold')
      y = addWrappedText(doc, arg.title, MARGIN, y, CONTENT_WIDTH, LINE_HEIGHT, HEADING_FONT_SIZE) + 2
    }
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(BODY_FONT_SIZE)
    if (arg.claim) y = addWrappedText(doc, `Claim: ${arg.claim}`, MARGIN, y, CONTENT_WIDTH) + 1
    if (arg.premises?.length) {
      for (const p of arg.premises) if (p) y = addWrappedText(doc, `• ${p}`, MARGIN, y, CONTENT_WIDTH) + 1
    }
    if (arg.conclusion) y = addWrappedText(doc, `Conclusion: ${arg.conclusion}`, MARGIN, y, CONTENT_WIDTH) + 1
    if (arg.assumptions) y = addWrappedText(doc, `Assumptions: ${arg.assumptions}`, MARGIN, y, CONTENT_WIDTH) + 1
    if (arg.strengths) y = addWrappedText(doc, `Strengths: ${arg.strengths}`, MARGIN, y, CONTENT_WIDTH) + 1
    if (arg.weaknesses) y = addWrappedText(doc, `Weaknesses: ${arg.weaknesses}`, MARGIN, y, CONTENT_WIDTH) + 1
    y += 4
  }
  return y
}

function addBookQuotationsOnly(doc, book, startY, citationStyle) {
  const quotations = getQuotations(book)
  let y = startY
  if (!quotations.length) {
    y = addWrappedText(doc, 'No quotations.', MARGIN, y, CONTENT_WIDTH) + 4
    return y
  }
  const fullCitation = formatBookCitation(book, citationStyle)
  doc.setFontSize(BODY_FONT_SIZE - 1)
  doc.setFont('helvetica', 'normal')
  y = addWrappedText(doc, `Works cited: ${fullCitation}`, MARGIN, y, CONTENT_WIDTH, LINE_HEIGHT, BODY_FONT_SIZE - 1) + 6
  for (const q of quotations) {
    if (y > PAGE_HEIGHT_MM - MARGIN - LINE_HEIGHT * 2) {
      doc.addPage()
      y = MARGIN
    }
    const line = formatQuotationForExport(q, book, citationStyle)
    if (line) y = addWrappedText(doc, line, MARGIN, y, CONTENT_WIDTH) + 3
  }
  return y
}

/**
 * Build and download book PDF.
 * @param {Object} book - Full book object
 * @param {Object} options - { contentType: 'full'|'summary'|'keyArguments'|'quotations', citationStyle: 'mla'|'apa'|'chicago' }
 */
export function buildBookPdf(book, options = {}) {
  const { contentType = 'full', citationStyle = 'mla' } = options
  const doc = new jsPDF({ margin: MARGIN })
  const title = book?.title || 'Untitled book'
  const subtitle = [book?.author, book?.year].filter(Boolean).join(' — ')

  addTitlePage(doc, title, subtitle)
  doc.addPage()
  let y = MARGIN

  if (contentType === 'full') {
    y = addBookFullNotes(doc, book, y)
  } else if (contentType === 'notes') {
    y = addBookNotesOnly(doc, book, y)
  } else if (contentType === 'summary') {
    y = addBookSummaryOnly(doc, book, y)
  } else if (contentType === 'keyArguments') {
    y = addBookKeyArgumentsOnly(doc, book, y)
  } else if (contentType === 'quotations') {
    y = addBookQuotationsOnly(doc, book, y, citationStyle)
  }

  addPageNumbers(doc)
  const filename = `${(title || 'book').replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').slice(0, 50)}.pdf`
  doc.save(filename)
}

// --- Essay PDF ---

function parseOutlineRaw(raw) {
  if (typeof raw !== 'string' || !raw.trim()) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/**
 * Build structured outline PDF for an essay (no AI rewriting).
 */
export function buildEssayOutlinePdf(essay, citationStyle = 'mla') {
  const doc = new jsPDF({ margin: MARGIN })
  const title = essay?.title || 'Essay Outline'
  const subtitle = [essay?.course, essay?.dueDate].filter(Boolean).join(' — ')

  addTitlePage(doc, title, subtitle ? `Outline · ${subtitle}` : 'Outline')
  doc.addPage()
  let y = MARGIN

  const outline = parseOutlineRaw(essay?.tabContent?.outline)
  if (!outline) {
    addWrappedText(doc, 'No outline data to export.', MARGIN, y, CONTENT_WIDTH)
    addPageNumbers(doc)
    doc.save(`${(title || 'outline').replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').slice(0, 40)}-outline.pdf`)
    return
  }

  doc.setFontSize(HEADING_FONT_SIZE)
  doc.setFont('helvetica', 'bold')
  y = addWrappedText(doc, 'Introduction', MARGIN, y, CONTENT_WIDTH, LINE_HEIGHT, HEADING_FONT_SIZE) + 2
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(BODY_FONT_SIZE)
  const intro = outline.introduction || {}
  if (intro.hook) y = addWrappedText(doc, `Hook: ${stripHtml(intro.hook)}`, MARGIN, y, CONTENT_WIDTH) + 1
  if (intro.context) y = addWrappedText(doc, `Context: ${stripHtml(intro.context)}`, MARGIN, y, CONTENT_WIDTH) + 1
  if (intro.thesis) y = addWrappedText(doc, `Thesis: ${stripHtml(intro.thesis)}`, MARGIN, y, CONTENT_WIDTH) + 2

  const body = outline.bodyParagraphs || []
  if (body.length) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(HEADING_FONT_SIZE)
    y = addWrappedText(doc, 'Body', MARGIN, y, CONTENT_WIDTH, LINE_HEIGHT, HEADING_FONT_SIZE) + 2
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(BODY_FONT_SIZE)
    body.forEach((p, i) => {
      if (y > PAGE_HEIGHT_MM - MARGIN - LINE_HEIGHT * 3) {
        doc.addPage()
        y = MARGIN
      }
      y = addWrappedText(doc, `Paragraph ${i + 1}`, MARGIN, y, CONTENT_WIDTH) + 1
      if (p.paragraphClaim) y = addWrappedText(doc, `Claim: ${stripHtml(p.paragraphClaim)}`, MARGIN, y, CONTENT_WIDTH) + 1
      if (p.evidence) y = addWrappedText(doc, `Evidence: ${p.evidence}`, MARGIN, y, CONTENT_WIDTH) + 1
      if (p.analysis) y = addWrappedText(doc, `Analysis: ${stripHtml(p.analysis)}`, MARGIN, y, CONTENT_WIDTH) + 1
      if (p.counterargument) y = addWrappedText(doc, `Counterargument: ${stripHtml(p.counterargument)}`, MARGIN, y, CONTENT_WIDTH) + 1
      if (p.response) y = addWrappedText(doc, `Response: ${stripHtml(p.response)}`, MARGIN, y, CONTENT_WIDTH) + 1
      y += 3
    })
  }

  if (outline.objectionSection) {
    if (y > PAGE_HEIGHT_MM - MARGIN - LINE_HEIGHT * 2) {
      doc.addPage()
      y = MARGIN
    }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(HEADING_FONT_SIZE)
    y = addWrappedText(doc, 'Objection section', MARGIN, y, CONTENT_WIDTH, LINE_HEIGHT, HEADING_FONT_SIZE) + 2
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(BODY_FONT_SIZE)
    y = addWrappedText(doc, stripHtml(outline.objectionSection), MARGIN, y, CONTENT_WIDTH) + 4
  }

  const concl = outline.conclusion || {}
  if (concl.restateThesis || concl.broaderImplication || concl.whyItMatters) {
    if (y > PAGE_HEIGHT_MM - MARGIN - LINE_HEIGHT * 2) {
      doc.addPage()
      y = MARGIN
    }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(HEADING_FONT_SIZE)
    y = addWrappedText(doc, 'Conclusion', MARGIN, y, CONTENT_WIDTH, LINE_HEIGHT, HEADING_FONT_SIZE) + 2
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(BODY_FONT_SIZE)
    if (concl.restateThesis) y = addWrappedText(doc, `Restate thesis: ${stripHtml(concl.restateThesis)}`, MARGIN, y, CONTENT_WIDTH) + 1
    if (concl.broaderImplication) y = addWrappedText(doc, `Broader implication: ${stripHtml(concl.broaderImplication)}`, MARGIN, y, CONTENT_WIDTH) + 1
    if (concl.whyItMatters) y = addWrappedText(doc, `Why it matters: ${stripHtml(concl.whyItMatters)}`, MARGIN, y, CONTENT_WIDTH) + 2
  }

  addPageNumbers(doc)
  doc.save(`${(title || 'outline').replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').slice(0, 40)}-outline.pdf`)
}

/**
 * Build draft-ready PDF: prompt, thesis, outline summary, evidence, objections, export tab content.
 * Citations use the chosen style label only for formatting headers; actual in-text citations are as entered.
 */
export function buildEssayDraftPdf(essay, citationStyle = 'mla') {
  const doc = new jsPDF({ margin: MARGIN })
  const title = essay?.title || 'Essay Draft'
  const subtitle = [essay?.course, essay?.dueDate].filter(Boolean).join(' — ')

  addTitlePage(doc, title, subtitle ? `Draft · ${subtitle}` : 'Draft')
  doc.addPage()
  let y = MARGIN

  doc.setFontSize(HEADING_FONT_SIZE)
  doc.setFont('helvetica', 'bold')
  if (essay?.prompt) {
    y = addWrappedText(doc, 'Assignment prompt', MARGIN, y, CONTENT_WIDTH, LINE_HEIGHT, HEADING_FONT_SIZE) + 2
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(BODY_FONT_SIZE)
    y = addWrappedText(doc, stripHtml(essay.prompt || ''), MARGIN, y, CONTENT_WIDTH) + 4
  }

  const thesisRaw = essay?.tabContent?.thesisBuilder
  if (thesisRaw) {
    try {
      const thesis = JSON.parse(thesisRaw)
      if (y > PAGE_HEIGHT_MM - MARGIN - LINE_HEIGHT * 2) {
        doc.addPage()
        y = MARGIN
      }
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(HEADING_FONT_SIZE)
      y = addWrappedText(doc, 'Thesis', MARGIN, y, CONTENT_WIDTH, LINE_HEIGHT, HEADING_FONT_SIZE) + 2
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(BODY_FONT_SIZE)
      if (thesis.workingThesis) y = addWrappedText(doc, thesis.workingThesis, MARGIN, y, CONTENT_WIDTH) + 2
      if (thesis.myAnswer) y = addWrappedText(doc, `Main claim: ${stripHtml(thesis.myAnswer)}`, MARGIN, y, CONTENT_WIDTH) + 1
      if (thesis.whyItMatters) y = addWrappedText(doc, `Why it matters: ${stripHtml(thesis.whyItMatters)}`, MARGIN, y, CONTENT_WIDTH) + 2
    } catch {
      /* ignore */
    }
  }

  const outline = parseOutlineRaw(essay?.tabContent?.outline)
  if (outline) {
    if (y > PAGE_HEIGHT_MM - MARGIN - LINE_HEIGHT * 2) {
      doc.addPage()
      y = MARGIN
    }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(HEADING_FONT_SIZE)
    y = addWrappedText(doc, 'Outline', MARGIN, y, CONTENT_WIDTH, LINE_HEIGHT, HEADING_FONT_SIZE) + 2
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(BODY_FONT_SIZE)
    const intro = outline.introduction || {}
    if (intro.thesis) y = addWrappedText(doc, `Thesis: ${stripHtml(intro.thesis)}`, MARGIN, y, CONTENT_WIDTH) + 2
    const body = outline.bodyParagraphs || []
    body.forEach((p, i) => {
      if (y > PAGE_HEIGHT_MM - MARGIN - LINE_HEIGHT) {
        doc.addPage()
        y = MARGIN
      }
      const claim = stripHtml(p.paragraphClaim || '') || '(No claim)'
      y = addWrappedText(doc, `${i + 1}. ${claim}`, MARGIN, y, CONTENT_WIDTH) + 1
      if (p.evidence) y = addWrappedText(doc, `   Evidence: ${p.evidence}`, MARGIN, y, CONTENT_WIDTH) + 1
      y += 2
    })
    y += 2
  }

  const evidence = (essay?.tabContent?.evidence ?? '').trim()
  if (evidence) {
    if (y > PAGE_HEIGHT_MM - MARGIN - LINE_HEIGHT * 2) {
      doc.addPage()
      y = MARGIN
    }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(HEADING_FONT_SIZE)
    y = addWrappedText(doc, 'Evidence & citations', MARGIN, y, CONTENT_WIDTH, LINE_HEIGHT, HEADING_FONT_SIZE) + 2
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(BODY_FONT_SIZE)
    y = addWrappedText(doc, `Citation style: ${citationStyle.toUpperCase()}`, MARGIN, y, CONTENT_WIDTH) + 2
    y = addWrappedText(doc, evidence, MARGIN, y, CONTENT_WIDTH) + 4
  }

  const objections = (essay?.tabContent?.objections ?? '').trim()
  if (objections) {
    if (y > PAGE_HEIGHT_MM - MARGIN - LINE_HEIGHT * 2) {
      doc.addPage()
      y = MARGIN
    }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(HEADING_FONT_SIZE)
    y = addWrappedText(doc, 'Objections', MARGIN, y, CONTENT_WIDTH, LINE_HEIGHT, HEADING_FONT_SIZE) + 2
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(BODY_FONT_SIZE)
    y = addWrappedText(doc, objections, MARGIN, y, CONTENT_WIDTH) + 4
  }

  const exportContent = (essay?.tabContent?.export ?? '').trim()
  if (exportContent) {
    if (y > PAGE_HEIGHT_MM - MARGIN - LINE_HEIGHT * 2) {
      doc.addPage()
      y = MARGIN
    }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(HEADING_FONT_SIZE)
    y = addWrappedText(doc, 'Draft / export notes', MARGIN, y, CONTENT_WIDTH, LINE_HEIGHT, HEADING_FONT_SIZE) + 2
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(BODY_FONT_SIZE)
    y = addWrappedText(doc, exportContent, MARGIN, y, CONTENT_WIDTH) + 4
  }

  if (essay?.content) {
    if (y > PAGE_HEIGHT_MM - MARGIN - LINE_HEIGHT * 2) {
      doc.addPage()
      y = MARGIN
    }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(HEADING_FONT_SIZE)
    y = addWrappedText(doc, 'Content', MARGIN, y, CONTENT_WIDTH, LINE_HEIGHT, HEADING_FONT_SIZE) + 2
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(BODY_FONT_SIZE)
    addWrappedText(doc, stripHtml(essay.content || ''), MARGIN, y, CONTENT_WIDTH)
  }

  addPageNumbers(doc)
  doc.save(`${(title || 'draft').replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').slice(0, 40)}-draft.pdf`)
}
