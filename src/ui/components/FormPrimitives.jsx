import { useLayoutEffect, useState } from 'react'

const sameDraft = (left, right) =>
  JSON.stringify(left) === JSON.stringify(right)

export function useDraft(
  value,
  { onDirtyChange, onDraftChange, savedDraft } = {},
) {
  const [editor, setEditor] = useState(() => ({ draft: value, base: value }))
  const { draft, base } = editor

  useLayoutEffect(() => {
    setEditor((current) => {
      if (current.base === value) return current
      if (sameDraft(current.base, value)) return { ...current, base: value }
      if (
        savedDraft &&
        current.base === savedDraft.base &&
        sameDraft(savedDraft.submitted, value)
      ) {
        return {
          base: value,
          draft: sameDraft(current.draft, savedDraft.draft)
            ? value
            : current.draft,
        }
      }
      if (sameDraft(current.base, current.draft))
        return { base: value, draft: value }
      return current
    })
  }, [value, savedDraft])

  useLayoutEffect(() => {
    onDirtyChange?.(!sameDraft(draft, base))
    onDraftChange?.({ draft, base })
  }, [draft, base, onDirtyChange, onDraftChange])

  const setDraft = (next) =>
    setEditor((current) => ({
      ...current,
      draft: typeof next === 'function' ? next(current.draft) : next,
    }))
  return [draft, setDraft]
}
export function TextField({
  label,
  value,
  onChange,
  placeholder,
  rows,
  hint,
  lang,
  className = '',
}) {
  return (
    <label className={`field ${className}`.trim()}>
      <span>{label}</span>
      {rows ? (
        <textarea
          lang={lang}
          rows={rows}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || ''}
        />
      ) : (
        <input
          lang={lang}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || ''}
        />
      )}
      {hint && <small>{hint}</small>}
    </label>
  )
}
export function CardTitle({ title, description, onAdd }) {
  return (
    <div className="card-title">
      <div>
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </div>
      {onAdd && (
        <button className="button secondary small" onClick={onAdd}>
          ＋ Añadir
        </button>
      )}
    </div>
  )
}

export function Check({ label, checked, onChange }) {
  return (
    <label className="check">
      <input
        type="checkbox"
        checked={!!checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  )
}

export function ArrayText({ title, items = [], onChange, lang }) {
  return (
    <div className="collection">
      <CardTitle title={title} onAdd={() => onChange([...(items || []), ''])} />
      {items.map((item, i) => (
        <div className="array-row" key={i}>
          <input
            lang={lang}
            aria-label={`${title} ${i + 1}`}
            value={typeof item === 'string' ? item : item.title || ''}
            onChange={(e) =>
              onChange(items.map((x, n) => (n === i ? e.target.value : x)))
            }
          />
          <button
            className="icon-button"
            aria-label={`Eliminar ${title.toLowerCase()}`}
            onClick={() => onChange(items.filter((_, n) => n !== i))}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
