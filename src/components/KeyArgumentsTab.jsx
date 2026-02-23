import { useState, useRef, useCallback, useEffect } from 'react'
import {
  getKeyArguments,
  addKeyArgument,
  updateKeyArgument,
  deleteKeyArgument,
  reorderKeyArguments,
  getAllThemes,
} from '../data/books'
import ThemeIdsPicker from './ThemeIdsPicker'

function PremisesList({ premises, onChange }) {
  const addPremise = () => onChange([...(premises || []), ''])
  const removePremise = (index) => {
    const next = (premises || []).filter((_, i) => i !== index)
    onChange(next)
  }
  const updatePremise = (index, value) => {
    const next = [...(premises || [])]
    next[index] = value
    onChange(next)
  }

  const list = premises && premises.length > 0 ? premises : ['']

  return (
    <div className="key-args-premises">
      <div className="key-args-premises-list">
        {list.map((text, i) => (
          <div key={i} className="key-args-premise-row">
            <span className="key-args-premise-bullet" aria-hidden>•</span>
            <input
              type="text"
              className="form-input key-args-premise-input"
              value={text}
              onChange={(e) => updatePremise(i, e.target.value)}
              placeholder={`Premise ${i + 1}`}
            />
            {list.length > 1 && (
              <button
                type="button"
                className="btn btn-sm btn-icon key-args-premise-remove"
                onClick={() => removePremise(i)}
                title="Remove premise"
                aria-label="Remove premise"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        className="btn btn-sm key-args-add-premise"
        onClick={addPremise}
      >
        + Add premise
      </button>
    </div>
  )
}

function ArgumentCard({
  argument,
  index,
  bookId,
  allThemes,
  onUpdate,
  onDelete,
  dragState,
  onDragStart,
  onDragOver,
  onDrop,
}) {
  const collapsed = !!argument.collapsed
  const toggleCollapsed = () => {
    onUpdate(bookId, argument.id, { collapsed: !collapsed })
  }

  const isDragging = dragState.draggingId === argument.id
  const isDropTarget = dragState.dropTargetIndex === index

  const handlePremisesChange = (premises) => {
    onUpdate(bookId, argument.id, { premises })
  }

  return (
    <div
      className={`key-args-card ${isDragging ? 'key-args-card-dragging' : ''} ${isDropTarget ? 'key-args-card-drop-target' : ''}`}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
    >
      <div className="key-args-card-head">
        <span
          className="key-args-drag-handle"
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
          className="key-args-card-toggle"
          onClick={toggleCollapsed}
          aria-expanded={!collapsed}
        >
          <span className="key-args-chevron">{collapsed ? '▶' : '▼'}</span>
          <span className="key-args-card-title-display">
            {argument.title?.trim() || 'Untitled argument'}
          </span>
        </button>
        <button
          type="button"
          className="btn btn-sm btn-icon danger key-args-card-delete"
          onClick={() => onDelete(bookId, argument.id)}
          title="Remove argument"
        >
          Remove
        </button>
      </div>
      {!collapsed && (
        <div className="key-args-card-body">
          <label className="form-label key-args-label">Argument title</label>
          <input
            type="text"
            className="form-input key-args-field key-args-title-input"
            value={argument.title ?? ''}
            onChange={(e) => onUpdate(bookId, argument.id, { title: e.target.value })}
            placeholder="Short label for this argument"
          />

          <label className="form-label key-args-label">Claim</label>
          <textarea
            className="form-input form-textarea key-args-field key-args-claim"
            value={argument.claim ?? ''}
            onChange={(e) => onUpdate(bookId, argument.id, { claim: e.target.value })}
            placeholder="Main thesis of this argument"
            rows={2}
          />

          <label className="form-label key-args-label">Premises</label>
          <PremisesList
            premises={argument.premises}
            onChange={handlePremisesChange}
          />

          <label className="form-label key-args-label">Conclusion</label>
          <textarea
            className="form-input form-textarea key-args-field key-args-conclusion"
            value={argument.conclusion ?? ''}
            onChange={(e) => onUpdate(bookId, argument.id, { conclusion: e.target.value })}
            placeholder="What the argument concludes"
            rows={2}
          />

          <label className="form-label key-args-label">Assumptions</label>
          <textarea
            className="form-input form-textarea key-args-field key-args-assumptions"
            value={argument.assumptions ?? ''}
            onChange={(e) => onUpdate(bookId, argument.id, { assumptions: e.target.value })}
            placeholder="Unstated or background assumptions"
            rows={2}
          />

          <label className="form-label key-args-label">Strengths</label>
          <textarea
            className="form-input form-textarea key-args-field key-args-strengths"
            value={argument.strengths ?? ''}
            onChange={(e) => onUpdate(bookId, argument.id, { strengths: e.target.value })}
            placeholder="Notable strengths of the argument"
            rows={2}
          />

          <label className="form-label key-args-label">Weaknesses</label>
          <textarea
            className="form-input form-textarea key-args-field key-args-weaknesses"
            value={argument.weaknesses ?? ''}
            onChange={(e) => onUpdate(bookId, argument.id, { weaknesses: e.target.value })}
            placeholder="Notable weaknesses or objections"
            rows={2}
          />

          <label className="form-label key-args-label">Shared themes</label>
          <ThemeIdsPicker
            themeIds={argument.themeIds || []}
            allThemes={allThemes}
            onChange={(themeIds) => onUpdate(bookId, argument.id, { themeIds })}
          />
        </div>
      )}
    </div>
  )
}

const REFRESH_DEBOUNCE_MS = 400

export default function KeyArgumentsTab({ book, onRefresh }) {
  const allThemes = getAllThemes()
  const argumentsList = getKeyArguments(book)
  const [dragState, setDragState] = useState({ draggingId: null, dropTargetIndex: null })
  const refreshTimeoutRef = useRef(null)

  const scheduleRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current)
    refreshTimeoutRef.current = setTimeout(() => {
      onRefresh?.()
      refreshTimeoutRef.current = null
    }, REFRESH_DEBOUNCE_MS)
  }, [onRefresh])

  const handleAddArgument = () => {
    addKeyArgument(book.id)
    onRefresh?.()
  }

  const handleUpdate = (bookId, argumentId, updates) => {
    updateKeyArgument(bookId, argumentId, updates)
    scheduleRefresh()
  }

  const handleDelete = (bookId, argumentId) => {
    if (window.confirm('Remove this argument card?')) {
      deleteKeyArgument(bookId, argumentId)
      onRefresh?.()
    }
  }

  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current)
    }
  }, [])

  const handleDragStart = (e, index) => {
    const arg = argumentsList[index]
    if (!arg) return
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', arg.id)
    e.dataTransfer.setData('application/x-key-args-index', String(index))
    setDragState({ draggingId: arg.id, dropTargetIndex: null })
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    const id = dragState.draggingId
    const arg = argumentsList[index]
    if (arg && arg.id !== id) setDragState(s => ({ ...s, dropTargetIndex: index }))
  }

  const handleDrop = (e, toIndex) => {
    e.preventDefault()
    const fromIndex = parseInt(e.dataTransfer.getData('application/x-key-args-index'), 10)
    if (Number.isNaN(fromIndex) || fromIndex === toIndex) {
      setDragState({ draggingId: null, dropTargetIndex: null })
      return
    }
    reorderKeyArguments(book.id, fromIndex, toIndex)
    onRefresh?.()
    setDragState({ draggingId: null, dropTargetIndex: null })
  }

  const handleDragEnd = () => {
    setDragState({ draggingId: null, dropTargetIndex: null })
  }

  return (
    <div className="key-args-tab">
      <p className="key-args-tab-intro">
        Record key arguments with a clear structure: claim, premises, conclusion, assumptions, and your analysis of strengths and weaknesses. Use this to train logical analysis—no AI generation.
      </p>
      <div className="key-args-toolbar">
        <button type="button" className="btn btn-primary" onClick={handleAddArgument}>
          + Add Argument
        </button>
      </div>
      <div
        className="key-args-list"
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => setDragState(s => ({ ...s, dropTargetIndex: null }))}
        onDragEnd={handleDragEnd}
      >
        {argumentsList.length === 0 && (
          <div className="key-args-empty">
            No arguments yet. Click “Add Argument” to create a structured argument card.
          </div>
        )}
        {argumentsList.map((arg, index) => (
          <ArgumentCard
            key={arg.id}
            argument={arg}
            index={index}
            bookId={book.id}
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
