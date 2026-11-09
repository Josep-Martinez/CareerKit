import assert from 'node:assert/strict'
import test from 'node:test'
import { createEmptyLinkedInVariant } from '../src/data/linkedin-variants.js'

test('creates a blank language version without copying the main profile', () => {
  const version = createEmptyLinkedInVariant('variant-en', 'en')

  assert.deepEqual(version, {
    id: 'variant-en',
    language: 'en',
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
  })
})
