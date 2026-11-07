import { useEffect, useRef, useState } from 'react'
import { EMPTY, FILES } from './catalog.js'
import { detectLocalFolder } from './local-folder.js'
import {
  forgetDirectoryHandle,
  loadDirectoryHandle,
  rememberDirectoryHandle,
} from './folder-handle-store.js'

const clone = (value) => JSON.parse(JSON.stringify(value))
const entryLists = [
  'skills',
  'experience',
  'education',
  'certifications',
  'languages',
  'projects',
  'evidence',
  'learnings',
]
const schemaVersions = Object.fromEntries(
  FILES.map((name) => [name, EMPTY[name]?.schemaVersion]),
)
const isRecord = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
const isStringList = (value) =>
  Array.isArray(value) && value.every((item) => typeof item === 'string')
const optionalStrings = (value, fields) =>
  fields.every(
    (field) => value[field] === undefined || typeof value[field] === 'string',
  )
const validCVVersion = (value) =>
  isRecord(value) &&
  typeof value.masterText === 'string' &&
  typeof value.lastUpdated === 'string' &&
  typeof value.lastReviewed === 'string'
const validLegacyCV = (value) =>
  isRecord(value) &&
  value.schemaVersion === 1 &&
  typeof value.masterText === 'string' &&
  typeof value.lastUpdated === 'string' &&
  typeof value.lastReviewed === 'string'
const emptyCvAdvice = () => ({
  recommendedVersion: 'pending',
  reason: '',
  assessedAt: '',
  spanishAdjustments: [],
  englishAdjustments: [],
})
const validCvAdvice = (value) =>
  isRecord(value) &&
  ['spanish', 'english', 'both', 'pending'].includes(
    value.recommendedVersion,
  ) &&
  typeof value.reason === 'string' &&
  typeof value.assessedAt === 'string' &&
  isStringList(value.spanishAdjustments) &&
  isStringList(value.englishAdjustments)
const validVacancyItem = (item) =>
  isRecord(item) &&
  typeof item.id === 'string' &&
  optionalStrings(item, [
    'role',
    'company',
    'location',
    'modality',
    'link',
    'source',
    'searchedAt',
    'verifiedAt',
    'description',
    'salary',
    'level',
    'jobType',
    'assessment',
    'gaps',
    'blockers',
  ]) &&
  (item.matchingEvidenceIds === undefined ||
    isStringList(item.matchingEvidenceIds)) &&
  (item.salaryVerified === undefined ||
    typeof item.salaryVerified === 'boolean') &&
  (item.featured === undefined || typeof item.featured === 'boolean') &&
  (item.preference === undefined || Number.isInteger(item.preference)) &&
  (item.cvAdvice === undefined || validCvAdvice(item.cvAdvice))
const validators = {
  profile: (d) =>
    typeof d.professionalProfile === 'string' &&
    isRecord(d.objectives) &&
    ['shortTerm', 'mediumTerm', 'longTerm'].every(
      (key) => typeof d.objectives[key] === 'string',
    ) &&
    entryLists.every(
      (key) =>
        Array.isArray(d[key]) &&
        d[key].every((item) => isRecord(item) && typeof item.id === 'string'),
    ),
  linkedin: (d) =>
    isRecord(d.published) &&
    typeof d.published.headline === 'string' &&
    typeof d.published.about === 'string' &&
    [
      'experience',
      'education',
      'skills',
      'certifications',
      'projects',
      'featured',
    ].every((key) => isStringList(d.published[key])) &&
    optionalStrings(d, ['lastUpdated']) &&
    Array.isArray(d.audits) &&
    d.audits.every(
      (item) =>
        isRecord(item) &&
        typeof item.id === 'string' &&
        typeof item.section === 'string' &&
        ['alta', 'media', 'baja'].includes(item.priority) &&
        optionalStrings(item, [
          'problem',
          'reasonEvidence',
          'recommendation',
          'proposedText',
          'date',
        ]) &&
        typeof item.problem === 'string' &&
        typeof item.reasonEvidence === 'string' &&
        typeof item.recommendation === 'string' &&
        typeof item.proposedText === 'string' &&
        typeof item.date === 'string' &&
        ['pendiente', 'aplicada', 'descartada'].includes(item.status) &&
        (item.action === undefined ||
          ['corregir', 'anadir', 'aclarar'].includes(item.action)) &&
        (item.profileEvidenceIds === undefined ||
          isStringList(item.profileEvidenceIds)),
    ),
  cv: (d) =>
    isRecord(d.versions) &&
    validCVVersion(d.versions.spanish) &&
    validCVVersion(d.versions.english) &&
    (d.previousVersion === undefined || validCVVersion(d.previousVersion)),
  vacancies: (d) => Array.isArray(d.items) && d.items.every(validVacancyItem),
  priorities: (d) =>
    Array.isArray(d.items) &&
    d.items.every(
      (item) =>
        isRecord(item) &&
        typeof item.id === 'string' &&
        typeof item.title === 'string' &&
        ['alta', 'media', 'baja'].includes(item.level) &&
        typeof item.reason === 'string' &&
        typeof item.date === 'string' &&
        ['profile', 'linkedin', 'cv', 'vacancies'].includes(item.section) &&
        (item.order === undefined || Number.isInteger(item.order)),
    ),
}
export const validateModule = (name, value) => {
  try {
    return Boolean(
      Number.isInteger(schemaVersions[name]) &&
      isRecord(value) &&
      value.schemaVersion === schemaVersions[name] &&
      validators[name]?.(value),
    )
  } catch {
    return false
  }
}

