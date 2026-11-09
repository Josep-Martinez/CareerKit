import assert from 'node:assert/strict'
import test from 'node:test'
import {
  cvReviewRevision,
  isCvReviewComplete,
} from '../src/data/cv-review-task.js'

test('ignores formatting and closes only after both populated versions change', async () => {
  const cv = {
    versions: {
      spanish: { masterText: 'Sección de prueba' },
      english: { masterText: 'Test section' },
    },
  }
  const task = { baseline: await cvReviewRevision(cv) }
  const reformatted = JSON.parse(JSON.stringify(cv, null, 4))
  reformatted.versions.spanish.masterText = '  Sección   de prueba\n'
  assert.equal(
    isCvReviewComplete(task, await cvReviewRevision(reformatted)),
    false,
  )
  reformatted.versions.spanish.lastReviewed = new Date(0)
    .toISOString()
    .slice(0, 10)
  assert.equal(
    isCvReviewComplete(task, await cvReviewRevision(reformatted)),
    false,
  )
  reformatted.versions.english.masterText = ''
  assert.equal(
    isCvReviewComplete(task, await cvReviewRevision(reformatted)),
    false,
  )
  reformatted.versions.english.masterText = 'Updated test section'
  assert.equal(
    isCvReviewComplete(task, await cvReviewRevision(reformatted)),
    true,
  )
})
