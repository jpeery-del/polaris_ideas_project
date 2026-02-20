const STORAGE_KEY_ESSAYS = 'platonic-study-essays'

function loadEssays() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ESSAYS)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveEssays(essays) {
  localStorage.setItem(STORAGE_KEY_ESSAYS, JSON.stringify(essays))
}

export function getAllEssays() {
  return loadEssays()
}

export function getEssayById(id) {
  return loadEssays().find(e => e.id === id) || null
}

export function saveEssay(essay) {
  const essays = loadEssays()
  const index = essays.findIndex(e => e.id === essay.id)
  const next = index >= 0
    ? essays.map((e, i) => (i === index ? essay : e))
    : [...essays, essay]
  saveEssays(next)
  return essay
}

export function deleteEssay(id) {
  saveEssays(loadEssays().filter(e => e.id !== id))
}

export function createEssay(title, author = '') {
  const essay = {
    id: crypto.randomUUID(),
    title: (title || '').trim() || 'Untitled essay',
    author: (author || '').trim(),
    content: '',
    createdAt: new Date().toISOString(),
  }
  saveEssay(essay)
  return essay
}