function templateMessage(name, detail) {
  return `${name}.json ${detail} Revisa templates/${name}.json y conserva el formato y schemaVersion de la plantilla. El archivo original no se ha modificado.`
}

const hasMeaningfulValue = (entry) => {
  if (typeof entry === 'string') return Boolean(entry.trim())
  if (typeof entry === 'boolean') return entry
  if (typeof entry === 'number') return Number.isFinite(entry)
  if (Array.isArray(entry)) return entry.some(hasMeaningfulValue)
  if (isRecord(entry))
    return Object.entries(entry).some(
      ([key, item]) => key !== 'id' && hasMeaningfulValue(item),
    )
  return false
}

export function hasModuleContent(name, value) {
  let hasContent
  if (name === 'profile')
    hasContent = Boolean(
      value.professionalProfile.trim() ||
      ['shortTerm', 'mediumTerm', 'longTerm'].some((key) =>
        value.objectives[key].trim(),
      ) ||
      entryLists.some((key) => hasMeaningfulValue(value[key])),
    )
  else if (name === 'linkedin')
    hasContent = Boolean(
      value.published.headline.trim() ||
      value.published.about.trim() ||
      [
        'experience',
        'education',
        'skills',
        'certifications',
        'projects',
        'featured',
      ].some((key) => hasMeaningfulValue(value.published[key])) ||
      value.lastUpdated?.trim() ||
      value.audits.some((audit) =>
        [
          'problem',
          'reasonEvidence',
          'recommendation',
          'proposedText',
          'date',
          'profileEvidenceIds',
        ].some((key) => hasMeaningfulValue(audit[key])),
      ),
    )
  else if (name === 'cv')
    hasContent = Boolean(
      ['spanish', 'english'].some(
        (key) =>
          value.versions[key].masterText.trim() ||
          value.versions[key].lastUpdated.trim() ||
          value.versions[key].lastReviewed.trim(),
      ) || value.previousVersion?.masterText?.trim(),
    )
  else if (name === 'vacancies')
    hasContent = value.items.some(
      (item) =>
        [
          'role',
          'company',
          'location',
          'modality',
          'link',
          'source',
          'searchedAt',
          'verifiedAt',
          'description',
          'salary',
          'level',
          'jobType',
          'assessment',
          'gaps',
          'blockers',
          'matchingEvidenceIds',
        ].some((key) => hasMeaningfulValue(item[key])) ||
        item.featured === true ||
        Number.isInteger(item.preference),
    )
  else
    hasContent = value.items.some((item) =>
      ['title', 'reason', 'date'].some((key) => hasMeaningfulValue(item[key])),
    )
  return Boolean(hasContent || findUnknown(name, value).length)
}

