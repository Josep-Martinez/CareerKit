export const LINKEDIN_AUDIT_FIELDS = {
  experience: [
    'title',
    'company',
    'employmentType',
    'location',
    'workplaceType',
    'dates',
    'description',
  ],
  education: [
    'institution',
    'degree',
    'fieldOfStudy',
    'dates',
    'grade',
    'activities',
    'description',
  ],
  languages: ['language', 'proficiency', 'details'],
  certifications: [
    'name',
    'issuer',
    'issueDate',
    'expirationDate',
    'credentialId',
    'credentialUrl',
    'description',
  ],
  projects: ['name', 'associatedWith', 'dates', 'description', 'url'],
  featured: ['title', 'description', 'url', 'mediaType'],
}

const arraySections = new Set([...Object.keys(LINKEDIN_AUDIT_FIELDS), 'skills'])

export function resolveLinkedInAuditTarget(published, audit) {
  if (!published || !audit) return { error: 'target-unavailable' }

  if (audit.section === 'headline' || audit.section === 'about') {
    return {
      kind: 'scalar',
      field: audit.section,
      beforeValue: published[audit.section] || '',
    }
  }

  if (audit.section === 'additionalSections') {
    const sections = published.additionalSections || []
    const index = sections.findIndex(
      (section) => section.id === audit.sectionId,
    )
    const field = audit.targetField || 'content'
    if (index < 0 || !['content', 'title'].includes(field))
      return { error: 'target-unavailable' }
    return {
      kind: 'additionalSection',
      index,
      field,
      beforeValue: sections[index][field] || '',
    }
  }

  if (!arraySections.has(audit.section)) return { error: 'target-unavailable' }
  const items = published[audit.section]
  if (!Array.isArray(items)) return { error: 'target-unavailable' }

  let index = -1
  if (typeof audit.targetEntryId === 'string') {
    const matches = items
      .map((entry, entryIndex) =>
        entry && typeof entry === 'object' && entry.id === audit.targetEntryId
          ? entryIndex
          : -1,
      )
      .filter((entryIndex) => entryIndex >= 0)
    if (matches.length !== 1) return { error: 'target-unavailable' }
    ;[index] = matches
  } else if (
    Number.isInteger(audit.targetEntryIndex) &&
    audit.targetEntryIndex >= 0
  ) {
    index = audit.targetEntryIndex
  }

  if (index < 0 || index >= items.length) return { error: 'target-unavailable' }

  const entry = items[index]
  if (typeof entry === 'string') {
    if (audit.targetField !== 'value') return { error: 'target-unavailable' }
    return { kind: 'arrayEntry', index, field: 'value', beforeValue: entry }
  }

  const fields = LINKEDIN_AUDIT_FIELDS[audit.section] || []
  if (
    !entry ||
    typeof entry !== 'object' ||
    !fields.includes(audit.targetField) ||
    (entry[audit.targetField] !== undefined &&
      typeof entry[audit.targetField] !== 'string')
  )
    return { error: 'target-unavailable' }

  return {
    kind: 'arrayEntry',
    index,
    field: audit.targetField,
    beforeValue: entry[audit.targetField] || '',
  }
}

export function applyLinkedInAuditProposal(published, audit) {
  if (typeof audit?.proposedText !== 'string' || !audit.proposedText.trim())
    return { error: 'proposal-empty', published }

  const target = resolveLinkedInAuditTarget(published, audit)
  if (target.error) return { error: target.error, published }

  let updated
  if (target.kind === 'scalar') {
    updated = { ...published, [target.field]: audit.proposedText }
  } else if (target.kind === 'additionalSection') {
    updated = {
      ...published,
      additionalSections: published.additionalSections.map((section, index) =>
        index === target.index
          ? { ...section, [target.field]: audit.proposedText }
          : section,
      ),
    }
  } else {
    updated = {
      ...published,
      [audit.section]: published[audit.section].map((entry, index) => {
        if (index !== target.index) return entry
        if (target.field === 'value') return audit.proposedText
        return { ...entry, [target.field]: audit.proposedText }
      }),
    }
  }

  return { published: updated, beforeValue: target.beforeValue }
}
