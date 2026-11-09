const cvEligibleEntries = [
  'experience',
  'education',
  'skills',
  'certifications',
  'languages',
  'projects',
  'evidence',
  'learnings',
]

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

function cvEvidence(profile, key) {
  return (Array.isArray(profile?.[key]) ? profile[key] : []).filter(
    (entry) =>
      entry &&
      typeof entry === 'object' &&
      entry.confirmed === true &&
      entry.cvEvidence === true &&
      entry.internal !== true,
  )
}

export function hasCvRelevantProfileChanges(before, after) {
  if (before?.professionalProfile !== after?.professionalProfile) return true

  return cvEligibleEntries.some(
    (key) =>
      stableStringify(cvEvidence(before, key)) !==
      stableStringify(cvEvidence(after, key)),
  )
}
