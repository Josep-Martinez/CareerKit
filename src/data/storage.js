import { useEffect, useRef, useState } from 'react'
import { EMPTY, FILES } from './catalog.js'
import { detectLocalFolder } from './local-folder.js'
import {
  getFolderPreference,
  saveFolderPreference,
} from './folder-preference.js'
import {
  findUnknownProfileFields,
  hasProfileContent,
} from './profile-fields.js'
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
const readTextFile = (file) => {
  if (typeof file.text === 'function') return file.text()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = () => resolve(String(reader.result || ''))
    reader.readAsText(file)
  })
}
const optionalStrings = (value, fields) =>
  fields.every(
    (field) => value[field] === undefined || typeof value[field] === 'string',
  )
const optionalContext = (value, textFields, listFields, booleanFields = []) =>
  value === undefined ||
  (isRecord(value) &&
    optionalStrings(value, textFields) &&
    listFields.every(
      (field) => value[field] === undefined || isStringList(value[field]),
    ) &&
    booleanFields.every(
      (field) =>
        value[field] === undefined || typeof value[field] === 'boolean',
    ))
const linkedinEntryFields = {
  experience: {
    text: [
      'id',
      'title',
      'company',
      'employmentType',
      'location',
      'workplaceType',
      'dates',
      'description',
    ],
    lists: ['skills'],
    booleans: ['descriptionTruncated'],
  },
  education: {
    text: [
      'id',
      'institution',
      'degree',
      'fieldOfStudy',
      'dates',
      'grade',
      'activities',
      'description',
    ],
    lists: ['skills'],
    booleans: ['descriptionTruncated'],
  },
  languages: {
    text: ['id', 'language', 'proficiency', 'details'],
    lists: [],
  },
  certifications: {
    text: [
      'id',
      'name',
      'issuer',
      'issueDate',
      'expirationDate',
      'credentialId',
      'credentialUrl',
      'description',
    ],
    lists: ['skills'],
    booleans: ['descriptionTruncated'],
  },
  projects: {
    text: ['id', 'name', 'associatedWith', 'dates', 'description', 'url'],
    lists: ['skills'],
    booleans: ['descriptionTruncated'],
  },
  featured: {
    text: ['id', 'title', 'description', 'url', 'mediaType'],
    lists: [],
    booleans: ['descriptionTruncated'],
  },
}
const validLinkedInEntry = (section, item) => {
  if (typeof item === 'string') return true
  const fields = linkedinEntryFields[section]
  return Boolean(
    fields &&
    isRecord(item) &&
    Object.keys(item).length > 0 &&
    optionalStrings(item, fields.text) &&
    fields.lists.every(
      (field) => item[field] === undefined || isStringList(item[field]),
    ) &&
    (fields.booleans || []).every(
      (field) => item[field] === undefined || typeof item[field] === 'boolean',
    ),
  )
}
const isLinkedInList = (section, value) =>
  Array.isArray(value) &&
  value.every((item) => validLinkedInEntry(section, item))
const isLinkedInAdditionalSections = (value) =>
  value === undefined ||
  (Array.isArray(value) &&
    value.every(
      (item) =>
        isRecord(item) &&
        typeof item.id === 'string' &&
        item.id.length > 0 &&
        typeof item.title === 'string' &&
        typeof item.content === 'string',
    ))
const validLinkedInVariant = (value) =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  value.id.length > 0 &&
  typeof value.language === 'string' &&
  value.language.length > 0 &&
  optionalStrings(value, ['name', 'lastUpdated']) &&
  (value.publicationStatus === undefined ||
    ['draft', 'published'].includes(value.publicationStatus)) &&
  typeof value.headline === 'string' &&
  typeof value.about === 'string' &&
  isLinkedInAdditionalSections(value.additionalSections) &&
  (value.languages === undefined ||
    isLinkedInList('languages', value.languages)) &&
  ['experience', 'education', 'certifications', 'projects', 'featured'].every(
    (key) => isLinkedInList(key, value[key]),
  ) &&
  isStringList(value.skills)
