import { useEffect, useState } from 'react'
import { STRINGS as s } from '../../i18n/es.js'
import { buildPromptText, PROMPT_INBOX_ES } from '../../i18n/prompt-inbox.es.js'
import { registerLinkedInPublication } from '../../data/linkedin-content-data.js'
import { id } from '../utils.js'
import { PageHeading, Status } from '../components/PagePrimitives.jsx'
import { TextField, useDraft } from '../components/FormPrimitives.jsx'

const emptyForm = () => ({
  id: id(),
  confirmed: false,
  type: 'project',
  text: '',
  language: '',
  publishedAt: '',
  url: '',
  sourceArticleId: '',
})

function safeUrl(value) {
  if (!value) return ''
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) ? url.href : ''
  } catch {
    return ''
  }
}

function publicationPrompt(form, sourceArticle) {
  const prompt = PROMPT_INBOX_ES.prompts.find(
    (item) => item.id === 'record-linkedin-publication',
  )
  const details = [
    '---',
    'Datos para registrar',
    `id: ${form.id}`,
    'Contexto: comparto este texto para registrar una publicación ya publicada en LinkedIn.',
    `Tipo: ${form.type}`,
    form.language ? `Idioma: ${form.language}` : '',
    form.publishedAt ? `Fecha publicada: ${form.publishedAt}` : '',
    form.url ? `Enlace: ${form.url}` : '',
    form.sourceArticleId ? `sourceArticleId: ${form.sourceArticleId}` : '',
    sourceArticle ? `Artículo relacionado: ${sourceArticle.title}` : '',
    'Texto exacto publicado:',
    form.text,
  ]
    .filter((line) => line !== '')
    .join('\n')
  return buildPromptText(prompt, { body: `${prompt.text}\n\n${details}` })
}

