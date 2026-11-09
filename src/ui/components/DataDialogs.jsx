import { useEffect, useState } from 'react'
import { EMPTY } from '../../data/catalog.js'
import { STRINGS as s } from '../../i18n/es.js'
import { buildPromptText } from '../../i18n/prompt-inbox.es.js'
import { normalizeModule, validateModule } from '../../data/storage.js'
import { Modal } from './Modal.jsx'

export function FolderDataDialog({
  scan,
  onClose,
  onPrepare,
  onRecheck,
  onStartProfile,
  onOpenPrompts,
}) {
  const copy = s.dataConnection
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const missing = scan.missing || []
  const invalid = scan.invalid || []
  const hasMissing = missing.length > 0
  const hasInvalid = invalid.length > 0
  const isEmpty = Boolean(scan.emptyData && !hasMissing && !hasInvalid)
  const title = hasMissing
    ? missing.length === Object.keys(EMPTY).length
      ? copy.emptyFolderTitle
      : copy.missingTitle
    : hasInvalid
      ? copy.invalidTitle
      : copy.emptyTitle
  const preparationPrompt = s.promptInbox.prompts.find(
    (item) => item.id === 'prepare-data',
  )
  const prompt = buildPromptText(preparationPrompt, {
    body: [
      copy.prompt,
      hasMissing
        ? `${copy.missingLabel}: ${missing.map((name) => `${name}.json`).join(', ')}.`
        : '',
      hasInvalid
        ? `${copy.invalidLabel}: ${invalid.map(({ name }) => `${name}.json (compara con templates/${name}.json)`).join(', ')}.`
        : '',
    ]
      .filter(Boolean)
      .join('\n\n'),
  })

  async function copyInstructions() {
    try {
      await navigator.clipboard.writeText(prompt)
      setMessage(copy.copied)
    } catch {
      setMessage(copy.copyFailed)
    }
  }

  async function run(action) {
    setBusy(true)
    setMessage('')
    try {
      await action()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      className="folder-data-modal"
      labelledBy="folder-data-title"
      onClose={onClose}
    >
      <button className="modal-close" onClick={onClose} aria-label={copy.close}>
        ×
      </button>
      <span className="eyebrow">{s.connected}</span>
      <h2 id="folder-data-title">{title}</h2>
      <p>
        {hasMissing
          ? copy.missingBody
          : hasInvalid
            ? copy.invalidBody
            : copy.emptyBody}
      </p>
      {hasMissing && (
        <div className="folder-file-list">
          <b>{copy.missingLabel}</b>
          <ul>
            {missing.map((name) => (
              <li key={name}>{name}.json</li>
            ))}
          </ul>
        </div>
      )}
      {hasInvalid && (
        <div className="folder-file-list">
          <b>{copy.invalidLabel}</b>
          <ul>
            {invalid.map(({ name, message: detail }) => (
              <li key={name}>
                <strong>{name}.json</strong>
                <small>{detail}</small>
                <span>
                  {copy.templateHint} templates/{name}.json
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {scan.preparationError && (
        <div className="folder-inline-note" role="status">
          {copy.prepareError}
        </div>
      )}
      {scan.recheckError && (
        <div className="folder-inline-note" role="status">
          {copy.recheckError}
        </div>
      )}
      {message && (
        <div className="folder-inline-note" role="status">
          {message}
        </div>
      )}
      {(hasInvalid || hasMissing) && (
        <label className="field folder-prompt-field">
          <span>{copy.assistantPromptLabel}</span>
          <textarea
            readOnly
            rows={5}
            value={prompt}
            onFocus={(event) => event.target.select()}
            aria-label={copy.assistantPromptLabel}
          />
        </label>
      )}
      <div className="modal-actions">
        {hasMissing && (
          <button
            className="button primary"
            disabled={busy}
            onClick={() => run(onPrepare)}
          >
            {busy ? copy.preparing : copy.prepareButton}
          </button>
        )}
        {isEmpty && (
          <button className="button primary" onClick={onStartProfile}>
            {copy.startProfile}
          </button>
        )}
        {(hasInvalid || hasMissing) && (
          <button
            className="button secondary"
            disabled={busy}
            onClick={copyInstructions}
          >
            {copy.copyInstructions}
          </button>
        )}
        {(hasInvalid || hasMissing) && (
          <button
            className="button secondary"
            disabled={busy}
            onClick={() => run(onRecheck)}
          >
            {copy.recheckButton}
          </button>
        )}
        {isEmpty && (
          <button className="button secondary" onClick={onOpenPrompts}>
            {copy.openPrompts}
          </button>
        )}
        <button className="button secondary" onClick={onClose}>
          {copy.close}
        </button>
      </div>
    </Modal>
  )
}

export function FallbackDialog({ module, data, onClose, onDownload }) {
  const readOnlyCv = module === 'cv'
  const [json, setJson] = useState(JSON.stringify(data, null, 2))
  useEffect(() => setJson(JSON.stringify(data, null, 2)), [data, module])
  function download() {
    try {
      let source
      try {
        source = JSON.parse(json)
      } catch {
        throw new Error(
          `${module}.json no contiene JSON válido. Revisa templates/${module}.json.`,
        )
      }
      let normalized
      try {
        normalized = normalizeModule(module, source).data
      } catch {
        throw new Error(
          `${module}.json no coincide con templates/${module}.json y no se ha descargado.`,
        )
      }
      if (!validateModule(module, normalized))
        throw new Error(
          `${module}.json no coincide con el formato de templates/${module}.json y no se ha descargado.`,
        )
      const blob = new Blob([JSON.stringify(normalized, null, 2) + '\n'], {
        type: 'application/json',
      })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${module}.json`
      link.click()
      URL.revokeObjectURL(link.href)
      onDownload?.(module)
    } catch (error) {
      alert(
        `${error.message || 'El contenido no es JSON válido para este módulo.'} No se ha descargado.`,
      )
    }
  }
  return (
    <Modal
      className="fallback-modal"
      labelledBy="fallback-title"
      onClose={onClose}
    >
      <button
        className="modal-close"
        type="button"
        aria-label={s.dataConnection.close}
        onClick={onClose}
      >
        ×
      </button>
      <span className="eyebrow">ACCESO AL ALMACENAMIENTO</span>
      <h2 id="fallback-title">
        {readOnlyCv ? s.cvEditor.fallbackTitle : 'Guardar un JSON individual'}
      </h2>
      <p>
        {readOnlyCv ? (
          s.cvEditor.fallbackReadOnly
        ) : (
          <>
            Este navegador no ofrece conexión directa a carpetas. Puedes abrir{' '}
            <b>{module}.json</b>, cargarlo y descargar una versión editada.
            Sustituye el fichero manualmente en tu carpeta privada.
          </>
        )}
      </p>
      <label className="button secondary file-button">
        Abrir {module}.json
        <input
          type="file"
          accept="application/json,.json"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) {
              const reader = new FileReader()
              reader.onload = () => setJson(String(reader.result))
              reader.readAsText(file)
            }
          }}
        />
      </label>
      <textarea
        className="json-editor"
        aria-label="Contenido del archivo JSON"
        value={json}
        onChange={(event) => setJson(event.target.value)}
        readOnly={readOnlyCv}
        spellCheck="false"
      />
      <div className="modal-actions">
        <button className="button secondary" onClick={onClose}>
          Cerrar
        </button>
        {!readOnlyCv && (
          <button className="button primary" onClick={download}>
            Descargar {module}.json actualizado
          </button>
        )}
      </div>
      <small className="limit-note">
        {readOnlyCv
          ? s.cvEditor.fallbackLimitNote
          : 'El modo manual no detecta cambios externos ni sincroniza el fichero con esta página.'}
      </small>
    </Modal>
  )
}

export function DisconnectDialog({ manual, onClose, onDisconnect }) {
  return (
    <Modal labelledBy="disconnect-title" onClose={onClose}>
      <button
        className="modal-close"
        type="button"
        aria-label={s.dataConnection.close}
        onClick={onClose}
      >
        ×
      </button>
      <span className="eyebrow">Privacidad</span>
      <h2 id="disconnect-title">
        {manual ? s.fallbackFiles.closeManualTitle : 'Desconectar carpeta'}
      </h2>
      <p>
        {manual
          ? s.fallbackFiles.closeManualBody
          : 'La web dejará de leer y guardar los JSON. Puedes borrar también los datos cargados en esta sesión.'}
      </p>
      <div className="modal-actions">
        <button className="button secondary" type="button" onClick={onClose}>
          Cancelar
        </button>
        <button
          className="button secondary"
          type="button"
          onClick={() => onDisconnect(false)}
        >
          {manual ? s.fallbackFiles.closeKeep : 'Desconectar'}
        </button>
        <button
          className="button danger"
          type="button"
          onClick={() => onDisconnect(true)}
        >
          {manual
            ? s.fallbackFiles.closeClear
            : 'Desconectar y borrar datos de sesión'}
        </button>
      </div>
    </Modal>
  )
}
