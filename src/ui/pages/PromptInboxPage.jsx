import { useEffect, useState } from 'react'
import { PageHeading } from '../components/PagePrimitives.jsx'
import { TextField } from '../components/FormPrimitives.jsx'
import { STRINGS as s } from '../../i18n/es.js'
import {
  buildPromptText,
  PROMPT_REQUIREMENTS,
} from '../../i18n/prompt-inbox.es.js'

export function PromptInboxPage({
  pending,
  onCopy,
  onCheckLinkedIn,
  onConfirmLinkedIn,
  adaptationVacancyId,
  vacancies,
  onReturnToVacancy,
  focusedPromptId,
}) {
  const copy = s.promptInbox
  const pendingCv = Boolean(pending?.cv)
  const pendingLinkedinLanguages = Boolean(pending?.linkedinLanguages)
  const pendingCount = Number(pendingCv) + Number(pendingLinkedinLanguages)
  const pendingPromptIds = new Set([
    ...(pendingCv ? ['refresh-cv'] : []),
    ...(pendingLinkedinLanguages ? ['sync-linkedin-languages'] : []),
  ])
  const [search, setSearch] = useState('')
  const [vacancyReference, setVacancyReference] = useState('')
  const [selectedVacancyId, setSelectedVacancyId] = useState(
    adaptationVacancyId || '',
  )
  const selectedVacancy = vacancies.find(
    (item) => item.id === selectedVacancyId,
  )
  const [copyMessages, setCopyMessages] = useState({})
  useEffect(() => {
    if (!focusedPromptId) return
    const summary = document
      .getElementById(`prompt-${focusedPromptId}`)
      ?.querySelector('summary')
    const frame = requestAnimationFrame(() => {
      summary?.focus({ preventScroll: true })
      summary?.scrollIntoView({ block: 'start' })
    })
    return () => cancelAnimationFrame(frame)
  }, [focusedPromptId])

  const query = search.trim().toLocaleLowerCase('es')
  const prompts = copy.prompts.filter((prompt) =>
    [
      prompt.title,
      prompt.use,
      prompt.text,
      ...prompt.skillPaths,
      copy.categories.find((category) => category.id === prompt.category)
        ?.title,
    ]
      .join(' ')
      .toLocaleLowerCase('es')
      .includes(query),
  )

  function referenceFor(prompt) {
    return prompt.id === 'tailor-cv-vacancy'
      ? selectedVacancy?.id || ''
      : vacancyReference.trim()
  }

  async function copyPrompt(prompt) {
    const reference = referenceFor(prompt)
    if (prompt.requiresVacancy && !reference) {
      setCopyMessages((previous) => ({
        ...previous,
        [prompt.id]: copy.copyMissingVacancy,
      }))
      return
    }
    const text = buildPromptText(prompt, {
      vacancyReference: referenceFor(prompt),
    })
    try {
      await navigator.clipboard.writeText(text)
      onCopy(prompt.id)
      setCopyMessages((previous) => ({ ...previous, [prompt.id]: copy.copied }))
    } catch {
      setCopyMessages((previous) => ({
        ...previous,
        [prompt.id]: copy.copyFailed,
      }))
    }
  }

  function renderPromptCard(prompt, isPending) {
    const requirements = PROMPT_REQUIREMENTS[prompt.id]
    const isTailoring = prompt.id === 'tailor-cv-vacancy'
    const renderedText = buildPromptText(prompt, {
      vacancyReference: referenceFor(prompt),
    })
    return (
      <article
        className={`prompt-card ${isPending ? 'is-pending' : ''}`}
        id={`prompt-${prompt.id}`}
        key={prompt.id}
      >
        <details
          className="prompt-details"
          open={isPending || prompt.id === focusedPromptId}
        >
          <summary className="prompt-card-heading">
            <div>
              <h3>{prompt.title}</h3>
              <p className="prompt-use">{prompt.use}</p>
              {requirements && (
                <div className="prompt-needs">
                  <p>
                    <b>{copy.filesLabel}</b>{' '}
                    {requirements.files.map((file) => (
                      <code key={file}>{file}</code>
                    ))}
                  </p>
                  <p>
                    <b>{copy.accessLabel}</b> {requirements.access}
                  </p>
                </div>
              )}
            </div>
            {isPending && (
              <span className="prompt-pending-tag">{copy.recentTag}</span>
            )}
          </summary>
          <div className="prompt-card-body">
            <p className="prompt-skills-label">{copy.skillsLabel}</p>
            <ul className="prompt-skill-list">
              {prompt.skillPaths.map((path) => (
                <li key={path}>
                  <code>{path}</code>
                </li>
              ))}
            </ul>
            {isTailoring && (
              <div className="tailoring-vacancy-picker">
                <label className="field">
                  <span>{s.vacancyPage.selectForCv}</span>
                  <select
                    value={selectedVacancy?.id || ''}
                    onChange={(event) => {
                      setSelectedVacancyId(event.target.value)
                      setCopyMessages((previous) => ({
                        ...previous,
                        [prompt.id]: '',
                      }))
                    }}
                  >
                    <option value="">{s.vacancyPage.chooseOffer}</option>
                    {vacancies.map((item) => (
                      <option key={item.id} value={item.id}>
                        {[item.role, item.company, item.location]
                          .filter(Boolean)
                          .join(' · ') || item.id}
                      </option>
                    ))}
                  </select>
                  {!vacancies.length && (
                    <small>{s.vacancyPage.noOffersForCv}</small>
                  )}
                </label>
                {selectedVacancy && (
                  <button
                    type="button"
                    className="button secondary small"
                    onClick={() => onReturnToVacancy(selectedVacancy.id)}
                  >
                    {s.vacancyPage.returnToOffer}
                  </button>
                )}
              </div>
            )}
            {prompt.requiresVacancy && !isTailoring && (
              <TextField
                label={copy.vacancyReference}
                value={vacancyReference}
                onChange={(value) => {
                  setVacancyReference(value)
                  setCopyMessages((previous) => ({
                    ...previous,
                    [prompt.id]: '',
                  }))
                }}
                hint={copy.vacancyReferenceHint}
              />
            )}
            <textarea
              className="prompt-content"
              aria-label={`${copy.promptLabel}: ${prompt.title}`}
              readOnly
              rows={8}
              value={renderedText}
              onFocus={(event) => event.target.select()}
            />
            <div className="prompt-card-footer">
              <button
                className="button secondary small"
                disabled={prompt.requiresVacancy && !referenceFor(prompt)}
                onClick={() => copyPrompt(prompt)}
              >
                {copy.copyButton}
              </button>
              {copyMessages[prompt.id] && (
                <span role="status">{copyMessages[prompt.id]}</span>
              )}
              {isPending && copyMessages[prompt.id] === copy.copyFailed && (
                <button
                  className="text-button"
                  onClick={() => {
                    onCopy(prompt.id)
                    setCopyMessages((previous) => ({
                      ...previous,
                      [prompt.id]: copy.copied,
                    }))
                  }}
                >
                  {copy.confirmManualCopy}
                </button>
              )}
            </div>
          </div>
        </details>
      </article>
    )
  }

  const recentPrompts = prompts.filter((prompt) =>
    pendingPromptIds.has(prompt.id),
  )
  const recentPromptIds = new Set(recentPrompts.map((prompt) => prompt.id))
  const otherPrompts = prompts.filter(
    (prompt) => !recentPromptIds.has(prompt.id),
  )

  return (
    <>
      <PageHeading
        eyebrow={copy.eyebrow}
        title={copy.title}
        subtitle={copy.subtitle}
      />
      <section className="prompt-usage-card">
        <div className="prompt-usage-mark" aria-hidden="true">
          i
        </div>
        <div>
          <h2>{copy.usageTitle}</h2>
          <p>{copy.usageBody}</p>
          <p>{copy.noNetwork}</p>
        </div>
      </section>
      {pendingCount > 0 && (
        <section className="prompt-reminder" role="status">
          <span className="prompt-reminder-count">{pendingCount}</span>
          <div>
            <h2>{copy.pendingTitle}</h2>
            {pendingCv && (
              <p>
                {copy.pendingCvBody.replace(
                  '{sources}',
                  (pending.cvSources || [])
                    .map((source) =>
                      source === 'profile' ? s.profilePage.title : 'LinkedIn',
                    )
                    .join(' y '),
                )}
              </p>
            )}
            {pendingLinkedinLanguages && (
              <div className="prompt-linkedin-check">
                <p>{copy.pendingLanguagesBody}</p>
                {pending?.linkedinNeedsReload && (
                  <p>{copy.pendingLanguagesExternalChange}</p>
                )}
                {pending?.linkedinCanCheck ? (
                  <button
                    className="button secondary small"
                    type="button"
                    onClick={onCheckLinkedIn}
                  >
                    {copy.checkLinkedInFile}
                  </button>
                ) : (
                  <p>{copy.linkedinCheckUnavailable}</p>
                )}
                {pending?.linkedinCanCheck && !pending.linkedinNeedsReload && (
                  <button
                    className="button secondary small"
                    type="button"
                    onClick={onConfirmLinkedIn}
                  >
                    {copy.confirmLinkedInSync}
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      )}
      <div className="prompt-search">
        <TextField
          label={copy.searchLabel}
          value={search}
          onChange={setSearch}
          placeholder={copy.searchPlaceholder}
        />
      </div>
      {recentPrompts.length > 0 && (
        <section className="prompt-group prompt-recent-group">
          <h2 className="prompt-group-title">{copy.recentChangesTitle}</h2>
          <p className="prompt-recent-description">
            {copy.recentChangesDescription}
          </p>
          <div className="prompt-group-list">
            {recentPrompts.map((prompt) => renderPromptCard(prompt, true))}
          </div>
        </section>
      )}
      <h2 className="prompt-all-title">{copy.allPromptsTitle}</h2>
      <div className="prompt-list">
        {copy.categories.map((category) => {
          const groupPrompts = otherPrompts.filter(
            (prompt) => prompt.category === category.id,
          )
          if (!groupPrompts.length) return null
          return (
            <section className="prompt-group" key={category.id}>
              <h2 className="prompt-group-title">{category.title}</h2>
              <div className="prompt-group-list">
                {groupPrompts.map((prompt) => renderPromptCard(prompt, false))}
              </div>
            </section>
          )
        })}
        {!prompts.length && (
          <p className="quiet-empty">{copy.noSearchResults}</p>
        )}
      </div>
    </>
  )
}
