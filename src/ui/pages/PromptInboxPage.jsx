import { useState } from 'react'
import { PageHeading } from '../components/PagePrimitives.jsx'
import { TextField } from '../components/FormPrimitives.jsx'
import { STRINGS as s } from '../../i18n/es.js'
import { buildPromptText } from '../../i18n/prompt-inbox.es.js'

export function PromptInboxPage({ pending, onCopy }) {
  const copy = s.promptInbox
  const [search, setSearch] = useState('')
  const [vacancyReference, setVacancyReference] = useState('')
  const [copyMessages, setCopyMessages] = useState({})
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

  async function copyPrompt(prompt) {
    if (prompt.requiresVacancy && !vacancyReference.trim()) {
      setCopyMessages((previous) => ({
        ...previous,
        [prompt.id]: copy.copyMissingVacancy,
      }))
      return
    }
    const text = buildPromptText(prompt, {
      vacancyReference: vacancyReference.trim(),
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
      {pending && (
        <section className="prompt-reminder" role="status">
          <span className="prompt-reminder-count">1</span>
          <div>
            <h2>{copy.pendingTitle}</h2>
            <p>{copy.pendingBody}</p>
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
      <div className="prompt-list">
        {copy.categories.map((category) => {
          const groupPrompts = prompts.filter(
            (prompt) => prompt.category === category.id,
          )
          if (!groupPrompts.length) return null
          return (
            <section className="prompt-group" key={category.id}>
              <h2 className="prompt-group-title">{category.title}</h2>
              <div className="prompt-group-list">
                {groupPrompts.map((prompt) => {
                  const isPending = pending && prompt.id === 'refresh-cv'
                  const renderedText = buildPromptText(prompt, {
                    vacancyReference: vacancyReference.trim(),
                  })
                  return (
                    <article
                      className={`prompt-card ${isPending ? 'is-pending' : ''}`}
                      key={prompt.id}
                    >
                      <details className="prompt-details" open={isPending}>
                        <summary className="prompt-card-heading">
                          <div>
                            <h3>{prompt.title}</h3>
                            <p className="prompt-use">{prompt.use}</p>
                          </div>
                          {isPending && (
                            <span className="prompt-pending-tag">
                              {copy.pendingTag}
                            </span>
                          )}
                        </summary>
                        <div className="prompt-card-body">
                          <p className="prompt-skills-label">
                            {copy.skillsLabel}
                          </p>
                          <ul className="prompt-skill-list">
                            {prompt.skillPaths.map((path) => (
                              <li key={path}>
                                <code>{path}</code>
                              </li>
                            ))}
                          </ul>
                          {prompt.requiresVacancy && (
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
                              disabled={
                                prompt.requiresVacancy &&
                                !vacancyReference.trim()
                              }
                              onClick={() => copyPrompt(prompt)}
                            >
                              {copy.copyButton}
                            </button>
                            {copyMessages[prompt.id] && (
                              <span role="status">
                                {copyMessages[prompt.id]}
                              </span>
                            )}
                            {isPending &&
                              copyMessages[prompt.id] === copy.copyFailed && (
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
                })}
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
