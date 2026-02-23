import { useState, useRef, useCallback, useEffect } from 'react'
import {
  getKeyArguments,
  getQuestions,
  getObjections,
  addQuestion,
  addObjection,
  updateQuestion,
  updateObjection,
  deleteQuestion,
  deleteObjection,
  reorderQuestions,
  reorderObjections,
} from '../data/books'
import RichTextEditor from './RichTextEditor'
import { stripHtml } from '../utils/text'

const REFRESH_DEBOUNCE_MS = 400
const STRENGTH_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

function QuestionCard({
  item,
  index,
  bookId,
  onUpdate,
  onDelete,
  dragState,
  onDragStart,
  onDragOver,
  onDrop,
}) {
  const collapsed = !!item.collapsed
  const toggleCollapsed = () => {
    onUpdate(bookId, item.id, { collapsed: !collapsed })
  }
  const isDragging = dragState.draggingId === item.id
  const isDropTarget = dragState.dropTargetIndex === index
  const titleDisplay = stripHtml((item.question ?? '').trim()).slice(0, 50) || 'Untitled question'
  const display = titleDisplay.length >= 50 ? titleDisplay + '…' : titleDisplay

  return (
    <div
      className={`qo-card qo-card-question ${isDragging ? 'qo-card-dragging' : ''} ${isDropTarget ? 'qo-card-drop-target' : ''}`}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
    >
      <div className="qo-card-head">
        <span
          className="qo-drag-handle"
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
          className="qo-card-toggle"
          onClick={toggleCollapsed}
          aria-expanded={!collapsed}
        >
          <span className="qo-chevron">{collapsed ? '▶' : '▼'}</span>
          <span className="qo-card-title-display">{display}</span>
        </button>
        <button
          type="button"
          className="btn btn-sm btn-icon danger qo-card-delete"
          onClick={() => onDelete(bookId, item.id)}
          title="Remove question"
        >
          Remove
        </button>
      </div>
      {!collapsed && (
        <div className="qo-card-body">
          <label className="form-label qo-label">Question</label>
          <RichTextEditor
            value={item.question ?? ''}
            onChange={(html) => onUpdate(bookId, item.id, { question: html })}
            placeholder="What is unclear or worth probing?"
            minRows={2}
            showSaveHint={false}
          />
          <label className="form-label qo-label">Why this question matters</label>
          <RichTextEditor
            value={item.whyMatters ?? ''}
            onChange={(html) => onUpdate(bookId, item.id, { whyMatters: html })}
            placeholder="Stakes for understanding the text or argument"
            minRows={2}
            showSaveHint={false}
          />
          <label className="form-label qo-label">Possible answer</label>
          <RichTextEditor
            value={item.possibleAnswer ?? ''}
            onChange={(html) => onUpdate(bookId, item.id, { possibleAnswer: html })}
            placeholder="Your current or tentative answer"
            minRows={2}
            showSaveHint={false}
          />
          <label className="form-label qo-label">Remaining uncertainty</label>
          <RichTextEditor
            value={item.remainingUncertainty ?? ''}
            onChange={(html) => onUpdate(bookId, item.id, { remainingUncertainty: html })}
            placeholder="What still needs scrutiny or evidence"
            minRows={2}
            showSaveHint={false}
          />
        </div>
      )}
    </div>
  )
}

