import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  findUnknownProfileFields,
  hasProfileContent,
} from '../src/data/profile-fields.js'

const profileSchema = JSON.parse(
  readFileSync(new URL('../schemas/profile.schema.json', import.meta.url)),
)
const profileTemplate = JSON.parse(
  readFileSync(new URL('../templates/profile.json', import.meta.url)),
)

const emptyProfile = {
  schemaVersion: 1,
  professionalProfile: '',
  objectives: { shortTerm: '', mediumTerm: '', longTerm: '' },
  personalContext: {},
  careerPreferences: {
    internal: true,
    mustHaves: [],
    niceToHaves: [],
    thingsToClarify: [],
  },
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

test('recognizes the new optional career preference lists', () => {
  const withPreferences = {
    ...emptyProfile,
    careerPreferences: {
      ...emptyProfile.careerPreferences,
      mustHaves: ['Full-time employment'],
      niceToHaves: ['Mentoring'],
      thingsToClarify: ['How often is the team in the office?'],
    },
  }

  assert.deepEqual(findUnknownProfileFields(withPreferences), [])
})

test('keeps the new preference lists optional in schema v1 and empty in the template', () => {
  const fields = ['mustHaves', 'niceToHaves', 'thingsToClarify']

  assert.equal(profileSchema.properties.schemaVersion.const, 1)
  for (const field of fields) {
    assert.ok(!profileSchema.$defs.careerPreferences.required?.includes(field))
    assert.deepEqual(
      profileSchema.$defs.careerPreferences.properties[field],
      { $ref: '#/$defs/stringList' },
    )
    assert.deepEqual(profileTemplate.careerPreferences[field], [])
  }
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

test('new job preferences make an otherwise empty Profile count as started', () => {
  assert.equal(
    hasProfileContent({
      ...emptyProfile,
      careerPreferences: {
        ...emptyProfile.careerPreferences,
        mustHaves: ['Full-time employment'],
      },
    }),
    true,
  )
})
