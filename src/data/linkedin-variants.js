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

export function hasLinkedInUnsavedChanges(draft, saved) {
  return JSON.stringify(draft) !== JSON.stringify(saved)
}
