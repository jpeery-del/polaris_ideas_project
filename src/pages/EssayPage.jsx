import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  getEssayById,
  saveEssay,
  deleteEssay,
  ESSAY_TAB_KEYS,
  ESSAY_TAB_LABELS,
  ESSAY_STATUSES,
} from '../data/essays'

export default function EssayPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [version, setVersion] = useState(0)
  const [activeTab, setActiveTab] = useState(ESSAY_TAB_KEYS[0])
  const [tabValue, setTabValue] = useState('')

  const essay = getEssayById(id)

  useEffect(() => {
    if (essay?.tabContent && activeTab) {
      setTabValue(essay.tabContent[activeTab] ?? '')
    }
  }, [essay?.id, activeTab, version])

  const refresh = () => setVersion((v) => v + 1)
  const current = getEssayById(id)

  if (!current) {
    return (
      <div className="essay-workspace-page">
        <p>Essay not found.</p>
        <Link to="/essays">← Back to Essays</Link>
      </div>
    )
  }

  const handleTabBlur = () => {
    const content = (current.tabContent || {})[activeTab]
    if (content === tabValue) return
    saveEssay({
      ...current,
      tabContent: {
        ...(current.tabContent || {}),
        [activeTab]: tabValue,
      },
    })
    refresh()
  }

  const handleStatusChange = (newStatus) => {
    saveEssay({ ...current, status: newStatus })
    refresh()
  }

  const handleDelete = () => {
    if (window.confirm('Delete this essay and its workspace?')) {
      deleteEssay(id)
      navigate('/essays')
    }
  }

  return (
    <div className="essay-workspace-page">
      <nav className="breadcrumb">
        <Link to="/essays">Essays</Link>
        <span className="sep">/</span>
        <span>{current.title}</span>
      </nav>

      <header className="essay-workspace-header">
        <div className="essay-workspace-title-block">
          <h1 className="essay-workspace-title">{current.title}</h1>
          {current.course && (
            <span className="essay-workspace-course">{current.course}</span>
          )}
          {current.dueDate && (
            <span className="essay-workspace-due">
              Due {new Date(current.dueDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
            </span>
          )}
          <div className="essay-workspace-status-row">
            <label className="form-label-inline">Status:</label>
            <select
              className="form-select essay-status-select"
              value={current.status}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              {ESSAY_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="essay-workspace-actions">
          <Link to="/essays" className="btn btn-secondary">
            ← Essays
          </Link>
          <button type="button" className="btn danger" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </header>

      <div className="essay-workspace-tabs">
        {ESSAY_TAB_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className={`essay-workspace-tab ${activeTab === key ? 'active' : ''}`}
            onClick={() => {
              handleTabBlur()
              setActiveTab(key)
            }}
          >
            {ESSAY_TAB_LABELS[key]}
          </button>
        ))}
      </div>

      <div className="essay-workspace-panel">
        {activeTab === 'promptAnalysis' ? (
          <div className="essay-prompt-analysis-tab">
            {current.prompt && (
              <div className="essay-prompt-block">
                <h3 className="essay-prompt-heading">Assignment prompt</h3>
                <div className="essay-prompt-text">{current.prompt}</div>
              </div>
            )}
            <label className="form-label" htmlFor="prompt-analysis-notes">
              Your analysis and notes
            </label>
            <textarea
              id="prompt-analysis-notes"
              className="form-input essay-workspace-textarea"
              value={tabValue}
              onChange={(e) => setTabValue(e.target.value)}
              onBlur={handleTabBlur}
              placeholder="Break down the prompt, key terms, and requirements…"
              rows={14}
            />
          </div>
        ) : (
          <textarea
            className="form-input essay-workspace-textarea"
            value={tabValue}
            onChange={(e) => setTabValue(e.target.value)}
            onBlur={handleTabBlur}
            placeholder={`Add content for ${ESSAY_TAB_LABELS[activeTab]}…`}
            rows={18}
          />
        )}
      </div>
    </div>
  )
}
