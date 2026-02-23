import { useState, useCallback, useRef, useEffect } from 'react'
import {
  getPhilosophicalAnalysisSections,
  addPhilosophicalAnalysisSection,
  updatePhilosophicalAnalysisSection,
  deletePhilosophicalAnalysisSection,
} from '../data/books'

const AUTO_SAVE_MS = 500

function RichSectionEditor({ html, onSave, placeholder }) {
  const ref = useRef(null)
  const [saving, setSaving] = useState(false)
  const timeoutRef = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (el.innerHTML !== html) {
      el.innerHTML = html || ''
    }
  }, [html])

  const scheduleSave = useCallback(() => {
    setSaving(true)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      const value = ref.current?.innerHTML ?? ''
      onSave(value)
      setSaving(false)
      timeoutRef.current = null
    }, AUTO_SAVE_MS)
  }, [onSave])

  const exec = (cmd, value = null) => {
    document.execCommand(cmd, false, value)
    ref.current?.focus()
    scheduleSave()
  }

  return (
    <div className="phil-analysis-rich-editor">
      <div className="phil-analysis-rich-toolbar">
        <button type="button" className="btn btn-sm phil-analysis-toolbar-btn" onClick={() => exec('bold')} title="Bold">
          <b>B</b>
        </button>
        <button type="button" className="btn btn-sm phil-analysis-toolbar-btn" onClick={() => exec('italic')} title="Italic">
          <i>I</i>
        </button>
        <button type="button" className="btn btn-sm phil-analysis-toolbar-btn" onClick={() => exec('insertUnorderedList')} title="Bullet list">
          • List
        </button>
        {saving && <span className="phil-analysis-autosave-hint">Saving…</span>}
      </div>
      <div
        ref={ref}
        className="phil-analysis-rich-content"
        contentEditable
        data-placeholder={placeholder}
        onInput={scheduleSave}
        onBlur={() => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
          }
          const value = ref.current?.innerHTML ?? ''
          onSave(value)
          setSaving(false)
        }}
        suppressContentEditableWarning
      />
    </div>
  )
}

function AnalysisSectionBlock({ section, bookId, onRefresh }) {
  const collapsed = !!section.collapsed
  const toggleCollapsed = () => {
    updatePhilosophicalAnalysisSection(bookId, section.id, { collapsed: !collapsed })
    onRefresh?.()
  }

  const handleTitleBlur = (e) => {
    const title = e.target.value.trim() || 'Untitled'
    if (title !== (section.title ?? '')) {
      updatePhilosophicalAnalysisSection(bookId, section.id, { title })
      onRefresh?.()
    }
  }

  const handleContentSave = (content) => {
    if (content !== (section.content ?? '')) {
      updatePhilosophicalAnalysisSection(bookId, section.id, { content })
      onRefresh?.()
    }
  }

  const handleDelete = () => {
    if (window.confirm('Remove this section?')) {
      deletePhilosophicalAnalysisSection(bookId, section.id)
      onRefresh?.()
    }
  }

  return (
    <div className="phil-analysis-section">
      <div className="phil-analysis-head">
        <button
          type="button"
          className="phil-analysis-toggle"
          onClick={toggleCollapsed}
          aria-expanded={!collapsed}
        >
          <span className="phil-analysis-chevron">{collapsed ? '▶' : '▼'}</span>
          <input
            type="text"
            className="phil-analysis-title-input"
            defaultValue={section.title ?? ''}
            onBlur={handleTitleBlur}
            onClick={(e) => e.stopPropagation()}
            placeholder="Section title (e.g. Metaphysical implications)"
          />
        </button>
        <button
          type="button"
          className="btn btn-sm btn-icon danger phil-analysis-delete"
          onClick={handleDelete}
          title="Remove section"
        >
          Remove
        </button>
      </div>
      {!collapsed && (
        <div className="phil-analysis-body">
          <RichSectionEditor
            html={section.content ?? ''}
            onSave={handleContentSave}
            placeholder="Add your reflections…"
          />
        </div>
      )}
    </div>
  )
}

export default function PhilosophicalAnalysisTab({ book, onRefresh }) {
  const sections = getPhilosophicalAnalysisSections(book)

  const handleAddSection = () => {
    addPhilosophicalAnalysisSection(book.id)
    onRefresh?.()
  }

  return (
    <div className="phil-analysis-tab">
      <p className="phil-analysis-intro">
        Add your own reflection sections (e.g. implications, assumptions, stakes). Expand to write; content saves automatically.
      </p>
      <div className="phil-analysis-toolbar">
        <button type="button" className="btn btn-primary" onClick={handleAddSection}>
          + Add section
        </button>
      </div>
      <div className="phil-analysis-list">
        {sections.length === 0 && (
          <div className="phil-analysis-empty">
            No sections yet. Click “Add section” to create one and give it any title you like.
          </div>
        )}
        {sections.map((section) => (
          <AnalysisSectionBlock
            key={section.id}
            section={section}
            bookId={book.id}
            onRefresh={onRefresh}
          />
        ))}
      </div>
    </div>
  )
}
