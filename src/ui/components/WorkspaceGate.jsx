import { useState } from 'react'
import { STRINGS as s } from '../../i18n/es.js'

export function WorkspaceGate({ connecting, notice, onConnect }) {
  const [showPrompt, setShowPrompt] = useState(false)
  const [promptMessage, setPromptMessage] = useState('')
  const copy = s.workspaceGate
  const prompt = s.promptInbox.prompts.find(
    (item) => item.id === 'prepare-data',
  )

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt.text)
      setPromptMessage(copy.copied)
    } catch {
      setPromptMessage(copy.copyFailed)
    }
  }

  return (
    <main className="workspace-gate">
      <div className="workspace-gate-brand">
        <span className="brand-mark" aria-hidden="true">
          C
        </span>
        <span>{s.brand}</span>
      </div>
      <section className="workspace-gate-card" aria-labelledby="gate-title">
        <span className="workspace-gate-priority">{copy.priority}</span>
        <span className="eyebrow">{copy.eyebrow}</span>
        <h1 id="gate-title">{copy.title}</h1>
        <p className="workspace-gate-description">{copy.body}</p>
        {notice && (
          <p className="workspace-gate-notice" role="status">
            {notice}
          </p>
        )}
        <div className="workspace-gate-actions">
          <button
            className="button primary"
            type="button"
            onClick={onConnect}
            disabled={connecting}
          >
            {connecting ? copy.connecting : s.connect}
          </button>
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
        </div>
        {showPrompt && (
          <div className="workspace-gate-prompt" id="workspace-setup-prompt">
            <label className="field">
              <span>{copy.promptLabel}</span>
              <textarea
                readOnly
                rows={7}
                value={prompt.text}
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
        <p className="workspace-gate-privacy">{copy.privacy}</p>
      </section>
    </main>
  )
}
