import assert from 'node:assert/strict'
import test from 'node:test'
import { profileEvidenceAnchorId } from '../src/ui/profile-evidence.js'

test('creates a safe stable anchor from a profile evidence ID', () => {
  assert.equal(
    profileEvidenceAnchorId('experience/entry 1'),
    'profile-evidence-experience%2Fentry%201',
  )
})
