const STORAGE_KEY_BOOKS = 'platonic-study-books'

/** Tab keys for philosophical book workspace (persisted in book.tabContent). */
export const BOOK_TAB_KEYS = [
  'overview',
  'summary',
  'keyArguments',
  'quotations',
  'philosophicalAnalysis',
  'questionsObjections',
  'crossConnections',
]

export const BOOK_TAB_LABELS = {
  overview: 'Overview',
  summary: 'Summary',
  keyArguments: 'Key Arguments',
  quotations: 'Quotations',
  philosophicalAnalysis: 'Philosophical Analysis',
  questionsObjections: 'Questions & Objections',
  crossConnections: 'Cross-Connections',
}

function defaultTabContent() {
  return BOOK_TAB_KEYS.reduce((acc, key) => ({ ...acc, [key]: '' }), {})
}

export const NOTE_TYPES = [
  { id: 'summary', label: 'Summary notes' },
  { id: 'key_concept', label: 'Key concepts' },
  { id: 'quotation', label: 'Quotations' },
  { id: 'question', label: 'Questions' },
  { id: 'implication', label: 'Implications' },
  { id: 'note', label: 'Note' },
]

/** Only Book Overview section uses these 5 structured types. */
export const BOOK_OVERVIEW_NOTE_TYPES = NOTE_TYPES.filter(t => t.id !== 'note')

function loadBooks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKS)
    const books = raw ? JSON.parse(raw) : []
    const legacyTypeMap = { idea: 'summary', event: 'summary', argument: 'implication', note: 'summary', other: 'summary' }
    let didMigrate = false
    const result = books.map(book => {
      let sections = (book.sections || []).map((sec, i) => ({
        ...sec,
        order: sec.order ?? i,
        notes: (sec.notes || []).map(n => {
          const type = NOTE_TYPES.some(t => t.id === n.type) ? n.type : (legacyTypeMap[n.type] ?? 'summary')
          return { ...n, type, subentries: n.subentries || [] }
        }),
      }))
      // Migrate "Character and concept index" → "Character index" + "Concept index"
      const expanded = sections.flatMap(sec =>
        sec.title === 'Character and concept index'
          ? (didMigrate = true, [
              { ...sec, title: 'Character index' },
              { id: crypto.randomUUID(), title: 'Concept index', notes: [], order: sec.order + 1 },
            ])
          : [sec]
      )
      sections = expanded.map((sec, i) => ({ ...sec, order: i }))
      const tabContent = book.tabContent && typeof book.tabContent === 'object'
        ? { ...defaultTabContent(), ...book.tabContent }
        : defaultTabContent()
      return {
        ...book,
        author: book.author ?? '',
        translator: book.translator ?? '',
        publisher: book.publisher ?? '',
        year: book.year ?? '',
        edition: book.edition ?? '',
        tags: Array.isArray(book.tags) ? book.tags : [],
        customTypes: book.customTypes || [],
        sections,
        tabContent,
      }
    })
    if (didMigrate) saveBooks(result)
    return result
  } catch {
    return []
  }
}

function saveBooks(books) {
  localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(books))
}

export function getAllBooks() {
  return loadBooks()
}

export function getBookById(id) {
  return loadBooks().find(b => b.id === id) || null
}

export function saveBook(book) {
  const books = loadBooks()
  const index = books.findIndex(b => b.id === book.id)
  const next = index >= 0
    ? books.map((b, i) => (i === index ? book : b))
    : [...books, book]
  saveBooks(next)
  return book
}

export function deleteBook(id) {
  saveBooks(loadBooks().filter(b => b.id !== id))
}

const DEFAULT_SECTIONS = [
  'Book Overview',
  'Character index',
  'Concept index',
  'Argument map',
]

/**
 * Create a new philosophy book workspace.
 * @param {Object} opts - { title, author, year, edition, translator, tags }
 */
export function createBook(opts) {
  const title = typeof opts === 'string' ? opts : (opts?.title ?? '')
  const author = typeof opts === 'string' ? '' : (opts?.author ?? '')
  const year = typeof opts === 'string' ? '' : (opts?.year ?? '')
  const edition = typeof opts === 'string' ? '' : (opts?.edition ?? '')
  const translator = typeof opts === 'string' ? '' : (opts?.translator ?? '')
  const publisher = typeof opts === 'string' ? '' : (opts?.publisher ?? '')
  const tags = Array.isArray(opts?.tags) ? opts.tags : []
  const book = {
    id: crypto.randomUUID(),
    title: (title || '').trim() || 'Untitled book',
    author: (author || '').trim(),
    translator: (translator || '').trim(),
    publisher: (publisher || '').trim(),
    year: (year || '').toString().trim(),
    edition: (edition || '').toString().trim(),
    tags: tags.filter(Boolean).map(t => (typeof t === 'string' ? t : '').trim()).filter(Boolean),
    sections: [],
    customTypes: [],
    tabContent: defaultTabContent(),
    createdAt: new Date().toISOString(),
  }
  saveBook(book)
  return book
}

