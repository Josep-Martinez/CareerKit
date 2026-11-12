import assert from 'node:assert/strict'
import test from 'node:test'
import {
  hasLinkedInContent,
  patchLinkedInArticle,
  registerLinkedInPublication,
  validLinkedInContentData,
} from '../src/data/linkedin-content-data.js'

const emptyContent = {
  schemaVersion: 1,
  articles: [],
}

const publication = {
  id: 'publication-1',
  type: 'article',
  language: 'en',
  text: 'The exact text that was published.\n\nSecond paragraph.',
  publishedAt: 'sample-date',
  url: 'https://example.org/public-post',
  sourceArticleId: 'article-1',
}

test('keeps existing content files valid while adding empty archive fields', () => {
  assert.equal(validLinkedInContentData(emptyContent), true)
  assert.equal(
    validLinkedInContentData({
      ...emptyContent,
      publications: [],
      excludedArticleUrls: [],
    }),
    true,
  )
})

test('accepts an exact published post and its source article reference', () => {
  assert.equal(
    validLinkedInContentData({
      ...emptyContent,
      articles: [
        {
          id: 'article-1',
          title: 'A public article',
          source: 'A public source',
          url: 'https://example.org/article',
          status: 'published',
          publicationId: publication.id,
        },
      ],
      publications: [publication],
    }),
    true,
  )
})

test('rejects publications without the exact text or a supported type', () => {
  assert.equal(
    validLinkedInContentData({
      ...emptyContent,
      publications: [{ ...publication, text: '  ' }],
    }),
    false,
  )
  assert.equal(
    validLinkedInContentData({
      ...emptyContent,
      publications: [{ ...publication, type: 'unknown' }],
    }),
    false,
  )
})

test('requires a publication reference when an article is marked published', () => {
  assert.equal(
    validLinkedInContentData({
      ...emptyContent,
      articles: [
        {
          id: 'article-1',
          title: 'A public article',
          source: 'A public source',
          url: 'https://example.org/article',
          status: 'published',
        },
      ],
    }),
    false,
  )
})

test('treats publication records and exclusion URLs as saved content', () => {
  assert.equal(
    hasLinkedInContent({
      ...emptyContent,
      publications: [publication],
    }),
    true,
  )
  assert.equal(
    hasLinkedInContent({
      ...emptyContent,
      excludedArticleUrls: ['https://example.org/declined'],
    }),
    true,
  )
})

test('updates only the chosen article while preserving its other fields', () => {
  const data = {
    ...emptyContent,
    articles: [
      {
        id: 'article-1',
        title: 'A public article',
        source: 'A public source',
        url: 'https://example.org/article',
        status: 'pending',
        opinion: 'My view',
        customNote: 'keep this',
      },
    ],
  }

  const next = patchLinkedInArticle(data, 'article-1', { status: 'accepted' })

  assert.equal(next.articles[0].status, 'accepted')
  assert.equal(next.articles[0].opinion, 'My view')
  assert.equal(next.articles[0].customNote, 'keep this')
  assert.notEqual(next, data)
})

test('registers an exact publication and marks its accepted article published', () => {
  const data = {
    ...emptyContent,
    articles: [
      {
        id: 'article-1',
        title: 'A public article',
        source: 'A public source',
        url: 'https://example.org/article',
        status: 'accepted',
      },
    ],
  }

  const result = registerLinkedInPublication(data, publication)

  assert.equal(result.ok, true)
  assert.deepEqual(result.data.publications, [publication])
  assert.equal(result.data.articles[0].status, 'published')
  assert.equal(result.data.articles[0].publicationId, publication.id)
})

test('does not register a publication for a non-accepted article or replace an ID', () => {
  const rejectedSource = {
    ...emptyContent,
    articles: [
      {
        id: 'article-1',
        title: 'A public article',
        source: 'A public source',
        url: 'https://example.org/article',
        status: 'rejected',
      },
    ],
  }
  const refused = registerLinkedInPublication(rejectedSource, publication)
  assert.equal(refused.ok, false)
  assert.equal(refused.reason, 'article-not-accepted')

  const existing = { ...emptyContent, publications: [publication] }
  const duplicate = registerLinkedInPublication(existing, publication)
  assert.equal(duplicate.ok, true)
  assert.equal(duplicate.duplicate, true)

  const conflict = registerLinkedInPublication(existing, {
    ...publication,
    text: 'Different text',
  })
  assert.equal(conflict.ok, false)
  assert.equal(conflict.reason, 'id-conflict')
})
