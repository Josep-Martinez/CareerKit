const isRecord = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const supportedTypes = [
  'achievement',
  'new-role',
  'promotion',
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

export const validLinkedInDraft = (item) =>
  isRecord(item) &&
  typeof item.id === 'string' &&
  item.id.trim().length > 0 &&
  supportedTypes.includes(item.type) &&
  item.language === 'en' &&
  typeof item.text === 'string' &&
  Boolean(item.text.trim()) &&
  ['needs-review', 'ready-to-post'].includes(item.status) &&
  optionalStrings(item, ['sourceArticleId'])

export const validLinkedInContentData = (value) =>
  isRecord(value) &&
  value.schemaVersion === 1 &&
  Array.isArray(value.articles) &&
  value.articles.every(validLinkedInContentArticle) &&
  (value.publications === undefined ||
    (Array.isArray(value.publications) &&
      value.publications.every(validLinkedInPublication))) &&
  (value.drafts === undefined ||
    (Array.isArray(value.drafts) && value.drafts.every(validLinkedInDraft))) &&
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

const publicationTitle = (publication) =>
  publication.text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean) ||
  publication.type ||
  publication.id

export function sortLinkedInPublications(publications = []) {
  const dated = []
  const undated = []

  for (const publication of publications) {
    const timestamp = publication.publishedAt
      ? Date.parse(publication.publishedAt)
      : Number.NaN
    if (Number.isFinite(timestamp)) dated.push({ publication, timestamp })
    else undated.push(publication)
  }

  dated.sort(
    (left, right) =>
      right.timestamp - left.timestamp ||
      left.publication.id.localeCompare(right.publication.id),
  )
  undated.sort(
    (left, right) =>
      publicationTitle(left).localeCompare(publicationTitle(right), 'en', {
        sensitivity: 'base',
      }) || left.id.localeCompare(right.id),
  )

  return [...dated.map(({ publication }) => publication), ...undated]
}

export function updateLinkedInDraft(data, draft) {
  if (!validLinkedInDraft(draft))
    return { ok: false, reason: 'invalid-draft', data }
  const drafts = data.drafts || []
  const index = drafts.findIndex((item) => item.id === draft.id)
  if (index < 0) return { ok: false, reason: 'draft-not-found', data }
  const nextDrafts = drafts.slice()
  nextDrafts[index] = { ...nextDrafts[index], ...draft }
  return { ok: true, data: { ...data, drafts: nextDrafts } }
}

export function deleteLinkedInDraft(data, draftId) {
  return {
    ...data,
    drafts: (data.drafts || []).filter((item) => item.id !== draftId),
  }
}

export function updateLinkedInPublication(data, publication) {
  if (!validLinkedInPublication(publication))
    return { ok: false, reason: 'invalid-publication', data }
  const publications = data.publications || []
  const index = publications.findIndex((item) => item.id === publication.id)
  if (index < 0) return { ok: false, reason: 'publication-not-found', data }
  const nextPublications = publications.slice()
  nextPublications[index] = { ...nextPublications[index], ...publication }
  return {
    ok: true,
    data: { ...data, publications: nextPublications },
  }
}

export function deleteLinkedInPublication(data, publicationId) {
  const publication = (data.publications || []).find(
    (item) => item.id === publicationId,
  )
  if (!publication) return data

  const articles = (data.articles || []).map((article) => {
    if (article.publicationId !== publicationId) return article
    const updatedArticle = { ...article, status: 'accepted' }
    delete updatedArticle.publicationId
    return updatedArticle
  })

  return {
    ...data,
    articles,
    publications: (data.publications || []).filter(
      (item) => item.id !== publicationId,
    ),
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
  (value.drafts || []).some((draft) => Boolean(draft.text)) ||
  (value.excludedArticleUrls || []).length > 0
