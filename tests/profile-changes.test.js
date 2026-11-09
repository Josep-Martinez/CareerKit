import assert from 'node:assert/strict'
import test from 'node:test'
import { hasCvRelevantProfileChanges } from '../src/data/profile-changes.js'

const profile = {
  professionalProfile: '',
  personalContext: { interests: [] },
  objectives: { shortTerm: '', mediumTerm: '', longTerm: '' },
  experience: [],
}

test('ignores unchanged profile, private context, and objectives', () => {
  assert.equal(
    hasCvRelevantProfileChanges(profile, structuredClone(profile)),
    false,
  )
  assert.equal(
    hasCvRelevantProfileChanges(profile, {
      ...profile,
      personalContext: { interests: ['tema interno'] },
      objectives: { ...profile.objectives, shortTerm: 'nuevo objetivo' },
    }),
    false,
  )
})

test('detects a changed professional summary', () => {
  assert.equal(
    hasCvRelevantProfileChanges(profile, {
      ...profile,
      professionalProfile: 'Resumen profesional',
    }),
    true,
  )
})

test('detects edits to confirmed evidence selected for the CV', () => {
  const before = {
    ...profile,
    experience: [
      {
        id: 'evidence-1',
        title: 'Puesto',
        confirmed: true,
        cvEvidence: true,
      },
    ],
  }
  const after = structuredClone(before)
  after.experience[0].results = 'Resultado confirmado'
  assert.equal(hasCvRelevantProfileChanges(before, after), true)
})

test('ignores unconfirmed or internal-only evidence changes', () => {
  const before = {
    ...profile,
    experience: [
      {
        id: 'evidence-1',
        title: 'Borrador',
        confirmed: false,
        cvEvidence: true,
      },
    ],
  }
  const after = structuredClone(before)
  after.experience[0].title = 'Cambio sin confirmar'
  assert.equal(hasCvRelevantProfileChanges(before, after), false)
  after.experience[0].confirmed = true
  after.experience[0].internal = true
  assert.equal(hasCvRelevantProfileChanges(before, after), false)
})
