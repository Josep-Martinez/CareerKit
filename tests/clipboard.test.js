import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { copyTextToClipboard } from '../src/ui/clipboard.js'

function createDocument(execResult) {
  const appended = []
  const removed = []
  const document = {
    body: {
      append(element) {
        appended.push(element)
      },
    },
    createElement(tagName) {
      return {
        tagName,
        style: {},
        setAttribute() {},
        focus() {},
        select() {},
        remove() {
          removed.push(this)
        },
      }
    },
    execCommand(command) {
      assert.equal(command, 'copy')
      return execResult
    },
  }
  return { document, appended, removed }
}

test('copies with the browser clipboard when it is available', async () => {
  const writes = []
  const { document, appended } = createDocument(false)

  const copied = await copyTextToClipboard('prompt text', {
    clipboard: { writeText: async (text) => writes.push(text) },
    document,
  })

  assert.equal(copied, true)
  assert.deepEqual(writes, ['prompt text'])
  assert.equal(appended.length, 0)
})

test('falls back to a temporary selected field when browser clipboard fails', async () => {
  const { document, appended, removed } = createDocument(true)

  const copied = await copyTextToClipboard('fallback prompt', {
    clipboard: { writeText: async () => Promise.reject(new Error('denied')) },
    document,
  })

  assert.equal(copied, true)
  assert.equal(appended[0].value, 'fallback prompt')
  assert.deepEqual(removed, appended)
})

test('reports failure when neither clipboard method succeeds', async () => {
  const { document, appended, removed } = createDocument(false)

  const copied = await copyTextToClipboard('unavailable prompt', {
    clipboard: undefined,
    document,
  })

  assert.equal(copied, false)
  assert.equal(appended[0].value, 'unavailable prompt')
  assert.deepEqual(removed, appended)
})

test('all prompt-copy surfaces use the shared clipboard handler', async () => {
  const surfaces = [
    'src/ui/App.jsx',
    'src/ui/components/DataDialogs.jsx',
    'src/ui/components/WorkspaceGate.jsx',
    'src/ui/pages/CVPage.jsx',
    'src/ui/pages/LinkedInContentPage.jsx',
    'src/ui/pages/LinkedInPublicationsPage.jsx',
    'src/ui/pages/PromptInboxPage.jsx',
    'src/ui/pages/VacanciesPage.jsx',
  ]

  for (const path of surfaces) {
    const source = await readFile(
      new URL(`../${path}`, import.meta.url),
      'utf8',
    )
    assert.match(
      source,
      /copyTextToClipboard/,
      `${path} must use the shared copy helper`,
    )
    assert.doesNotMatch(
      source,
      /navigator\.clipboard\??\.writeText|document\.execCommand\(['"]copy['"]\)/,
      `${path} must not bypass the shared copy helper`,
    )
  }
})
