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
import RichTextEditor from '../components/RichTextEditor'

const DEFAULT_THESIS_BUILDER = {
  myAnswer: '',
  whyItMatters: '',
  whoDisagrees: '',
  stakesIfRight: '',
  stakesIfWrong: '',
  workingThesis: '',
  checklist: { answersPrompt: false, specific: false, arguable: false },
}

function parseThesisBuilder(raw) {
  if (typeof raw !== 'string' || !raw.trim()) return DEFAULT_THESIS_BUILDER
  try {
    const parsed = JSON.parse(raw)
    return {
      ...DEFAULT_THESIS_BUILDER,
      ...parsed,
      checklist: { ...DEFAULT_THESIS_BUILDER.checklist, ...(parsed.checklist || {}) },
    }
  } catch {
    return DEFAULT_THESIS_BUILDER
  }
}

function createBodyParagraph() {
  return {
    id: crypto.randomUUID(),
    paragraphClaim: '',
    evidence: '',
    analysis: '',
    counterargument: '',
    response: '',
  }
}

const DEFAULT_OUTLINE = {
  introduction: { hook: '', context: '', thesis: '' },
  bodyParagraphs: [],
  objectionSection: '',
  conclusion: { restateThesis: '', broaderImplication: '', whyItMatters: '' },
}

function parseOutline(raw) {
  if (typeof raw !== 'string' || !raw.trim()) return DEFAULT_OUTLINE
  try {
    const parsed = JSON.parse(raw)
    const intro = { ...DEFAULT_OUTLINE.introduction, ...(parsed.introduction || {}) }
    const body = Array.isArray(parsed.bodyParagraphs)
      ? parsed.bodyParagraphs.map((p) => ({
          ...createBodyParagraph(),
          ...p,
          id: p.id || crypto.randomUUID(),
        }))
      : []
    const conclusion = { ...DEFAULT_OUTLINE.conclusion, ...(parsed.conclusion || {}) }
    return {
      introduction: intro,
      bodyParagraphs: body,
      objectionSection: typeof parsed.objectionSection === 'string' ? parsed.objectionSection : '',
      conclusion,
    }
  } catch {
    return DEFAULT_OUTLINE
  }
}