export function addSection(bookId, sectionTitle) {
  const book = getBookById(bookId)
  if (!book) return null
  const section = {
    id: crypto.randomUUID(),
    title: sectionTitle.trim() || 'Untitled section',
    notes: [],
    order: (book.sections || []).length,
  }
  const updated = {
    ...book,
    sections: [...(book.sections || []), section],
  }
  saveBook(updated)
  return section
}

export function updateSection(bookId, sectionId, updates) {
  const book = getBookById(bookId)
  if (!book || !book.sections) return null
  const sections = book.sections.map(s =>
    s.id === sectionId ? { ...s, ...updates } : s
  )
  saveBook({ ...book, sections })
  return getBookById(bookId)
}

export function deleteSection(bookId, sectionId) {
  const book = getBookById(bookId)
  if (!book || !book.sections) return null
  saveBook({
    ...book,
    sections: book.sections.filter(s => s.id !== sectionId),
  })
  return getBookById(bookId)
}

export function moveSection(bookId, sectionId, direction) {
  const book = getBookById(bookId)
  if (!book?.sections?.length) return null
  const sections = [...book.sections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  const idx = sections.findIndex(s => s.id === sectionId)
  if (idx < 0) return null
  const next = idx + (direction === 'up' ? -1 : 1)
  if (next < 0 || next >= sections.length) return getBookById(bookId)
  const temp = sections[idx]
  sections[idx] = { ...sections[next], order: sections[idx].order }
  sections[next] = { ...temp, order: sections[next].order }
  saveBook({ ...book, sections })
  return getBookById(bookId)
}

export function addCustomType(bookId, label) {
  const book = getBookById(bookId)
  if (!book) return null
  const id = 'custom-' + crypto.randomUUID().slice(0, 8)
  const customTypes = [...(book.customTypes || []), { id, label: (label || '').trim() || 'Custom' }]
  saveBook({ ...book, customTypes })
  return { id, label: customTypes[customTypes.length - 1].label }
}

export function deleteCustomType(bookId, typeId) {
  const book = getBookById(bookId)
  if (!book) return null
  const customTypes = (book.customTypes || []).filter(t => t.id !== typeId)
  saveBook({ ...book, customTypes })
  return getBookById(bookId)
}

export function addNote(bookId, sectionId, type, content) {
  const book = getBookById(bookId)
  if (!book || !book.sections) return null
  const note = {
    id: crypto.randomUUID(),
    type: (type && NOTE_TYPES.some(t => t.id === type)) ? type : 'note',
    content: (content || '').trim(),
    subentries: [],
    createdAt: new Date().toISOString(),
  }
  const sections = book.sections.map(s => {
    if (s.id !== sectionId) return s
    return { ...s, notes: [...(s.notes || []), note] }
  })
  saveBook({ ...book, sections })
  return note
}

export function updateNote(bookId, sectionId, noteId, updates) {
  const book = getBookById(bookId)
  if (!book || !book.sections) return null
  const sections = book.sections.map(s => {
    if (s.id !== sectionId) return s
    return {
      ...s,
      notes: (s.notes || []).map(n =>
        n.id === noteId ? { ...n, ...updates } : n
      ),
    }
  })
  saveBook({ ...book, sections })
  return getBookById(bookId)
}

export function deleteNote(bookId, sectionId, noteId) {
  const book = getBookById(bookId)
  if (!book || !book.sections) return null
  const sections = book.sections.map(s => {
    if (s.id !== sectionId) return s
    return { ...s, notes: (s.notes || []).filter(n => n.id !== noteId) }
  })
  saveBook({ ...book, sections })
  return getBookById(bookId)
}

export function getSectionById(book, sectionId) {
  return (book?.sections || []).find(s => s.id === sectionId) || null
}

export function addSubentry(bookId, sectionId, noteId, content) {
  const book = getBookById(bookId)
  if (!book?.sections) return null
  const sub = { id: crypto.randomUUID(), content: (content || '').trim() }
  const sections = book.sections.map(s => {
    if (s.id !== sectionId) return s
    return {
      ...s,
      notes: (s.notes || []).map(n =>
        n.id !== noteId ? n : { ...n, subentries: [...(n.subentries || []), sub] }
      ),
    }
  })
  saveBook({ ...book, sections })
  return sub
}

export function updateSubentry(bookId, sectionId, noteId, subentryId, content) {
  const book = getBookById(bookId)
  if (!book?.sections) return null
  const sections = book.sections.map(s => {
    if (s.id !== sectionId) return s
    return {
      ...s,
      notes: (s.notes || []).map(n => {
        if (n.id !== noteId) return n
        return {
          ...n,
          subentries: (n.subentries || []).map(sub =>
            sub.id !== subentryId ? sub : { ...sub, content: (content || '').trim() }
          ),
        }
      }),
    }
  })
  saveBook({ ...book, sections })
  return getBookById(bookId)
}

export function deleteSubentry(bookId, sectionId, noteId, subentryId) {
  const book = getBookById(bookId)
  if (!book?.sections) return null
  const sections = book.sections.map(s => {
    if (s.id !== sectionId) return s
    return {
      ...s,
      notes: (s.notes || []).map(n =>
        n.id !== noteId ? n : { ...n, subentries: (n.subentries || []).filter(sub => sub.id !== subentryId) }
      ),
    }
  })
  saveBook({ ...book, sections })
  return getBookById(bookId)
}
