import { useState, useCallback } from 'react'
import {
  getPhilosophicalAnalysisSections,
  addPhilosophicalAnalysisSection,
  updatePhilosophicalAnalysisSection,
  deletePhilosophicalAnalysisSection,
} from '../data/books'
import RichTextEditor from './RichTextEditor'

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
          <RichTextEditor
            value={section.content ?? ''}
            onChange={handleContentSave}
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