function ObjectionCard({
  item,
  index,
  bookId,
  book,
  onUpdate,
  onDelete,
  dragState,
  onDragStart,
  onDragOver,
  onDrop,
}) {
  const collapsed = !!item.collapsed
  const toggleCollapsed = () => {
    onUpdate(bookId, item.id, { collapsed: !collapsed })
  }
  const isDragging = dragState.draggingId === item.id
  const isDropTarget = dragState.dropTargetIndex === index
  const keyArguments = getKeyArguments(book)
  const titleDisplay = stripHtml((item.objection ?? '').trim()).slice(0, 50) || 'Untitled objection'
  const display = titleDisplay.length >= 50 ? titleDisplay + '…' : titleDisplay

  return (
    <div
      className={`qo-card qo-card-objection ${isDragging ? 'qo-card-dragging' : ''} ${isDropTarget ? 'qo-card-drop-target' : ''}`}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
    >
      <div className="qo-card-head">
        <span
          className="qo-drag-handle"
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
          className="qo-card-toggle"
          onClick={toggleCollapsed}
          aria-expanded={!collapsed}
        >
          <span className="qo-chevron">{collapsed ? '▶' : '▼'}</span>
          <span className="qo-card-title-display">{display}</span>
        </button>
        <button
          type="button"
          className="btn btn-sm btn-icon danger qo-card-delete"
          onClick={() => onDelete(bookId, item.id)}
          title="Remove objection"
        >
          Remove
        </button>
      </div>
      {!collapsed && (
        <div className="qo-card-body">
          <label className="form-label qo-label">Objection</label>
          <RichTextEditor
            value={item.objection ?? ''}
            onChange={(html) => onUpdate(bookId, item.id, { objection: html })}
            placeholder="A counter-argument or challenge to one of the key arguments"
            minRows={2}
            showSaveHint={false}
          />
          <label className="form-label qo-label">Target argument</label>
          <select
            className="form-input qo-select"
            value={item.targetArgumentId ?? ''}
            onChange={(e) => onUpdate(bookId, item.id, { targetArgumentId: e.target.value })}
            aria-label="Key argument this objection targets"
          >
            <option value="">— Select key argument —</option>
            {keyArguments.map((arg) => (
              <option key={arg.id} value={arg.id}>
                {arg.title?.trim() || 'Untitled argument'}
              </option>
            ))}
          </select>
          <label className="form-label qo-label">Strength of objection</label>
          <select
            className="form-input qo-select qo-strength"
            value={item.strength ?? 'medium'}
            onChange={(e) => onUpdate(bookId, item.id, { strength: e.target.value })}
            aria-label="Strength of objection"
          >
            {STRENGTH_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <label className="form-label qo-label">Possible response</label>
          <RichTextEditor
            value={item.possibleResponse ?? ''}
            onChange={(html) => onUpdate(bookId, item.id, { possibleResponse: html })}
            placeholder="How the argument might be defended or refined"
            minRows={3}
            showSaveHint={false}
          />
        </div>
      )}
    </div>
  )
}

export default function QuestionsObjectionsTab({ book, onRefresh }) {
  const questionsList = getQuestions(book)
  const objectionsList = getObjections(book)
  const [questionDragState, setQuestionDragState] = useState({ draggingId: null, dropTargetIndex: null })
  const [objectionDragState, setObjectionDragState] = useState({ draggingId: null, dropTargetIndex: null })
  const refreshTimeoutRef = useRef(null)

  const scheduleRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current)
    refreshTimeoutRef.current = setTimeout(() => {
      onRefresh?.()
      refreshTimeoutRef.current = null
    }, REFRESH_DEBOUNCE_MS)
  }, [onRefresh])

  const handleAddQuestion = () => {
    addQuestion(book.id)
    onRefresh?.()
  }

  const handleAddObjection = () => {
    addObjection(book.id)
    onRefresh?.()
  }

  const handleUpdateQuestion = (bookId, questionId, updates) => {
    updateQuestion(bookId, questionId, updates)
    scheduleRefresh()
  }

  const handleUpdateObjection = (bookId, objectionId, updates) => {
    updateObjection(bookId, objectionId, updates)
    scheduleRefresh()
  }

  const handleDeleteQuestion = (bookId, questionId) => {
    if (window.confirm('Remove this question card?')) {
      deleteQuestion(bookId, questionId)
      onRefresh?.()
    }
  }

  const handleDeleteObjection = (bookId, objectionId) => {
    if (window.confirm('Remove this objection card?')) {
      deleteObjection(bookId, objectionId)
      onRefresh?.()
    }
  }

  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current)
    }
  }, [])

  const questionDragStart = (e, index) => {
    const item = questionsList[index]
    if (!item) return
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', item.id)
    e.dataTransfer.setData('application/x-qo-questions-index', String(index))
    setQuestionDragState({ draggingId: item.id, dropTargetIndex: null })
  }

  const questionDragOver = (e, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    const id = questionDragState.draggingId
    const item = questionsList[index]
    if (item && item.id !== id) setQuestionDragState((s) => ({ ...s, dropTargetIndex: index }))
  }

  const questionDrop = (e, toIndex) => {
    e.preventDefault()
    const fromIndex = parseInt(e.dataTransfer.getData('application/x-qo-questions-index'), 10)
    if (Number.isNaN(fromIndex) || fromIndex === toIndex) {
      setQuestionDragState({ draggingId: null, dropTargetIndex: null })
      return
    }
    reorderQuestions(book.id, fromIndex, toIndex)
    onRefresh?.()
    setQuestionDragState({ draggingId: null, dropTargetIndex: null })
  }

  const objectionDragStart = (e, index) => {
    const item = objectionsList[index]
    if (!item) return
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', item.id)
    e.dataTransfer.setData('application/x-qo-objections-index', String(index))
    setObjectionDragState({ draggingId: item.id, dropTargetIndex: null })
  }

  const objectionDragOver = (e, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    const id = objectionDragState.draggingId
    const item = objectionsList[index]
    if (item && item.id !== id) setObjectionDragState((s) => ({ ...s, dropTargetIndex: index }))
  }

  const objectionDrop = (e, toIndex) => {
    e.preventDefault()
    const fromIndex = parseInt(e.dataTransfer.getData('application/x-qo-objections-index'), 10)
    if (Number.isNaN(fromIndex) || fromIndex === toIndex) {
      setObjectionDragState({ draggingId: null, dropTargetIndex: null })
      return
    }
    reorderObjections(book.id, fromIndex, toIndex)
    onRefresh?.()
    setObjectionDragState({ draggingId: null, dropTargetIndex: null })
  }

  return (
    <div className="qo-tab">
      <p className="qo-tab-intro">
        Sharpen your reading by recording questions and objections. Questions probe what is unclear or significant; objections target specific key arguments and help you weigh strength and response. Reorder by dragging.
      </p>

      <section className="qo-section">
        <div className="qo-section-header">
          <h2 className="qo-section-title">Questions</h2>
          <button type="button" className="btn btn-primary" onClick={handleAddQuestion}>
            + Add Question
          </button>
        </div>
        <div
          className="qo-list"
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={() => setQuestionDragState((s) => ({ ...s, dropTargetIndex: null }))}
          onDragEnd={() => setQuestionDragState({ draggingId: null, dropTargetIndex: null })}
        >
          {questionsList.length === 0 && (
            <div className="qo-empty">
              No questions yet. Click “Add Question” to create a card with question, why it matters, possible answer, and remaining uncertainty.
            </div>
          )}
          {questionsList.map((item, index) => (
            <QuestionCard
              key={item.id}
              item={item}
              index={index}
              bookId={book.id}
              onUpdate={handleUpdateQuestion}
              onDelete={handleDeleteQuestion}
              dragState={questionDragState}
              onDragStart={questionDragStart}
              onDragOver={questionDragOver}
              onDrop={questionDrop}
            />
          ))}
        </div>
      </section>

      <section className="qo-section">
        <div className="qo-section-header">
          <h2 className="qo-section-title">Objections</h2>
          <button type="button" className="btn btn-primary" onClick={handleAddObjection}>
            + Add Objection
          </button>
        </div>
        <div
          className="qo-list"
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={() => setObjectionDragState((s) => ({ ...s, dropTargetIndex: null }))}
          onDragEnd={() => setObjectionDragState({ draggingId: null, dropTargetIndex: null })}
        >
          {objectionsList.length === 0 && (
            <div className="qo-empty">
              No objections yet. Click “Add Objection” to create a card linked to a key argument, with strength and possible response.
            </div>
          )}
          {objectionsList.map((item, index) => (
            <ObjectionCard
              key={item.id}
              item={item}
              index={index}
              bookId={book.id}
              book={book}
              onUpdate={handleUpdateObjection}
              onDelete={handleDeleteObjection}
              dragState={objectionDragState}
              onDragStart={objectionDragStart}
              onDragOver={objectionDragOver}
              onDrop={objectionDrop}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
