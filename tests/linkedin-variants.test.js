import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createEmptyLinkedInVariant,
  hasLinkedInUnsavedChanges,
  markLinkedInLanguageSyncPending,
} from '../src/data/linkedin-variants.js'

test('creates a blank language version without copying the main profile', () => {
  const version = createEmptyLinkedInVariant('variant-en', 'en')

  assert.deepEqual(version, {
    id: 'variant-en',
    language: 'en',
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

test('records a pending language sync without mutating the source JSON', () => {
  const source = {
    schemaVersion: 1,
    published: { language: 'en', headline: 'A profile headline' },
    audits: [],
    retainedField: { note: 'keep me' },
  }

  const next = markLinkedInLanguageSyncPending(source, 'es')

  assert.deepEqual(next.languageSync, {
    status: 'pending',
    sourceLanguage: 'es',
  })
  assert.deepEqual(next.retainedField, source.retainedField)
  assert.equal(source.languageSync, undefined)
})

test('detects whether LinkedIn has edits that are not saved yet', () => {
  const saved = { published: { headline: '' }, audits: [] }

  assert.equal(hasLinkedInUnsavedChanges(structuredClone(saved), saved), false)
  assert.equal(
    hasLinkedInUnsavedChanges(
      { ...saved, published: { headline: 'Updated headline' } },
      saved,
    ),
    true,
  )
})
