import { useEffect, useState } from 'react'

export function useDraft(value) { const [draft, setDraft] = useState(value); useEffect(() => setDraft(value), [value]); return [draft, setDraft] }
export function TextField({ label, value, onChange, placeholder, rows, hint, lang }) { return <label className="field"><span>{label}</span>{rows ? <textarea lang={lang} rows={rows} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || ''}/> : <input lang={lang} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || ''}/ >}{hint && <small>{hint}</small>}</label> }
export function CardTitle({ title, description, onAdd }) { return <div className="card-title"><div><h3>{title}</h3>{description && <p>{description}</p>}</div>{onAdd && <button className="button secondary small" onClick={onAdd}>＋ Añadir</button>}</div> }

export function Check({ label, checked, onChange }) { return <label className="check"><input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)}/><span>{label}</span></label> }

export function ArrayText({ title, items = [], onChange, lang }) { return <div className="collection"><CardTitle title={title} onAdd={() => onChange([...(items || []), ''])}/>{items.map((item, i) => <div className="array-row" key={i}><input lang={lang} aria-label={`${title} ${i+1}`} value={typeof item === 'string' ? item : item.title || ''} onChange={(e) => onChange(items.map((x,n) => n === i ? e.target.value : x))}/><button className="icon-button" aria-label={`Eliminar ${title.toLowerCase()}`} onClick={() => onChange(items.filter((_,n) => n !== i))}>×</button></div>)}</div> }
