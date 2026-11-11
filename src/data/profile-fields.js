const rootFields = [
  'schemaVersion',
  'professionalProfile',
  'objectives',
  'personalContext',
  'careerPreferences',
  'contentDirection',
  'skills',
  'experience',
  'education',
  'certifications',
  'languages',
  'projects',
  'evidence',
  'learnings',
]

const entryFields = [
  'id',
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
  'tags',
  'evidenceIds',
  'confirmed',
  'cvEvidence',
  'onLinkedIn',
  'internal',
]

const objectFields = {
  objectives: ['shortTerm', 'mediumTerm', 'longTerm'],
  personalContext: [
    'aboutMe',
    'values',
    'interests',
    'motivations',
    'thinkingStyle',
    'learningStyle',
    'workStyle',
    'strengths',
    'growthAreas',
    'preferredEnvironment',
    'boundaries',
  ],
  careerPreferences: [
    'roleFamilies',
    'tasks',
    'industries',
    'workModes',
    'location',
    'conditions',
    'avoid',
    'internal',
  ],
  contentDirection: [
    'themes',
    'viewpoints',
    'preferredVoices',
    'preferredOrganizations',
    'tone',
    'avoid',
    'languages',
    'versionPreference',
    'internal',
  ],
}

const entryCollections = [
  'skills',
  'experience',
  'education',
  'certifications',
  'languages',
  'projects',
  'evidence',
  'learnings',
]

function hasMeaningfulValue(value) {
  if (typeof value === 'string') return Boolean(value.trim())
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return Number.isFinite(value)
  if (Array.isArray(value)) return value.some(hasMeaningfulValue)
  if (value && typeof value === 'object')
    return Object.entries(value).some(
      ([key, item]) =>
        key !== 'id' && key !== 'internal' && hasMeaningfulValue(item),
    )
  return false
}

export function hasProfileContent(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false
  return Boolean(
    data.professionalProfile?.trim() ||
    hasMeaningfulValue(data.personalContext) ||
    hasMeaningfulValue(data.careerPreferences) ||
    hasMeaningfulValue(data.contentDirection) ||
    ['shortTerm', 'mediumTerm', 'longTerm'].some((key) =>
      data.objectives?.[key]?.trim(),
    ) ||
    entryCollections.some((key) => hasMeaningfulValue(data[key])),
  )
}

function inspectUnknown(value, allowed, path, unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) unknown.push(`${path}.${key}`)
  }
}

export function findUnknownProfileFields(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return []

  const unknown = Object.keys(data).filter((key) => !rootFields.includes(key))
  for (const [key, allowed] of Object.entries(objectFields)) {
    inspectUnknown(data[key], allowed, key, unknown)
  }
  for (const key of entryCollections) {
    if (!Array.isArray(data[key])) continue
    data[key].forEach((item, index) =>
      inspectUnknown(item, entryFields, `${key}[${index}]`, unknown),
    )
  }
  return unknown
}