export function LinkedInPublicationsPage({
  articleId,
  value,
  state,
  warning,
  savedAt,
  saving,
  savedDraft,
  onDirtyChange,
  onDraftChange,
  onSave,
  onReload,
  onNavigate,
  onPromptCopied,
}) {
  const copy = s.linkedinPublicationsPage
  const [draft, setDraft] = useDraft(value, { onDraftChange, savedDraft })
  const [form, setForm] = useState(emptyForm)
  const [formTouched, setFormTouched] = useState(false)
  const [notice, setNotice] = useState('')
  const [promptPreview, setPromptPreview] = useState('')
  const [savingPublication, setSavingPublication] = useState(false)
  const articles = draft.articles || []
  const publications = draft.publications || []
  const acceptedArticles = articles.filter(
    (article) => article.status === 'accepted',
  )
  const sourceArticle = articles.find((article) => article.id === articleId)
  const relatedOpinion = sourceArticle?.opinion || ''
  const selectedArticle = acceptedArticles.find(
    (article) => article.id === form.sourceArticleId,
  )
  const existingPublication = sourceArticle?.publicationId
    ? publications.find(
        (publication) => publication.id === sourceArticle.publicationId,
      )
    : null
  const canCopyRegistrationPrompt =
    !savingPublication && !saving && Boolean(form.text.trim())
  const formDirty = formTouched
  const dirty = JSON.stringify(draft) !== JSON.stringify(value)

  useEffect(() => {
    if (articleId && sourceArticle?.status === 'accepted') {
      setForm((current) => ({
        ...current,
        type: 'article',
        sourceArticleId: sourceArticle.id,
      }))
    }
  }, [articleId, sourceArticle?.id, sourceArticle?.status])

  useEffect(() => {
    onDirtyChange?.(dirty || formDirty)
  }, [dirty, formDirty, onDirtyChange])

  function updateForm(key, nextValue) {
    setFormTouched(true)
    setNotice('')
    setPromptPreview('')
    setForm((current) => ({ ...current, [key]: nextValue }))
  }

  async function savePublication() {
    setNotice('')
    if (!form.confirmed) {
      setNotice(copy.confirmBeforeSave)
      return
    }
    const url = safeUrl(form.url.trim())
    if (!form.text.trim() || (form.url.trim() && !url)) {
      setNotice(copy.invalid)
      return
    }
    const publication = {
      id: form.id,
      type: form.type,
      text: form.text,
      ...(form.language ? { language: form.language } : {}),
      ...(form.publishedAt ? { publishedAt: form.publishedAt } : {}),
      ...(url ? { url } : {}),
      ...(form.sourceArticleId
        ? { sourceArticleId: form.sourceArticleId }
        : {}),
    }
    const result = registerLinkedInPublication(draft, publication)
    if (!result.ok) {
      setNotice(
        result.reason === 'article-not-accepted'
          ? copy.articleNotAccepted
          : result.reason === 'id-conflict'
            ? copy.idConflict
            : copy.invalid,
      )
      return
    }
    if (result.duplicate) {
      if (JSON.stringify(draft) !== JSON.stringify(value)) {
        setSavingPublication(true)
        const saved = await onSave(draft)
        setSavingPublication(false)
        if (saved) {
          setNotice(copy.saved)
          setForm(emptyForm())
          setFormTouched(false)
        } else setNotice(copy.saveFailed)
      } else setNotice(copy.duplicate)
      return
    }
    setSavingPublication(true)
    setDraft(result.data)
    const saved = await onSave(result.data)
    setSavingPublication(false)
    if (saved) {
      setNotice(copy.saved)
      setForm(emptyForm())
      setFormTouched(false)
    } else {
      setNotice(copy.saveFailed)
    }
  }

  async function copyPrompt(text) {
    setPromptPreview(text)
    try {
      await navigator.clipboard.writeText(text)
      onPromptCopied?.('record-linkedin-publication')
      setNotice(copy.promptCopied)
    } catch {
      setNotice(copy.copyFailed)
    }
  }

  async function copyGeneralRegistrationPrompt() {
    const prompt = PROMPT_INBOX_ES.prompts.find(
      (item) => item.id === 'record-linkedin-publication',
    )
    await copyPrompt(buildPromptText(prompt))
  }

  async function copyHeaderRegistrationPrompt() {
    if (form.text.trim()) {
      await copyRegistrationPrompt()
      return
    }
    await copyGeneralRegistrationPrompt()
  }

  async function copyRegistrationPrompt() {
    await copyPrompt(publicationPrompt(form, selectedArticle))
  }

  const postsByDate = [...publications].reverse()

  return (
    <>
      <PageHeading
        eyebrow={copy.eyebrow}
        title={copy.title}
        subtitle={copy.subtitle}
        className="publication-page-heading"
        action={
          <div className="publication-page-actions">
            {!existingPublication && (
              <button
                type="button"
                className="button secondary"
                onClick={copyHeaderRegistrationPrompt}
              >
                {copy.copyPrompt}
              </button>
            )}
            <button
              type="button"
              className="button secondary"
              onClick={() => onNavigate?.('linkedin-content')}
            >
              {copy.backToContent}
            </button>
          </div>
        }
      />
      <Status
        fileName="linkedin-content"
        state={state}
        dirty={dirty || formDirty}
        warning={warning}
        savedAt={savedAt}
        onReload={onReload}
      />
      {notice && (
        <p className="content-linkedin-notice" role="status" aria-live="polite">
          {notice}
        </p>
      )}
      {existingPublication ? (
        <section className="content-linkedin-work-panel publication-register-panel">
          <span className="eyebrow">{copy.savedPublicationTitle}</span>
          <h2>{sourceArticle?.title}</h2>
          <div className="publication-post-preview">
            {existingPublication.text}
          </div>
          <div className="publication-archive-topline">
            {existingPublication.publishedAt && (
              <span>{existingPublication.publishedAt}</span>
            )}
            {existingPublication.language && (
              <span>
                {existingPublication.language === 'en' ? 'English' : 'Español'}
              </span>
            )}
          </div>
          {existingPublication.url && safeUrl(existingPublication.url) && (
            <a
              className="button secondary small"
              href={safeUrl(existingPublication.url)}
              target="_blank"
              rel="noreferrer"
            >
              {copy.openLink}
            </a>
          )}
        </section>
      ) : (
        <section className="content-linkedin-work-panel publication-register-panel">
          <span className="eyebrow">{copy.introTitle}</span>
          <p>{copy.intro}</p>
          {relatedOpinion && (
            <div className="publication-related-note">
              <strong>{copy.sourceContext}</strong>
              <p>{relatedOpinion}</p>
              <small>{copy.sourceContextHint}</small>
            </div>
          )}
          <div className="content-linkedin-form-grid">
            <label className="field">
              <span>{copy.typeLabel}</span>
              <select
                value={form.type}
                onChange={(event) => updateForm('type', event.target.value)}
              >
                {Object.entries(s.linkedinContentPage.postTypes).map(
                  ([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ),
                )}
              </select>
            </label>
            <label className="field">
              <span>{copy.languageLabel}</span>
              <select
                value={form.language}
                onChange={(event) => updateForm('language', event.target.value)}
              >
                <option value="">{copy.languageNone}</option>
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </label>
            <TextField
              label={copy.dateLabel}
              value={form.publishedAt}
              onChange={(date) => updateForm('publishedAt', date)}
              placeholder="AAAA-MM-DD"
            />
            <TextField
              label={copy.urlLabel}
              value={form.url}
              onChange={(url) => updateForm('url', url)}
            />
            {acceptedArticles.length > 0 && (
              <label className="field publication-source-select">
                <span>{copy.sourceLabel}</span>
                <select
                  value={form.sourceArticleId}
                  onChange={(event) =>
                    updateForm('sourceArticleId', event.target.value)
                  }
                >
                  <option value="">{copy.noSource}</option>
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
            label={copy.contentLabel}
            rows={10}
            value={form.text}
            onChange={(text) => updateForm('text', text)}
            hint={copy.contentHint}
          />
          <label className="check publication-confirmation">
            <input
              type="checkbox"
              checked={form.confirmed}
              onChange={(event) =>
                updateForm('confirmed', event.target.checked)
              }
            />
            <span>{copy.confirmPublished}</span>
          </label>
          <div className="publication-register-actions">
            <button
              type="button"
              className="button primary"
              disabled={
                savingPublication ||
                saving ||
                !form.confirmed ||
                !form.text.trim()
              }
              onClick={savePublication}
            >
              {savingPublication || saving ? copy.saving : copy.save}
            </button>
            <button
              type="button"
              className="button secondary"
              disabled={!canCopyRegistrationPrompt}
              onClick={copyRegistrationPrompt}
            >
              {copy.copyPrompt}
            </button>
          </div>
          <details className="content-linkedin-prompt-preview">
            <summary>{copy.promptPreview}</summary>
            <textarea
              aria-label={copy.promptPreview}
              readOnly
              rows={11}
              value={promptPreview || publicationPrompt(form, selectedArticle)}
            />
          </details>
        </section>
      )}

      <section
        className="publication-archive"
        aria-labelledby="publication-archive-title"
      >
        <div className="section-title-row">
          <div>
            <span className="eyebrow">{copy.archiveTitle}</span>
            <h2 id="publication-archive-title">{copy.archiveTitle}</h2>
            <p className="muted">{copy.archiveDescription}</p>
          </div>
        </div>
        {postsByDate.length ? (
          <div className="publication-archive-list">
            {postsByDate.map((publication) => {
              const source = articles.find(
                (article) => article.id === publication.sourceArticleId,
              )
              return (
                <article
                  className="publication-archive-card"
                  key={publication.id}
                >
                  <div className="publication-archive-topline">
                    <span className="content-linkedin-status is-published">
                      {copy.publishedBadge}
                    </span>
                    {(publication.publishedAt || publication.language) && (
                      <span>
                        {publication.publishedAt || ''}
                        {publication.language
                          ? `${publication.publishedAt ? ' · ' : ''}${publication.language === 'en' ? 'English' : 'Español'}`
                          : ''}
                      </span>
                    )}
                  </div>
                  <h3>{s.linkedinContentPage.postTypes[publication.type]}</h3>
                  {source && (
                    <p className="publication-source-title">
                      {copy.sourcePrefix}: {source.title}
                    </p>
                  )}
                  <div className="publication-post-preview">
                    {publication.text}
                  </div>
                  {publication.url && safeUrl(publication.url) && (
                    <a
                      className="button secondary small"
                      href={safeUrl(publication.url)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {copy.openLink}
                    </a>
                  )}
                </article>
              )
            })}
          </div>
        ) : (
          <div className="content-linkedin-queue-empty">
            <span aria-hidden="true">✳</span>
            <p>{copy.empty}</p>
          </div>
        )}
      </section>
    </>
  )
}
