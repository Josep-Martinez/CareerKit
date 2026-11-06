import { useState } from 'react'
import { PageHeading, Status } from '../components/PagePrimitives.jsx'
import { STRINGS as s } from '../../i18n/es.js'
import { pretty } from '../utils.js'

export function CVPage({
  value,
  connected,
  isEmpty,
  profileReady,
  linkedinReady,
  state,
  warning,
  onNavigate,
  onReload,
  onPromptCopied,
}) {
  const [activeVersion, setActiveVersion] = useState('spanish')
  const [promptMessage, setPromptMessage] = useState('')
  const copy = s.cvEditor
  const spanish = activeVersion === 'spanish'
  const current = value.versions?.[activeVersion] || {
    masterText: '',
    lastUpdated: '',
    lastReviewed: '',
  }
  const guide = spanish ? copy.spanishGuide : copy.englishGuide
  const guideTitle = spanish ? copy.spanishGuideTitle : copy.englishGuideTitle
  const showEmptyGuidance = connected && isEmpty
  const sourcesReady = profileReady && linkedinReady
  const refreshPrompt = s.promptInbox.prompts.find(
    (prompt) => prompt.id === 'refresh-cv',
  )

  async function copyRefreshPrompt() {
    try {
      await navigator.clipboard.writeText(refreshPrompt.text)
      setPromptMessage(s.promptInbox.copied)
      onPromptCopied('refresh-cv')
    } catch {
      setPromptMessage(s.promptInbox.copyFailed)
    }
  }

  if (showEmptyGuidance) {
    return (
      <>
        <PageHeading
          eyebrow="BASE PROFESIONAL"
          title={copy.title}
          subtitle={copy.subtitle}
        />
        <Status state={state} warning={warning} onReload={onReload} />
        <section className="cv-preparation panel">
          <span className="eyebrow">{copy.emptyEyebrow}</span>
          <h2>{copy.emptyTitle}</h2>
          <p>
            {sourcesReady
              ? copy.emptyBodyWithSources
              : copy.emptyBodyWithoutSources}
          </p>
          {!sourcesReady && (
            <div className="cv-preparation-actions">
              {!profileReady && (
                <button
                  className="button secondary"
                  onClick={() => onNavigate('profile')}
                >
                  {s.homeSetup.profileAction}
                </button>
              )}
              {!linkedinReady && (
                <button
                  className="button secondary"
                  onClick={() => onNavigate('linkedin')}
                >
                  {s.homeSetup.linkedinAction}
                </button>
              )}
            </div>
          )}
          <label className="field cv-preparation-prompt">
            <span>
              {s.promptInbox.promptLabel}: {refreshPrompt.title}
            </span>
            <textarea
              readOnly
              rows={8}
              value={refreshPrompt.text}
              onFocus={(event) => event.target.select()}
            />
          </label>
          <div className="cv-preparation-actions">
            <button className="button primary" onClick={copyRefreshPrompt}>
              {s.promptInbox.copyButton}
            </button>
            <button
              className="button secondary"
              onClick={() => onNavigate('prompts')}
            >
              {copy.morePrompts}
            </button>
            {promptMessage && <span role="status">{promptMessage}</span>}
            {promptMessage === s.promptInbox.copyFailed && (
              <button
                className="text-button"
                onClick={() => {
                  onPromptCopied('refresh-cv')
                  setPromptMessage(s.promptInbox.copied)
                }}
              >
                {s.promptInbox.confirmManualCopy}
              </button>
            )}
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <PageHeading
        eyebrow="BASE PROFESIONAL"
        title={copy.title}
        subtitle={copy.subtitle}
      />
      <Status state={state} warning={warning} onReload={onReload} />
      <div
        className="cv-version-switch"
        role="group"
        aria-label={copy.versionGroup}
      >
        <button
          type="button"
          className={spanish ? 'selected' : ''}
          aria-pressed={spanish}
          onClick={() => setActiveVersion('spanish')}
        >
          <span>{copy.spanishTab}</span>
        </button>
        <button
          type="button"
          className={!spanish ? 'selected' : ''}
          aria-pressed={!spanish}
          onClick={() => setActiveVersion('english')}
        >
          <span>{copy.englishTab}</span>
        </button>
      </div>
      {value.previousVersion && (
        <section className="cv-legacy-notice" aria-labelledby="cv-legacy-title">
          <div>
            <h2 id="cv-legacy-title">{copy.legacyTitle}</h2>
            <p>{copy.legacyReadOnly}</p>
          </div>
          <pre className="cv-legacy-content">
            {value.previousVersion.masterText || copy.noLegacyText}
          </pre>
        </section>
      )}
      <div className="cv-layout">
        <section className="panel form-panel">
          <div className={`cv-format-guide ${spanish ? 'spanish' : 'english'}`}>
            <span className="eyebrow">{guideTitle}</span>
            <p>{guide}</p>
            {spanish && <small>{copy.photoNote}</small>}
          </div>
          <div className="cv-baseline-note">
            <b>{copy.baseTitle}</b>
            <p>{copy.baseGuidance}</p>
            <small>{copy.baseHint}</small>
          </div>
          <pre
            className={`cv-master-text ${spanish ? 'spanish' : 'english'}`}
            lang={spanish ? 'es' : 'en'}
          >
            {current.masterText || copy.noBase}
          </pre>
          <dl className="cv-date-summary">
            <div>
              <dt>{copy.lastUpdated}</dt>
              <dd>{pretty(current.lastUpdated)}</dd>
            </div>
            <div>
              <dt>{copy.lastReviewed}</dt>
              <dd>{pretty(current.lastReviewed)}</dd>
            </div>
          </dl>
        </section>
        <aside className="tip-card cv-tip">
          <span className="tip-icon">▤</span>
          <h3>{copy.tipTitle}</h3>
          <p>{copy.tipBody}</p>
          <span className="privacy-tag">{copy.noManualEdit}</span>
        </aside>
      </div>
    </>
  )
}
