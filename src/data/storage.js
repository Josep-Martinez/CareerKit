import { useState } from 'react'
import { EMPTY, FILES } from './catalog.js'

const clone = (value) => JSON.parse(JSON.stringify(value))
const entryLists = ['skills', 'experience', 'education', 'certifications', 'languages', 'projects', 'evidence', 'learnings']
const isStringList = (value) => Array.isArray(value) && value.every((item) => typeof item === 'string')
const optionalStrings = (value, fields) => fields.every((field) => value[field] === undefined || typeof value[field] === 'string')
const validators = {
  profile: (d) => typeof d.professionalProfile === 'string' && d.objectives && ['shortTerm','mediumTerm','longTerm'].every((key) => typeof d.objectives[key] === 'string') && entryLists.every((key) => Array.isArray(d[key]) && d[key].every((item) => item && typeof item === 'object' && typeof item.id === 'string')),
  linkedin: (d) => d.published && typeof d.published.headline === 'string' && typeof d.published.about === 'string' && ['experience','education','skills','certifications','projects','featured'].every((key) => isStringList(d.published[key])) && optionalStrings(d, ['lastUpdated']) && Array.isArray(d.audits) && d.audits.every((item) => item && typeof item.id === 'string' && typeof item.section === 'string' && ['alta','media','baja'].includes(item.priority) && optionalStrings(item, ['problem','reasonEvidence','recommendation','proposedText','date']) && typeof item.problem === 'string' && typeof item.reasonEvidence === 'string' && typeof item.recommendation === 'string' && typeof item.proposedText === 'string' && typeof item.date === 'string' && ['pendiente','aplicada','descartada'].includes(item.status)),
  cv: (d) => typeof d.masterText === 'string' && typeof d.lastUpdated === 'string' && typeof d.lastReviewed === 'string',
  vacancies: (d) => Array.isArray(d.items) && d.items.every((item) => item && typeof item.id === 'string' && optionalStrings(item, ['role','company','location','modality','link','source','searchedAt','verifiedAt','description','salary','level','jobType','assessment','gaps','blockers']) && (item.matchingEvidenceIds === undefined || isStringList(item.matchingEvidenceIds)) && (item.salaryVerified === undefined || typeof item.salaryVerified === 'boolean') && (item.featured === undefined || typeof item.featured === 'boolean') && (item.preference === undefined || Number.isInteger(item.preference))),
  priorities: (d) => Array.isArray(d.items) && d.items.every((item) => item && typeof item.id === 'string' && typeof item.title === 'string' && ['alta','media','baja'].includes(item.level) && typeof item.reason === 'string' && typeof item.date === 'string' && ['profile','linkedin','cv','vacancies'].includes(item.section) && (item.order === undefined || Number.isInteger(item.order))),
}
export const validateModule = (name, value) => Boolean(value && typeof value === 'object' && value.schemaVersion === 1 && validators[name]?.(value))

