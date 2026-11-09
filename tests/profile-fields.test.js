import assert from 'node:assert/strict'
import test from 'node:test'
import {
  findUnknownProfileFields,
  hasProfileContent,
} from '../src/data/profile-fields.js'

const emptyProfile = {
  schemaVersion: 1,
  professionalProfile: '',
  objectives: { shortTerm: '', mediumTerm: '', longTerm: '' },
  personalContext: {},
  careerPreferences: { internal: true },
  contentDirection: {
    languages: [],
    versionPreference: '',
    internal: true,
  },
  skills: [{ id: 'test-skill', type: '', description: '', tags: [] }],
  experience: [],
  education: [{ id: 'test-education', status: '' }],
  certifications: [],
  languages: [
    { id: 'test-language', type: '', proficiency: '', description: '' },
  ],
  projects: [
    {
      id: 'test-project',
      type: '',
      description: '',
      grade: '',
      tags: [],
    },
  ],
  evidence: [],
  learnings: [],
}

test('recognizes Profile fields used for context and evidence', () => {
  assert.deepEqual(findUnknownProfileFields(emptyProfile), [])
})

test('still reports fields that are not part of the Profile format', () => {
  assert.deepEqual(
    findUnknownProfileFields({
      ...emptyProfile,
      contentDirection: { surprise: true },
    }),
    ['contentDirection.surprise'],
  )
})

test('internal metadata does not make an otherwise empty Profile look complete', () => {
  const empty = {
    professionalProfile: '',
    personalContext: {},
    careerPreferences: { internal: true },
    contentDirection: {
      languages: [],
      versionPreference: '',
      internal: true,
    },
    objectives: { shortTerm: '', mediumTerm: '', longTerm: '' },
    skills: [],
    experience: [],
    education: [],
    certifications: [],
    languages: [],
    projects: [],
    evidence: [],
    learnings: [],
  }

  assert.equal(hasProfileContent(empty), false)
})
