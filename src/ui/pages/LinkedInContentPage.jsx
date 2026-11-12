import { useState } from 'react'
import { STRINGS as s } from '../../i18n/es.js'
import { buildPromptText, PROMPT_INBOX_ES } from '../../i18n/prompt-inbox.es.js'
import { collectProfileEvidence } from '../profile-evidence.js'
import { patchLinkedInArticle } from '../../data/linkedin-content-data.js'
import { id } from '../utils.js'
import { PageHeading, Status } from '../components/PagePrimitives.jsx'
import { TextField, useDraft } from '../components/FormPrimitives.jsx'

const promptById = (idValue) =>
  PROMPT_INBOX_ES.prompts.find((prompt) => prompt.id === idValue)

const safeArticleUrl = (value) => {
  try {
    const url = new URL(value)
    return ['https:', 'http:'].includes(url.protocol) ? url.href : ''
  } catch {
    return ''
  }
}

const emptyArticleForm = () => ({
  title: '',
  source: '',
  url: '',
  publishedAt: '',
  relevance: '',
  topics: '',
})

function fieldLines(values = []) {
  return values.filter((value) => typeof value === 'string' && value.trim())
}

function statusLabel(status, copy) {
  return {
    pending: copy.pendingLabel,
    accepted: copy.acceptedLabel,
    rejected: copy.rejectedLabel,
    published: copy.publishedLabel,
  }[status]
}

