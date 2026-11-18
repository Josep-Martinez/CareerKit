import { useState } from 'react'
import { BrandIcon } from './BrandIcon.jsx'
import { STRINGS as s } from '../../i18n/es.js'
import { buildPromptText } from '../../i18n/prompt-inbox.es.js'
import { copyTextToClipboard } from '../clipboard.js'

export function WorkspaceGate({
  connecting,
  notice,
  noticeAction,
  restoreStatus,
  hasRememberedFolder,
  onConnect,
  onChooseFolder,
  onConnectLocal,
  onOpenFiles,
}) {
  const [showPrompt, setShowPrompt] = useState(false)
  const [promptMessage, setPromptMessage] = useState('')
  const copy = s.workspaceGate
  const setupPrompt = s.promptInbox.prompts.find(
    (item) => item.id === 'prepare-data',
  )
  const prompt = buildPromptText(setupPrompt)
  const checking = restoreStatus === 'checking'
  const permissionRequired = restoreStatus === 'needs-permission'
  const storageError = restoreStatus === 'storage-error'
  const title = checking
    ? copy.checkingTitle
    : permissionRequired
      ? copy.rememberedTitle
      : storageError
        ? copy.storageErrorTitle
        : copy.title
  const body = checking
    ? copy.checkingBody
    : permissionRequired
      ? copy.rememberedBody
      : storageError
        ? copy.storageErrorBody
        : copy.body
  const primaryLabel = checking
    ? copy.checking
    : connecting
      ? copy.connecting
      : permissionRequired
        ? copy.grantPermission
        : s.connect

  async function copyPrompt() {
    if (await copyTextToClipboard(prompt)) {
      setPromptMessage(copy.copied)
    } else {
      setPromptMessage(copy.copyFailed)
      const textarea = document.querySelector(
        '#workspace-setup-prompt textarea',
      )
      textarea?.focus()
      textarea?.select()
    }
  }

  return (
    <main className="workspace-gate">
      <div className="workspace-gate-brand">
        <BrandIcon size={38} />
        <span>{s.brand}</span>
      </div>
      <section className="workspace-gate-card" aria-labelledby="gate-title">
        <span className="workspace-gate-priority">{copy.priority}</span>
        <span className="eyebrow">{copy.eyebrow}</span>
        <h1 id="gate-title">{title}</h1>
        <p className="workspace-gate-description">{body}</p>
        {notice && (
          <p className="workspace-gate-notice" role="status">
            {notice}
            {noticeAction === 'open-data-files' && (
              <button
                className="text-button workspace-gate-notice-action"
                type="button"
                onClick={onOpenFiles}
              >
                {copy.openFiles} →
              </button>
            )}
          </p>
        )}
        <div className="workspace-gate-actions">
          <button
            className="button primary"
            type="button"
            onClick={() => onConnect()}
            disabled={connecting || checking}
          >
            {primaryLabel}
          </button>
          <button
            className="button secondary"
            type="button"
            onClick={onOpenFiles}
            disabled={connecting || checking}
          >
            {copy.openFiles}
          </button>
          {(permissionRequired || storageError) && hasRememberedFolder && (
            <button
              className="button secondary"
              type="button"
              onClick={onChooseFolder}
              disabled={connecting}
            >
              {copy.chooseAnother}
            </button>
          )}
          {!checking && onConnectLocal && (
            <button
              className="button secondary"
              type="button"
              onClick={onConnectLocal}
              disabled={connecting}
            >
              {copy.connectLocal}
            </button>
          )}
          {!checking && (
            <button
              className="button secondary"
              type="button"
              aria-expanded={showPrompt}
              aria-controls="workspace-setup-prompt"
              onClick={() => {
                setShowPrompt((visible) => !visible)
                setPromptMessage('')
              }}
            >
              {showPrompt ? copy.hidePrompt : copy.showPrompt}
            </button>
          )}
        </div>
        {!checking && !permissionRequired && (
          <p className="workspace-gate-picker-hint">{copy.pickerHelp}</p>
        )}
        {showPrompt && (
          <div className="workspace-gate-prompt" id="workspace-setup-prompt">
            <label className="field">
              <span>{copy.promptLabel}</span>
              <textarea
                readOnly
                rows={7}
                value={prompt}
                onFocus={(event) => event.target.select()}
              />
            </label>
            <button
              className="button secondary"
              type="button"
              onClick={copyPrompt}
            >
              {copy.copyPrompt}
            </button>
            {promptMessage && <span role="status">{promptMessage}</span>}
          </div>
        )}
        <details className="workspace-gate-prompt">
          <summary>{copy.helpTitle}</summary>
          <ol>
            {copy.helpSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </details>
        <p className="workspace-gate-privacy">{copy.privacy}</p>
      </section>
    </main>
  )
}
