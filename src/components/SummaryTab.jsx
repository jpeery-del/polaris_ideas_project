import { useState } from 'react'
import {
  getSummaryChapters,
  addSummaryChapter,
  updateSummaryChapter,
  deleteSummaryChapter,
  reorderSummaryChapters,
} from '../data/books'
import RichTextEditor from './RichTextEditor'

function ChapterBlock({
  chapter,
  index,
  total,
  bookId,
  onReorder,
  onUpdate,
  onDelete,
  dragState,
  onDragStart,
  onDragOver,
  onDrop,
}) {
  const collapsed = !!chapter.collapsed
  const toggleCollapsed = () => {
    onUpdate(bookId, chapter.id, { collapsed: !collapsed })
  }

  const handleTitleBlur = (e) => {
    const v = e.target.value.trim()
    if (v !== (chapter.title ?? '')) onUpdate(bookId, chapter.id, { title: v })
  }
  const handlePageRangeBlur = (e) => {
    const v = e.target.value.trim()
    if (v !== (chapter.pageRange ?? '')) onUpdate(bookId, chapter.id, { pageRange: v })
  }
  const handleSummarySave = (html) => {
    if (html !== (chapter.summaryHtml ?? '')) onUpdate(bookId, chapter.id, { summaryHtml: html })
  }

  const isDragging = dragState.draggingId === chapter.id
  const isDropTarget = dragState.dropTargetIndex === index

  return (
    <div
      className={`summary-chapter-block ${isDragging ? 'summary-chapter-dragging' : ''} ${isDropTarget ? 'summary-chapter-drop-target' : ''}`}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
    >
      <div className="summary-chapter-head">
        <span
          className="summary-drag-handle"
          draggable
          title="Drag to reorder"
          onDragStart={(e) => onDragStart(e, index)}
          onMouseDown={(e) => e.stopPropagation()}
        >
          ⋮⋮
        </span>
        <button
          type="button"
          className="summary-chapter-toggle"
          onClick={toggleCollapsed}
          aria-expanded={!collapsed}
        >
          <span className="summary-chapter-chevron">{collapsed ? '▶' : '▼'}</span>
          <input
            type="text"
            className="summary-chapter-title-input"
            defaultValue={chapter.title ?? ''}
            onBlur={handleTitleBlur}
            placeholder="Chapter title"
            onClick={(e) => e.stopPropagation()}
          />
          {(chapter.pageRange ?? '') && (
            <span className="summary-chapter-pages-inline">pp. {chapter.pageRange}</span>
          )}
        </button>
        <button
          type="button"
          className="btn btn-sm btn-icon danger summary-chapter-delete"
          onClick={() => onDelete(bookId, chapter.id)}
          title="Remove chapter"
        >
          Remove
        </button>
      </div>
      {!collapsed && (
        <div className="summary-chapter-body">
          <label className="form-label">Page range</label>
          <input
            type="text"
            className="form-input summary-page-range"
            defaultValue={chapter.pageRange ?? ''}
            onBlur={handlePageRangeBlur}
            placeholder="e.g. 1–24"
          />
          <label className="form-label">Main thesis of chapter</label>
          <RichTextEditor
            value={chapter.mainThesis ?? ''}
            onChange={(html) => onUpdate(bookId, chapter.id, { mainThesis: html })}
            placeholder="One or two sentences on the chapter's main thesis."
            minRows={2}
            showSaveHint={false}
          />
          <label className="form-label">Structured summary</label>
          <RichTextEditor
            value={chapter.summaryHtml ?? ''}
            onChange={handleSummarySave}
            placeholder="Write your summary (bold, italics, bullets supported)."
          />
        </div>
      )}
    </div>
  )
}

export default function SummaryTab({ book, onRefresh }) {
  const chapters = getSummaryChapters(book)
  const [dragState, setDragState] = useState({ draggingId: null, dropTargetIndex: null })

  const handleAddChapter = () => {
    addSummaryChapter(book.id)
    onRefresh?.()
  }

  const handleUpdate = (bookId, chapterId, updates) => {
    updateSummaryChapter(bookId, chapterId, updates)
    onRefresh?.()
  }

  const handleDelete = (bookId, chapterId) => {
    if (window.confirm('Remove this chapter from the summary?')) {
      deleteSummaryChapter(bookId, chapterId)
      onRefresh?.()
    }
  }

  const handleDragStart = (e, index) => {
    const ch = chapters[index]
    if (!ch) return
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', ch.id)
    e.dataTransfer.setData('application/x-summary-index', String(index))
    setDragState({ draggingId: ch.id, dropTargetIndex: null })
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    const id = dragState.draggingId
    const ch = chapters[index]
    if (ch && ch.id !== id) setDragState(s => ({ ...s, dropTargetIndex: index }))
  }

  const handleDrop = (e, toIndex) => {
    e.preventDefault()
    const fromIndex = parseInt(e.dataTransfer.getData('application/x-summary-index'), 10)
    if (Number.isNaN(fromIndex) || fromIndex === toIndex) {
      setDragState({ draggingId: null, dropTargetIndex: null })
      return
    }
    reorderSummaryChapters(book.id, fromIndex, toIndex)
    onRefresh?.()
    setDragState({ draggingId: null, dropTargetIndex: null })
  }

  const handleDragEnd = () => {
    setDragState({ draggingId: null, dropTargetIndex: null })
  }

  return (
    <div className="summary-tab">
      <p className="summary-tab-intro">
        Add chapter-based summaries. Each entry includes title, page range, main thesis, and a rich-text summary. Reorder by dragging.
      </p>
      <div className="summary-toolbar">
        <button type="button" className="btn btn-primary" onClick={handleAddChapter}>
          + Add Chapter
        </button>
      </div>
      <div
        className="summary-chapters-list"
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => setDragState(s => ({ ...s, dropTargetIndex: null }))}
        onDragEnd={handleDragEnd}
      >
        {chapters.length === 0 && (
          <div className="summary-empty">
            No chapters yet. Click “Add Chapter” to create a structured chapter summary.
          </div>
        )}
        {chapters.map((chapter, index) => (
          <ChapterBlock
            key={chapter.id}
            chapter={chapter}
            index={index}
            total={chapters.length}
            bookId={book.id}
            onReorder={reorderSummaryChapters}
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
