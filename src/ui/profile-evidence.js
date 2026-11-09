export function profileEvidenceAnchorId(id) {
  return `profile-evidence-${encodeURIComponent(String(id))}`
}

export const profileEvidenceCollections = [
  'experience',
  'education',
  'skills',
  'certifications',
  'languages',
  'projects',
  'evidence',
  'learnings',
]

export function collectProfileEvidence(profile) {
  return new Map(
    profileEvidenceCollections.flatMap((collection) =>
      (profile?.[collection] || [])
        .filter((item) => item.id)
        .map((item) => [item.id, { item, collection }]),
    ),
  )
}

export function findRemovedEvidenceReferences(before, after, vacancies) {
  const beforeEvidence = collectProfileEvidence(before)
  const afterEvidence = collectProfileEvidence(after)
  return vacancies.flatMap((vacancy) => {
    const evidenceIds = (vacancy.matchingEvidenceIds || []).filter(
      (id) => beforeEvidence.has(id) && !afterEvidence.has(id),
    )
    return evidenceIds.length ? [{ vacancy, evidenceIds }] : []
  })
}
