const isRecord = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const supportedTypes = [
  'achievement',
  'project',
  'learning',
  'article',
  'source',
]

const isHttpUrl = (value) => {
  if (typeof value !== 'string') return false
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol)
  } catch {
    return false
  }
}

const optionalStrings = (value, fields) =>
  fields.every(
    (field) => value[field] === undefined || typeof value[field] === 'string',
  )

export const validLinkedInContentArticle = (item) =>
  isRecord(item) &&
  typeof item.id === 'string' &&
  item.id.trim().length > 0 &&
  typeof item.title === 'string' &&
  item.title.trim().length > 0 &&
  typeof item.source === 'string' &&
  item.source.trim().length > 0 &&
  isHttpUrl(item.url) &&
  optionalStrings(item, [
    'publishedAt',
    'verifiedAt',
    'relevance',
    'opinion',
    'publicationId',
  ]) &&
  (item.verified === undefined || typeof item.verified === 'boolean') &&
  (item.topics === undefined ||
    (Array.isArray(item.topics) &&
      item.topics.every((topic) => typeof topic === 'string'))) &&
  ['pending', 'accepted', 'rejected', 'published'].includes(item.status) &&
  (item.status !== 'published' || Boolean(item.publicationId?.trim()))

export const validLinkedInPublication = (item) =>
  isRecord(item) &&
  typeof item.id === 'string' &&
  item.id.trim().length > 0 &&
  supportedTypes.includes(item.type) &&
  typeof item.text === 'string' &&
  Boolean(item.text.trim()) &&
  optionalStrings(item, [
    'language',
    'publishedAt',
    'url',
    'sourceArticleId',
  ]) &&
  (item.language === undefined || ['es', 'en'].includes(item.language)) &&
  (item.url === undefined || item.url === '' || isHttpUrl(item.url))

export const validLinkedInContentData = (value) =>
  isRecord(value) &&
  value.schemaVersion === 1 &&
  Array.isArray(value.articles) &&
  value.articles.every(validLinkedInContentArticle) &&
  (value.publications === undefined ||
    (Array.isArray(value.publications) &&
      value.publications.every(validLinkedInPublication))) &&
  (value.excludedArticleUrls === undefined ||
    (Array.isArray(value.excludedArticleUrls) &&
      value.excludedArticleUrls.every(isHttpUrl)))

export function patchLinkedInArticle(data, articleId, patch) {
  let matched = false
  const articles = (data.articles || []).map((article) => {
    if (article.id !== articleId) return article
    matched = true
    return { ...article, ...patch }
  })
  return matched ? { ...data, articles } : data
}

export function registerLinkedInPublication(data, publication) {
  if (!validLinkedInPublication(publication))
    return { ok: false, reason: 'invalid-publication' }

  const publications = data.publications || []
  const existing = publications.find((item) => item.id === publication.id)
  if (existing) {
    const identical = JSON.stringify(existing) === JSON.stringify(publication)
    return identical
      ? { ok: true, duplicate: true, data }
      : { ok: false, reason: 'id-conflict' }
  }

  let articles = data.articles || []
  if (publication.sourceArticleId) {
    const sourceArticle = articles.find(
      (article) => article.id === publication.sourceArticleId,
    )
    if (!sourceArticle || sourceArticle.status !== 'accepted')
      return { ok: false, reason: 'article-not-accepted' }
    articles = articles.map((article) =>
      article.id === publication.sourceArticleId
        ? {
            ...article,
            status: 'published',
            publicationId: publication.id,
          }
        : article,
    )
  }

  return {
    ok: true,
    duplicate: false,
    data: {
      ...data,
      articles,
      publications: [...publications, publication],
    },
  }
}

export const hasLinkedInContent = (value) =>
  (value.articles || []).some((article) =>
    [
      'title',
      'source',
      'url',
      'publishedAt',
      'verified',
      'verifiedAt',
      'relevance',
      'topics',
      'opinion',
      'publicationId',
    ].some((key) => {
      const content = article[key]
      if (Array.isArray(content)) return content.length > 0
      if (typeof content === 'string') return Boolean(content.trim())
      return content === true
    }),
  ) ||
  (value.publications || []).some((publication) => Boolean(publication.text)) ||
  (value.excludedArticleUrls || []).length > 0
