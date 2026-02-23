import { useRef, useState, useCallback, useEffect } from 'react'

const AUTO_SAVE_MS = 500

/**
 * Shared rich text editor (toolbar + contenteditable) matching the philosophical analysis text box.
 * Use for all multi-line text inputs except login.
 * @param {{ value: string, onChange: (html: string) => void, onBlur?: (html: string) => void, placeholder?: string, minRows?: number, showSaveHint?: boolean }} props
 */
export default function RichTextEditor({ value, onChange, onBlur, placeholder = 'Add text…', minRows, showSaveHint = true }) {
  const ref = useRef(null)
  const [saving, setSaving] = useState(false)
  const timeoutRef = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const next = value ?? ''
    if (el.innerHTML !== next) {
      el.innerHTML = next
    }
  }, [value])

  useEffect(() => {
    return () => {
      const html = ref.current?.innerHTML ?? ''
      onBlur?.(html)
    }
  }, [onBlur])

  const scheduleSave = useCallback(() => {
    setSaving(true)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      const html = ref.current?.innerHTML ?? ''
      onChange(html)
      setSaving(false)
      timeoutRef.current = null
    }, AUTO_SAVE_MS)
  }, [onChange])

  const exec = (cmd, val = null) => {
    document.execCommand(cmd, false, val)
    ref.current?.focus()
    scheduleSave()
  }

  const handleBlur = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    const html = ref.current?.innerHTML ?? ''
    onChange(html)
    onBlur?.(html)
    setSaving(false)
  }

  const minHeight = minRows ? `${minRows * 1.5}rem` : undefined

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
        {showSaveHint && saving && <span className="phil-analysis-autosave-hint">Saving…</span>}
      </div>
      <div
        ref={ref}
        className="phil-analysis-rich-content"
        contentEditable
        data-placeholder={placeholder}
        style={minHeight ? { minHeight } : undefined}
        onInput={scheduleSave}
        onBlur={handleBlur}
        suppressContentEditableWarning
      />
    </div>
  )
}
