import assert from 'node:assert/strict'
import test from 'node:test'
import { applyLinkedInAuditProposal } from '../src/data/linkedin-audit.js'

test('applies a headline proposal without changing another published field', () => {
  const published = {
    headline: 'Current headline',
    about: 'Keep this text',
    experience: [{ id: 'work-1', title: 'Role', company: 'Company' }],
  }
  const result = applyLinkedInAuditProposal(published, {
    section: 'headline',
    proposedText: 'Proposed headline',
  })

  assert.equal(result.error, undefined)
  assert.equal(result.published.headline, 'Proposed headline')
  assert.equal(result.published.about, published.about)
  assert.deepEqual(result.published.experience, published.experience)
  assert.equal(published.headline, 'Current headline')
})

test('applies a proposal only to the selected entry field', () => {
  const published = {
    experience: [
      { id: 'work-1', title: 'Role one', description: 'First description' },
      { id: 'work-2', title: 'Role two', description: 'Second description' },
    ],
  }
  const result = applyLinkedInAuditProposal(published, {
    section: 'experience',
    targetEntryId: 'work-2',
    targetField: 'description',
    proposedText: 'Updated second description',
  })

  assert.equal(result.error, undefined)
  assert.equal(result.published.experience[0].description, 'First description')
  assert.equal(
    result.published.experience[1].description,
    'Updated second description',
  )
})

test('supports an explicitly selected string-list item', () => {
  const result = applyLinkedInAuditProposal(
    { skills: ['First skill', 'Second skill'] },
    {
      section: 'skills',
      targetEntryIndex: 1,
      targetField: 'value',
      proposedText: 'Updated skill',
    },
  )

  assert.equal(result.error, undefined)
  assert.deepEqual(result.published.skills, ['First skill', 'Updated skill'])
})

test('applies a proposal only to the linked additional section', () => {
  const published = {
    additionalSections: [
      { id: 'section-1', title: 'Activities', content: 'Current text' },
      { id: 'section-2', title: 'Honors', content: 'Keep this text' },
    ],
  }
  const result = applyLinkedInAuditProposal(published, {
    section: 'additionalSections',
    sectionId: 'section-1',
    targetField: 'content',
    proposedText: 'Updated text',
  })

  assert.equal(result.error, undefined)
  assert.equal(result.published.additionalSections[0].content, 'Updated text')
  assert.equal(result.published.additionalSections[1].content, 'Keep this text')
})

test('refuses to apply when the selected target is unavailable', () => {
  const published = { experience: [{ id: 'work-1', title: 'Role' }] }
  const result = applyLinkedInAuditProposal(published, {
    section: 'experience',
    targetEntryId: 'removed-entry',
    targetField: 'title',
    proposedText: 'Replacement',
  })

  assert.equal(result.error, 'target-unavailable')
  assert.deepEqual(result.published, published)
})