const validLinkedInLanguageSync = (value) =>
  value === undefined ||
  (isRecord(value) &&
    ['current', 'pending'].includes(value.status) &&
    (value.sourceLanguage === undefined ||
      ['es', 'en'].includes(value.sourceLanguage)))
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
const validProfileEntry = (item) =>
  isRecord(item) &&
  typeof item.id === 'string' &&
  optionalStrings(item, [
    'type',
    'title',
    'name',
    'organization',
    'dates',
    'actions',
    'results',
    'description',
    'grade',
    'status',
    'proficiency',
    'situation',
    'task',
  ]) &&
  (item.tags === undefined || isStringList(item.tags)) &&
  (item.evidenceIds === undefined || isStringList(item.evidenceIds)) &&
  ['confirmed', 'cvEvidence', 'onLinkedIn', 'internal'].every(
    (field) => item[field] === undefined || typeof item[field] === 'boolean',
  )
const validAdaptedCv = (value) =>
  isRecord(value) &&
  typeof value.text === 'string' &&
  /\S/.test(value.text) &&
  ['es', 'en'].includes(value.language) &&
  (value.layout === undefined ||
    ['single-column', 'two-columns'].includes(value.layout))
const validLinkedInContentArticle = (item) => {
  if (!isRecord(item)) return false
  let url
  try {
    url = new URL(item.url)
  } catch {
    return false
  }
  return (
    typeof item.id === 'string' &&
    item.id.length > 0 &&
    typeof item.title === 'string' &&
    Boolean(item.title.trim()) &&
    typeof item.source === 'string' &&
    Boolean(item.source.trim()) &&
    ['http:', 'https:'].includes(url.protocol) &&
    optionalStrings(item, [
      'publishedAt',
      'verifiedAt',
      'relevance',
      'opinion',
    ]) &&
    (item.verified === undefined || typeof item.verified === 'boolean') &&
    (item.topics === undefined || isStringList(item.topics)) &&
    ['pending', 'accepted', 'rejected'].includes(item.status)
  )
}
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
  (item.cvAdvice === undefined || validCvAdvice(item.cvAdvice)) &&
  (item.adaptedCv === undefined || validAdaptedCv(item.adaptedCv))
