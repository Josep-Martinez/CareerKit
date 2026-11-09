import assert from 'node:assert/strict'
import test from 'node:test'
import {
  PROMPT_INBOX_ES,
  PROMPT_REQUIREMENTS,
} from '../src/i18n/prompt-inbox.es.js'

test('every Buzón prompt explains its files and required access', () => {
  for (const prompt of PROMPT_INBOX_ES.prompts) {
    const requirements = PROMPT_REQUIREMENTS[prompt.id]
    assert.ok(requirements, `Missing requirements for ${prompt.id}`)
    assert.ok(requirements.files.length, `Missing files for ${prompt.id}`)
    assert.ok(requirements.access.trim(), `Missing access for ${prompt.id}`)
  }
})
