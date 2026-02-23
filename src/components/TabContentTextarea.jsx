import { useState, useEffect, useRef } from 'react'
import RichTextEditor from './RichTextEditor'

/**
 * Rich-text panel for tabs that store content in book.tabContent[key].
 * Uses the same editor as philosophical analysis; content is stored as HTML.
 */
export default function TabContentTextarea({ initialValue, label, onBlur }) {
  const [value, setValue] = useState(initialValue ?? '')
  const valueRef = useRef(value)
  valueRef.current = value

  useEffect(() => {
    setValue(initialValue ?? '')
  }, [initialValue])

  useEffect(() => {
    return () => {
      onBlur?.(valueRef.current ?? '')
    }
  }, [onBlur])

  const handleChange = (html) => {
    setValue(html)
    onBlur?.(html)
  }

  return (
    <RichTextEditor
      value={value}
      onChange={handleChange}
      placeholder={`Add notes for ${label}…`}
    />
  )
}
