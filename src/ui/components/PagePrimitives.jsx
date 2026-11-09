import { STRINGS as s } from '../../i18n/es.js'

export function PageHeading({
  eyebrow,
  title,
  subtitle,
  action,
  className = '',
}) {
  return (
    <div className={`page-heading ${className}`.trim()}>
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action}
    </div>
  )
}

export function EmptyState({ text, action, onClick }) {
  return (
    <div className="empty-state">
      <div className="empty-symbol">◇</div>
      <p>{text}</p>
      {action && (
        <button className="text-button" onClick={onClick}>
          {action} →
        </button>
      )}
    </div>
  )
}
export function Status({ state, warning, onReload, fileName, savedAt }) {
  const file = fileName ? `private-data/${fileName}.json` : ''
  const format = (template, replacements) =>
    Object.entries(replacements).reduce(
      (value, [key, replacement]) => value.replaceAll(`{${key}}`, replacement),
      template,
    )
  let label = state
  if (state === 'Guardando') label = format(s.saveStatus.saving, { file })
  else if (state === 'Guardado' && savedAt) {
    const time = new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(savedAt))
    label = format(s.saveStatus.saved, { file, time })
  } else if (state === 'Guardado manual')
    label = format(s.saveStatus.manualSaved, { file })
  else if (state === 'Pendiente de guardar')
    label = format(s.saveStatus.pendingManual, { file })
  else if (state === 'Cambio externo')
    label = format(s.saveStatus.externalState, { file })
  else if (state === 'Conflicto externo')
    label = format(s.saveStatus.conflictState, { file })
  else if (file) label = format(s.saveStatus.state, { file, state })

  const external = ['Cambio externo', 'Conflicto externo'].includes(state)
  return (
    <>
      {state && (
        <div
          className={`save-state ${state.includes('Error') || state.includes('externo') ? 'state-error' : ''} ${state.includes('plantilla') ? 'state-warning' : ''} ${state === 'Guardando' ? 'is-saving' : ''}`}
          role="status"
        >
          <span>●</span> {label}
        </div>
      )}
      {warning && (
        <div className="warning-box">
          {warning}
          {external && (
            <button type="button" onClick={onReload}>
              {s.saveStatus.reloadExternal}
            </button>
          )}
          {state === 'Error' && (
            <button type="button" onClick={onReload}>
              Volver a intentar
            </button>
          )}
          {state?.includes('plantilla') && (
            <button type="button" onClick={onReload}>
              Volver a comprobar
            </button>
          )}
        </div>
      )}
    </>
  )
}
