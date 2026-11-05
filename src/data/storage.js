import { useState } from 'react'
import { EMPTY, FILES } from './catalog.js'

const clone = (value) => JSON.parse(JSON.stringify(value))
const entryLists = ['skills', 'experience', 'education', 'certifications', 'languages', 'projects', 'evidence', 'learnings']
const schemaVersions = { profile: 1, linkedin: 1, cv: 2, vacancies: 2, priorities: 1 }
const isStringList = (value) => Array.isArray(value) && value.every((item) => typeof item === 'string')
const optionalStrings = (value, fields) => fields.every((field) => value[field] === undefined || typeof value[field] === 'string')
const validCVVersion = (value) => value && typeof value === 'object' && typeof value.masterText === 'string' && typeof value.lastUpdated === 'string' && typeof value.lastReviewed === 'string'
const validLegacyCV = (value) => value && value.schemaVersion === 1 && typeof value.masterText === 'string' && typeof value.lastUpdated === 'string' && typeof value.lastReviewed === 'string'
const emptyCvAdvice = () => ({ recommendedVersion: 'pending', reason: '', assessedAt: '', spanishAdjustments: [], englishAdjustments: [] })
const validCvAdvice = (value) => value && typeof value === 'object' && ['spanish', 'english', 'both', 'pending'].includes(value.recommendedVersion) && typeof value.reason === 'string' && typeof value.assessedAt === 'string' && isStringList(value.spanishAdjustments) && isStringList(value.englishAdjustments)
const validVacancyItem = (item) => item && typeof item === 'object' && typeof item.id === 'string' && optionalStrings(item, ['role','company','location','modality','link','source','searchedAt','verifiedAt','description','salary','level','jobType','assessment','gaps','blockers']) && (item.matchingEvidenceIds === undefined || isStringList(item.matchingEvidenceIds)) && (item.salaryVerified === undefined || typeof item.salaryVerified === 'boolean') && (item.featured === undefined || typeof item.featured === 'boolean') && (item.preference === undefined || Number.isInteger(item.preference)) && (item.cvAdvice === undefined || validCvAdvice(item.cvAdvice))
const validators = {
  profile: (d) => typeof d.professionalProfile === 'string' && d.objectives && ['shortTerm','mediumTerm','longTerm'].every((key) => typeof d.objectives[key] === 'string') && entryLists.every((key) => Array.isArray(d[key]) && d[key].every((item) => item && typeof item === 'object' && typeof item.id === 'string')),
  linkedin: (d) => d.published && typeof d.published.headline === 'string' && typeof d.published.about === 'string' && ['experience','education','skills','certifications','projects','featured'].every((key) => isStringList(d.published[key])) && optionalStrings(d, ['lastUpdated']) && Array.isArray(d.audits) && d.audits.every((item) => item && typeof item.id === 'string' && typeof item.section === 'string' && ['alta','media','baja'].includes(item.priority) && optionalStrings(item, ['problem','reasonEvidence','recommendation','proposedText','date']) && typeof item.problem === 'string' && typeof item.reasonEvidence === 'string' && typeof item.recommendation === 'string' && typeof item.proposedText === 'string' && typeof item.date === 'string' && ['pendiente','aplicada','descartada'].includes(item.status) && (item.action === undefined || ['corregir','anadir','aclarar'].includes(item.action)) && (item.profileEvidenceIds === undefined || isStringList(item.profileEvidenceIds))),
  cv: (d) => d.versions && validCVVersion(d.versions.spanish) && validCVVersion(d.versions.english) && (d.previousVersion === undefined || validCVVersion(d.previousVersion)),
  vacancies: (d) => Array.isArray(d.items) && d.items.every(validVacancyItem),
  priorities: (d) => Array.isArray(d.items) && d.items.every((item) => item && typeof item.id === 'string' && typeof item.title === 'string' && ['alta','media','baja'].includes(item.level) && typeof item.reason === 'string' && typeof item.date === 'string' && ['profile','linkedin','cv','vacancies'].includes(item.section) && (item.order === undefined || Number.isInteger(item.order))),
}
export const validateModule = (name, value) => Boolean(value && typeof value === 'object' && value.schemaVersion === schemaVersions[name] && validators[name]?.(value))

