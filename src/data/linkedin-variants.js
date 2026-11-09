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

export function markLinkedInLanguageSyncPending(value, sourceLanguage) {
  return {
    ...value,
    languageSync: {
      status: 'pending',
      ...(sourceLanguage === 'es' || sourceLanguage === 'en'
        ? { sourceLanguage }
        : {}),
    },
  }
}
