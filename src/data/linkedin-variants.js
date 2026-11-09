export function createEmptyLinkedInVariant(id, language) {
  return {
    id,
    language,
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