export function normalizeModule(name, value) {
  if (
    name === 'vacancies' &&
    value?.schemaVersion === 1 &&
    Array.isArray(value.items)
  ) {
    return {
      data: {
        ...value,
        schemaVersion: 2,
        items: value.items.map((item) =>
          item && typeof item === 'object' && !Array.isArray(item)
            ? {
                ...item,
                cvAdvice: Object.hasOwn(item, 'cvAdvice')
                  ? item.cvAdvice
                  : emptyCvAdvice(),
              }
            : item,
        ),
      },
      migrated: true,
    }
  }
  if (name !== 'cv' || value?.schemaVersion !== 1 || !validLegacyCV(value))
    return { data: value, migrated: false }
  const conflicts = ['versions', 'previousVersion'].filter((key) =>
    Object.hasOwn(value, key),
  )
  if (conflicts.length)
    throw new Error(
      `cv.json contiene campos que pueden entrar en conflicto con la nueva estructura (${conflicts.join(', ')}). No se ha modificado.`,
    )
  const { masterText, lastUpdated, lastReviewed, ...unknownFields } = value
  const data = {
    ...unknownFields,
    schemaVersion: 2,
    versions: {
      spanish: { masterText: '', lastUpdated: '', lastReviewed: '' },
      english: { masterText: '', lastUpdated: '', lastReviewed: '' },
    },
  }
  if (masterText || lastUpdated || lastReviewed)
    data.previousVersion = { masterText, lastUpdated, lastReviewed }
  return { data, migrated: true }
}