export function normalizeModule(name, value) {
  if (name === 'vacancies' && value?.schemaVersion === 1 && Array.isArray(value.items)) {
    return {
      data: {
        ...value,
        schemaVersion: 2,
        items: value.items.map((item) => item && typeof item === 'object' && !Array.isArray(item)
          ? { ...item, cvAdvice: Object.hasOwn(item, 'cvAdvice') ? item.cvAdvice : emptyCvAdvice() }
          : item),
      },
      migrated: true,
    }
  }
  if (name !== 'cv' || value?.schemaVersion !== 1 || !validLegacyCV(value)) return { data: value, migrated: false }
  const conflicts = ['versions', 'previousVersion'].filter((key) => Object.hasOwn(value, key))
  if (conflicts.length) throw new Error(`cv.json contiene campos que pueden entrar en conflicto con la nueva estructura (${conflicts.join(', ')}). No se ha modificado.`)
  const { masterText, lastUpdated, lastReviewed, ...unknownFields } = value
  const data = {
    ...unknownFields,
    schemaVersion: 2,
    versions: {
      spanish: { masterText: '', lastUpdated: '', lastReviewed: '' },
      english: { masterText: '', lastUpdated: '', lastReviewed: '' },
    },
  }
  if (masterText || lastUpdated || lastReviewed) data.previousVersion = { masterText, lastUpdated, lastReviewed }
  return { data, migrated: true }
}

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
    const normalized = normalizeModule(name, JSON.parse(raw))
    const parsed = normalized.data
    if (!validateModule(name, parsed)) throw new Error(`${name}.json no cumple el esquema v${schemaVersions[name]}.`)
    const unknown = findUnknown(name, parsed)
    setData((prev) => ({ ...prev, [name]: parsed }))
    setRevision((prev) => ({ ...prev, [name]: raw }))
    setStates((prev) => ({ ...prev, [name]: normalized.migrated ? 'Migración pendiente' : 'Cargado' }))
    const migrationWarning = normalized.migrated
      ? name === 'cv'
        ? parsed.previousVersion
          ? 'Se conservó el CV anterior sin asignarle idioma. Elige Español o Inglés para incorporarlo; el archivo original no cambia hasta que guardes.'
          : 'El archivo anterior se preparó para las dos versiones y solo se actualizará cuando guardes.'
        : 'Las vacantes se prepararon para guardar recomendaciones de adaptación de CV. El archivo original no cambia hasta que guardes.'
      : ''
    const unknownWarning = unknown.length ? `Campos no reconocidos preservados: ${unknown.join(', ')}` : ''
    setWarnings((prev) => ({ ...prev, [name]: [migrationWarning, unknownWarning].filter(Boolean).join(' ') }))
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
    const safe = { ...next, schemaVersion: schemaVersions[name] }
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
      const unknown = findUnknown(name, safe)
      setWarnings((prev) => ({ ...prev, [name]: unknown.length ? `Campos no reconocidos preservados: ${unknown.join(', ')}` : '' }))
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
      linkedin: ['schemaVersion','published','lastUpdated','audits'], cv: ['schemaVersion','versions','previousVersion'],
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
      audit: ['id','section','action','priority','problem','reasonEvidence','profileEvidenceIds','recommendation','proposedText','date','status'],
    },
    vacancies: {
      item: ['id','role','company','location','modality','link','source','searchedAt','verifiedAt','description','salary','salaryVerified','level','jobType','assessment','matchingEvidenceIds','gaps','blockers','preference','featured','cvAdvice'],
      cvAdvice: ['recommendedVersion','reason','assessedAt','spanishAdjustments','englishAdjustments'],
    },
    priorities: { item: ['id','title','level','reason','date','section','order'] },
    cv: { version: ['masterText','lastUpdated','lastReviewed'] },
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
  if (name === 'cv') {
    inspect(data.versions, ['spanish','english'], 'versions')
    inspect(data.versions?.spanish, rules.cv.version, 'versions.spanish')
    inspect(data.versions?.english, rules.cv.version, 'versions.english')
    inspect(data.previousVersion, rules.cv.version, 'previousVersion')
  }
  if (name === 'vacancies') (data.items || []).forEach((item, index) => {
    inspect(item, rules.item, `items[${index}]`)
    inspect(item.cvAdvice, rules.cvAdvice, `items[${index}].cvAdvice`)
  })
  if (name === 'priorities') (data.items || []).forEach((item, index) => inspect(item, rules.item, `items[${index}]`))
  return unknown
}