export function LinkedInContentPage({
  value,
  profile,
  state,
  warning,
  savedAt,
  saving,
  savedDraft,
  onDirtyChange,
  onDraftChange,
  onSave,
  onReload,
  onPromptCopied,
  onRegisterPublication,
}) {
  const copy = s.linkedinContentPage
  const [draft, setDraft] = useDraft(value, {
    onDirtyChange,
    onDraftChange,
    savedDraft,
  })
  const [flow, setFlow] = useState('articles')
  const [queueView, setQueueView] = useState('pending')
  const [searchFocus, setSearchFocus] = useState('')
  const [articleForm, setArticleForm] = useState(emptyArticleForm)
  const [articleError, setArticleError] = useState('')
  const [postType, setPostType] = useState('project')
  const [postIdeas, setPostIdeas] = useState({})
  const [selectedArticleId, setSelectedArticleId] = useState('')
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState([])
  const [commentSource, setCommentSource] = useState('')
  const [commentOpinion, setCommentOpinion] = useState('')
  const [notice, setNotice] = useState('')
  const [savingArticleId, setSavingArticleId] = useState('')
  const postIdea = postIdeas[postType] || ''

  const articles = draft.articles || []
  const postDrafts = (draft.drafts || []).slice().reverse()
  const currentArticles = articles.filter(
    (article) => article.status === queueView,
  )
  const acceptedArticles = articles.filter(
    (article) => article.status === 'accepted',
  )
  const selectedArticle = acceptedArticles.find(
    (article) => article.id === selectedArticleId,
  )
  const profileSearchPreferences = fieldLines([
    ...(profile?.personalContext?.interests || []),
    ...(profile?.contentDirection?.themes || []),
    ...(profile?.contentDirection?.preferredVoices || []),
    ...(profile?.contentDirection?.preferredOrganizations || []),
  ])
  const evidence = [...collectProfileEvidence(profile).entries()].filter(
    ([, { item }]) => item.confirmed === true,
  )
  const dirty = JSON.stringify(draft) !== JSON.stringify(value)

  const patchArticle = (articleId, patch) =>
    setDraft((current) => patchLinkedInArticle(current, articleId, patch))

  async function saveArticleStatus(article, status) {
    if (savingArticleId) return
    const next = patchLinkedInArticle(draft, article.id, { status })
    setSavingArticleId(article.id)
    setNotice(copy.articleDecisionSaving)
    setDraft(next)
    try {
      const saved = await onSave(next)
      setNotice(saved ? copy.articleDecisionSaved : copy.articleDecisionFailed)
    } catch {
      setNotice(copy.articleDecisionFailed)
    } finally {
      setSavingArticleId('')
    }
  }

  function addArticle() {
    const url = safeArticleUrl(articleForm.url.trim())
    if (!articleForm.title.trim() || !articleForm.source.trim() || !url) {
      setArticleError(copy.articleInvalid)
      return
    }
    const article = {
      id: id(),
      title: articleForm.title.trim(),
      source: articleForm.source.trim(),
      url,
      publishedAt: articleForm.publishedAt.trim(),
      verified: false,
      verifiedAt: '',
      relevance: articleForm.relevance.trim(),
      topics: articleForm.topics
        .split(',')
        .map((topic) => topic.trim())
        .filter(Boolean),
      status: 'pending',
      opinion: '',
    }
    setDraft((current) => ({
      ...current,
      articles: [...current.articles, article],
    }))
    setArticleForm(emptyArticleForm())
    setArticleError('')
    setQueueView('pending')
    setNotice('')
  }

  function buildDiscoveryPrompt() {
    const prompt = promptById('discover-linkedin-articles')
    return buildPromptText(prompt, {
      body: [
        prompt.text,
        searchFocus.trim()
          ? `\n\n${copy.promptContext.extraSearchFocus}: ${searchFocus.trim()}`
          : '',
      ].join(''),
    })
  }

  function buildPostPrompt() {
    const prompt = promptById('draft-linkedin-post')
    const skills =
      postType === 'article'
        ? [...prompt.skillPaths, '.agents/skills/li-repurpose/SKILL.md'].filter(
            (path, index, all) => all.indexOf(path) === index,
          )
        : prompt.skillPaths
    const articleForPrompt = postType === 'article' ? selectedArticle : null
    const articleBlock = articleForPrompt
      ? [
          `${copy.promptContext.articleId}: ${articleForPrompt.id}`,
          `${copy.promptContext.articleTitle}: ${articleForPrompt.title}`,
          `${copy.promptContext.articleSource}: ${articleForPrompt.source}`,
          `${copy.promptContext.articleLink}: ${articleForPrompt.url}`,
          articleForPrompt.publishedAt
            ? `${copy.promptContext.articleDate}: ${articleForPrompt.publishedAt}`
            : '',
          articleForPrompt.relevance
            ? `${copy.promptContext.articleRelevance}: ${articleForPrompt.relevance}`
            : '',
          `${copy.promptContext.userOpinion}: ${postIdea.trim()}`,
        ]
          .filter(Boolean)
          .join('\n')
      : ''
    return buildPromptText(
      { ...prompt, skillPaths: skills },
      {
        body: [
          prompt.text,
          `---\n${copy.promptContext.title}`,
          `${copy.promptContext.type}: ${copy.postTypes[postType]}`,
          postType !== 'article' && postIdea.trim()
            ? `${copy.postIdeaLabels[postType]}:\n${postIdea.trim()}`
            : '',
          articleBlock
            ? `${copy.promptContext.acceptedArticle}:\n${articleBlock}`
            : '',
          selectedEvidenceIds.length
            ? `${copy.promptContext.evidenceIds}: ${selectedEvidenceIds.join(', ')}`
            : '',
        ]
          .filter(Boolean)
          .join('\n\n'),
      },
    )
  }

  function buildCommentPrompt() {
    const prompt = promptById('draft-linkedin-comment')
    return buildPromptText(prompt, {
      body: [
        prompt.text,
        `---\n${copy.promptContext.commentMaterial}`,
        `${copy.promptContext.postText}:\n${commentSource.trim()}`,
        `${copy.promptContext.commentOpinion}:\n${commentOpinion.trim()}`,
        copy.promptContext.profileTone,
      ].join('\n\n'),
    })
  }

  async function copyPrompt(text, promptId, successMessage) {
    try {
      await navigator.clipboard.writeText(text)
      onPromptCopied?.(promptId)
      setNotice(successMessage || copy.promptCopied)
    } catch {
      setNotice(copy.copyFailed)
    }
  }

  async function saveGeneratedDraft(item, status) {
    if (saving) return
    const next = {
      ...draft,
      drafts: (draft.drafts || []).map((current) =>
        current.id === item.id ? { ...current, ...item, status } : current,
      ),
    }
    setDraft(next)
    setNotice(copy.postDraftSaving)
    try {
      const saved = await onSave(next)
      setNotice(
        saved
          ? status === 'ready-to-post'
            ? copy.postDraftConfirmed
            : copy.postDraftSaved
          : copy.postDraftSaveFailed,
      )
    } catch {
      setNotice(copy.postDraftSaveFailed)
    }
  }

  async function copyGeneratedDraft(text) {
    try {
      await navigator.clipboard.writeText(text)
      setNotice(copy.postDraftCopied)
    } catch {
      setNotice(copy.copyFailed)
    }
  }

  async function saveQueue() {
    setNotice('')
    const result = await onSave(draft)
    if (result === true) setNotice(copy.saved)
    else setNotice(copy.saveFailed)
  }

  async function startArticlePost(article) {
    if (!(article.opinion || '').trim()) {
      setQueueView('accepted')
      setNotice(copy.opinionRequired)
      return
    }
    if (dirty) {
      setNotice(copy.savingOpinion)
      const saved = await onSave(draft)
      if (!saved) {
        setNotice(copy.opinionSaveFailed)
        return
      }
    }
    setSelectedArticleId(article.id)
    setPostType('article')
    setPostIdeas((current) => ({ ...current, article: article.opinion || '' }))
    setFlow('posts')
    setNotice('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const postCanCopy =
    postType === 'article'
      ? Boolean(selectedArticle && postIdea.trim())
      : Boolean(postIdea.trim())

  return (
    <>
      <PageHeading
        eyebrow={copy.eyebrow}
        title={copy.title}
        subtitle={copy.subtitle}
        action={
          dirty && (
            <button
              type="button"
              className="button primary"
              disabled={saving}
              onClick={saveQueue}
            >
              {saving ? copy.saving : copy.save}
            </button>
          )
        }
      />
      <Status
        fileName="linkedin-content"
        state={state}
        dirty={dirty}
        warning={warning}
        savedAt={savedAt}
        onReload={onReload}
      />
      {notice && (
        <p className="content-linkedin-notice" role="status" aria-live="polite">
          {notice}
        </p>
      )}
      <div
        className="content-linkedin-flow-tabs"
        role="group"
        aria-label={copy.flowTabsLabel}
      >
        {Object.entries(copy.flows).map(([key, label], index) => (
          <button
            type="button"
            key={key}
            className={flow === key ? 'is-active' : ''}
            aria-pressed={flow === key}
            onClick={() => {
              setFlow(key)
              setNotice('')
            }}
          >
            <span>0{index + 1}</span>
            {label}
          </button>
        ))}
      </div>

      {flow === 'articles' && (
        <>
          <section className="content-linkedin-search-panel">
            <div className="content-linkedin-search-copy">
              <span className="eyebrow">{copy.searchEyebrow}</span>
              <h2>{copy.discoverTitle}</h2>
              <p>{copy.discoverDescription}</p>
              <p className="content-linkedin-profile-context">
                {profileSearchPreferences.length
                  ? copy.profileReady.replace(
                      '{count}',
                      profileSearchPreferences.length,
                    )
                  : copy.profileEmpty}
              </p>
            </div>
            <div className="content-linkedin-search-action">
              <TextField
                label={copy.searchFocus}
                value={searchFocus}
                onChange={setSearchFocus}
                hint={copy.searchFocusHint}
              />
              <button
                className="button primary"
                type="button"
                onClick={() =>
                  copyPrompt(
                    buildDiscoveryPrompt(),
                    'discover-linkedin-articles',
                    copy.discoveryPromptCopied,
                  )
                }
              >
                {copy.discoverCopy}
              </button>
              <details className="content-linkedin-prompt-preview">
                <summary>{copy.promptPreview}</summary>
                <textarea
                  aria-label={copy.discoveryPrompt}
                  readOnly
                  rows={10}
                  value={buildDiscoveryPrompt()}
                />
              </details>
            </div>
          </section>

          <section
            className="content-linkedin-queue"
            aria-labelledby="content-queue-title"
          >
            <div className="section-title-row">
              <div>
                <span className="eyebrow">{copy.queueEyebrow}</span>
                <h2 id="content-queue-title">{copy.queueTitle}</h2>
                <p className="muted">{copy.queueDescription}</p>
              </div>
              <details className="content-linkedin-add-article">
                <summary className="button secondary">
                  {copy.addManually}
                </summary>
                <div className="content-linkedin-manual-form">
                  <TextField
                    label={copy.articleTitle}
                    value={articleForm.title}
                    onChange={(title) =>
                      setArticleForm((current) => ({ ...current, title }))
                    }
                  />
                  <TextField
                    label={copy.articleSource}
                    value={articleForm.source}
                    onChange={(source) =>
                      setArticleForm((current) => ({ ...current, source }))
                    }
                  />
                  <TextField
                    label={copy.articleUrl}
                    value={articleForm.url}
                    onChange={(url) =>
                      setArticleForm((current) => ({ ...current, url }))
                    }
                  />
                  <TextField
                    label={copy.articleDate}
                    value={articleForm.publishedAt}
                    onChange={(publishedAt) =>
                      setArticleForm((current) => ({ ...current, publishedAt }))
                    }
                  />
                  <TextField
                    label={copy.articleRelevance}
                    value={articleForm.relevance}
                    onChange={(relevance) =>
                      setArticleForm((current) => ({ ...current, relevance }))
                    }
                  />
                  <TextField
                    label={copy.articleTopics}
                    value={articleForm.topics}
                    onChange={(topics) =>
                      setArticleForm((current) => ({ ...current, topics }))
                    }
                  />
                  {articleError && (
                    <p className="content-linkedin-error">{articleError}</p>
                  )}
                  <button
                    type="button"
                    className="button primary"
                    onClick={addArticle}
                  >
                    {copy.addArticle}
                  </button>
                </div>
              </details>
            </div>
            <div
              className="content-linkedin-queue-tabs"
              role="group"
              aria-label={copy.queueTitle}
            >
              {Object.entries(copy.queueTabs).map(([key, label]) => (
                <button
                  type="button"
                  key={key}
                  className={queueView === key ? 'is-active' : ''}
                  aria-pressed={queueView === key}
                  onClick={() => setQueueView(key)}
                >
                  {label}
                  <span>
                    {
                      articles.filter((article) => article.status === key)
                        .length
                    }
                  </span>
                </button>
              ))}
            </div>
            {currentArticles.length ? (
              <div className="content-linkedin-article-list">
                {currentArticles.map((article) => (
                  <article
                    className={`content-linkedin-article is-${article.status}`}
                    key={article.id}
                  >
                    <div className="content-linkedin-article-topline">
                      <span
                        className={`content-linkedin-status is-${article.status}`}
                      >
                        {statusLabel(article.status, copy)}
                      </span>
                      <div className="content-linkedin-article-meta">
                        {article.publishedAt && (
                          <span>{article.publishedAt}</span>
                        )}
                        {article.verified === true && (
                          <span className="content-linkedin-verified">
                            {copy.verifiedArticle}
                          </span>
                        )}
                        {article.verified === false && (
                          <span className="content-linkedin-unverified">
                            {copy.unverifiedArticle}
                          </span>
                        )}
                      </div>
                    </div>
                    <h3>{article.title}</h3>
                    <p className="content-linkedin-source">{article.source}</p>
                    {article.relevance && <p>{article.relevance}</p>}
                    {article.topics?.length > 0 && (
                      <div className="content-linkedin-topics">
                        {article.topics.map((topic, index) => (
                          <span key={`${topic}-${index}`}>{topic}</span>
                        ))}
                      </div>
                    )}
                    <div className="content-linkedin-article-actions">
                      <a
                        href={safeArticleUrl(article.url)}
                        target="_blank"
                        rel="noreferrer"
                        className="button secondary small"
                      >
                        {copy.openArticle}
                      </a>
                      {article.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            className="button primary small"
                            disabled={Boolean(savingArticleId)}
                            onClick={() =>
                              saveArticleStatus(article, 'accepted')
                            }
                          >
                            {copy.acceptArticle}
                          </button>
                          <button
                            type="button"
                            className="button quiet small"
                            disabled={Boolean(savingArticleId)}
                            onClick={() =>
                              saveArticleStatus(article, 'rejected')
                            }
                          >
                            {copy.rejectArticle}
                          </button>
                        </>
                      )}
                      {article.status === 'rejected' && (
                        <button
                          type="button"
                          className="button secondary small"
                          disabled={Boolean(savingArticleId)}
                          onClick={() => saveArticleStatus(article, 'pending')}
                        >
                          {copy.restoreArticle}
                        </button>
                      )}
                    </div>
                    {article.status === 'accepted' && (
                      <div className="content-linkedin-opinion">
                        <TextField
                          label={copy.opinionLabel}
                          rows={4}
                          value={article.opinion || ''}
                          onChange={(opinion) =>
                            patchArticle(article.id, { opinion })
                          }
                          hint={copy.opinionHint}
                        />
                        <button
                          type="button"
                          className="button secondary small"
                          disabled={Boolean(savingArticleId)}
                          onClick={() => startArticlePost(article)}
                        >
                          {copy.preparePost}
                        </button>
                        <button
                          type="button"
                          className="button primary small"
                          onClick={() => onRegisterPublication?.(article.id)}
                        >
                          {copy.registerPublication}
                        </button>
                        <button
                          type="button"
                          className="button quiet small"
                          disabled={Boolean(savingArticleId)}
                          onClick={() => saveArticleStatus(article, 'rejected')}
                        >
                          {copy.rejectArticle}
                        </button>
                      </div>
                    )}
                    {article.status === 'published' && (
                      <div className="content-linkedin-opinion">
                        <p>{copy.publishedArticleMessage}</p>
                        <button
                          type="button"
                          className="button secondary small"
                          onClick={() => onRegisterPublication?.(article.id)}
                        >
                          {copy.viewPublishedPost}
                        </button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <div className="content-linkedin-queue-empty">
                <span aria-hidden="true">✳</span>
                <p>{copy.noArticles[queueView]}</p>
                {queueView === 'pending' && (
                  <button
                    type="button"
                    className="text-button"
                    onClick={() =>
                      copyPrompt(
                        buildDiscoveryPrompt(),
                        'discover-linkedin-articles',
                        copy.discoveryPromptCopied,
                      )
                    }
                  >
                    {copy.discoverCopy} →
                  </button>
                )}
              </div>
            )}
          </section>
        </>
      )}

      {flow === 'posts' && (
        <section className="content-linkedin-work-panel">
          <span className="eyebrow">{copy.postsEyebrow}</span>
          <h2>{copy.postTitle}</h2>
          <p>{copy.postDescription}</p>
          <section
            className="content-linkedin-draft-review"
            aria-labelledby="content-linkedin-drafts-title"
          >
            <div className="section-title-row">
              <div>
                <span className="eyebrow">{copy.postDraftsEyebrow}</span>
                <h3 id="content-linkedin-drafts-title">
                  {copy.postDraftsTitle}
                </h3>
                <p>{copy.postDraftsDescription}</p>
              </div>
            </div>
            {postDrafts.length ? (
              <div className="content-linkedin-draft-list">
                {postDrafts.map((postDraft) => {
                  const sourceArticle = articles.find(
                    (article) => article.id === postDraft.sourceArticleId,
                  )
                  return (
                    <article
                      className="content-linkedin-generated-draft"
                      key={postDraft.id}
                    >
                      <div className="content-linkedin-draft-topline">
                        <span
                          className={`content-linkedin-draft-status is-${postDraft.status}`}
                        >
                          {postDraft.status === 'ready-to-post'
                            ? copy.postDraftReadyLabel
                            : copy.postDraftNeedsReviewLabel}
                        </span>
                        <span>{copy.postTypes[postDraft.type]}</span>
                      </div>
                      {sourceArticle && (
                        <p className="content-linkedin-draft-source">
                          {copy.postDraftSource}: {sourceArticle.title}
                        </p>
                      )}
                      <TextField
                        label={copy.postDraftTextLabel}
                        rows={10}
                        lang="en"
                        value={postDraft.text}
                        onChange={(text) =>
                          setDraft((current) => ({
                            ...current,
                            drafts: (current.drafts || []).map((item) =>
                              item.id === postDraft.id
                                ? {
                                    ...item,
                                    text,
                                    status:
                                      text !== postDraft.text
                                        ? 'needs-review'
                                        : item.status,
                                  }
                                : item,
                            ),
                          }))
                        }
                        hint={copy.postDraftTextHint}
                      />
                      <div className="content-linkedin-draft-actions">
                        <button
                          type="button"
                          className="button secondary small"
                          disabled={saving}
                          onClick={() =>
                            saveGeneratedDraft(postDraft, postDraft.status)
                          }
                        >
                          {copy.postDraftSave}
                        </button>
                        <button
                          type="button"
                          className="button primary small"
                          disabled={
                            saving || postDraft.status === 'ready-to-post'
                          }
                          onClick={() =>
                            saveGeneratedDraft(postDraft, 'ready-to-post')
                          }
                        >
                          {postDraft.status === 'ready-to-post'
                            ? copy.postDraftReadyLabel
                            : copy.postDraftConfirm}
                        </button>
                        <button
                          type="button"
                          className="button quiet small"
                          onClick={() => copyGeneratedDraft(postDraft.text)}
                        >
                          {copy.postDraftCopy}
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            ) : (
              <p className="content-linkedin-drafts-empty">
                {copy.noPostDrafts}
              </p>
            )}
          </section>
          <div className="content-linkedin-form-grid">
            <label className="field">
              <span>{copy.postType}</span>
              <select
                value={postType}
                onChange={(event) => {
                  const nextType = event.target.value
                  setPostType(nextType)
                  if (nextType === 'article' && selectedArticle)
                    setPostIdeas((current) => ({
                      ...current,
                      article: selectedArticle.opinion || '',
                    }))
                }}
              >
                {Object.entries(copy.postTypes).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            {postType === 'article' && (
              <label className="field">
                <span>{copy.relatedArticle}</span>
                <select
                  value={selectedArticleId}
                  onChange={(event) => {
                    const nextId = event.target.value
                    setSelectedArticleId(nextId)
                    const article = acceptedArticles.find(
                      (item) => item.id === nextId,
                    )
                    setPostIdeas((current) => ({
                      ...current,
                      article: article?.opinion || '',
                    }))
                  }}
                >
                  <option value="">{copy.noAcceptedArticles}</option>
                  {acceptedArticles.map((article) => (
                    <option key={article.id} value={article.id}>
                      {article.title}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
          <TextField
            label={copy.postIdeaLabels[postType]}
            rows={5}
            value={postIdea}
            onChange={(next) =>
              setPostIdeas((current) => ({ ...current, [postType]: next }))
            }
            hint={copy.postIdeaHints[postType]}
          />
          {evidence.length > 0 ? (
            <fieldset className="content-linkedin-evidence-picker">
              <legend>{copy.selectedEvidence}</legend>
              {evidence.map(([evidenceId, { item }]) => (
                <label key={evidenceId}>
                  <input
                    type="checkbox"
                    checked={selectedEvidenceIds.includes(evidenceId)}
                    onChange={(event) =>
                      setSelectedEvidenceIds((current) =>
                        event.target.checked
                          ? [...current, evidenceId]
                          : current.filter((idValue) => idValue !== evidenceId),
                      )
                    }
                  />
                  <span>
                    {item.title || item.name || item.organization || evidenceId}
                  </span>
                </label>
              ))}
              <small>{copy.evidenceHint}</small>
            </fieldset>
          ) : (
            <p className="quiet-empty">{copy.noEvidence}</p>
          )}
          {postType === 'article' && selectedArticle && !postIdea.trim() && (
            <p className="content-linkedin-error" role="status">
              {copy.opinionRequired}
            </p>
          )}
          <button
            type="button"
            className="button primary"
            disabled={!postCanCopy}
            onClick={() => copyPrompt(buildPostPrompt(), 'draft-linkedin-post')}
          >
            {copy.copyPostPrompt}
          </button>
          <details className="content-linkedin-prompt-preview">
            <summary>{copy.promptPreview}</summary>
            <textarea
              aria-label={copy.promptPreview}
              readOnly
              rows={13}
              value={buildPostPrompt()}
            />
          </details>
        </section>
      )}

      {flow === 'comments' && (
        <section className="content-linkedin-work-panel">
          <span className="eyebrow">{copy.commentsEyebrow}</span>
          <h2>{copy.commentTitle}</h2>
          <p>{copy.commentDescription}</p>
          <TextField
            label={copy.commentSource}
            rows={9}
            value={commentSource}
            onChange={setCommentSource}
          />
          <TextField
            label={copy.commentPoint}
            rows={4}
            value={commentOpinion}
            onChange={setCommentOpinion}
            hint={copy.commentPointHint}
          />
          <button
            type="button"
            className="button primary"
            disabled={!commentSource.trim() || !commentOpinion.trim()}
            onClick={() =>
              copyPrompt(buildCommentPrompt(), 'draft-linkedin-comment')
            }
          >
            {copy.copyCommentPrompt}
          </button>
          <details className="content-linkedin-prompt-preview">
            <summary>{copy.promptPreview}</summary>
            <textarea
              aria-label={copy.promptPreview}
              readOnly
              rows={13}
              value={buildCommentPrompt()}
            />
          </details>
        </section>
      )}

      {notice && (
        <p className="content-linkedin-notice" role="status">
          {notice}
        </p>
      )}
    </>
  )
}