export default function EssayPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [version, setVersion] = useState(0)
  const [activeTab, setActiveTab] = useState(ESSAY_TAB_KEYS[0])
  const [tabValue, setTabValue] = useState('')
  const [thesisData, setThesisData] = useState(DEFAULT_THESIS_BUILDER)
  const [outlineData, setOutlineData] = useState(DEFAULT_OUTLINE)
  const [outlineDragState, setOutlineDragState] = useState({ draggingId: null, dropTargetIndex: null })

  const essay = getEssayById(id)

  useEffect(() => {
    if (essay?.tabContent && activeTab) {
      const value = essay.tabContent[activeTab] ?? ''
      setTabValue(value)
      if (activeTab === 'thesisBuilder') {
        setThesisData(parseThesisBuilder(value))
      }
      if (activeTab === 'outline') {
        setOutlineData(parseOutline(value))
      }
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

  const handleTabBlur = (contentFromBlur) => {
    const content = contentFromBlur !== undefined ? contentFromBlur : tabValue
    if (content === (current.tabContent || {})[activeTab]) return
    saveEssay({
      ...current,
      tabContent: {
        ...(current.tabContent || {}),
        [activeTab]: content,
      },
    })
    refresh()
  }

  const handleThesisChange = (next) => {
    setThesisData(next)
    const str = JSON.stringify(next)
    setTabValue(str)
    saveEssay({
      ...current,
      tabContent: {
        ...(current.tabContent || {}),
        thesisBuilder: str,
      },
    })
    refresh()
  }

  const handleThesisField = (field, value) => {
    handleThesisChange({ ...thesisData, [field]: value })
  }

  const handleThesisChecklist = (key, checked) => {
    handleThesisChange({
      ...thesisData,
      checklist: { ...thesisData.checklist, [key]: checked },
    })
  }

  const handleOutlineChange = (next) => {
    setOutlineData(next)
    const str = JSON.stringify(next)
    setTabValue(str)
    saveEssay({
      ...current,
      tabContent: {
        ...(current.tabContent || {}),
        outline: str,
      },
    })
    refresh()
  }

  const handleOutlineIntro = (field, value) => {
    handleOutlineChange({
      ...outlineData,
      introduction: { ...outlineData.introduction, [field]: value },
    })
  }

  const handleOutlineConclusion = (field, value) => {
    handleOutlineChange({
      ...outlineData,
      conclusion: { ...outlineData.conclusion, [field]: value },
    })
  }

  const handleOutlineObjectionSection = (value) => {
    handleOutlineChange({ ...outlineData, objectionSection: value })
  }

  const handleOutlineBodyUpdate = (index, updates) => {
    const body = outlineData.bodyParagraphs.map((p, i) =>
      i === index ? { ...p, ...updates } : p
    )
    handleOutlineChange({ ...outlineData, bodyParagraphs: body })
  }

  const handleOutlineBodyAdd = () => {
    handleOutlineChange({
      ...outlineData,
      bodyParagraphs: [...outlineData.bodyParagraphs, createBodyParagraph()],
    })
  }

  const handleOutlineBodyRemove = (index) => {
    handleOutlineChange({
      ...outlineData,
      bodyParagraphs: outlineData.bodyParagraphs.filter((_, i) => i !== index),
    })
    setOutlineDragState({ draggingId: null, dropTargetIndex: null })
  }

  const handleOutlineBodyReorder = (fromIndex, toIndex) => {
    const body = [...outlineData.bodyParagraphs]
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= body.length || toIndex >= body.length) return
    const [removed] = body.splice(fromIndex, 1)
    body.splice(toIndex, 0, removed)
    handleOutlineChange({ ...outlineData, bodyParagraphs: body })
    setOutlineDragState({ draggingId: null, dropTargetIndex: null })
  }

  const handleOutlineDragStart = (e, index) => {
    const block = outlineData.bodyParagraphs[index]
    if (!block) return
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', block.id)
    setOutlineDragState({ draggingId: block.id, dropTargetIndex: null })
  }

  const handleOutlineDragOver = (e, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    const id = outlineDragState.draggingId
    const block = outlineData.bodyParagraphs[index]
    if (block && block.id !== id) setOutlineDragState((s) => ({ ...s, dropTargetIndex: index }))
  }

  const handleOutlineDrop = (e, toIndex) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    const fromIndex = outlineData.bodyParagraphs.findIndex((p) => p.id === id)
    if (fromIndex >= 0) handleOutlineBodyReorder(fromIndex, toIndex)
    setOutlineDragState({ draggingId: null, dropTargetIndex: null })
  }

  const handleOutlineDragEnd = () => {
    setOutlineDragState({ draggingId: null, dropTargetIndex: null })
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
                <div className="essay-prompt-text" dangerouslySetInnerHTML={{ __html: current.prompt }} />
              </div>
            )}
            <label className="form-label" htmlFor="prompt-analysis-notes">
              Your analysis and notes
            </label>
            <RichTextEditor
              value={tabValue}
              onChange={(html) => setTabValue(html)}
              onBlur={handleTabBlur}
              placeholder="Break down the prompt, key terms, and requirements…"
            />
          </div>
        ) : activeTab === 'thesisBuilder' ? (
          <div className="essay-thesis-builder-tab">
            <div className="essay-thesis-field">
              <label className="form-label" htmlFor="thesis-my-answer">
                My Answer (main claim)
              </label>
              <RichTextEditor
                value={thesisData.myAnswer}
                onChange={(html) => handleThesisField('myAnswer', html)}
                placeholder="Your main claim in a sentence or two…"
                minRows={3}
                showSaveHint={false}
              />
            </div>
            <div className="essay-thesis-field">
              <label className="form-label" htmlFor="thesis-why-matters">
                Why It Matters
              </label>
              <RichTextEditor
                value={thesisData.whyItMatters}
                onChange={(html) => handleThesisField('whyItMatters', html)}
                placeholder="Why this question or claim matters…"
                minRows={3}
                showSaveHint={false}
              />
            </div>
            <div className="essay-thesis-field">
              <label className="form-label" htmlFor="thesis-who-disagrees">
                Who Disagrees
              </label>
              <RichTextEditor
                value={thesisData.whoDisagrees}
                onChange={(html) => handleThesisField('whoDisagrees', html)}
                placeholder="Who might disagree, and what do they believe?"
                minRows={3}
                showSaveHint={false}
              />
            </div>
            <div className="essay-thesis-field">
              <label className="form-label" htmlFor="thesis-stakes-right">
                Stakes If I'm Right
              </label>
              <RichTextEditor
                value={thesisData.stakesIfRight}
                onChange={(html) => handleThesisField('stakesIfRight', html)}
                placeholder="What follows if your claim is correct?"
                minRows={2}
                showSaveHint={false}
              />
            </div>
            <div className="essay-thesis-field">
              <label className="form-label" htmlFor="thesis-stakes-wrong">
                Stakes If I'm Wrong
              </label>
              <RichTextEditor
                value={thesisData.stakesIfWrong}
                onChange={(html) => handleThesisField('stakesIfWrong', html)}
                placeholder="What follows if your claim is incorrect?"
                minRows={2}
                showSaveHint={false}
              />
            </div>
            <div className="essay-thesis-field">
              <label className="form-label" htmlFor="thesis-working">
                Working Thesis Statement (single sentence)
              </label>
              <input
                id="thesis-working"
                type="text"
                className="form-input essay-thesis-working-input"
                value={thesisData.workingThesis}
                onChange={(e) => handleThesisField('workingThesis', e.target.value)}
                placeholder="One clear, arguable sentence that states your thesis."
              />
            </div>
            <div className="essay-thesis-checklist">
              <h3 className="essay-thesis-checklist-heading">Logical integrity</h3>
              <label className="essay-thesis-checklist-item">
                <input
                  type="checkbox"
                  checked={thesisData.checklist.answersPrompt}
                  onChange={(e) => handleThesisChecklist('answersPrompt', e.target.checked)}
                />
                <span>Does this directly answer the prompt?</span>
              </label>
              <label className="essay-thesis-checklist-item">
                <input
                  type="checkbox"
                  checked={thesisData.checklist.specific}
                  onChange={(e) => handleThesisChecklist('specific', e.target.checked)}
                />
                <span>Is it specific?</span>
              </label>
              <label className="essay-thesis-checklist-item">
                <input
                  type="checkbox"
                  checked={thesisData.checklist.arguable}
                  onChange={(e) => handleThesisChecklist('arguable', e.target.checked)}
                />
                <span>Is it arguable?</span>
              </label>
            </div>
          </div>
        ) : activeTab === 'outline' ? (
          <div
            className="essay-outline-tab"
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={() => setOutlineDragState((s) => ({ ...s, dropTargetIndex: null }))}
            onDragEnd={handleOutlineDragEnd}
          >
            <section className="essay-outline-section">
              <h3 className="essay-outline-section-heading">Introduction</h3>
              <div className="essay-outline-field">
                <label className="form-label" htmlFor="outline-intro-hook">Hook</label>
                <RichTextEditor
                  value={outlineData.introduction.hook}
                  onChange={(html) => handleOutlineIntro('hook', html)}
                  placeholder="Opening that draws the reader in…"
                  minRows={2}
                  showSaveHint={false}
                />
              </div>
              <div className="essay-outline-field">
                <label className="form-label" htmlFor="outline-intro-context">Context</label>
                <RichTextEditor
                  value={outlineData.introduction.context}
                  onChange={(html) => handleOutlineIntro('context', html)}
                  placeholder="Background the reader needs…"
                  minRows={2}
                  showSaveHint={false}
                />
              </div>
              <div className="essay-outline-field">
                <label className="form-label" htmlFor="outline-intro-thesis">Thesis</label>
                <RichTextEditor
                  value={outlineData.introduction.thesis}
                  onChange={(html) => handleOutlineIntro('thesis', html)}
                  placeholder="Your main claim (one sentence)."
                  minRows={2}
                  showSaveHint={false}
                />
              </div>
            </section>

            <section className="essay-outline-section">
              <div className="essay-outline-section-head-row">
                <h3 className="essay-outline-section-heading">Body paragraphs</h3>
                <button type="button" className="btn btn-sm btn-primary" onClick={handleOutlineBodyAdd}>
                  + Add paragraph
                </button>
              </div>
              {outlineData.bodyParagraphs.length === 0 ? (
                <p className="essay-outline-empty-hint">No body paragraphs yet. Add one to start outlining.</p>
              ) : (
                <ul className="essay-outline-body-list">
                  {outlineData.bodyParagraphs.map((block, index) => {
                    const isDragging = outlineDragState.draggingId === block.id
                    const isDropTarget = outlineDragState.dropTargetIndex === index
                    return (
                      <li
                        key={block.id}
                        className={`essay-outline-body-block ${isDragging ? 'essay-outline-body-block-dragging' : ''} ${isDropTarget ? 'essay-outline-body-block-drop-target' : ''}`}
                        onDragOver={(e) => handleOutlineDragOver(e, index)}
                        onDrop={(e) => handleOutlineDrop(e, index)}
                      >
                        <span
                          className="essay-outline-drag-handle"
                          draggable
                          title="Drag to reorder"
                          onDragStart={(e) => handleOutlineDragStart(e, index)}
                          aria-hidden
                        >
                          ⋮⋮
                        </span>
                        <div className="essay-outline-body-fields">
                          <div className="essay-outline-field">
                            <label className="form-label">Paragraph claim</label>
                            <RichTextEditor
                              value={block.paragraphClaim}
                              onChange={(html) => handleOutlineBodyUpdate(index, { paragraphClaim: html })}
                              placeholder="Main claim for this paragraph."
                              minRows={2}
                              showSaveHint={false}
                            />
                          </div>
                          <div className="essay-outline-field">
                            <label className="form-label">Evidence (link to quotation system)</label>
                            <input
                              type="text"
                              className="form-input"
                              value={block.evidence}
                              onChange={(e) => handleOutlineBodyUpdate(index, { evidence: e.target.value })}
                              placeholder="Book, page, or quotation reference."
                            />
                          </div>
                          <div className="essay-outline-field">
                            <label className="form-label">Analysis</label>
                            <RichTextEditor
                              value={block.analysis}
                              onChange={(html) => handleOutlineBodyUpdate(index, { analysis: html })}
                              placeholder="How the evidence supports the claim."
                              minRows={2}
                              showSaveHint={false}
                            />
                          </div>
                          <div className="essay-outline-field">
                            <label className="form-label">Counterargument</label>
                            <RichTextEditor
                              value={block.counterargument}
                              onChange={(html) => handleOutlineBodyUpdate(index, { counterargument: html })}
                              placeholder="Objection or opposing view."
                              minRows={2}
                              showSaveHint={false}
                            />
                          </div>
                          <div className="essay-outline-field">
                            <label className="form-label">Response</label>
                            <RichTextEditor
                              value={block.response}
                              onChange={(html) => handleOutlineBodyUpdate(index, { response: html })}
                              placeholder="Your reply to the counterargument."
                              minRows={2}
                              showSaveHint={false}
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-sm danger essay-outline-body-remove"
                          onClick={() => handleOutlineBodyRemove(index)}
                          title="Remove paragraph"
                        >
                          Remove
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>

            <section className="essay-outline-section">
              <h3 className="essay-outline-section-heading">Objection section</h3>
              <p className="essay-outline-section-desc">Address major objections before the conclusion.</p>
              <div className="essay-outline-field">
                <RichTextEditor
                  value={outlineData.objectionSection}
                  onChange={handleOutlineObjectionSection}
                  placeholder="Outline how you will handle objections…"
                  minRows={4}
                  showSaveHint={false}
                />
              </div>
            </section>

            <section className="essay-outline-section">
              <h3 className="essay-outline-section-heading">Conclusion</h3>
              <div className="essay-outline-field">
                <label className="form-label" htmlFor="outline-concl-restate">Restate thesis</label>
                <RichTextEditor
                  value={outlineData.conclusion.restateThesis}
                  onChange={(html) => handleOutlineConclusion('restateThesis', html)}
                  placeholder="Rephrase your main claim."
                  minRows={2}
                  showSaveHint={false}
                />
              </div>
              <div className="essay-outline-field">
                <label className="form-label" htmlFor="outline-concl-broader">Broader implication</label>
                <RichTextEditor
                  value={outlineData.conclusion.broaderImplication}
                  onChange={(html) => handleOutlineConclusion('broaderImplication', html)}
                  placeholder="What this implies more generally."
                  minRows={2}
                  showSaveHint={false}
                />
              </div>
              <div className="essay-outline-field">
                <label className="form-label" htmlFor="outline-concl-matters">Why it matters</label>
                <RichTextEditor
                  value={outlineData.conclusion.whyItMatters}
                  onChange={(html) => handleOutlineConclusion('whyItMatters', html)}
                  placeholder="So what? Why should the reader care?"
                  minRows={2}
                  showSaveHint={false}
                />
              </div>
            </section>
          </div>
        ) : (
            <RichTextEditor
              value={tabValue}
              onChange={setTabValue}
              onBlur={handleTabBlur}
              placeholder={`Add content for ${ESSAY_TAB_LABELS[activeTab]}…`}
            />
        )}
      </div>
    </div>
  )
}
