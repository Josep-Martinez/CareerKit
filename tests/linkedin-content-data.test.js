import assert from 'node:assert/strict'
import test from 'node:test'
import {
  hasLinkedInContent,
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
