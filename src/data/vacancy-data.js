const isRecord = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const optionalStrings = (value, fields) =>
  fields.every(
    (field) => value[field] === undefined || typeof value[field] === 'string',
  )

export const validVacancyAvailability = (value) =>
  value === undefined ||
  (isRecord(value) &&
    ['active', 'closed', 'uncertain'].includes(value.status) &&
    optionalStrings(value, ['checkedAt', 'sourceUrl', 'notes']))

export const validVacancyHiringContact = (value) =>
  value === undefined ||
  (isRecord(value) &&
    optionalStrings(value, [
      'name',
      'role',
      'linkedinUrl',
      'contactUrl',
      'publicEmail',
      'sourceUrl',
      'verifiedAt',
    ]))
