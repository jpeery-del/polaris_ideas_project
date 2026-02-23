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
      // Summary tab uses structured chapters; ensure array exists
      const summaryChapters = Array.isArray(book.summaryChapters)
        ? book.summaryChapters.map((ch, i) => ({
            id: ch.id || crypto.randomUUID(),
            title: ch.title ?? '',
            pageRange: ch.pageRange ?? '',
            mainThesis: ch.mainThesis ?? '',
            summaryHtml: ch.summaryHtml ?? '',
            order: ch.order ?? i,
            collapsed: !!ch.collapsed,
          }))
        : []
      // Key Arguments tab: structured argument cards
      const keyArguments = Array.isArray(book.keyArguments)
        ? book.keyArguments.map((arg, i) => ({
            id: arg.id || crypto.randomUUID(),
            title: arg.title ?? '',
            claim: arg.claim ?? '',
            premises: Array.isArray(arg.premises) ? arg.premises.map(p => (p && typeof p === 'string' ? p : '')) : [],
            conclusion: arg.conclusion ?? '',
            assumptions: arg.assumptions ?? '',
            strengths: arg.strengths ?? '',
            weaknesses: arg.weaknesses ?? '',
            order: arg.order ?? i,
            collapsed: !!arg.collapsed,
          }))
        : []
      return {
        ...book,
        summaryChapters,
        keyArguments,
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
    keyArguments: [],
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

// ——— Summary tab: structured chapter-based summaries ———

export function getSummaryChapters(book) {
  const raw = book?.summaryChapters
  if (!Array.isArray(raw)) return []
  return [...raw].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

export function addSummaryChapter(bookId) {
  const book = getBookById(bookId)
  if (!book) return null
  const chapters = getSummaryChapters(book)
  const chapter = {
    id: crypto.randomUUID(),
    title: '',
    pageRange: '',
    mainThesis: '',
    summaryHtml: '',
    order: chapters.length,
    collapsed: false,
  }
  saveBook({ ...book, summaryChapters: [...chapters, chapter] })
  return chapter
}

export function updateSummaryChapter(bookId, chapterId, updates) {
  const book = getBookById(bookId)
  if (!book || !Array.isArray(book.summaryChapters)) return null
  const summaryChapters = book.summaryChapters.map(ch =>
    ch.id === chapterId ? { ...ch, ...updates } : ch
  )
  saveBook({ ...book, summaryChapters })
  return getBookById(bookId)
}

export function deleteSummaryChapter(bookId, chapterId) {
  const book = getBookById(bookId)
  if (!book || !Array.isArray(book.summaryChapters)) return null
  const chapters = book.summaryChapters.filter(ch => ch.id !== chapterId)
  chapters.forEach((ch, i) => { ch.order = i })
  saveBook({ ...book, summaryChapters: chapters })
  return getBookById(bookId)
}

export function reorderSummaryChapters(bookId, fromIndex, toIndex) {
  const book = getBookById(bookId)
  const chapters = getSummaryChapters(book)
  if (fromIndex < 0 || toIndex < 0 || fromIndex >= chapters.length || toIndex >= chapters.length) return getBookById(bookId)
  const [removed] = chapters.splice(fromIndex, 1)
  chapters.splice(toIndex, 0, removed)
  chapters.forEach((ch, i) => { ch.order = i })
  saveBook({ ...book, summaryChapters: chapters })
  return getBookById(bookId)
}

/**
 * Returns structured summary content for PDF or other export.
 * @param {Object} book - Book object
 * @returns {{ title: string, author: string, chapters: Array<{ title: string, pageRange: string, mainThesis: string, summaryHtml: string }> }}
 */
export function getSummaryForExport(book) {
  if (!book) return { title: '', author: '', chapters: [] }
  const chapters = getSummaryChapters(book).map(ch => ({
    title: ch.title || 'Untitled chapter',
    pageRange: ch.pageRange || '',
    mainThesis: ch.mainThesis || '',
    summaryHtml: ch.summaryHtml || '',
  }))
  return {
    title: book.title || '',
    author: book.author || '',
    chapters,
  }
}

// ——— Key Arguments tab: structured argument cards ———

export function getKeyArguments(book) {
  const raw = book?.keyArguments
  if (!Array.isArray(raw)) return []
  return [...raw].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

export function addKeyArgument(bookId) {
  const book = getBookById(bookId)
  if (!book) return null
  const args = getKeyArguments(book)
  const argument = {
    id: crypto.randomUUID(),
    title: '',
    claim: '',
    premises: [],
    conclusion: '',
    assumptions: '',
    strengths: '',
    weaknesses: '',
    order: args.length,
    collapsed: false,
  }
  saveBook({ ...book, keyArguments: [...args, argument] })
  return argument
}

export function updateKeyArgument(bookId, argumentId, updates) {
  const book = getBookById(bookId)
  if (!book || !Array.isArray(book.keyArguments)) return null
  const keyArguments = book.keyArguments.map(arg =>
    arg.id === argumentId ? { ...arg, ...updates } : arg
  )
  saveBook({ ...book, keyArguments })
  return getBookById(bookId)
}

export function deleteKeyArgument(bookId, argumentId) {
  const book = getBookById(bookId)
  if (!book || !Array.isArray(book.keyArguments)) return null
  const args = book.keyArguments.filter(a => a.id !== argumentId)
  args.forEach((a, i) => { a.order = i })
  saveBook({ ...book, keyArguments: args })
  return getBookById(bookId)
}

export function reorderKeyArguments(bookId, fromIndex, toIndex) {
  const book = getBookById(bookId)
  const args = getKeyArguments(book)
  if (fromIndex < 0 || toIndex < 0 || fromIndex >= args.length || toIndex >= args.length) return getBookById(bookId)
  const [removed] = args.splice(fromIndex, 1)
  args.splice(toIndex, 0, removed)
  args.forEach((a, i) => { a.order = i })
  saveBook({ ...book, keyArguments: args })
  return getBookById(bookId)
}
