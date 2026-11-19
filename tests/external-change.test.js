import assert from 'node:assert/strict'
import test from 'node:test'
import {
  shouldAutoReloadExternalContent,
  shouldShowExternalContentReloadTask,
} from '../src/ui/external-change.js'

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

test('shows an inbox reload task only while LinkedIn content is externally stale', () => {
  assert.equal(shouldShowExternalContentReloadTask('Cambio externo'), true)
  assert.equal(shouldShowExternalContentReloadTask('Conflicto externo'), true)
  assert.equal(shouldShowExternalContentReloadTask('Cargado'), false)
  assert.equal(shouldShowExternalContentReloadTask('Guardado'), false)
  assert.equal(shouldShowExternalContentReloadTask(undefined), false)
})
