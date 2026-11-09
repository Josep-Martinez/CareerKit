import { STRINGS as s } from '../../i18n/es.js'

export function FallbackConnectDialog({ busy, error, onClose, onFiles }) {
  const copy = s.fallbackFiles

  return (
    <div className="modal-backdrop">
      <section
        className="modal fallback-connect-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fallback-connect-title"
      >
        <button
          className="modal-close"
          type="button"
          onClick={onClose}
          aria-label={s.dataConnection.close}
        >
          ×
        </button>
        <span className="eyebrow">{copy.eyebrow}</span>
        <h2 id="fallback-connect-title">{copy.title}</h2>
        <p>{copy.body}</p>
        <p className="fallback-connect-help">{copy.files}</p>
        <label className="button primary file-button">
          {busy ? copy.opening : copy.choose}
          <input
            type="file"
            accept="application/json,.json"
            multiple
            disabled={busy}
            onChange={(event) => {
              const files = Array.from(event.currentTarget.files || [])
              event.currentTarget.value = ''
              if (files.length) onFiles(files)
            }}
          />
        </label>
        {error && (
          <p className="workspace-gate-notice" role="alert">
            {error}
          </p>
        )}
        <div className="fallback-connect-limits">
          <b>{copy.limitTitle}</b>
          <p>{copy.limitBody}</p>
        </div>
        <div className="modal-actions">
          <button
            className="button secondary"
            type="button"
            onClick={onClose}
            disabled={busy}
          >
            {s.dataConnection.close}
          </button>
        </div>
      </section>
    </div>
  )
}
