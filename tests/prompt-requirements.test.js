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

test('vacancy discovery and availability review are separate prompts', () => {
  const discovery = PROMPT_INBOX_ES.prompts.find(
    (prompt) => prompt.id === 'research-vacancies',
  )
  const review = PROMPT_INBOX_ES.prompts.find(
    (prompt) => prompt.id === 'verify-vacancies',
  )

  assert.ok(discovery)
  assert.ok(review)
  assert.match(discovery.text, /InfoJobs/)
  assert.match(discovery.text, /JobToday/)
  assert.match(discovery.text, /JobTeaser/)
  assert.match(discovery.text, /Jobzen/)
  assert.match(discovery.text, /responsable|responsable del departamento/i)
  assert.match(discovery.text, /linkedinUrl/)
  assert.match(discovery.text, /no .*contactes|no envíes mensajes/i)
  assert.match(review.text, /availability/)
  assert.match(review.text, /no elimines|conserva todas las ofertas/i)
  assert.doesNotMatch(
    discovery.text,
    /Antes de buscar nuevas ofertas, revisa cada vacante guardada/,
  )
})
