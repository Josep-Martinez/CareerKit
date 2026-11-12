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

test('article discovery excludes decided readings and cleans discarded records', () => {
  const prompt = PROMPT_INBOX_ES.prompts.find(
    (item) => item.id === 'discover-linkedin-articles',
  )

  assert.match(prompt.text, /status.*pending.*accepted.*published.*rejected/i)
  assert.match(prompt.text, /excludedArticleUrls/)
  assert.match(prompt.text, /elimina.*rejected|borra.*rejected/i)
  assert.match(prompt.text, /URL normalizada|URL canónica/i)
  assert.doesNotMatch(prompt.text, /No borres artículos guardados/)
})

test('published post prompt records exact text and links its accepted article', () => {
  const prompt = PROMPT_INBOX_ES.prompts.find(
    (item) => item.id === 'record-linkedin-publication',
  )
  const requirements = PROMPT_REQUIREMENTS['record-linkedin-publication']

  assert.ok(prompt)
  assert.ok(requirements)
  assert.match(prompt.text, /texto exacto/i)
  assert.match(prompt.text, /ni reescribas|no reescribas/i)
  assert.match(prompt.text, /publicationId/)
  assert.match(prompt.text, /usa ese id tal como lo proporcioné/i)
  assert.match(prompt.text, /si no confirmo que ya está publicada/i)
  assert.match(prompt.text, /no publiques/i)
})

test('post creation prompt prepares a strong draft for user review', () => {
  const prompt = PROMPT_INBOX_ES.prompts.find(
    (item) => item.id === 'draft-linkedin-post',
  )

  assert.match(prompt.text, /publicación completa/i)
  assert.match(prompt.text, /lista para publicar/i)
  assert.match(prompt.text, /tres aperturas/i)
  assert.match(prompt.text, /no pares para preguntarme/i)
  assert.match(prompt.text, /revise|revisar/i)
  assert.match(prompt.text, /logro|proyecto|experiencia|artículo/i)
  assert.match(prompt.text, /no publiques/i)
})
