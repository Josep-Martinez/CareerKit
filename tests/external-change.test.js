import assert from 'node:assert/strict'
import test from 'node:test'
import { shouldAutoReloadExternalContent } from '../src/ui/external-change.js'

test('auto reloads external LinkedIn content only when its editor is safe', () => {
  assert.equal(
    shouldAutoReloadExternalContent({
      module: 'linkedin-content',
      hasUnsavedChanges: false,
      isSaving: false,
    }),
    true,
  )
  assert.equal(
    shouldAutoReloadExternalContent({
      module: 'linkedin-content',
      hasUnsavedChanges: true,
      isSaving: false,
    }),
    false,
  )
  assert.equal(
    shouldAutoReloadExternalContent({
      module: 'linkedin-content',
      hasUnsavedChanges: false,
      isSaving: true,
    }),
    false,
  )
  assert.equal(
    shouldAutoReloadExternalContent({
      module: 'profile',
      hasUnsavedChanges: false,
      isSaving: false,
    }),
    false,
  )
})
