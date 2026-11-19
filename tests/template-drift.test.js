import assert from 'node:assert/strict'
import test from 'node:test'
import { getPendingTemplateUpdates } from '../src/data/template-drift.js'

test('detects a template field missing from an already loaded local JSON', () => {
  const updates = getPendingTemplateUpdates(
    { 'linkedin-content': { schemaVersion: 1, articles: [], drafts: [] } },
    {
      'linkedin-content': {
        schemaVersion: 1,
        articles: [],
        drafts: [],
        network: [],
      },
    },
    { 'linkedin-content': 'Cargado' },
  )

  assert.deepEqual(updates, [
    { module: 'linkedin-content', fields: ['network'] },
  ])
})

test('finds missing nested object properties without treating empty values as missing', () => {
  const updates = getPendingTemplateUpdates(
    { profile: { schemaVersion: 1, careerPreferences: { sectors: [] } } },
    {
      profile: {
        schemaVersion: 1,
        careerPreferences: { sectors: [], workStyle: '' },
      },
    },
    { profile: 'Guardado' },
  )

  assert.deepEqual(updates, [
    { module: 'profile', fields: ['careerPreferences.workStyle'] },
  ])
})

test('checks only valid loaded modules and ignores missing fields inside array items', () => {
  const updates = getPendingTemplateUpdates(
    {
      ready: { schemaVersion: 1, entries: [{ id: 'existing' }] },
      invalid: { schemaVersion: 1 },
      missing: { schemaVersion: 1 },
      waiting: { schemaVersion: 1 },
      stale: { schemaVersion: 1 },
    },
    {
      ready: { schemaVersion: 1, entries: [{ id: '', newField: '' }] },
      invalid: { schemaVersion: 1, network: [] },
      missing: { schemaVersion: 1, network: [] },
      waiting: { schemaVersion: 1, network: [] },
      stale: { schemaVersion: 1, network: [] },
    },
    {
      ready: 'Cargado',
      invalid: 'Revisar plantilla',
      missing: 'Falta plantilla',
      waiting: 'Cargando',
      stale: 'Cambio externo',
    },
  )

  assert.deepEqual(updates, [])
})
