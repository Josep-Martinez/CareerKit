import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildPromptText,
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

test('every copied prompt checks CareerKit availability and local data access', () => {
  for (const prompt of PROMPT_INBOX_ES.prompts) {
    const copied = buildPromptText(prompt)
    assert.match(copied, /127\.0\.0\.1:5173/)
    assert.match(copied, /reutiliza esa sesión sin ejecutar pnpm local/)
    assert.match(copied, /servidor está detenido y el puerto libre/)
    assert.match(copied, /private-data\//)
    assert.match(copied, /navegador de CareerKit tiene conectada esa carpeta/i)
    assert.match(copied, /no concede acceso local/i)
    assert.match(copied, /no bloquees el trabajo/i)
  }
})

test('template update prompt adds only missing defaults to valid local files', () => {
  const prompt = PROMPT_INBOX_ES.prompts.find(
    (item) => item.id === 'sync-template-fields',
  )

  assert.ok(prompt)
  assert.match(prompt.use, /marque esta tarea en rojo/i)
  assert.match(prompt.text, /compara.*templates/i)
  assert.match(prompt.text, /campos.*faltan|propiedades.*falten/i)
  assert.match(prompt.text, /network: \[\]/)
  assert.match(prompt.text, /no reemplaces valores que ya existan/i)
  assert.match(prompt.text, /propiedades desconocidas/i)
  assert.match(prompt.text, /no.*copi(?:es|ar).*elementos.*plantilla/i)
  assert.match(prompt.text, /valida.*antes y después|valida.*antes.*después/i)
  assert.match(
    prompt.text,
    /resume.*campos (añadidos|añadiste)|indica.*campos añadidos/i,
  )
  assert.ok(prompt.skillPaths.includes('schemas/agent-format.md'))
  assert.ok(
    PROMPT_REQUIREMENTS[prompt.id].files.includes('schemas/*.schema.json'),
  )
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

test('vacancy search and fit prompts share the new preference rules', () => {
  const search = PROMPT_INBOX_ES.prompts.find(
    (prompt) => prompt.id === 'research-vacancies',
  )
  const assess = PROMPT_INBOX_ES.prompts.find(
    (prompt) => prompt.id === 'assess-vacancy',
  )
  const combined = `${search.text}\n${assess.text}`

  for (const field of ['mustHaves', 'niceToHaves', 'thingsToClarify'])
    assert.match(combined, new RegExp(field))
  assert.match(combined, /conditions ambiguas/i)
  assert.match(combined, /pendiente/i)
  assert.match(combined, /no para excluir/i)
  assert.match(search.text, /objetivo.*ordenar|objetivos.*orden/i)
  assert.match(search.text, /items\[\]\.adaptedCv/)
  assert.match(search.text, /cvAdvice/)
  assert.match(search.text, /se muestran en Ver detalles/i)
})

test('profile prompts classify explicit preferences and preserve existing context', () => {
  const interview = PROMPT_INBOX_ES.prompts.find(
    (prompt) => prompt.id === 'fill-profile',
  )
  const material = PROMPT_INBOX_ES.prompts.find(
    (prompt) => prompt.id === 'profile-from-material',
  )
  const fromCv = PROMPT_INBOX_ES.prompts.find(
    (prompt) => prompt.id === 'profile-from-cv',
  )

  assert.match(interview.text, /mustHaves.*niceToHaves.*thingsToClarify/)
  assert.match(material.text, /solo si el material distingue explícitamente/i)
  assert.match(fromCv.text, /conserva lo que ya exista/i)
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

test('network discovery verifies and saves relevant public profiles safely', () => {
  const prompt = PROMPT_INBOX_ES.prompts.find(
    (item) => item.id === 'recommend-linkedin-network',
  )
  const requirements = PROMPT_REQUIREMENTS['recommend-linkedin-network']

  assert.ok(prompt)
  assert.ok(requirements)
  assert.match(requirements.files.join(' '), /profile\.json/)
  assert.match(requirements.files.join(' '), /linkedin\.json/)
  assert.match(requirements.files.join(' '), /cv\.json/)
  assert.match(prompt.text, /network\[\]/)
  assert.match(prompt.text, /recruiter|selección/i)
  assert.match(prompt.text, /hiring-manager|responsable de contratación/i)
  assert.match(prompt.text, /nombre o apellido/i)
  assert.match(prompt.text, /búsqueda web pública/i)
  assert.match(prompt.text, /pending.*followed.*dismissed/i)
  assert.match(prompt.text, /URL canónica|URL normalizada/i)
  assert.match(prompt.text, /fuente.*fecha de verificación/i)
  assert.match(prompt.text, /no sigas.*no envíes mensajes/i)
  assert.match(prompt.text, /no garantices|no prometas/i)
})

test('published post prompt records exact text and links its accepted article', () => {
  const prompt = PROMPT_INBOX_ES.prompts.find(
    (item) => item.id === 'record-linkedin-publication',
  )
  const requirements = PROMPT_REQUIREMENTS['record-linkedin-publication']

  assert.ok(prompt)
  assert.ok(requirements)
  assert.match(prompt.text, /conserva literalmente cada texto/i)
  assert.match(prompt.text, /ni reescribas|no reescribas/i)
  assert.match(prompt.text, /publicationId/)
  assert.match(prompt.text, /ya está publicado en LinkedIn/i)
  assert.match(prompt.text, /no me pidas una confirmación adicional/i)
  assert.match(prompt.text, /publications\[\]/)
  assert.match(prompt.text, /no publiques/i)
})

test('post creation prompt prepares a strong draft for user review', () => {
  const prompt = PROMPT_INBOX_ES.prompts.find(
    (item) => item.id === 'draft-linkedin-post',
  )

  assert.match(prompt.text, /publicación completa/i)
  assert.match(prompt.text, /lista para que yo la revise/i)
  assert.match(prompt.text, /tres aperturas/i)
  assert.match(prompt.text, /no me preguntes antes de ofrecer un borrador/i)
  assert.match(prompt.text, /revise|revisar/i)
  assert.match(prompt.text, /logro|proyecto|experiencia|artículo/i)
  assert.match(prompt.text, /persona.*mencionar|mención.*persona/i)
  assert.match(prompt.text, /no inventes.*cargo|no inventes.*relación/i)
  assert.match(prompt.text, /etiqueta real.*LinkedIn|etiquetar.*manualmente/i)
  assert.match(prompt.text, /no publiques/i)
  assert.match(prompt.text, /Tus publicaciones/)
})

test('comment prompt accepts a public link and proposes a profile-based angle when opinion is absent', () => {
  const prompt = PROMPT_INBOX_ES.prompts.find(
    (item) => item.id === 'draft-linkedin-comment',
  )
  const requirements = PROMPT_REQUIREMENTS['draft-linkedin-comment']

  assert.ok(prompt)
  assert.match(prompt.text, /enlace público/i)
  assert.match(prompt.text, /private-data\/profile\.json/i)
  assert.match(prompt.text, /respuestas anteriores/i)
  assert.match(prompt.text, /propon(?:er|ga).*ángulo/i)
  assert.match(prompt.text, /no inventes.*experiencia/i)
  assert.match(prompt.text, /opinión confirmada/i)
  assert.match(requirements.files.join(' '), /opinión.*opcional/i)
  assert.match(requirements.files.join(' '), /enlace público/i)
  assert.match(requirements.access, /acceso local opcional/i)
})
