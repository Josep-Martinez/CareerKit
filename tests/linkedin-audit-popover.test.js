import assert from 'node:assert/strict'
import test from 'node:test'
import { summarizeAuditNotes } from '../src/ui/linkedin-audit-popover.js'

test('summarizes the highest priority and count for a section marker', () => {
  assert.deepEqual(
    summarizeAuditNotes([{ priority: 'baja' }, { priority: 'alta' }]),
    { count: 2, priority: 'alta' },
  )
})

test('uses the next available priority when a section has no high-priority note', () => {
  assert.deepEqual(
    summarizeAuditNotes([{ priority: 'baja' }, { priority: 'media' }]),
    { count: 2, priority: 'media' },
  )
})

test('returns no marker summary for an empty annotation list', () => {
  assert.deepEqual(summarizeAuditNotes([]), { count: 0, priority: 'baja' })
})
