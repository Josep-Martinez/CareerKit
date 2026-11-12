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
    (value.contactType === undefined ||
      ['recruiter', 'talent-acquisition', 'human-resources'].includes(
        value.contactType,
      )) &&
    optionalStrings(value, [
      'name',
      'role',
      'linkedinUrl',
      'contactUrl',
      'publicEmail',
      'sourceUrl',
      'verifiedAt',
    ]))

export const validVacancyCompanyProfile = (value) =>
  value === undefined ||
  (isRecord(value) &&
    optionalStrings(value, [
      'name',
      'linkedinUrl',
      'websiteUrl',
      'summary',
      'sourceUrl',
      'verifiedAt',
    ]))

export const validVacancyPeopleToFollow = (value) =>
  value === undefined ||
  (Array.isArray(value) &&
    value.every(
      (person) =>
        isRecord(person) &&
        typeof person.id === 'string' &&
        person.id.trim().length > 0 &&
        optionalStrings(person, [
          'name',
          'role',
          'linkedinUrl',
          'contactUrl',
          'reason',
          'sourceUrl',
          'verifiedAt',
        ]),
    ))
