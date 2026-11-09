import assert from 'node:assert/strict'
import test from 'node:test'
import { hasCvRelevantLinkedInChanges } from '../src/data/linkedin-changes.js'

const snapshot = (published, extra = {}) => ({
  schemaVersion: 1,
  published: {
    headline: '',
    about: '',
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    projects: [],
    featured: [],
    ...published,
  },
  audits: [],
  ...extra,
})

test('ignores translated copy and audit-only changes', () => {
  const before = snapshot(
    { language: 'en', headline: 'Product manager' },
    { audits: [] },
  )
  const after = snapshot(
    { language: 'en', headline: 'Gestión de producto' },
    { audits: [{ id: 'audit-1', status: 'pendiente' }] },
  )

  assert.equal(hasCvRelevantLinkedInChanges(before, after), false)
})

test('detects a new experience and a corrected date', () => {
  const before = snapshot({
    experience: [{ id: 'experience-1', title: 'Role', dates: 'January 2024' }],
  })
  const newExperience = snapshot({
    experience: [
      { id: 'experience-1', title: 'Role', dates: 'January 2024' },
      { id: 'experience-2', title: 'Another role', dates: 'May 2025' },
    ],
  })
  const correctedDate = snapshot({
    experience: [{ id: 'experience-1', title: 'Role', dates: 'February 2024' }],
  })

  assert.equal(hasCvRelevantLinkedInChanges(before, newExperience), true)
  assert.equal(hasCvRelevantLinkedInChanges(before, correctedDate), true)
})

test('does not treat translated month names as a changed date', () => {
  const before = snapshot({
    experience: [{ id: 'experience-1', dates: 'September 2020 – Present' }],
  })
  const after = snapshot({
    experience: [
      { id: 'experience-1', dates: 'septiembre 2020 – actualidad' },
    ],
  })

  assert.equal(hasCvRelevantLinkedInChanges(before, after), false)
})

test('detects changed dates in legacy string entries', () => {
  const before = snapshot({ experience: ['Role at Company · June 2020 – Present'] })
  const after = snapshot({ experience: ['Role at Company · July 2020 – Present'] })

  assert.equal(hasCvRelevantLinkedInChanges(before, after), true)
})

test('does not treat a newly added language variant as new CV evidence', () => {
  const before = snapshot({
    language: 'es',
    experience: [{ id: 'experience-1', dates: '2020 – actual' }],
    variants: [],
  })
  const after = snapshot({
    language: 'es',
    experience: [{ id: 'experience-1', dates: '2020 – actual' }],
    variants: [
      {
        id: 'english-profile',
        language: 'en',
        headline: '',
        about: '',
        experience: [{ id: 'experience-1', dates: '2020 – present' }],
        education: [],
        skills: [],
        certifications: [],
        projects: [],
        featured: [],
      },
    ],
  })

  assert.equal(hasCvRelevantLinkedInChanges(before, after), false)
})