export function useStorageState() {
  const [folder, setFolder] = useState(null)
  const [data, setData] = useState(() => Object.fromEntries(FILES.map((name) => [name, clone(EMPTY[name])])))
  const [states, setStates] = useState({})
  const [warnings, setWarnings] = useState({})
  const [revision, setRevision] = useState({})

  async function readModule(name, handle = folder) {
    const fileHandle = await handle.getFileHandle(`${name}.json`)
    const file = await fileHandle.getFile()
    const raw = await file.text()
    const parsed = JSON.parse(raw)
    if (!validateModule(name, parsed)) throw new Error(`${name}.json no cumple el esquema v1.`)
    const unknown = findUnknown(name, parsed)
    setData((prev) => ({ ...prev, [name]: parsed }))
    setRevision((prev) => ({ ...prev, [name]: raw }))
    setStates((prev) => ({ ...prev, [name]: 'Cargado' }))
    setWarnings((prev) => ({ ...prev, [name]: unknown.length ? `Campos no reconocidos preservados: ${unknown.join(', ')}` : '' }))
  }

  async function connect() {
    if (!window.showDirectoryPicker) return { fallback: true }
    try {
      const handle = await window.showDirectoryPicker({ mode: 'readwrite', id: 'careerkit-private-data' })
      const permission = await handle.requestPermission({ mode: 'readwrite' })
      if (permission !== 'granted') throw new Error('No se concedió permiso de lectura y escritura.')
      setFolder(handle)
      for (const name of FILES) {
        try { await readModule(name, handle) }
        catch (error) { setStates((prev) => ({ ...prev, [name]: 'Error' })); setWarnings((prev) => ({ ...prev, [name]: `${error.message} No se ha modificado el fichero.` })) }
      }
      return { connected: true }
    } catch (error) {
      if (error.name === 'AbortError') return { cancelled: true }
      return { error: error.message }
    }
  }

  async function save(name, next) {
    const safe = { ...next, schemaVersion: 1 }
    if (!validateModule(name, safe)) return { error: 'El contenido no cumple el esquema del módulo.' }
    setData((prev) => ({ ...prev, [name]: safe }))
    if (!folder) { setStates((prev) => ({ ...prev, [name]: 'Pendiente de guardar' })); return { fallback: true } }
    try {
      const handle = await folder.getFileHandle(`${name}.json`)
      const file = await handle.getFile()
      const current = await file.text()
      if (current !== revision[name]) {
        setStates((prev) => ({ ...prev, [name]: 'Conflicto externo' }))
        return { conflict: true }
      }
      const writable = await handle.createWritable()
      const raw = JSON.stringify(safe, null, 2) + '\n'
      await writable.write(raw)
      await writable.close()
      setRevision((prev) => ({ ...prev, [name]: raw }))
      setStates((prev) => ({ ...prev, [name]: 'Guardado' }))
      return { saved: true }
    } catch (error) {
      setStates((prev) => ({ ...prev, [name]: 'Error' }))
      setWarnings((prev) => ({ ...prev, [name]: error.message }))
      return { error: error.message }
    }
  }

  async function reload(name) {
    try { await readModule(name); return { ok: true } }
    catch (error) { setWarnings((prev) => ({ ...prev, [name]: `${error.message} No se ha modificado el fichero.` })); return { error: error.message } }
  }

  function disconnect(clear) {
    setFolder(null)
    if (clear) {
      setData(Object.fromEntries(FILES.map((name) => [name, clone(EMPTY[name])])))
      setStates({}); setWarnings({}); setRevision({})
    }
  }

  return { folder, data, states, warnings, revision, connect, save, reload, disconnect, setStates, setWarnings }
}

function findUnknown(name, data) {
  const known = {
    profile: ['schemaVersion','professionalProfile','objectives','skills','experience','education','certifications','languages','projects','evidence','learnings'],
    linkedin: ['schemaVersion','published','audits'], cv: ['schemaVersion','masterText','lastUpdated','lastReviewed'],
    vacancies: ['schemaVersion','items'], priorities: ['schemaVersion','items'],
  }[name]
  const unknown = Object.keys(data).filter((key) => !known.includes(key))
  const rules = {
    profile: {
      root: ['objectives','skills','experience','education','certifications','languages','projects','evidence','learnings'],
      objectives: ['shortTerm','mediumTerm','longTerm'],
      entry: ['id','title','name','organization','dates','actions','results','evidenceIds','confirmed','cvEvidence','onLinkedIn','internal'],
    },
    linkedin: {
      published: ['headline','about','experience','education','skills','certifications','projects','featured'],
      audit: ['id','section','priority','problem','reasonEvidence','recommendation','proposedText','date','status'],
    },
    vacancies: {
      item: ['id','role','company','location','modality','link','source','searchedAt','verifiedAt','description','salary','salaryVerified','level','jobType','assessment','matchingEvidenceIds','gaps','blockers','preference','featured'],
    },
    priorities: { item: ['id','title','level','reason','date','section','order'] },
  }[name]
  const inspect = (value, allowed, path) => {
    if (!value || typeof value !== 'object' || Array.isArray(value) || !allowed) return
    for (const key of Object.keys(value)) if (!allowed.includes(key)) unknown.push(`${path}.${key}`)
  }
  if (name === 'profile') {
    inspect(data.objectives, rules.objectives, 'objectives')
    for (const key of entryLists) (data[key] || []).forEach((item, index) => inspect(item, rules.entry, `${key}[${index}]`))
  }
  if (name === 'linkedin') {
    inspect(data.published, rules.published, 'published')
    ;(data.audits || []).forEach((item, index) => inspect(item, rules.audit, `audits[${index}]`))
  }
  if (name === 'vacancies') (data.items || []).forEach((item, index) => inspect(item, rules.item, `items[${index}]`))
  if (name === 'priorities') (data.items || []).forEach((item, index) => inspect(item, rules.item, `items[${index}]`))
  return unknown
}
