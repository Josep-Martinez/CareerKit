import assert from 'node:assert/strict'
import test from 'node:test'
import {
  deleteLinkedInDraft,
  deleteLinkedInPublication,
  hasLinkedInContent,
  patchLinkedInArticle,
  registerLinkedInPublication,
  sortLinkedInPublications,
  updateLinkedInDraft,
  updateLinkedInPublication,
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

test('sorts dated publications newest first and undated ones alphabetically', () => {
  const items = [
    { id: 'z', type: 'project', text: 'Zebra post' },
    {
      id: 'old',
      type: 'project',
      text: 'Old post',
      publishedAt: 'Jan 3, 2026',
    },
    { id: 'a', type: 'project', text: 'Alpha post' },
    {
      id: 'new',
      type: 'project',
      text: 'New post',
      publishedAt: 'Nov 10, 2026',
    },
    { id: 'invalid', type: 'project', text: 'Beta post', publishedAt: 'unknown' },
  ]

  assert.deepEqual(
    sortLinkedInPublications(items).map((item) => item.id),
    ['new', 'old', 'a', 'invalid', 'z'],
  )
})

test('updates and deletes draft records without moving them into publications', () => {
  const postDraft = {
    id: 'draft-1',
    type: 'project',
    language: 'en',
    text: 'First version',
    status: 'needs-review',
    sourceArticleId: 'article-1',
    externalTag: 'preserve',
  }
  const data = { ...emptyContent, drafts: [postDraft] }
  const updated = updateLinkedInDraft(data, {
    ...postDraft,
    text: 'Edited version',
    status: 'ready-to-post',
  })

  assert.equal(updated.ok, true)
  assert.equal(updated.data.drafts[0].text, 'Edited version')
  assert.equal(updated.data.drafts[0].status, 'ready-to-post')
  assert.equal(updated.data.drafts[0].externalTag, 'preserve')
  assert.equal(updated.data.publications, undefined)

  const deleted = deleteLinkedInDraft(updated.data, 'draft-1')
  assert.deepEqual(deleted.drafts, [])
})

test('edits and removes a published record while preserving unknown data', () => {
  const data = {
    ...emptyContent,
    articles: [
      {
        id: 'article-1',
        title: 'A public article',
        source: 'A public source',
        url: 'https://example.org/article',
        status: 'published',
        publicationId: 'publication-1',
        customArticleField: true,
      },
    ],
    publications: [{ ...publication, customField: 'keep' }],
  }
  const edited = updateLinkedInPublication(data, {
    ...data.publications[0],
    text: 'Corrected archive copy',
  })

  assert.equal(edited.ok, true)
  assert.equal(edited.data.publications[0].text, 'Corrected archive copy')
  assert.equal(edited.data.publications[0].customField, 'keep')

  const deleted = deleteLinkedInPublication(edited.data, publication.id)
  assert.deepEqual(deleted.publications, [])
  assert.equal(deleted.articles[0].status, 'accepted')
  assert.equal('publicationId' in deleted.articles[0], false)
  assert.equal(deleted.articles[0].customArticleField, true)
})
