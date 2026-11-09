const collections = {
  experience: ['dates'],
  education: ['dates'],
  certifications: ['issueDate', 'expirationDate'],
  projects: ['dates'],
}

const monthNames = new Map([
  ['january', '01'],
  ['enero', '01'],
  ['gener', '01'],
  ['february', '02'],
  ['febrero', '02'],
  ['febrer', '02'],
  ['march', '03'],
  ['marzo', '03'],
  ['març', '03'],
  ['april', '04'],
  ['abril', '04'],
  ['maig', '05'],
  ['may', '05'],
  ['mayo', '05'],
  ['june', '06'],
  ['junio', '06'],
  ['juny', '06'],
  ['july', '07'],
  ['julio', '07'],
  ['juliol', '07'],
  ['august', '08'],
  ['agosto', '08'],
  ['agost', '08'],
  ['september', '09'],
  ['septiembre', '09'],
  ['setembre', '09'],
  ['october', '10'],
  ['octubre', '10'],
  ['november', '11'],
  ['noviembre', '11'],
  ['novembre', '11'],
  ['december', '12'],
  ['diciembre', '12'],
  ['desembre', '12'],
])

const ongoingTerms = new Set([
  'actual',
  'actualidad',
  'currently',
  'current',
  'present',
  'today',
  'ara',
  'actualment',
])

function dateFingerprint(value) {
  if (typeof value !== 'string' || !value.trim()) return ''
  const normalized = value.toLocaleLowerCase().normalize('NFC')
  const tokens = normalized.match(/[\p{L}\p{N}]+/gu) || []
  const facts = tokens.flatMap((token) => {
    const month = monthNames.get(token)
    if (month) return [`m${month}`]
    if (ongoingTerms.has(token)) return ['ongoing']
    return /^\d{1,4}$/.test(token) ? [token] : []
  })
  return facts.join('-')
}

function entriesById(entries = []) {
  return new Map(
    entries.map((entry, index) => [
      entry && typeof entry === 'object' && typeof entry.id === 'string'
        ? `id:${entry.id}`
        : `index:${index}`,
      entry,
    ]),
  )
}

function collectionChanged(before, after, dateFields) {
  const previous = entriesById(before)
  const next = entriesById(after)
  if (previous.size !== next.size) return true

  for (const [id, previousEntry] of previous) {
    if (!next.has(id)) return true
    const nextEntry = next.get(id)
    if (typeof previousEntry === 'string' || typeof nextEntry === 'string') {
      if (dateFingerprint(previousEntry) !== dateFingerprint(nextEntry))
        return true
      continue
    }
    if (typeof previousEntry !== 'object' || typeof nextEntry !== 'object')
      continue
    if (
      dateFields.some(
        (field) =>
          dateFingerprint(previousEntry[field]) !==
          dateFingerprint(nextEntry[field]),
      )
    )
      return true
  }
  return false
}

function snapshotsById(data) {
  const snapshots = new Map([['main', data?.published]])
  for (const variant of data?.published?.variants || []) {
    if (typeof variant.id === 'string') snapshots.set(variant.id, variant)
  }
  return snapshots
}

export function hasCvRelevantLinkedInChanges(before, after) {
  const previous = snapshotsById(before)
  const next = snapshotsById(after)

  for (const [id, nextSnapshot] of next) {
    if (!previous.has(id)) continue
    const previousSnapshot = previous.get(id)
    for (const [collection, dateFields] of Object.entries(collections)) {
      if (
        collectionChanged(
          previousSnapshot?.[collection],
          nextSnapshot?.[collection],
          dateFields,
        )
      )
        return true
    }
  }
  return false
}
