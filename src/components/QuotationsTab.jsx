import { useState, useRef, useCallback, useEffect } from 'react'
import {
  getQuotations,
  addQuotation,
  updateQuotation,
  deleteQuotation,
  setQuotationsOrder,
  formatQuotationCitation,
  getAllThemes,
} from '../data/books'
import ThemeIdsPicker from './ThemeIdsPicker'
import RichTextEditor from './RichTextEditor'
import { stripHtml } from '../utils/text'

function TagsInput({ tags, onChange, placeholder }) {
  const [input, setInput] = useState('')
  const addTag = () => {
    const t = input.trim()
    if (!t) return
    const existing = (tags || []).map(x => x.toLowerCase())
    if (existing.includes(t.toLowerCase())) {
      setInput('')
      return
    }
    onChange([...(tags || []), t])
    setInput('')
  }
  const removeTag = (index) => {
    const next = (tags || []).filter((_, i) => i !== index)
    onChange(next)
  }
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    }
  }
  return (
    <div className="quotations-tags-wrap">
      <div className="quotations-tags-list">
        {(tags || []).map((t, i) => (
          <span key={i} className="quotations-tag-pill">
            {t}
            <button
              type="button"
              className="quotations-tag-remove"
              onClick={() => removeTag(i)}
              aria-label={`Remove tag ${t}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="quotations-tags-input-row">
        <input
          type="text"
          className="form-input quotations-tag-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={placeholder ?? 'Add tag…'}
        />
        <button type="button" className="btn btn-sm quotations-tag-add" onClick={addTag}>
          Add
        </button>
      </div>
    </div>
  )
}

function QuotationCard({
  quotation,
  index,
  bookId,
  book,
  allThemes,
  onUpdate,
  onDelete,
  dragState,
  onDragStart,
  onDragOver,
  onDrop,
}) {
  const collapsed = !!quotation.collapsed
  const toggleCollapsed = () => {
    onUpdate(bookId, quotation.id, { collapsed: !collapsed })
  }
  const isDragging = dragState.draggingId === quotation.id
  const isDropTarget = dragState.dropTargetIndex === index
  const handleTagsChange = (tags) => onUpdate(bookId, quotation.id, { tags })
  const handleThemeIdsChange = (themeIds) => onUpdate(bookId, quotation.id, { themeIds })
  const citationText = formatQuotationCitation(quotation, book, 'plain')
  const handleCopyCitation = () => {
    if (citationText) {
      navigator.clipboard.writeText(citationText)
    }
  }
  const rawQuote = quotation.quoteText ?? ''
  const preview = stripHtml(rawQuote).trim().slice(0, 60)
  const titleDisplay = preview ? (preview.length < stripHtml(rawQuote).trim().length ? preview + '…' : preview) : 'Untitled quotation'

  return (
    <div
      className={`quotations-card ${isDragging ? 'quotations-card-dragging' : ''} ${isDropTarget ? 'quotations-card-drop-target' : ''}`}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
    >
      <div className="quotations-card-head">
        <span
          className="quotations-drag-handle"
          draggable
          title="Drag to reorder"
          onDragStart={(e) => onDragStart(e, index)}
          onMouseDown={(e) => e.stopPropagation()}
          aria-hidden
        >
          ⋮⋮
        </span>
        <button
          type="button"
          className="quotations-card-toggle"
          onClick={toggleCollapsed}
          aria-expanded={!collapsed}
        >
          <span className="quotations-chevron">{collapsed ? '▶' : '▼'}</span>
          <span className="quotations-card-title-display">
            {titleDisplay || 'Untitled quotation'}
          </span>
          {(quotation.pageNumber ?? '') && (
            <span className="quotations-page-inline">p. {quotation.pageNumber}</span>
          )}
        </button>
        <button
          type="button"
          className="btn btn-sm quotations-copy-btn"
          onClick={handleCopyCitation}
          title="Copy citation-ready text"
        >
          Copy citation
        </button>
        <button
          type="button"
          className="btn btn-sm btn-icon danger quotations-card-delete"
          onClick={() => onDelete(bookId, quotation.id)}
          title="Remove quotation"
        >
          Remove
        </button>
      </div>
      {!collapsed && (
        <div className="quotations-card-body">
          <label className="form-label quotations-label">Quote</label>
          <RichTextEditor
            value={quotation.quoteText ?? ''}
            onChange={(html) => onUpdate(bookId, quotation.id, { quoteText: html })}
            placeholder="Paste or type the quoted text…"
            minRows={4}
            showSaveHint={false}
          />
          <label className="form-label quotations-label">Page number</label>
          <input
            type="text"
            className="form-input quotations-page-input"
            value={quotation.pageNumber ?? ''}
            onChange={(e) => onUpdate(bookId, quotation.id, { pageNumber: e.target.value })}
            placeholder="e.g. 42"
          />
          <label className="form-label quotations-label">Context</label>
          <RichTextEditor
            value={quotation.context ?? ''}
            onChange={(html) => onUpdate(bookId, quotation.id, { context: html })}
            placeholder="What is happening in the text at this point?"
            minRows={2}
            showSaveHint={false}
          />
          <label className="form-label quotations-label">Why it matters</label>
          <RichTextEditor
            value={quotation.whyItMatters ?? ''}
            onChange={(html) => onUpdate(bookId, quotation.id, { whyItMatters: html })}
            placeholder="Your analysis of why this quotation matters"
            minRows={3}
            showSaveHint={false}
          />
          <label className="form-label quotations-label">Tags (free-form)</label>
          <TagsInput
            tags={quotation.tags}
            onChange={handleTagsChange}
            placeholder="e.g. virtue, knowledge"
          />
          <label className="form-label quotations-label">Shared themes</label>
          <ThemeIdsPicker
            themeIds={quotation.themeIds || []}
            allThemes={allThemes}
            onChange={handleThemeIdsChange}
          />
        </div>
      )}
    </div>
  )
}

const REFRESH_DEBOUNCE_MS = 400

export default function QuotationsTab({ book, onRefresh }) {
  const allThemes = getAllThemes()
  const allQuotations = getQuotations(book)
  const [sortBy, setSortBy] = useState('page')
  const [filterTag, setFilterTag] = useState('')
  const [dragState, setDragState] = useState({ draggingId: null, dropTargetIndex: null })
  const refreshTimeoutRef = useRef(null)

  const allTags = [...new Set(allQuotations.flatMap(q => q.tags || []))].filter(Boolean).sort()

  const filtered = filterTag
    ? allQuotations.filter(q => (q.tags || []).includes(filterTag))
    : allQuotations

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'page') {
      const pa = parseInt(String(a.pageNumber ?? ''), 10)
      const pb = parseInt(String(b.pageNumber ?? ''), 10)
      if (Number.isNaN(pa) && Number.isNaN(pb)) return (a.order ?? 0) - (b.order ?? 0)
      if (Number.isNaN(pa)) return 1
      if (Number.isNaN(pb)) return -1
      return pa - pb
    }
    if (sortBy === 'tag') {
      const ta = (a.tags && a.tags[0]) ?? ''
      const tb = (b.tags && b.tags[0]) ?? ''
      const c = ta.localeCompare(tb)
      if (c !== 0) return c
      return (a.order ?? 0) - (b.order ?? 0)
    }
    return (a.order ?? 0) - (b.order ?? 0)
  })

  const scheduleRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current)
    refreshTimeoutRef.current = setTimeout(() => {
      onRefresh?.()
      refreshTimeoutRef.current = null
    }, REFRESH_DEBOUNCE_MS)
  }, [onRefresh])

  const handleAddQuotation = () => {
    addQuotation(book.id)
    onRefresh?.()
  }

  const handleUpdate = (bookId, quotationId, updates) => {
    updateQuotation(bookId, quotationId, updates)
    scheduleRefresh()
  }

  const handleDelete = (bookId, quotationId) => {
    if (window.confirm('Remove this quotation?')) {
      deleteQuotation(bookId, quotationId)
      onRefresh?.()
    }
  }

  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current)
    }
  }, [])

  const handleDragStart = (e, index) => {
    const q = sorted[index]
    if (!q) return
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', q.id)
    e.dataTransfer.setData('application/x-quotations-index', String(allQuotations.findIndex(x => x.id === q.id)))
    setDragState({ draggingId: q.id, dropTargetIndex: null })
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    const id = dragState.draggingId
    const q = sorted[index]
    if (q && q.id !== id) setDragState(s => ({ ...s, dropTargetIndex: index }))
  }

  const handleDrop = (e, toIndex) => {
    e.preventDefault()
    const fromIndex = parseInt(e.dataTransfer.getData('application/x-quotations-index'), 10)
    if (Number.isNaN(fromIndex) || fromIndex < 0) {
      setDragState({ draggingId: null, dropTargetIndex: null })
      return
    }
    const draggedId = allQuotations[fromIndex]?.id
    if (!draggedId) {
      setDragState({ draggingId: null, dropTargetIndex: null })
      return
    }
    const newDisplayOrder = [...sorted]
    const [removed] = newDisplayOrder.splice(
      newDisplayOrder.findIndex(q => q.id === draggedId),
      1
    )
    newDisplayOrder.splice(toIndex, 0, removed)
    setQuotationsOrder(book.id, newDisplayOrder.map(q => q.id))
    onRefresh?.()
    setDragState({ draggingId: null, dropTargetIndex: null })
  }

  const handleDragEnd = () => {
    setDragState({ draggingId: null, dropTargetIndex: null })
  }

  return (
    <div className="quotations-tab">
      <p className="quotations-tab-intro">
        Record key quotations with page number, context, and why they matter. Add tags for themes.
      </p>
      <div className="quotations-toolbar">
        <button type="button" className="btn btn-primary" onClick={handleAddQuotation}>
          + Add Quotation
        </button>
        <div className="quotations-controls">
          <label className="quotations-control-label">
            Sort by
            <select
              className="form-input quotations-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="page">Page number</option>
              <option value="tag">Tag</option>
            </select>
          </label>
          <label className="quotations-control-label">
            Filter by tag
            <select
              className="form-input quotations-select"
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
            >
              <option value="">All</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <div
        className="quotations-list"
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => setDragState(s => ({ ...s, dropTargetIndex: null }))}
        onDragEnd={handleDragEnd}
      >
        {sorted.length === 0 && (
          <div className="quotations-empty">
            {allQuotations.length === 0
              ? 'No quotations yet. Click “Add Quotation” to add one.'
              : 'No quotations match the selected tag filter.'}
          </div>
        )}
        {sorted.map((q, index) => (
          <QuotationCard
            key={q.id}
            quotation={q}
            index={index}
            bookId={book.id}
            book={book}
            allThemes={allThemes}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            dragState={dragState}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        ))}
      </div>
    </div>
  )
}