const validators = {
  profile: (d) =>
    typeof d.professionalProfile === 'string' &&
    optionalContext(
      d.personalContext,
      [
        'aboutMe',
        'motivations',
        'thinkingStyle',
        'learningStyle',
        'workStyle',
        'preferredEnvironment',
        'boundaries',
      ],
      ['values', 'interests', 'strengths', 'growthAreas'],
    ) &&
    optionalContext(
      d.careerPreferences,
      ['location', 'conditions'],
      ['roleFamilies', 'tasks', 'industries', 'workModes', 'avoid'],
      ['internal'],
    ) &&
    optionalContext(
      d.contentDirection,
      ['tone', 'versionPreference'],
      ['themes', 'viewpoints', 'avoid', 'languages'],
      ['internal'],
    ) &&
    isRecord(d.objectives) &&
    ['shortTerm', 'mediumTerm', 'longTerm'].every(
      (key) => typeof d.objectives[key] === 'string',
    ) &&
    entryLists.every(
      (key) => Array.isArray(d[key]) && d[key].every(validProfileEntry),
    ),
  linkedin: (d) =>
    isRecord(d.published) &&
    optionalStrings(d.published, ['name', 'language']) &&
    isLinkedInAdditionalSections(d.published.additionalSections) &&
    (d.published.variants === undefined ||
      (Array.isArray(d.published.variants) &&
        d.published.variants.every(validLinkedInVariant))) &&
    (d.published.languages === undefined ||
      isLinkedInList('languages', d.published.languages)) &&
    typeof d.published.headline === 'string' &&
    typeof d.published.about === 'string' &&
    ['experience', 'education', 'certifications', 'projects', 'featured'].every(
      (key) => isLinkedInList(key, d.published[key]),
    ) &&
    isStringList(d.published.skills) &&
    validLinkedInLanguageSync(d.languageSync) &&
    optionalStrings(d, ['lastUpdated']) &&
    Array.isArray(d.audits) &&
    d.audits.every(
      (item) =>
        isRecord(item) &&
        typeof item.id === 'string' &&
        typeof item.section === 'string' &&
        (item.sectionId === undefined ||
          (item.section === 'additionalSections' &&
            typeof item.sectionId === 'string' &&
            item.sectionId.length > 0)) &&
        (item.sectionLabel === undefined ||
          typeof item.sectionLabel === 'string') &&
        (item.variantId === undefined ||
          (typeof item.variantId === 'string' && item.variantId.length > 0)) &&
        (item.targetEntryId === undefined ||
          (typeof item.targetEntryId === 'string' &&
            item.targetEntryId.length > 0)) &&
        (item.targetEntryIndex === undefined ||
          (Number.isInteger(item.targetEntryIndex) &&
            item.targetEntryIndex >= 0)) &&
        (item.targetField === undefined ||
          (typeof item.targetField === 'string' &&
            item.targetField.length > 0)) &&
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
  'linkedin-content': (d) =>
    Array.isArray(d.articles) && d.articles.every(validLinkedInContentArticle),
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

const hasLocalizedProfileContent = (variants = []) =>
  variants.some((variant) => {
    const content = Object.fromEntries(
      Object.entries(variant).filter(
        ([key]) =>
          !['id', 'language', 'publicationStatus', 'lastUpdated'].includes(key),
      ),
    )
    return Boolean(variant.lastUpdated?.trim()) || hasMeaningfulValue(content)
  })

export function hasModuleContent(name, value) {
  let hasContent
  if (name === 'profile') hasContent = hasProfileContent(value)
  else if (name === 'linkedin')
    hasContent = Boolean(
      value.published.name?.trim() ||
      value.published.headline.trim() ||
      value.published.about.trim() ||
      hasLocalizedProfileContent(value.published.variants) ||
      [
        'experience',
        'education',
        'languages',
        'skills',
        'certifications',
        'projects',
        'featured',
        'additionalSections',
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
          'adaptedCv',
        ].some((key) => hasMeaningfulValue(item[key])) ||
        item.featured === true ||
        Number.isInteger(item.preference),
    )
  else if (name === 'priorities')
    hasContent = value.items.some((item) =>
      ['title', 'reason', 'date'].some((key) => hasMeaningfulValue(item[key])),
    )
  else if (name === 'linkedin-content')
    hasContent = value.articles.some((article) =>
      [
        'title',
        'source',
        'url',
        'publishedAt',
        'verified',
        'verifiedAt',
        'relevance',
        'topics',
        'opinion',
      ].some((key) => hasMeaningfulValue(article[key])),
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
  const [fallbackConnected, setFallbackConnected] = useState(false)
  const folderRef = useRef(null)
  const folderPreference = useRef(getFolderPreference())
  const connectingRef = useRef(true)
  const rememberedRef = useRef(null)
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
        const preference = folderPreference.current
        if (preference === 'disconnected' || preference === 'files') {
          setRestoreStatus('no-saved-folder')
          return
        }
        const saved =
          preference === 'local' ? null : await loadDirectoryHandle()
        const handle =
          saved || (preference === 'picked' ? null : await detectLocalFolder())
        if (!active) return
        if (!handle) {
          setRestoreStatus('no-saved-folder')
          return
        }
        rememberedRef.current = saved || null
        setRememberedFolder(saved || null)
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
      } finally {
        if (active) connectingRef.current = false
      }
    }
    restoreFolder()
    const timer = setInterval(async () => {
      if (
        !active ||
        connectingRef.current ||
        folderRef.current ||
        rememberedRef.current ||
        ['disconnected', 'picked', 'files'].includes(folderPreference.current)
      )
        return
      const handle = await detectLocalFolder()
      if (
        !active ||
        !handle ||
        folderRef.current ||
        connectingRef.current ||
        rememberedRef.current ||
        ['disconnected', 'picked', 'files'].includes(folderPreference.current)
      )
        return
      connectingRef.current = true
      setRestoreStatus('checking')
      try {
        const result = await scanFolder(handle)
        if (!active) return
        setFolder(handle)
        setRestoreResult(result)
        setRestoreStatus('restored')
      } catch {
        if (active) setRestoreStatus('storage-error')
      } finally {
        if (active) connectingRef.current = false
      }
    }, 3000)
    return () => {
      clearInterval(timer)
      active = false
    }
  }, [])

  async function connect({ selectAnother = false, useLocal = false } = {}) {
    if (connectingRef.current) return { cancelled: true }
    connectingRef.current = true
    try {
      if (!selectAnother && !useLocal && rememberedFolder) {
        return {
          ...(await connectHandle(rememberedFolder, {
            requestPermission: true,
          })),
          reconnected: true,
        }
      }
      if (useLocal || !window.showDirectoryPicker) {
        const local = await detectLocalFolder()
        if (!local)
          return useLocal ? { localMissing: true } : { fallback: true }
        return await connectHandle(local, { requestPermission: false })
      }
      const handle = await window.showDirectoryPicker({
        mode: 'readwrite',
        id: 'careerkit-private-data',
      })
      if (handle.name !== 'private-data')
        return { wrongFolder: true, selectedName: handle.name }
      return await connectHandle(handle, { requestPermission: true })
    } catch (error) {
      if (error.name === 'AbortError') return { cancelled: true }
      return { error: error.message }
    } finally {
      connectingRef.current = false
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
        if (rememberedFolder === handle) setRestoreStatus('needs-permission')
        return { permissionDenied: true }
      }

      let persistenceError = false
      try {
        if (!handle.local) await rememberDirectoryHandle(handle)
      } catch {
        persistenceError = true
        try {
          await forgetDirectoryHandle()
        } catch {
          // The status message below tells the user the old selection may remain.
        }
      }
      const preference = handle.local ? 'local' : 'picked'
      folderPreference.current = preference
      const preferenceSaved = saveFolderPreference(preference)
      rememberedRef.current = persistenceError || handle.local ? null : handle
      setRememberedFolder(rememberedRef.current)
      persistenceError ||= !preferenceSaved
      setRememberFailed(persistenceError)
      setData(
        Object.fromEntries(FILES.map((name) => [name, clone(EMPTY[name])])),
      )
      setStates({})
      setWarnings({})
      setRevision({})
      const result = await scanFolder(handle)
      setFolder(handle)
      setFallbackConnected(false)
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

  async function connectFiles(files) {
    const selected = new Map()
    const duplicates = new Set()
    for (const file of Array.from(files || [])) {
      const module = FILES.find(
        (name) => file.name.toLowerCase() === `${name}.json`,
      )
      if (!module) continue
      if (selected.has(module)) duplicates.add(module)
      else selected.set(module, file)
    }
    if (!selected.size) return { error: 'noRecognizedFiles' }

    const nextData = fallbackConnected
      ? { ...data }
      : Object.fromEntries(FILES.map((name) => [name, clone(EMPTY[name])]))
    const nextStates = fallbackConnected ? { ...states } : {}
    const nextWarnings = fallbackConnected ? { ...warnings } : {}
    const nextRevision = fallbackConnected ? { ...revision } : {}
    const loaded = []
    const invalid = []
    const missing = []

    for (const name of FILES) {
      const file = selected.get(name)
      if (!file) {
        if (!fallbackConnected) {
          missing.push(name)
          nextStates[name] = 'Falta plantilla'
          nextWarnings[name] =
            `${name}.json no se seleccionó. Puedes abrirlo después desde la carpeta private-data.`
        }
        continue
      }
      if (duplicates.has(name)) {
        const message = `Se seleccionó más de un archivo llamado ${name}.json. Elige solo el archivo de private-data.`
        invalid.push({ name, message })
        nextStates[name] = 'Revisar plantilla'
        nextWarnings[name] = message
        continue
      }

      try {
        const raw = await readTextFile(file)
        if (!raw.trim()) throw new Error(templateMessage(name, 'está vacío.'))
        let source
        try {
          source = JSON.parse(raw)
        } catch {
          throw new Error(templateMessage(name, 'no contiene JSON válido.'))
        }
        const normalized = normalizeModule(name, source)
        if (!validateModule(name, normalized.data))
          throw new Error(
            templateMessage(
              name,
              `no coincide con el esquema v${schemaVersions[name]}.`,
            ),
          )

        nextData[name] = normalized.data
        nextStates[name] = normalized.migrated
          ? 'Migración pendiente'
          : 'Cargado'
        nextRevision[name] = raw
        const unknown = findUnknown(name, normalized.data)
        nextWarnings[name] = unknown.length
          ? `Campos no reconocidos preservados: ${unknown.join(', ')}`
          : ''
        loaded.push(name)
      } catch (error) {
        const message =
          error.message || templateMessage(name, 'no se pudo leer.')
        invalid.push({ name, message })
        nextStates[name] = 'Revisar plantilla'
        nextWarnings[name] = message
      }
    }

    setData(nextData)
    setStates(nextStates)
    setWarnings(nextWarnings)
    setRevision(nextRevision)
    folderPreference.current = 'files'
    saveFolderPreference('files')
    setFolder(null)
    setFallbackConnected(true)
    return { connected: true, loaded, invalid, missing }
  }

  function markFallbackSaved(name) {
    setStates((prev) => ({ ...prev, [name]: 'Guardado manual' }))
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
    function conflict(raw) {
      let external
      try {
        const candidate = normalizeModule(name, JSON.parse(raw)).data
        if (validateModule(name, candidate)) external = candidate
      } catch {
        // Keep an invalid external file intact and allow manual recovery.
      }
      setStates((prev) => ({ ...prev, [name]: 'Conflicto externo' }))
      setWarnings((prev) => ({
        ...prev,
        [name]: `No se guardó el cambio porque ${name}.json cambió antes. Tu edición sigue en el formulario. Puedes cargar la versión actual y volver a aplicar lo que quieras conservar.`,
      }))
      return { conflict: true, external }
    }

    try {
      const handle = await folder.getFileHandle(`${name}.json`)
      const file = await handle.getFile()
      const current = await file.text()
      if (current !== revision[name]) return conflict(current)
      setStates((prev) => ({ ...prev, [name]: 'Guardando' }))
      const writable = await handle.createWritable()
      const raw = JSON.stringify(safe, null, 2) + '\n'
      try {
        await writable.write(raw)
        if (!folder.local) {
          const latest = await (await handle.getFile()).text()
          if (latest !== current) {
            await writable.abort().catch(() => {})
            return conflict(latest)
          }
        }
        await writable.close()
      } catch (error) {
        await writable.abort?.().catch(() => {})
        throw error
      }
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
      if (error?.name === 'ConflictError') {
        let latest
        try {
          const handle = await folder.getFileHandle(`${name}.json`)
          latest = await (await handle.getFile()).text()
        } catch {
          // The file may have moved or changed again after the conflict.
        }
        return conflict(latest)
      }
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
      const data = await readModule(name)
      return { ok: true, data }
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
    folderPreference.current = 'disconnected'
    let persistenceCleared = saveFolderPreference('disconnected')
    try {
      await forgetDirectoryHandle()
    } catch {
      persistenceCleared = false
    }
    rememberedRef.current = null
    setRememberedFolder(null)
    setRememberFailed(!persistenceCleared)
    setFolder(null)
    setFallbackConnected(false)
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
    fallbackConnected,
    restoreStatus,
    restoreResult,
    hasRememberedFolder: Boolean(rememberedFolder),
    rememberFailed,
    data,
    states,
    warnings,
    revision,
    connect,
    connectFiles,
    recheck,
    prepareMissing,
    save,
    reload,
    disconnect,
    markFallbackSaved,
    setStates,
    setWarnings,
  }
}

function findUnknown(name, data) {
  if (name === 'profile') return findUnknownProfileFields(data)

  const known = {
    linkedin: [
      'schemaVersion',
      'published',
      'lastUpdated',
      'audits',
      'languageSync',
    ],
    cv: ['schemaVersion', 'versions', 'previousVersion'],
    vacancies: ['schemaVersion', 'items'],
    priorities: ['schemaVersion', 'items'],
    'linkedin-content': ['schemaVersion', 'articles'],
  }[name]
  const unknown = Object.keys(data).filter((key) => !known.includes(key))
  const rules = {
    linkedin: {
      published: [
        'name',
        'language',
        'headline',
        'about',
        'experience',
        'education',
        'languages',
        'skills',
        'certifications',
        'projects',
        'featured',
        'additionalSections',
        'variants',
      ],
      localizedProfile: [
        'id',
        'language',
        'publicationStatus',
        'lastUpdated',
        'name',
        'headline',
        'about',
        'experience',
        'education',
        'languages',
        'skills',
        'certifications',
        'projects',
        'featured',
        'additionalSections',
      ],
      languageSync: ['status', 'sourceLanguage'],
      additionalSection: ['id', 'title', 'content'],
      audit: [
        'id',
        'section',
        'sectionId',
        'sectionLabel',
        'variantId',
        'targetEntryId',
        'targetEntryIndex',
        'targetField',
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
        'adaptedCv',
      ],
      adaptedCv: ['text', 'language', 'layout'],
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
    'linkedin-content': {
      article: [
        'id',
        'title',
        'source',
        'url',
        'publishedAt',
        'verified',
        'verifiedAt',
        'relevance',
        'topics',
        'status',
        'opinion',
      ],
    },
    cv: { version: ['masterText', 'lastUpdated', 'lastReviewed'] },
  }[name]
  const inspect = (value, allowed, path) => {
    if (!value || typeof value !== 'object' || Array.isArray(value) || !allowed)
      return
    for (const key of Object.keys(value))
      if (!allowed.includes(key)) unknown.push(`${path}.${key}`)
  }
  if (name === 'linkedin') {
    const inspectPublished = (published, path, allowedFields) => {
      inspect(published, allowedFields, path)
      ;(published?.additionalSections || []).forEach((item, index) =>
        inspect(
          item,
          rules.additionalSection,
          `${path}.additionalSections[${index}]`,
        ),
      )
      for (const [section, fields] of Object.entries(linkedinEntryFields))
        (published?.[section] || []).forEach((item, index) => {
          if (isRecord(item))
            inspect(
              item,
              [...fields.text, ...fields.lists, ...(fields.booleans || [])],
              `${path}.${section}[${index}]`,
            )
        })
    }
    inspectPublished(data.published, 'published', rules.published)
    inspect(data.languageSync, rules.languageSync, 'languageSync')
    ;(data.published?.variants || []).forEach((variant, index) =>
      inspectPublished(
        variant,
        `published.variants[${index}]`,
        rules.localizedProfile,
      ),
    )
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
      inspect(item.adaptedCv, rules.adaptedCv, `items[${index}].adaptedCv`)
    })
  if (name === 'priorities')
    (data.items || []).forEach((item, index) =>
      inspect(item, rules.item, `items[${index}]`),
    )
  if (name === 'linkedin-content')
    (data.articles || []).forEach((article, index) =>
      inspect(article, rules.article, `articles[${index}]`),
    )
  return unknown
}
