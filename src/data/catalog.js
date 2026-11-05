export const FILES = ['profile', 'linkedin', 'cv', 'vacancies', 'priorities']

export const EMPTY = {
  profile: { schemaVersion: 1, professionalProfile: '', objectives: { shortTerm: '', mediumTerm: '', longTerm: '' }, skills: [], experience: [], education: [], certifications: [], languages: [], projects: [], evidence: [], learnings: [] },
  linkedin: { schemaVersion: 1, published: { headline: '', about: '', experience: [], education: [], skills: [], certifications: [], projects: [], featured: [] }, lastUpdated: '', audits: [] },
  cv: {
    schemaVersion: 2,
    versions: {
      spanish: { masterText: '', lastUpdated: '', lastReviewed: '' },
      english: { masterText: '', lastUpdated: '', lastReviewed: '' },
    },
  },
  vacancies: { schemaVersion: 1, items: [] },
  priorities: { schemaVersion: 1, items: [] },
}