export function useStorageState() {
  const [folder, setFolderState] = useState(null)
  const folderRef = useRef(null)
  function setFolder(value) {
    folderRef.current = value
    setFolderState(value)
  }
  const [rememberedFolder, setRememberedFolder] = useState(null)
  const [rememberFailed, setRememberFailed] = useState(false)
  const [restoreStatus, setRestoreStatus] = useState('checking')
  const [restoreResult, setRestoreResult] = useState(null)
  const [data, setData] = useState(() =>
    Object.fromEntries(FILES.map((name) => [name, clone(EMPTY[name])])),
  )
  const [states, setStates] = useState({})
  const [warnings, setWarnings] = useState({})
  const [revision, setRevision] = useState({})

  async function readModule(name, handle = folder) {
    const fileHandle = await handle.getFileHandle(`${name}.json`)
    const file = await fileHandle.getFile()
    const raw = await file.text()
    if (!raw.trim()) throw new Error(templateMessage(name, 'está vacío.'))
    let source
    try {
      source = JSON.parse(raw)
    } catch {
      throw new Error(templateMessage(name, 'no contiene JSON válido.'))
    }
    let normalized
    try {
      normalized = normalizeModule(name, source)
    } catch (error) {
      throw new Error(
        templateMessage(name, `no se pudo preparar (${error.message}).`),
      )
    }
    const parsed = normalized.data
    if (!validateModule(name, parsed))
      throw new Error(
        templateMessage(
          name,
          `no coincide con el esquema v${schemaVersions[name]}.`,
        ),
      )
    const unknown = findUnknown(name, parsed)
    setData((prev) => ({ ...prev, [name]: parsed }))
    setRevision((prev) => ({ ...prev, [name]: raw }))
    setStates((prev) => ({
      ...prev,
      [name]: normalized.migrated ? 'Migración pendiente' : 'Cargado',
    }))
    const migrationWarning = normalized.migrated
      ? name === 'cv'
        ? parsed.previousVersion
          ? 'Se conservó el CV anterior sin asignarle idioma. Elige Español o Inglés para incorporarlo; el archivo original no cambia hasta que guardes.'
          : 'El archivo anterior se preparó para las dos versiones y solo se actualizará cuando guardes.'
        : 'Las vacantes se prepararon para guardar recomendaciones de adaptación de CV. El archivo original no cambia hasta que guardes.'
      : ''
    const unknownWarning = unknown.length
      ? `Campos no reconocidos preservados: ${unknown.join(', ')}`
      : ''
    setWarnings((prev) => ({
      ...prev,
      [name]: [migrationWarning, unknownWarning].filter(Boolean).join(' '),
    }))
    return parsed
  }

  async function scanFolder(handle = folder) {
    const missing = []
    const invalid = []
    let containsData = false
    for (const name of FILES) {
      try {
        const value = await readModule(name, handle)
        containsData ||= hasModuleContent(name, value)
      } catch (error) {
        if (error?.name === 'NotFoundError') {
          missing.push(name)
          setStates((prev) => ({ ...prev, [name]: 'Falta plantilla' }))
          setWarnings((prev) => ({
            ...prev,
            [name]: `${name}.json todavía no está en la carpeta. Puedes preparar solo los archivos que faltan.`,
          }))
        } else {
          invalid.push({
            name,
            message: error.message || templateMessage(name, 'no se pudo leer.'),
          })
          setStates((prev) => ({ ...prev, [name]: 'Revisar plantilla' }))
          setWarnings((prev) => ({
            ...prev,
            [name]: error.message || templateMessage(name, 'no se pudo leer.'),
          }))
        }
      }
    }
    return {
      missing,
      invalid,
      emptyData: missing.length === 0 && invalid.length === 0 && !containsData,
    }
  }

  useEffect(() => {
    let active = true
    async function restoreFolder() {
      try {
        const handle =
          (await detectLocalFolder()) || (await loadDirectoryHandle())
        if (!active) return
        if (!handle) {
          setRestoreStatus('no-saved-folder')
          return
        }
        setRememberedFolder(handle)
        const permission =
          typeof handle.queryPermission === 'function'
            ? await handle.queryPermission({ mode: 'readwrite' })
            : 'granted'
        if (!active) return
        if (permission !== 'granted') {
          setRestoreStatus('needs-permission')
          return
        }

        setData(
          Object.fromEntries(FILES.map((name) => [name, clone(EMPTY[name])])),
        )
        setStates({})
        setWarnings({})
        setRevision({})
        const result = await scanFolder(handle)
        if (!active) return
        setFolder(handle)
        setRestoreResult(result)
        setRestoreStatus('restored')
      } catch {
        if (!active) return
        setRestoreStatus('storage-error')
      }
    }
    restoreFolder()
    const timer = setInterval(async () => {
      if (
        !active ||
        folderRef.current ||
        sessionStorage.getItem('careerkit-disconnected')
      )
        return
      const handle = await detectLocalFolder()
      if (!active || !handle) return
      clearInterval(timer)
      const result = await scanFolder(handle)
      if (!active) return
      setFolder(handle)
      setRestoreResult(result)
      setRestoreStatus('restored')
    }, 3000)
    return () => {
      clearInterval(timer)
      active = false
    }
  }, [])

  async function connect({ selectAnother = false } = {}) {
    sessionStorage.removeItem('careerkit-disconnected')
    if (!selectAnother && rememberedFolder) {
      return {
        ...(await connectHandle(rememberedFolder, { requestPermission: true })),
        reconnected: true,
      }
    }
    if (!window.showDirectoryPicker) return { fallback: true }
    try {
      const handle = await window.showDirectoryPicker({
        mode: 'readwrite',
        id: 'careerkit-private-data',
      })
      return connectHandle(handle, { requestPermission: true })
    } catch (error) {
      if (error.name === 'AbortError') return { cancelled: true }
      return { error: error.message }
    }
  }

  async function connectHandle(handle, { requestPermission: mayRequest }) {
    try {
      const permission =
        mayRequest && typeof handle.requestPermission === 'function'
          ? await handle.requestPermission({ mode: 'readwrite' })
          : typeof handle.queryPermission === 'function'
            ? await handle.queryPermission({ mode: 'readwrite' })
            : 'granted'
      if (permission !== 'granted') {
        setRestoreStatus('needs-permission')
        return { permissionDenied: true }
      }

      let persistenceError = false
      try {
        await rememberDirectoryHandle(handle)
      } catch {
        persistenceError = true
        try {
          await forgetDirectoryHandle()
        } catch {
          // The status message below tells the user the old selection may remain.
        }
      }
      setRememberedFolder(persistenceError ? null : handle)
      setRememberFailed(persistenceError)
      setData(
        Object.fromEntries(FILES.map((name) => [name, clone(EMPTY[name])])),
      )
      setStates({})
      setWarnings({})
      setRevision({})
      const result = await scanFolder(handle)
      setFolder(handle)
      setRestoreResult(null)
      setRestoreStatus('connected')
      return {
        connected: true,
        persistenceError,
        ...result,
      }
    } catch (error) {
      if (error?.name === 'AbortError') return { cancelled: true }
      return { error: error?.message || 'No se pudo abrir la carpeta.' }
    }
  }

  async function recheck() {
    if (!folder) return { error: 'Conecta primero la carpeta de datos.' }
    return scanFolder(folder)
  }

  async function prepareMissing(names = []) {
    if (!folder) return { error: 'Conecta primero la carpeta de datos.' }
    const created = []
    for (const name of [...new Set(names)]) {
      if (!FILES.includes(name)) continue
      try {
        await folder.getFileHandle(`${name}.json`)
        continue
      } catch (error) {
        if (error?.name !== 'NotFoundError') return { error: error.message }
      }
      try {
        const handle = await folder.getFileHandle(`${name}.json`, {
          create: true,
        })
        const current = await handle.getFile()
        if (current.size > 0) continue
        const writable = await handle.createWritable()
        await writable.write(`${JSON.stringify(EMPTY[name], null, 2)}\n`)
        await writable.close()
        created.push(name)
      } catch (error) {
        return { error: error.message, created }
      }
    }
    return { created, ...(await scanFolder(folder)) }
  }

  async function save(name, next) {
    const safe = { ...next, schemaVersion: schemaVersions[name] }
    if (!validateModule(name, safe))
      return {
        error: templateMessage(
          name,
          `no coincide con el esquema v${schemaVersions[name]}.`,
        ),
      }
    if (!folder) {
      setData((prev) => ({ ...prev, [name]: safe }))
      setStates((prev) => ({ ...prev, [name]: 'Pendiente de guardar' }))
      return { fallback: true }
    }
    if (
      ['Falta plantilla', 'Revisar plantilla'].includes(states[name]) ||
      revision[name] === undefined
    )
      return { needsReview: true }
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
      setData((prev) => ({ ...prev, [name]: safe }))
      setRevision((prev) => ({ ...prev, [name]: raw }))
      setStates((prev) => ({ ...prev, [name]: 'Guardado' }))
      const unknown = findUnknown(name, safe)
      setWarnings((prev) => ({
        ...prev,
        [name]: unknown.length
          ? `Campos no reconocidos preservados: ${unknown.join(', ')}`
          : '',
      }))
      return { saved: true }
    } catch (error) {
      if (error?.name === 'NotFoundError') {
        setStates((prev) => ({ ...prev, [name]: 'Falta plantilla' }))
        setWarnings((prev) => ({
          ...prev,
          [name]: `${name}.json ya no está en la carpeta. No se guardaron los cambios.`,
        }))
        return { needsReview: true }
      }
      setStates((prev) => ({ ...prev, [name]: 'Revisar plantilla' }))
      setWarnings((prev) => ({
        ...prev,
        [name]: `${name}.json no se pudo guardar. Revisa templates/${name}.json y los permisos de la carpeta. ${error.message}`,
      }))
      return {
        error: `${name}.json no se pudo guardar. Revisa templates/${name}.json y los permisos de la carpeta.`,
      }
    }
  }

  async function reload(name) {
    try {
      await readModule(name)
      return { ok: true }
    } catch (error) {
      const missing = error?.name === 'NotFoundError'
      setStates((prev) => ({
        ...prev,
        [name]: missing ? 'Falta plantilla' : 'Revisar plantilla',
      }))
      setWarnings((prev) => ({
        ...prev,
        [name]: missing
          ? `${name}.json no está en la carpeta.`
          : error.message || templateMessage(name, 'no se pudo leer.'),
      }))
      return { error: error.message }
    }
  }

  async function disconnect(clear) {
    sessionStorage.setItem('careerkit-disconnected', 'true')
    let persistenceCleared = true
    try {
      await forgetDirectoryHandle()
    } catch {
      persistenceCleared = false
    }
    setRememberedFolder(null)
    setRememberFailed(!persistenceCleared)
    setFolder(null)
    setRestoreResult(null)
    setRestoreStatus('no-saved-folder')
    if (clear) {
      setData(
        Object.fromEntries(FILES.map((name) => [name, clone(EMPTY[name])])),
      )
      setStates({})
      setWarnings({})
      setRevision({})
    }
    return { persistenceCleared }
  }

  return {
    folder,
    restoreStatus,
    restoreResult,
    hasRememberedFolder: Boolean(rememberedFolder),
    rememberFailed,
    data,
    states,
    warnings,
    revision,
    connect,
    recheck,
    prepareMissing,
    save,
    reload,
    disconnect,
    setStates,
    setWarnings,
  }
}

