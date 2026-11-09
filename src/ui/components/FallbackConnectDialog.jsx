import { STRINGS as s } from '../../i18n/es.js'
import { Modal } from './Modal.jsx'

export function FallbackConnectDialog({ busy, error, onClose, onFiles }) {
  const copy = s.fallbackFiles

  return (
    <Modal
      className="fallback-connect-modal"
      labelledBy="fallback-connect-title"
      onClose={busy ? undefined : onClose}
    >
      <button
        className="modal-close"
        type="button"
        onClick={onClose}
        aria-label={s.dataConnection.close}
        disabled={busy}
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
    </Modal>
  )
}
