const STORAGE_KEY_ESSAYS = 'platonic-study-essays'

/** Essay status options for dashboard. */
export const ESSAY_STATUSES = ['Planning', 'Drafting', 'Completed']

/** Tab keys for essay workspace (persisted in essay.tabContent). */
export const ESSAY_TAB_KEYS = [
  'promptAnalysis',
  'thesisBuilder',
  'outline',
  'evidence',
  'objections',
  'export',
]

export const ESSAY_TAB_LABELS = {
  promptAnalysis: 'Prompt Analysis',
  thesisBuilder: 'Thesis Builder',
  outline: 'Outline',
  evidence: 'Evidence',
  objections: 'Objections',
  export: 'Export',
}

function defaultTabContent() {
  return ESSAY_TAB_KEYS.reduce((acc, key) => ({ ...acc, [key]: '' }), {})
}

function loadEssays() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ESSAYS)
    const essays = raw ? JSON.parse(raw) : []
    return essays.map((e) => migrateEssay(e))
  } catch {
    return []
  }
}

function migrateEssay(e) {
  const tabContent =
    e.tabContent && typeof e.tabContent === 'object'
      ? { ...defaultTabContent(), ...e.tabContent }
      : defaultTabContent()
  return {
    id: e.id,
    title: e.title ?? 'Untitled essay',
    author: e.author ?? '',
    content: e.content ?? '',
    prompt: e.prompt ?? '',
    course: e.course ?? '',
    dueDate: e.dueDate ?? '',
    status: ESSAY_STATUSES.includes(e.status) ? e.status : 'Planning',
    tabContent,
    createdAt: e.createdAt ?? new Date().toISOString(),
  }
}

function saveEssays(essays) {
  localStorage.setItem(STORAGE_KEY_ESSAYS, JSON.stringify(essays))
}

export function getAllEssays() {
  return loadEssays()
}

export function getEssayById(id) {
  return loadEssays().find((e) => e.id === id) || null
}

export function saveEssay(essay) {
  const essays = loadEssays()
  const migrated = migrateEssay(essay)
  const index = essays.findIndex((e) => e.id === migrated.id)
  const next =
    index >= 0
      ? essays.map((e, i) => (i === index ? migrated : e))
      : [...essays, migrated]
  saveEssays(next)
  return migrated
}

export function deleteEssay(id) {
  saveEssays(loadEssays().filter((e) => e.id !== id))
}

/**
 * Create a new essay with workspace tabs.
 * @param {string} title
 * @param {string} prompt
 * @param {string} course
 * @param {string} dueDate - ISO date string or YYYY-MM-DD
 */
export function createEssay(title, prompt = '', course = '', dueDate = '') {
  const essay = migrateEssay({
    id: crypto.randomUUID(),
    title: (title || '').trim() || 'Untitled essay',
    author: '',
    content: '',
    prompt: (prompt || '').trim(),
    course: (course || '').trim(),
    dueDate: (dueDate || '').trim(),
    status: 'Planning',
    tabContent: defaultTabContent(),
    createdAt: new Date().toISOString(),
  })
  saveEssay(essay)
  return essay
}