function findUnknown(name, data) {
  const known = {
    profile: [
      'schemaVersion',
      'professionalProfile',
      'objectives',
      'skills',
      'experience',
      'education',
      'certifications',
      'languages',
      'projects',
      'evidence',
      'learnings',
    ],
    linkedin: ['schemaVersion', 'published', 'lastUpdated', 'audits'],
    cv: ['schemaVersion', 'versions', 'previousVersion'],
    vacancies: ['schemaVersion', 'items'],
    priorities: ['schemaVersion', 'items'],
  }[name]
  const unknown = Object.keys(data).filter((key) => !known.includes(key))
  const rules = {
    profile: {
      root: [
        'objectives',
        'skills',
        'experience',
        'education',
        'certifications',
        'languages',
        'projects',
        'evidence',
        'learnings',
      ],
      objectives: ['shortTerm', 'mediumTerm', 'longTerm'],
      entry: [
        'id',
        'title',
        'name',
        'organization',
        'dates',
        'actions',
        'results',
        'evidenceIds',
        'confirmed',
        'cvEvidence',
        'onLinkedIn',
        'internal',
      ],
    },
    linkedin: {
      published: [
        'headline',
        'about',
        'experience',
        'education',
        'skills',
        'certifications',
        'projects',
        'featured',
      ],
      audit: [
        'id',
        'section',
        'action',
        'priority',
        'problem',
        'reasonEvidence',
        'profileEvidenceIds',
        'recommendation',
        'proposedText',
        'date',
        'status',
      ],
    },
    vacancies: {
      item: [
        'id',
        'role',
        'company',
        'location',
        'modality',
        'link',
        'source',
        'searchedAt',
        'verifiedAt',
        'description',
        'salary',
        'salaryVerified',
        'level',
        'jobType',
        'assessment',
        'matchingEvidenceIds',
        'gaps',
        'blockers',
        'preference',
        'featured',
        'cvAdvice',
      ],
      cvAdvice: [
        'recommendedVersion',
        'reason',
        'assessedAt',
        'spanishAdjustments',
        'englishAdjustments',
      ],
    },
    priorities: {
      item: ['id', 'title', 'level', 'reason', 'date', 'section', 'order'],
    },
    cv: { version: ['masterText', 'lastUpdated', 'lastReviewed'] },
  }[name]
  const inspect = (value, allowed, path) => {
    if (!value || typeof value !== 'object' || Array.isArray(value) || !allowed)
      return
    for (const key of Object.keys(value))
      if (!allowed.includes(key)) unknown.push(`${path}.${key}`)
  }
  if (name === 'profile') {
    inspect(data.objectives, rules.objectives, 'objectives')
    for (const key of entryLists)
      (data[key] || []).forEach((item, index) =>
        inspect(item, rules.entry, `${key}[${index}]`),
      )
  }
  if (name === 'linkedin') {
    inspect(data.published, rules.published, 'published')
    ;(data.audits || []).forEach((item, index) =>
      inspect(item, rules.audit, `audits[${index}]`),
    )
  }
  if (name === 'cv') {
    inspect(data.versions, ['spanish', 'english'], 'versions')
    inspect(data.versions?.spanish, rules.version, 'versions.spanish')
    inspect(data.versions?.english, rules.version, 'versions.english')
    inspect(data.previousVersion, rules.version, 'previousVersion')
  }
  if (name === 'vacancies')
    (data.items || []).forEach((item, index) => {
      inspect(item, rules.item, `items[${index}]`)
      inspect(item.cvAdvice, rules.cvAdvice, `items[${index}].cvAdvice`)
    })
  if (name === 'priorities')
    (data.items || []).forEach((item, index) =>
      inspect(item, rules.item, `items[${index}]`),
    )
  return unknown
}
