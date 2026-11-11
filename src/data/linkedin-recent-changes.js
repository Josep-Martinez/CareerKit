const SECTION_KEYS = [
  'experience',
  'education',
  'languages',
  'skills',
  'certifications',
  'projects',
  'featured',
]

const meaningful = (value) => {
  if (typeof value === 'string') return Boolean(value.trim())
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return true
  if (Array.isArray(value)) return value.some(meaningful)
  if (!value || typeof value !== 'object') return false
  return Object.entries(value).some(
    ([key, item]) => key !== 'id' && meaningful(item),
  )
}

const comparable = (value) => {
  if (Array.isArray(value)) return value.map(comparable)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(
    Object.keys(value)
      .filter((key) => key !== 'id')
      .sort()
      .map((key) => [key, comparable(value[key])]),
  )
}

const sameContent = (left, right) => {
  if (!meaningful(left) && !meaningful(right)) return true
  return JSON.stringify(comparable(left)) === JSON.stringify(comparable(right))
}

const itemKey = (item, index) =>
  item && typeof item === 'object' && item.id
    ? String(item.id)
    : `index:${index}`

function collectVersions(value) {
  const published = value?.published || {}
  const versions = new Map()
  const languageKey = (language, fallback) =>
    language?.toLowerCase().split(/[-_]/)[0] || fallback

  versions.set(languageKey(published.language, 'main'), {
    ...published,
    lastUpdated: value?.lastUpdated ?? published.lastUpdated,
  })
  for (const variant of published.variants || []) {
    versions.set(
      languageKey(variant.language, `variant:${variant.id}`),
      variant,
    )
  }
  return versions
}

function diffList(before = [], after = []) {
  const previous = new Map(
    before.map((item, index) => [itemKey(item, index), item]),
  )
  const current = new Map(
    after.map((item, index) => [itemKey(item, index), item]),
  )
  const changed = [...new Set([...previous.keys(), ...current.keys()])].filter(
    (key) =>
      !previous.has(key) ||
      !current.has(key) ||
      !sameContent(previous.get(key), current.get(key)),
  )

  const sharedBefore = [...previous.keys()].filter((key) => current.has(key))
  const sharedAfter = [...current.keys()].filter((key) => previous.has(key))
  if (sharedBefore.some((key, index) => key !== sharedAfter[index])) {
    const beforeRank = new Map(sharedBefore.map((key, index) => [key, index]))
    const afterRank = new Map(sharedAfter.map((key, index) => [key, index]))
    for (const key of sharedBefore) {
      if (beforeRank.get(key) !== afterRank.get(key)) changed.push(key)
    }
  }
  return [...new Set(changed)]
}

function diffVersion(before = {}, after = {}) {
  const fields = ['name', 'headline', 'about', 'lastUpdated'].filter(
    (key) => !sameContent(before[key], after[key]),
  )
  const entries = {}
  const sections = []

  for (const section of SECTION_KEYS) {
    const changed = diffList(before[section] || [], after[section] || [])
    if (changed.length) {
      sections.push(section)
      entries[section] = changed
    }
  }

  const additionalSections = diffList(
    before.additionalSections || [],
    after.additionalSections || [],
  )
  if (additionalSections.length) sections.push('additionalSections')

  return { fields, sections, entries, additionalSections }
}

export function getLinkedInRecentChanges(before, after) {
  const previousVersions = collectVersions(before)
  const currentVersions = collectVersions(after)
  const byLanguage = {}

  for (const language of new Set([
    ...previousVersions.keys(),
    ...currentVersions.keys(),
  ])) {
    const changes = diffVersion(
      previousVersions.get(language),
      currentVersions.get(language),
    )
    if (
      changes.fields.length ||
      changes.sections.length ||
      changes.additionalSections.length
    ) {
      byLanguage[language] = changes
    }
  }

  const auditIds = diffList(before?.audits || [], after?.audits || [])
  return { byLanguage, auditIds }
}

export function hasLinkedInRecentChanges(changes) {
  return Boolean(
    changes?.auditIds?.length ||
    Object.values(changes?.byLanguage || {}).some(
      (language) =>
        language.fields.length ||
        language.sections.length ||
        language.additionalSections.length,
    ),
  )
}
