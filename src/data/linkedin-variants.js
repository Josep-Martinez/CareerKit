export function createEmptyLinkedInVariant(id, language) {
  return {
    id,
    language,
    publicationStatus: 'draft',
    name: '',
    headline: '',
    about: '',
    experience: [],
    education: [],
    languages: [],
    skills: [],
    certifications: [],
    projects: [],
    featured: [],
    additionalSections: [],
  }
}
