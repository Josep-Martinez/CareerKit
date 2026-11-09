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
export function Status({ state, warning, onReload }) {
  return (
    <>
      {state && (
        <div
          className={`save-state ${state.includes('Error') || state.includes('externo') ? 'state-error' : ''} ${state.includes('plantilla') ? 'state-warning' : ''}`}
          role="status"
        >
          <span>●</span> {state}
          {state?.includes('externo') && (
            <button onClick={onReload}>Recargar archivo</button>
          )}
        </div>
      )}
      {warning && (
        <div className="warning-box">
          {warning}
          {state === 'Error' && (
            <button onClick={onReload}>Volver a intentar</button>
          )}
          {state === 'Cambio externo' && (
            <button onClick={onReload}>Recargar archivo</button>
          )}
          {state?.includes('plantilla') && (
            <button onClick={onReload}>Volver a comprobar</button>
          )}
        </div>
      )}
    </>
  )
}
