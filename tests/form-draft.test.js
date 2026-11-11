import assert from 'node:assert/strict'
import test from 'node:test'
import { reconcileSavedDraft } from '../src/ui/draft-state.js'

test('keeps edits made while the submitted draft is saving', () => {
  const base = { schemaVersion: 1, summary: 'Original' }
  const submitted = { schemaVersion: 1, summary: 'First edit' }
  const typedDuringSave = { schemaVersion: 1, summary: 'Second edit' }
  const saved = { schemaVersion: 1, summary: 'First edit' }

  assert.deepEqual(
    reconcileSavedDraft(
      { base, draft: typedDuringSave },
      saved,
      { base, submitted, draft: submitted },
    ),
    { base: saved, draft: typedDuringSave },
  )
})

test('replaces the editor with the saved value when no newer edits exist', () => {
  const base = { schemaVersion: 1, summary: 'Original' }
  const submitted = { schemaVersion: 1, summary: 'First edit' }
  const saved = { schemaVersion: 1, summary: 'First edit' }

  assert.deepEqual(
    reconcileSavedDraft(
      { base, draft: submitted },
      saved,
      { base, submitted, draft: submitted },
    ),
    { base: saved, draft: saved },
  )
})
