import React, { useEffect, useState } from 'react'
import { EMPTY } from '../data/catalog.js'
import { NAV, STRINGS as s, TITLES } from '../i18n/es.js'
import { normalizeModule, useStorageState, validateModule } from '../data/storage.js'

const id = () => crypto.randomUUID()
const pretty = (value) => value || s.noData

export default function App() {
  const store = useStorageState()
  const [page, setPage] = useState('home')
  const [notice, setNotice] = useState('')
  const [noticeAction, setNoticeAction] = useState(null)
  const [fallbackOpen, setFallbackOpen] = useState(false)
  const [fallbackSavedModule, setFallbackSavedModule] = useState(null)
  const [folderDialog, setFolderDialog] = useState(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [vacancyId, setVacancyId] = useState(null)
  const [confirmDisconnect, setConfirmDisconnect] = useState(false)
  const [cvPromptPending, setCvPromptPending] = useState(false)
  const currentModule = Object.hasOwn(store.data, page) ? page : null

  function showNotice(message, action = null) {
    setNotice(message)
    setNoticeAction(action)
  }

  function remindCvPrompt(message) {
    setCvPromptPending(true)
    showNotice(message, 'cv-prompt')
  }

  async function reload(module) {
    const result = await store.reload(module)
    if (result.error && store.folder) setFolderDialog(await store.recheck())
    if (result.ok && ['profile', 'linkedin'].includes(module)) {
      remindCvPrompt(s.promptInbox.sourceReloaded)
    }
    return result
  }

  function handlePromptCopied(promptId) {
    if (promptId === 'refresh-cv') setCvPromptPending(false)
    showNotice(s.promptInbox.promptCopiedNotice)
  }

  function handleFallbackDownload(module) {
    if (fallbackSavedModule !== module) return
    setFallbackSavedModule(null)
    if (['profile', 'linkedin'].includes(module)) remindCvPrompt(s.promptInbox.fallbackSaved)
    else showNotice(s.promptInbox.downloadPrepared)
  }

  useEffect(() => {
    if (!store.folder) return undefined
    let cancelled = false
    const checks = async () => {
      for (const key of Object.keys(EMPTY)) {
        if (cancelled) return
        try {
          const handle = await store.folder.getFileHandle(`${key}.json`)
          const file = await handle.getFile()
          const txt = await file.text()
          if (txt !== store.revision[key] && store.revision[key] !== undefined) {
            if (store.states[key] !== 'Cambio externo') {
              store.setStates((prev) => ({ ...prev, [key]: 'Cambio externo' }))
              store.setWarnings((prev) => ({ ...prev, [key]: `${key}.json cambió fuera de la aplicación. Recárgalo para cargar la versión externa antes de guardar.` }))
              if (['profile', 'linkedin'].includes(key)) remindCvPrompt(s.promptInbox.sourceChanged)
            }
          }
        } catch { /* missing files are surfaced on initial connection */ }
      }
    }
    const timer = setInterval(checks, 2200)
    return () => { cancelled = true; clearInterval(timer) }
  }, [store.folder, store.revision, store.states])

  useEffect(() => {
    if (!mobileNavOpen) return undefined
    const closeOnEscape = (event) => { if (event.key === 'Escape') setMobileNavOpen(false) }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [mobileNavOpen])

  async function connect() {
    const result = await store.connect()
    if (result.fallback) setFallbackOpen(true)
    else if (result.connected) {
      const needsHelp = result.missing.length || result.invalid.length || result.emptyData
      setFolderDialog(needsHelp ? result : null)
      showNotice(needsHelp ? '' : s.dataConnection.connectedReady)
    } else if (result.error) showNotice(s.dataConnection.connectFailed)
  }
  async function prepareMissing() {
    const result = await store.prepareMissing(folderDialog?.missing || [])
    if (result.error) {
      const scan = await store.recheck()
      setFolderDialog({ ...scan, preparationError: true })
      return
    }
    setFolderDialog(result.missing.length || result.invalid.length || result.emptyData ? result : null)
    if (result.created.length) showNotice(s.dataConnection.prepared)
  }
  async function recheckFolder() {
    const result = await store.recheck()
    if (result.error) {
      setFolderDialog((previous) => ({ ...previous, recheckError: true }))
      return
    }
    setFolderDialog(result.missing.length || result.invalid.length || result.emptyData ? result : null)
    if (!result.missing.length && !result.invalid.length && !result.emptyData) showNotice(s.dataConnection.loadedSuccessfully)
  }
  function openSetupPrompt() {
    setFolderDialog(null)
    setPage('prompts')
    setVacancyId(null)
    showNotice('')
  }
  async function save(module, value) {
    const result = await store.save(module, value)
    if (result.conflict) showNotice(`${module}.json cambió fuera de la aplicación. Recárgalo antes de volver a guardar.`)
    else if (result.needsReview) setFolderDialog(await store.recheck())
    else if (result.fallback) { setFallbackSavedModule(module); showNotice('Cambios preparados. Usa «Guardar JSON individual» para guardar este módulo en tu dispositivo.'); setFallbackOpen(true) }
    else if (result.saved && ['profile', 'linkedin'].includes(module)) { setFallbackSavedModule(null); remindCvPrompt(module === 'profile' ? s.promptInbox.sourceSavedProfile : s.promptInbox.sourceSavedLinkedin) }
    else if (result.saved) { setFallbackSavedModule(null); showNotice(`${module}.json guardado.`) }
    else if (result.error) showNotice(result.error)
  }
  function openCvPrompt() { setPage('prompts'); setVacancyId(null); showNotice('') }
  const activeVacancy = store.data.vacancies.items.find((v) => v.id === vacancyId)

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNavOpen ? 'is-open' : ''}`}>
      <div className="brand"><div className="brand-mark">C</div><div><strong>CareerKit</strong><span>Tu espacio profesional</span></div><button className="sidebar-close" onClick={() => setMobileNavOpen(false)} aria-label="Ocultar menú">×</button></div>
      <div className="side-label">ESPACIO</div>
      <nav id="primary-nav" aria-label="Secciones principales">{NAV.map(([key, label]) => <button key={key} className={`nav-link ${page === key ? 'active' : ''}`} onClick={() => { setPage(key); setVacancyId(null); setMobileNavOpen(false) }}><span className="nav-icon"><SectionIcon name={key}/></span>{label}{key === 'prompts' && cvPromptPending && <span className="nav-badge" aria-label={s.promptInbox.pendingTag}>1</span>}{page === key && <span className="nav-dot" />}</button>)}</nav>
      <div className="sidebar-bottom"><div className="privacy-card"><span className="privacy-icon">♧</span><div><strong>Datos en tu dispositivo</strong><p>La app no envía información a ningún servidor.</p></div></div><button className="connect-button" onClick={() => { setMobileNavOpen(false); connect() }}><span>↗</span>{store.folder ? 'Carpeta conectada' : s.connect}</button><p className="side-note">Permisos de lectura y escritura solicitados al conectar.</p></div>
    </aside>
    <button className={`nav-backdrop ${mobileNavOpen ? 'is-visible' : ''}`} onClick={() => setMobileNavOpen(false)} aria-label="Ocultar menú" tabIndex={mobileNavOpen ? 0 : -1}/>
    <main className="main-area">
      <header className="topbar"><button className="mobile-menu-toggle" aria-controls="primary-nav" aria-expanded={mobileNavOpen} aria-label={mobileNavOpen ? 'Ocultar secciones' : 'Mostrar secciones'} onClick={() => setMobileNavOpen((open) => !open)}><span/><span/><span/></button><div className="breadcrumbs">CareerKit <span>/</span> {page === 'home' ? 'Inicio' : TITLES[page]}</div><div className="top-actions"><span className={`connection ${store.folder ? 'is-connected' : ''}`}><i />{store.folder ? 'Datos conectados' : 'Solo vista previa'}</span><button className="avatar">C</button></div></header>
      <section className="page-content">
        {notice && <div className="toast" role="status"><span>{notice}</span>{noticeAction === 'cv-prompt' && <button className="toast-action" onClick={openCvPrompt}>{s.promptInbox.openButton}</button>}<button onClick={() => showNotice('')} aria-label="Cerrar aviso">×</button></div>}
        {!store.folder && <section className="connection-banner" aria-labelledby="connection-banner-title"><div><span className="eyebrow">{s.dataConnection.bannerEyebrow}</span><h2 id="connection-banner-title">{s.dataConnection.bannerTitle}</h2><p>{window.showDirectoryPicker ? s.dataConnection.bannerBody : s.dataConnection.bannerFallback}</p></div><div className="connection-banner-actions"><button className="button primary" onClick={connect}>{s.connect}</button><button className="text-button" onClick={openSetupPrompt}>{s.dataConnection.promptsButton}</button></div></section>}
        {page === 'home' && <Home data={store.data} onNavigate={setPage} onVacancy={(v) => { setVacancyId(v.id); setPage('vacancies') }} />}
        {page === 'profile' && <ProfileEditor value={store.data.profile} state={store.states.profile} warning={store.warnings.profile} onSave={(v) => save('profile', v)} onReload={() => reload('profile')} />}
        {page === 'linkedin' && <LinkedInEditor value={store.data.linkedin} profile={store.data.profile} state={store.states.linkedin} warning={store.warnings.linkedin} onSave={(v) => save('linkedin', v)} onReload={() => reload('linkedin')} />}
        {page === 'cv' && <CVEditor value={store.data.cv} state={store.states.cv} warning={store.warnings.cv} onReload={() => reload('cv')} />}
        {page === 'vacancies' && (activeVacancy ? <VacancyDetail value={activeVacancy} onBack={() => setVacancyId(null)} /> : <Vacancies value={store.data.vacancies} state={store.states.vacancies} warning={store.warnings.vacancies} onSave={(v) => save('vacancies', v)} onReload={() => reload('vacancies')} onSelect={() => {}} />)}
        {page === 'prompts' && <PromptInbox pending={cvPromptPending} onCopy={handlePromptCopied} />}
        <footer className="page-footer"><span>Privado por diseño · Sin cuentas ni sincronización</span>{store.folder && <button className="text-button" onClick={() => setConfirmDisconnect(true)}>{s.disconnect}</button>}</footer>
      </section>
    </main>
    {fallbackOpen && <FallbackDialog module={currentModule || 'profile'} data={store.data[currentModule || 'profile']} onClose={() => { setFallbackOpen(false); setFallbackSavedModule(null) }} onDownload={handleFallbackDownload} />}
    {folderDialog && <FolderDataDialog scan={folderDialog} onClose={() => setFolderDialog(null)} onPrepare={prepareMissing} onRecheck={recheckFolder} onStartProfile={() => { setFolderDialog(null); setPage('profile'); setVacancyId(null) }} onOpenPrompts={openSetupPrompt} />}
    {confirmDisconnect && <div className="modal-backdrop"><div className="modal"><button className="modal-close" onClick={() => setConfirmDisconnect(false)}>×</button><span className="eyebrow">Privacidad</span><h2>Desconectar carpeta</h2><p>La web dejará de leer y guardar los JSON. Puedes borrar también los datos cargados en esta sesión.</p><div className="modal-actions"><button className="button secondary" onClick={() => setConfirmDisconnect(false)}>Cancelar</button><button className="button secondary" onClick={() => { store.disconnect(false); setConfirmDisconnect(false); setNotice('Carpeta desconectada.') }}>Desconectar</button><button className="button danger" onClick={() => { store.disconnect(true); setConfirmDisconnect(false); setNotice('Carpeta desconectada y datos de sesión borrados.') }}>Desconectar y borrar datos de sesión</button></div></div></div>}
  </div>
}

function SectionIcon({ name }) {
  const common = { className: 'section-icon-svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, focusable: false }
  if (name === 'home') return <svg {...common}><path d="m3.5 10 8.5-6.5 8.5 6.5"/><path d="M5.5 9v11h13V9M9.5 20v-6h5v6"/></svg>
  if (name === 'profile') return <svg {...common}><circle cx="9" cy="8" r="3.2"/><path d="M3.8 19a5.2 5.2 0 0 1 10.4 0M16 7.2h4.5M18.25 5v4.5"/></svg>
  if (name === 'linkedin') return <svg {...common}><rect x="3.5" y="3.5" width="17" height="17" rx="4"/><circle cx="8" cy="8" r=".9" fill="currentColor" stroke="none"/><path d="M7.2 11v5.6M10.8 16.6v-3.1a2 2 0 0 1 4 0v3.1M10.8 12.5V11"/></svg>
  if (name === 'cv') return <svg {...common}><path d="M6 3.5h8l4 4V20H6z"/><path d="M14 3.5V8h4M9 12h6M9 15h6M9 18h4"/></svg>
  if (name === 'prompts') return <svg {...common}><path d="M4 7.5h16v12H4z"/><path d="M4 13h4l1.5 2h5L16 13h4M8 4.5h8"/></svg>
  return <svg {...common}><rect x="3.5" y="7.5" width="17" height="12.5" rx="2"/><path d="M8.5 7.5V5h7v2.5M3.5 12h17M10 12v2h4v-2"/></svg>
}
function PageHeading({ eyebrow, title, subtitle, action }) { return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{subtitle}</p></div>{action}</div> }
function FolderDataDialog({ scan, onClose, onPrepare, onRecheck, onStartProfile, onOpenPrompts }) {
  const copy = s.dataConnection
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const missing = scan.missing || []
  const invalid = scan.invalid || []
  const hasMissing = missing.length > 0
  const hasInvalid = invalid.length > 0
  const isEmpty = Boolean(scan.emptyData && !hasMissing && !hasInvalid)
  const title = hasMissing
    ? missing.length === Object.keys(EMPTY).length ? copy.emptyFolderTitle : copy.missingTitle
    : hasInvalid ? copy.invalidTitle : copy.emptyTitle
  const prompt = [
    copy.prompt,
    hasMissing ? `${copy.missingLabel}: ${missing.map((name) => `${name}.json`).join(', ')}.` : '',
    hasInvalid ? `${copy.invalidLabel}: ${invalid.map(({ name }) => `${name}.json (compara con templates/${name}.json)`).join(', ')}.` : '',
  ].filter(Boolean).join('\n\n')

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
    try { await action() }
    finally { setBusy(false) }
  }

  return <div className="modal-backdrop"><section className="modal folder-data-modal" role="dialog" aria-modal="true" aria-labelledby="folder-data-title">
    <button className="modal-close" onClick={onClose} aria-label={copy.close}>×</button>
    <span className="eyebrow">{s.connected}</span>
    <h2 id="folder-data-title">{title}</h2>
    <p>{hasMissing ? copy.missingBody : hasInvalid ? copy.invalidBody : copy.emptyBody}</p>
    {hasMissing && <div className="folder-file-list"><b>{copy.missingLabel}</b><ul>{missing.map((name) => <li key={name}>{name}.json</li>)}</ul></div>}
    {hasInvalid && <div className="folder-file-list"><b>{copy.invalidLabel}</b><ul>{invalid.map(({ name, message: detail }) => <li key={name}><strong>{name}.json</strong><small>{detail}</small><span>{copy.templateHint} templates/{name}.json</span></li>)}</ul></div>}
    {scan.preparationError && <div className="folder-inline-note" role="status">{copy.prepareError}</div>}
    {scan.recheckError && <div className="folder-inline-note" role="status">{copy.recheckError}</div>}
    {message && <div className="folder-inline-note" role="status">{message}</div>}
    {(hasInvalid || hasMissing) && <label className="field folder-prompt-field"><span>{copy.assistantPromptLabel}</span><textarea readOnly rows={5} value={prompt} onFocus={(event) => event.target.select()} aria-label={copy.assistantPromptLabel}/></label>}
    <div className="modal-actions">
      {hasMissing && <button className="button primary" disabled={busy} onClick={() => run(onPrepare)}>{busy ? copy.preparing : copy.prepareButton}</button>}
      {isEmpty && <button className="button primary" onClick={onStartProfile}>{copy.startProfile}</button>}
      {(hasInvalid || hasMissing) && <button className="button secondary" disabled={busy} onClick={copyInstructions}>{copy.copyInstructions}</button>}
      {(hasInvalid || hasMissing) && <button className="button secondary" disabled={busy} onClick={() => run(onRecheck)}>{copy.recheckButton}</button>}
      {isEmpty && <button className="button secondary" onClick={onOpenPrompts}>{copy.openPrompts}</button>}
      <button className="button secondary" onClick={onClose}>{copy.close}</button>
    </div>
  </section></div>
}
function Home({ data, onNavigate, onVacancy }) {
  const vacancies = [...data.vacancies.items].filter((item) => item.featured).sort((a, b) => (a.preference || 999) - (b.preference || 999)).slice(0, 3)
  const priorities = [...data.priorities.items].sort((a, b) => (a.order || 999) - (b.order || 999) || ({ alta: 0, media: 1, baja: 2 }[a.level] ?? 3) - ({ alta: 0, media: 1, baja: 2 }[b.level] ?? 3))
  return <><PageHeading eyebrow="TU ESPACIO PROFESIONAL" title="Inicio" subtitle="Una vista clara de lo que estás construyendo." />
    <div className="welcome-card"><div className="welcome-copy"><span className="welcome-label">TU ESPACIO DE TRABAJO</span><h2>Una historia profesional,<br/>bien ordenada.</h2><p>Reúne tu experiencia, materiales y oportunidades en un espacio privado que controlas tú.</p><button className="button light" onClick={() => onNavigate('profile')}>Abrir mi perfil <span>→</span></button></div><div className="welcome-art"><div className="folio-sheet"><span>CAREER NOTES <i>01</i></span><b>Trayectoria<br/>con intención.</b><div className="folio-rule"/><small>PERFIL · APRENDIZAJES · PRÓXIMOS PASOS</small></div><div className="folio-stamp">CK<br/><i>EST. LOCAL</i></div></div></div>
    <div className="section-title-row"><div><span className="eyebrow">A TENER EN CUENTA</span><h2>Tu actividad</h2></div><span className="muted">Fechas registradas</span></div>
    <div className="activity-grid">
      <div className="activity-card cv-activity-card">
        <div className="activity-icon purple"><SectionIcon name="cv"/></div>
        <div className="cv-activity-copy">
          <span>{s.cvDates}</span>
          <small><b>{s.cvEditor.spanishShort}</b> · {s.cvEditor.homeReview}: {pretty(data.cv.versions.spanish.lastReviewed)} · {s.cvEditor.homeUpdated}: {pretty(data.cv.versions.spanish.lastUpdated)}</small>
          <small><b>{s.cvEditor.englishShort}</b> · {s.cvEditor.homeReview}: {pretty(data.cv.versions.english.lastReviewed)} · {s.cvEditor.homeUpdated}: {pretty(data.cv.versions.english.lastUpdated)}</small>
          {data.cv.previousVersion && <small>{s.cvEditor.legacyShort} · {s.cvEditor.homeReview}: {pretty(data.cv.previousVersion.lastReviewed)} · {s.cvEditor.homeUpdated}: {pretty(data.cv.previousVersion.lastUpdated)}</small>}
        </div>
        <button onClick={() => onNavigate('cv')} aria-label={s.cvEditor.openCV}>↗</button>
      </div>
      <div className="activity-card"><div className="activity-icon green"><SectionIcon name="linkedin"/></div><div><span>LinkedIn · última auditoría</span><strong>{pretty(data.linkedin.audits.at(-1)?.date)}</strong><small>Actualizado: {pretty(data.linkedin.lastUpdated)}</small></div><button onClick={() => onNavigate('linkedin')} aria-label="Abrir LinkedIn">↗</button></div>
    </div>
    <div className="dashboard-grid"><section className="panel"><div className="panel-heading"><div><span className="eyebrow">ORDEN DE PREFERENCIA</span><h2>Vacantes destacadas</h2></div><button className="arrow-link" onClick={() => onNavigate('vacancies')}>Ver todas <span>→</span></button></div>{vacancies.length ? vacancies.map((v, i) => <button className="vacancy-row" key={v.id} onClick={() => onVacancy(v)}><span className="rank">{String(i + 1).padStart(2, '0')}</span><span className="vacancy-logo">{(v.company || '·').slice(0, 1).toUpperCase()}</span><span className="vacancy-main"><b>{v.role || 'Puesto sin título'}</b><small>{v.company || 'Empresa sin registrar'} · {v.location || 'Ubicación sin registrar'}</small></span><span className="mode-tag">{v.modality || 'Sin modalidad'}</span><span className="row-arrow">↗</span></button>) : <EmptyState text="Todavía no has guardado vacantes." action="Añade una vacante" onClick={() => onNavigate('vacancies')} />}</section>
    <section className="panel priorities-panel"><div className="panel-heading"><div><span className="eyebrow">SIGUIENTES PASOS</span><h2>Prioridades</h2></div><span className="tiny-icon">✳</span></div>{priorities.length ? priorities.map((p) => <button className="priority-row" key={p.id} onClick={() => onNavigate(p.section || 'profile')}><span className={`priority-dot ${p.level || 'media'}`} /><span><b>{p.title || 'Prioridad sin título'}</b><small>{p.reason || 'Sin motivo registrado'}</small><small>{pretty(p.date)}</small></span><span className="row-arrow">↗</span></button>) : <div className="agent-note"><span>✳</span><div><b>Sin prioridades todavía</b><p>Un agente puede añadir aquí prioridades cuando le pidas revisar tu perfil o una oferta.</p></div></div>}</section></div>
  </>
}
function EmptyState({ text, action, onClick }) { return <div className="empty-state"><div className="empty-symbol">◇</div><p>{text}</p>{action && <button className="text-button" onClick={onClick}>{action} →</button>}</div> }
function Status({ state, warning, onReload }) { return <>{state && <div className={`save-state ${state.includes('Error') || state.includes('externo') ? 'state-error' : ''} ${state.includes('plantilla') ? 'state-warning' : ''}`} role="status"><span>●</span> {state}{state?.includes('externo') && <button onClick={onReload}>Recargar archivo</button>}</div>}{warning && <div className="warning-box">{warning}{state === 'Error' && <button onClick={onReload}>Volver a intentar</button>}{state === 'Cambio externo' && <button onClick={onReload}>Recargar archivo</button>}{state?.includes('plantilla') && <button onClick={onReload}>Volver a comprobar</button>}</div>}</> }
function useDraft(value) { const [draft, setDraft] = useState(value); useEffect(() => setDraft(value), [value]); return [draft, setDraft] }
function TextField({ label, value, onChange, placeholder, rows, hint, lang }) { return <label className="field"><span>{label}</span>{rows ? <textarea lang={lang} rows={rows} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || ''}/> : <input lang={lang} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || ''}/ >}{hint && <small>{hint}</small>}</label> }
function CardTitle({ title, description, onAdd }) { return <div className="card-title"><div><h3>{title}</h3>{description && <p>{description}</p>}</div>{onAdd && <button className="button secondary small" onClick={onAdd}>＋ Añadir</button>}</div> }
function ProfileEditor({ value, state, warning, onSave, onReload }) {
  const [draft, setDraft] = useDraft(value)
  const update = (key, val) => setDraft({ ...draft, [key]: val })
  const add = (key) => update(key, [...(draft[key] || []), { id: id(), title: '', organization: '', dates: '', actions: '', results: '', evidenceIds: [], confirmed: false, cvEvidence: false, onLinkedIn: false, internal: false }])
  const patchItem = (key, idx, part) => update(key, draft[key].map((item, i) => i === idx ? { ...item, ...part } : item))
  return <><PageHeading eyebrow="BASE DE TU HISTORIA" title="Perfil y aprendizajes" subtitle="Guarda experiencias, metas y evidencias a tu manera." /><Status state={state} warning={warning} onReload={onReload}/>
    <div className="editor-grid"><section className="panel form-panel"><CardTitle title="Perfil profesional" description="Una descripción de tu perfil, editable por ti."/><TextField label="Perfil profesional" rows={5} value={draft.professionalProfile} onChange={(v) => update('professionalProfile', v)} placeholder="Escribe tu perfil profesional…"/>
      <CardTitle title="Objetivos" description="Metas a corto, medio y largo plazo."/><div className="form-two"><TextField label="Corto plazo" rows={3} value={draft.objectives.shortTerm} onChange={(v) => update('objectives', { ...draft.objectives, shortTerm: v })}/><TextField label="Medio plazo" rows={3} value={draft.objectives.mediumTerm} onChange={(v) => update('objectives', { ...draft.objectives, mediumTerm: v })}/></div><TextField label="Largo plazo" rows={3} value={draft.objectives.longTerm} onChange={(v) => update('objectives', { ...draft.objectives, longTerm: v })}/>
      {['experience','education','skills','certifications','languages','projects','evidence','learnings'].map((key) => <div className="collection" key={key}><CardTitle title={({experience:'Experiencia',education:'Formación',skills:'Habilidades',certifications:'Certificaciones',languages:'Idiomas',projects:'Proyectos',evidence:'Otras evidencias',learnings:'Aprendizajes'})[key]} onAdd={() => add(key)}/>{(draft[key] || []).map((item, i) => <div className="item-card" key={item.id || i}><div className="item-heading"><span>Elemento {i + 1}</span><button className="icon-button" aria-label="Eliminar elemento" onClick={() => update(key, draft[key].filter((_, n) => n !== i))}>×</button></div><div className="form-two"><TextField label={key === 'skills' || key === 'languages' ? 'Nombre' : 'Título'} value={item.title || item.name} onChange={(v) => patchItem(key, i, key === 'skills' || key === 'languages' ? { title: v, name: v } : { title: v })}/><TextField label="Organización / contexto" value={item.organization} onChange={(v) => patchItem(key, i, { organization: v })}/></div><div className="form-two"><TextField label="Fechas" value={item.dates} onChange={(v) => patchItem(key, i, { dates: v })}/><TextField label="Acciones" value={item.actions} onChange={(v) => patchItem(key, i, { actions: v })}/></div><TextField label="Resultados demostrables" value={item.results} onChange={(v) => patchItem(key, i, { results: v })}/><div className="checks"><Check label="Evidencia para el CV" checked={item.cvEvidence} onChange={(v) => patchItem(key, i, { cvEvidence: v })}/><Check label="Aparece en LinkedIn" checked={item.onLinkedIn} onChange={(v) => patchItem(key, i, { onLinkedIn: v })}/><Check label="Información interna" checked={item.internal} onChange={(v) => patchItem(key, i, { internal: v })}/><Check label="Confirmado" checked={item.confirmed} onChange={(v) => patchItem(key, i, { confirmed: v })}/></div></div>)}{!(draft[key] || []).length && <p className="quiet-empty">Sin elementos. Añade uno cuando quieras.</p>}</div>)}
      <button className="button primary save-button" onClick={() => onSave(draft)}>Guardar perfil</button></section><aside className="side-info"><div className="tip-card"><span className="tip-icon">✳</span><h3>Una historia completa</h3><p>Guarda aquí también proyectos universitarios y actividades que no formen parte de LinkedIn.</p></div><div className="legend-card"><h3>Estado de la información</h3><div><i className="legend-confirmed"/> Confirmado</div><div><i className="legend-pending"/> Pendiente de confirmar</div><p>Cada elemento incluye un identificador para relacionarlo con vacantes.</p></div></aside></div></>
}
function Check({ label, checked, onChange }) { return <label className="check"><input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)}/><span>{label}</span></label> }
const LINKEDIN_SECTIONS = [
  ['headline', 'Titular'], ['about', 'Acerca de'], ['experience', 'Experiencia'], ['education', 'Educación'],
  ['skills', 'Aptitudes'], ['certifications', 'Certificaciones'], ['projects', 'Proyectos'], ['featured', 'Destacados'],
]
const PROFILE_EVIDENCE_GROUPS = [
  ['experience', 'Experiencia'], ['education', 'Formación'], ['skills', 'Habilidades'], ['certifications', 'Certificaciones'], ['languages', 'Idiomas'], ['projects', 'Proyectos'], ['evidence', 'Otras evidencias'], ['learnings', 'Aprendizajes'],
]
function LinkedInEditor({ value, profile, state, warning, onSave, onReload }) {
  const [draft, setDraft] = useDraft(value)
  const pub = draft.published
  const setPub = (key, val) => setDraft({ ...draft, published: { ...pub, [key]: val } })
  const evidenceItems = PROFILE_EVIDENCE_GROUPS.flatMap(([key]) => (profile[key] || []).map((item) => ({ ...item, category: key })))
  const addAudit = () => setDraft({ ...draft, audits: [...draft.audits, { id: id(), section: 'about', action: 'corregir', priority: 'media', problem: '', reasonEvidence: '', profileEvidenceIds: [], recommendation: '', proposedText: '', date: '', status: 'pendiente' }] })
  const updateAudit = (index, part) => setDraft({ ...draft, audits: draft.audits.map((item, n) => n === index ? { ...item, ...part } : item) })
  const removeAudit = (index) => setDraft({ ...draft, audits: draft.audits.filter((_, n) => n !== index) })
  const previewKeys = ['experience','education','skills','certifications','projects','featured']
  const auditNotes = (section) => draft.audits.filter((item) => item.section === section && item.status !== 'descartada')
  return <><PageHeading eyebrow="COPIA DEL PERFIL PUBLICADO" title="LinkedIn" subtitle="Conserva el contenido publicado y anota qué corregir o añadir, con su base en perfil y aprendizajes."/><Status state={state} warning={warning} onReload={onReload}/><div className="linkedin-layout"><section className="panel form-panel"><CardTitle title="Contenido actual" description="Transcribe el contenido tal como aparece publicado."/><TextField label="Titular" value={pub.headline} onChange={(v) => setPub('headline', v)}/><AuditPoints notes={auditNotes('headline')} evidence={evidenceItems}/><TextField label="Acerca de" rows={6} value={pub.about} onChange={(v) => setPub('about', v)}/><AuditPoints notes={auditNotes('about')} evidence={evidenceItems}/>{previewKeys.map((key) => <ArrayText key={key} title={({experience:'Experiencia',education:'Educación',skills:'Aptitudes',certifications:'Certificaciones',projects:'Proyectos',featured:'Destacados'})[key]} items={pub[key]} onChange={(v) => setPub(key, v)}/>)}
      <TextField label="Última actualización del perfil" value={draft.lastUpdated} onChange={(v) => setDraft({ ...draft, lastUpdated: v })} hint="Fecha manual; déjala vacía si no está registrada."/><div className="divider"/><CardTitle title="Qué corregir o añadir" description="Cada punto se vincula a una sección de LinkedIn y a evidencias de tu perfil o aprendizajes." onAdd={addAudit}/>{draft.audits.map((item, i) => <AuditCard key={item.id || i} item={item} evidence={evidenceItems} onChange={(part) => updateAudit(i, part)} onDelete={() => removeAudit(i)}/>)}{!draft.audits.length && <p className="quiet-empty">Sin puntos de auditoría.</p>}<button className="button primary save-button" onClick={() => onSave(draft)}>Guardar LinkedIn y auditoría</button></section>
      <aside className="linkedin-preview"><div className="preview-label"><span className="eyebrow">VISTA PREVIA</span><span>La copia y las sugerencias se mantienen separadas</span></div><div className="preview-card"><div className="preview-cover"/><div className="preview-avatar">{pub.headline ? pub.headline[0].toUpperCase() : '·'}</div><div className="preview-content"><h3>Nombre sin registrar</h3><p>{pub.headline || 'Tu titular profesional aparecerá aquí'}</p><AuditPoints notes={auditNotes('headline')} evidence={evidenceItems}/><div className="preview-about"><b>Acerca de</b><small>{pub.about || 'El texto publicado aparecerá aquí tal como lo escribas.'}</small><AuditPoints notes={auditNotes('about')} evidence={evidenceItems}/></div><div className="preview-sections">{previewKeys.filter((key) => pub[key]?.length || auditNotes(key).length).map((key) => <div className="preview-section" key={key}><b>{({experience:'Experiencia',education:'Educación',skills:'Aptitudes',certifications:'Certificaciones',projects:'Proyectos',featured:'Destacados'})[key]}</b>{(pub[key] || []).map((entry, i) => <small key={i}>{typeof entry === 'string' ? entry : entry.title}</small>)}<AuditPoints notes={auditNotes(key)} evidence={evidenceItems}/></div>)}</div></div></div></aside></div></>
}

function AuditPoints({ notes, evidence }) {
  if (!notes.length) return null
  const actionLabel = { corregir: 'Corregir', anadir: 'Añadir', aclarar: 'Aclarar' }
  return <div className="preview-audit-points"><span>PARA REVISAR</span><ul>{notes.map((note) => {
    const linked = evidence.filter((item) => (note.profileEvidenceIds || []).includes(item.id))
    const basis = linked.length ? linked.map((item) => item.title || item.name || item.id).join(' · ') : (note.profileEvidenceIds || []).join(' · ')
    return <li key={note.id}><b>{actionLabel[note.action] || 'Revisar'}:</b> {note.recommendation || note.problem || 'Anotación pendiente'}{note.proposedText && <small>Texto propuesto: {note.proposedText}</small>}<small>{note.reasonEvidence ? `${note.reasonEvidence} · ` : ''}{basis ? `Base: ${basis}` : 'Vincula una evidencia del perfil o un aprendizaje.'} · Prioridad {note.priority || 'media'} · {note.status}</small></li>
  })}</ul></div>
}
function ArrayText({ title, items = [], onChange, lang }) { return <div className="collection"><CardTitle title={title} onAdd={() => onChange([...(items || []), ''])}/>{items.map((item, i) => <div className="array-row" key={i}><input lang={lang} aria-label={`${title} ${i+1}`} value={typeof item === 'string' ? item : item.title || ''} onChange={(e) => onChange(items.map((x,n) => n === i ? e.target.value : x))}/><button className="icon-button" aria-label={`Eliminar ${title.toLowerCase()}`} onClick={() => onChange(items.filter((_,n) => n !== i))}>×</button></div>)}</div> }
function AuditCard({ item, evidence, onChange, onDelete }) {
  const selectedIds = item.profileEvidenceIds || []
  const sectionKeys = LINKEDIN_SECTIONS.map(([key]) => key)
  const categoryLabels = Object.fromEntries(PROFILE_EVIDENCE_GROUPS)
  return <div className="item-card audit-card"><div className="item-heading"><span>Punto de auditoría · {item.date || s.noData}</span><button className="icon-button" aria-label="Eliminar punto de auditoría" onClick={onDelete}>×</button></div><div className="form-two"><label className="field"><span>Sección de LinkedIn</span><select value={sectionKeys.includes(item.section) ? item.section : item.section || 'about'} onChange={(e) => onChange({ section: e.target.value })}>{!sectionKeys.includes(item.section) && item.section && <option value={item.section}>{item.section}</option>}{LINKEDIN_SECTIONS.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><label className="field"><span>Acción</span><select value={item.action || 'corregir'} onChange={(e) => onChange({ action: e.target.value })}><option value="corregir">Corregir</option><option value="anadir">Añadir</option><option value="aclarar">Aclarar</option></select></label></div><label className="field"><span>Prioridad</span><select value={item.priority || 'media'} onChange={(e) => onChange({ priority: e.target.value })}><option value="alta">Alta</option><option value="media">Media</option><option value="baja">Baja</option></select></label><TextField label="Qué se observa" value={item.problem} onChange={(v) => onChange({ problem: v })}/><TextField label="Por qué, según el perfil o los aprendizajes" rows={2} value={item.reasonEvidence} onChange={(v) => onChange({ reasonEvidence: v })}/><fieldset className="audit-evidence"><legend>Evidencias relacionadas</legend>{PROFILE_EVIDENCE_GROUPS.map(([key]) => {
    const group = evidence.filter((entry) => entry.category === key)
    if (!group.length) return null
    return <div className="audit-evidence-group" key={key}><b>{categoryLabels[key]}</b>{group.map((entry) => <Check key={entry.id} label={`${entry.title || entry.name || 'Sin título'} · ${entry.id}`} checked={selectedIds.includes(entry.id)} onChange={(checked) => onChange({ profileEvidenceIds: checked ? [...selectedIds, entry.id] : selectedIds.filter((value) => value !== entry.id) })}/>)}</div>
  })}{!evidence.length && <p className="quiet-empty">Añade primero evidencias o aprendizajes en Perfil.</p>}<TextField label="Otros IDs de perfil/aprendizajes" value={selectedIds.filter((value) => !evidence.some((entry) => entry.id === value)).join(', ')} onChange={(v) => { const known = selectedIds.filter((value) => evidence.some((entry) => entry.id === value)); const extra = v.split(',').map((value) => value.trim()).filter(Boolean); onChange({ profileEvidenceIds: [...known, ...extra] }) }} hint="Los IDs deben existir en profile.json."/></fieldset><TextField label="Qué corregir o añadir" rows={2} value={item.recommendation} onChange={(v) => onChange({ recommendation: v })}/><TextField label="Texto propuesto (opcional)" rows={3} value={item.proposedText} onChange={(v) => onChange({ proposedText: v })}/><div className="form-two"><TextField label="Fecha de auditoría" value={item.date} onChange={(v) => onChange({ date: v })}/><label className="field"><span>Estado</span><select value={item.status || 'pendiente'} onChange={(e) => onChange({ status: e.target.value })}><option value="pendiente">Pendiente</option><option value="aplicada">Aplicada</option><option value="descartada">Descartada</option></select></label></div></div>
}
function CVEditor({ value, state, warning, onReload }) {
  const [activeVersion, setActiveVersion] = useState('spanish')
  const copy = s.cvEditor
  const spanish = activeVersion === 'spanish'
  const current = value.versions?.[activeVersion] || { masterText: '', lastUpdated: '', lastReviewed: '' }
  const guide = spanish ? copy.spanishGuide : copy.englishGuide
  const guideTitle = spanish ? copy.spanishGuideTitle : copy.englishGuideTitle

  return <>
    <PageHeading eyebrow="BASE PROFESIONAL" title={copy.title} subtitle={copy.subtitle}/>
    <Status state={state} warning={warning} onReload={onReload}/>
    <div className="cv-version-switch" role="group" aria-label={copy.versionGroup}>
      <button type="button" className={spanish ? 'selected' : ''} aria-pressed={spanish} onClick={() => setActiveVersion('spanish')}><span>{copy.spanishTab}</span></button>
      <button type="button" className={!spanish ? 'selected' : ''} aria-pressed={!spanish} onClick={() => setActiveVersion('english')}><span>{copy.englishTab}</span></button>
    </div>
    {value.previousVersion && <section className="cv-legacy-notice" aria-labelledby="cv-legacy-title">
      <div><h2 id="cv-legacy-title">{copy.legacyTitle}</h2><p>{copy.legacyReadOnly}</p></div>
      <pre className="cv-legacy-content">{value.previousVersion.masterText || copy.noLegacyText}</pre>
    </section>}
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
        <pre className={`cv-master-text ${spanish ? 'spanish' : 'english'}`} lang={spanish ? 'es' : 'en'}>{current.masterText || copy.noBase}</pre>
        <dl className="cv-date-summary">
          <div><dt>{copy.lastUpdated}</dt><dd>{pretty(current.lastUpdated)}</dd></div>
          <div><dt>{copy.lastReviewed}</dt><dd>{pretty(current.lastReviewed)}</dd></div>
        </dl>
      </section>
      <aside className="tip-card cv-tip"><span className="tip-icon">▤</span><h3>{copy.tipTitle}</h3><p>{copy.tipBody}</p><span className="privacy-tag">{copy.noManualEdit}</span></aside>
    </div>
  </>
}

function emptyCvAdvice() {
  return { recommendedVersion: 'pending', reason: '', assessedAt: '', spanishAdjustments: [], englishAdjustments: [] }
}

function CvAdviceEditor({ value, onChange }) {
  const copy = s.vacancyCvAdvice
  const advice = { ...emptyCvAdvice(), ...value }
  const update = (part) => onChange({ ...advice, ...part })
  return <section className="vacancy-cv-editor" aria-label={copy.title}>
    <CardTitle title={copy.title} description={copy.description}/>
    <label className="field">
      <span>{copy.recommendedVersion}</span>
      <select value={advice.recommendedVersion} onChange={(event) => update({ recommendedVersion: event.target.value })}>
        <option value="pending">{copy.pending}</option>
        <option value="spanish">{copy.spanish}</option>
        <option value="english">{copy.english}</option>
        <option value="both">{copy.both}</option>
      </select>
    </label>
    <TextField label={copy.reason} rows={3} value={advice.reason} onChange={(text) => update({ reason: text })}/>
    <TextField label={copy.assessedAt} value={advice.assessedAt} onChange={(text) => update({ assessedAt: text })} hint={copy.dateHint}/>
    <p className="cv-advice-hint">{copy.profileBasis}</p>
    <ArrayText title={copy.spanishAdjustments} items={advice.spanishAdjustments} onChange={(items) => update({ spanishAdjustments: items })} lang="es"/>
    <ArrayText title={copy.englishAdjustments} items={advice.englishAdjustments} onChange={(items) => update({ englishAdjustments: items })} lang="en"/>
    <small className="cv-advice-hint">{copy.editHint}</small>
  </section>
}

function CvAdjustmentList({ title, items = [], emptyLabel }) {
  const visible = items.filter((item) => typeof item === 'string' && item.trim())
  return <section className="cv-adjustment-list"><h3>{title}</h3>{visible.length ? <ul>{visible.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul> : <p>{emptyLabel}</p>}</section>
}

function Vacancies({ value, state, warning, onSave, onReload, onSelect }) {
  const [draft, setDraft] = useDraft(value)
  const [selected, setSelected] = useState(null)
  const items = [...draft.items].sort((a, b) => (a.preference || 999) - (b.preference || 999))

  function add() {
    const item = {
      id: id(), role: '', company: '', location: '', modality: '', link: '', source: '', searchedAt: '', verifiedAt: '',
      description: '', salary: '', salaryVerified: false, level: '', jobType: '', assessment: '', matchingEvidenceIds: [],
      gaps: '', blockers: '', preference: draft.items.length + 1, featured: false, cvAdvice: emptyCvAdvice(),
    }
    setDraft({ ...draft, items: [...draft.items, item] })
    setSelected(item.id)
  }

  function patch(idValue, part) {
    setDraft({ ...draft, items: draft.items.map((item) => item.id === idValue ? { ...item, ...part } : item) })
  }

  const detail = draft.items.find((item) => item.id === selected)
  return <>
    <PageHeading eyebrow="OPCIONES PROFESIONALES" title="Vacantes" subtitle="Registra oportunidades investigadas y ordénalas por preferencia." action={<button className="button primary" onClick={add}>＋ Añadir vacante</button>}/>
    <Status state={state} warning={warning} onReload={onReload}/>
    <div className="vacancies-layout">
      <section className="vacancy-list">
        {items.length ? items.map((item, index) => <button key={item.id} className={`vacancy-card ${selected === item.id ? 'selected' : ''}`} onClick={() => { setSelected(item.id); onSelect(item.id) }}>
          <div className="vacancy-card-top"><span className="rank">{String(index + 1).padStart(2, '0')}</span><span className="vacancy-logo">{(item.company || '·')[0].toUpperCase()}</span><span className="vacancy-card-title"><b>{item.role || 'Puesto sin título'}</b><small>{item.company || 'Empresa sin registrar'}</small></span><span className="row-arrow">↗</span></div>
          <div className="vacancy-tags"><span>{item.location || 'Ubicación sin registrar'}</span><span>{item.modality || 'Modalidad sin registrar'}</span>{item.featured && <span className="highlight-tag">Destacada</span>}</div>
          <div className="vacancy-card-bottom"><span>Preferencia {item.preference || '—'}</span><span>{item.salary || 'Salario sin registrar'}</span></div>
        </button>) : <EmptyState text="Añade ofertas cuando tú o un agente las hayáis investigado." action="Crear primera vacante" onClick={add}/>}
        <button className="button primary save-button" onClick={() => onSave(draft)}>Guardar vacantes</button>
      </section>
      {detail ? <section className="panel form-panel vacancy-form">
        <div className="panel-heading"><div><span className="eyebrow">DETALLE DE LA OFERTA</span><h2>{detail.role || 'Nueva vacante'}</h2></div><button className="icon-button" aria-label="Eliminar vacante" onClick={() => { setDraft({ ...draft, items: draft.items.filter((item) => item.id !== detail.id) }); setSelected(null) }}>×</button></div>
        <div className="form-two"><TextField label="Puesto" value={detail.role} onChange={(text) => patch(detail.id, { role: text })}/><TextField label="Empresa" value={detail.company} onChange={(text) => patch(detail.id, { company: text })}/></div>
        <div className="form-two"><TextField label="Ubicación" value={detail.location} onChange={(text) => patch(detail.id, { location: text })}/><TextField label="Modalidad" value={detail.modality} onChange={(text) => patch(detail.id, { modality: text })}/></div>
        <div className="form-two"><TextField label="Enlace" value={detail.link} onChange={(text) => patch(detail.id, { link: text })}/><TextField label="Fuente" value={detail.source} onChange={(text) => patch(detail.id, { source: text })}/></div>
        <div className="form-two"><TextField label="Fecha de búsqueda" value={detail.searchedAt} onChange={(text) => patch(detail.id, { searchedAt: text })}/><TextField label="Fecha de verificación" value={detail.verifiedAt} onChange={(text) => patch(detail.id, { verifiedAt: text })}/></div>
        <TextField label="Descripción completa" rows={7} value={detail.description} onChange={(text) => patch(detail.id, { description: text })}/>
        <div className="form-two"><TextField label="Salario o banda" value={detail.salary} onChange={(text) => patch(detail.id, { salary: text })}/><Check label="Salario verificado" checked={detail.salaryVerified} onChange={(checked) => patch(detail.id, { salaryVerified: checked })}/></div>
        <div className="form-two"><TextField label="Nivel" value={detail.level} onChange={(text) => patch(detail.id, { level: text })}/><TextField label="Tipo de puesto" value={detail.jobType} onChange={(text) => patch(detail.id, { jobType: text })}/></div>
        <TextField label="Valoración del agente" rows={3} value={detail.assessment} onChange={(text) => patch(detail.id, { assessment: text })}/>
        <TextField label="Evidencias de encaje (IDs estables del perfil)" value={(detail.matchingEvidenceIds || []).join(', ')} onChange={(text) => patch(detail.id, { matchingEvidenceIds: text.split(',').map((item) => item.trim()).filter(Boolean) })}/>
        <TextField label="Carencias demostrables" rows={2} value={detail.gaps} onChange={(text) => patch(detail.id, { gaps: text })}/>
        <TextField label="Posibles bloqueos" rows={2} value={detail.blockers} onChange={(text) => patch(detail.id, { blockers: text })}/>
        <div className="form-two"><TextField label="Orden de preferencia" value={detail.preference} onChange={(text) => patch(detail.id, { preference: Number(text)})}/><Check label="Destacar en Inicio" checked={detail.featured} onChange={(checked) => patch(detail.id, { featured: checked })}/></div>
        <CvAdviceEditor value={detail.cvAdvice} onChange={(cvAdvice) => patch(detail.id, { cvAdvice })}/>
        <button className="button secondary" onClick={() => onSave(draft)}>Guardar cambios</button>
      </section> : <aside className="vacancy-aside"><div className="tip-card"><span className="tip-icon">◎</span><h3>Tu lista, a tu ritmo</h3><p>Las ofertas no se buscan automáticamente. Añade una cuando la hayas investigado.</p></div><div className="legend-card"><h3>Relación con el perfil</h3><p>Relaciona cada valoración con evidencias mediante sus identificadores estables.</p></div></aside>}
    </div>
  </>
}

function VacancyDetail({ value, onBack }) {
  const copy = s.vacancyCvAdvice
  const advice = { ...emptyCvAdvice(), ...value.cvAdvice }
  const hasAssessment = advice.assessedAt || advice.reason || advice.recommendedVersion !== 'pending' || advice.spanishAdjustments.some((item) => item.trim()) || advice.englishAdjustments.some((item) => item.trim())
  const recommendedLabel = copy[advice.recommendedVersion] || copy.pending
  return <>
    <button className="back-link" onClick={onBack}>← Volver a vacantes</button>
    <PageHeading eyebrow="DETALLE DE LA OFERTA" title={value.role || 'Vacante'} subtitle={`${value.company || 'Empresa sin registrar'} · ${value.location || 'Ubicación sin registrar'}`}/>
    <div className="detail-grid">
      <section className="panel detail-panel">
        <div className="detail-tags"><span>{value.modality || 'Modalidad sin registrar'}</span><span>Preferencia {value.preference || '—'}</span></div>
        <h2>Descripción</h2><p className="preline">{value.description || 'Sin registrar'}</p>
        <h2>Valoración</h2><p className="preline">{value.assessment || 'Sin registrar'}</p>
        <h2>Evidencias de encaje</h2><p>{value.matchingEvidenceIds?.join(', ') || 'Sin registrar'}</p>
        <h2>Carencias y bloqueos</h2><p className="preline">{[value.gaps, value.blockers].filter(Boolean).join('\n') || 'Sin registrar'}</p>
        <section className="cv-advice-detail" aria-labelledby="cv-advice-heading">
          <div className="cv-advice-heading"><div><span className="eyebrow">CV PARA ESTA OFERTA</span><h2 id="cv-advice-heading">{copy.title}</h2></div><span className="cv-recommendation-tag">{recommendedLabel}</span></div>
          <p className="cv-advice-reason">{advice.reason || (hasAssessment ? copy.noAdjustments : copy.noAssessment)}</p>
          {advice.assessedAt && <small className="cv-advice-date">{copy.assessmentDate}: {advice.assessedAt}</small>}
          <div className="cv-adjustment-columns">
            <CvAdjustmentList title={copy.spanishAdjustments} items={advice.spanishAdjustments} emptyLabel={copy.noAdjustments}/>
            <CvAdjustmentList title={copy.englishAdjustments} items={advice.englishAdjustments} emptyLabel={copy.noAdjustments}/>
          </div>
        </section>
      </section>
      <aside className="legend-card"><h3>Datos de la oferta</h3><dl><dt>Salario</dt><dd>{value.salary ? `${value.salary} · ${value.salaryVerified ? 'verificado' : 'sin verificar'}` : 'Sin registrar'}</dd><dt>Nivel</dt><dd>{pretty(value.level)}</dd><dt>Tipo</dt><dd>{pretty(value.jobType)}</dd><dt>Fuente</dt><dd>{pretty(value.source)}</dd><dt>Verificada</dt><dd>{pretty(value.verifiedAt)}</dd></dl>{value.link && <a className="button secondary" href={value.link} target="_blank" rel="noreferrer">Abrir fuente ↗</a>}</aside>
    </div>
  </>
}
function PromptInbox({ pending, onCopy }) {
  const copy = s.promptInbox
  const [vacancyReference, setVacancyReference] = useState('')
  const [copyMessages, setCopyMessages] = useState({})

  async function copyPrompt(prompt) {
    if (prompt.requiresVacancy && !vacancyReference.trim()) {
      setCopyMessages((previous) => ({ ...previous, [prompt.id]: copy.copyMissingVacancy }))
      return
    }
    const text = prompt.text.replace('{{vacancy}}', vacancyReference.trim())
    try {
      await navigator.clipboard.writeText(text)
      onCopy(prompt.id)
      setCopyMessages((previous) => ({ ...previous, [prompt.id]: copy.copied }))
    } catch {
      setCopyMessages((previous) => ({ ...previous, [prompt.id]: copy.copyFailed }))
    }
  }

  return <>
    <PageHeading eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle}/>
    <section className="prompt-usage-card"><div className="prompt-usage-mark" aria-hidden="true">i</div><div><h2>{copy.usageTitle}</h2><p>{copy.usageBody}</p><p>{copy.noNetwork}</p></div></section>
    {pending && <section className="prompt-reminder" role="status"><span className="prompt-reminder-count">1</span><div><h2>{copy.pendingTitle}</h2><p>{copy.pendingBody}</p></div></section>}
    <div className="prompt-list">{copy.prompts.map((prompt) => {
      const isPending = pending && prompt.id === 'refresh-cv'
      const renderedText = prompt.text.replace('{{vacancy}}', vacancyReference.trim() || copy.vacancyPromptPlaceholder)
      return <article className={`prompt-card ${isPending ? 'is-pending' : ''}`} key={prompt.id}>
        <div className="prompt-card-heading"><div><h2>{prompt.title}</h2><p className="prompt-use">{prompt.use}</p></div>{isPending && <span className="prompt-pending-tag">{copy.pendingTag}</span>}</div>
        {prompt.requiresVacancy && <TextField label={copy.vacancyReference} value={vacancyReference} onChange={(value) => { setVacancyReference(value); setCopyMessages((previous) => ({ ...previous, [prompt.id]: '' })) }} hint={copy.vacancyReferenceHint}/>}
        <textarea className="prompt-content" aria-label={`${copy.promptLabel}: ${prompt.title}`} readOnly rows={6} value={renderedText} onFocus={(event) => event.target.select()}/>
        <div className="prompt-card-footer"><button className="button secondary small" disabled={prompt.requiresVacancy && !vacancyReference.trim()} onClick={() => copyPrompt(prompt)}>{copy.copyButton}</button>{copyMessages[prompt.id] && <span role="status">{copyMessages[prompt.id]}</span>}{isPending && copyMessages[prompt.id] === copy.copyFailed && <button className="text-button" onClick={() => { onCopy(prompt.id); setCopyMessages((previous) => ({ ...previous, [prompt.id]: copy.copied })) }}>{copy.confirmManualCopy}</button>}</div>
      </article>
    })}</div>
  </>
}

function FallbackDialog({ module, data, onClose, onDownload }) {
  const readOnlyCv = module === 'cv'
  const [json, setJson] = useState(JSON.stringify(data, null, 2))
  useEffect(() => setJson(JSON.stringify(data, null, 2)), [data, module])
  function download() {
    try {
      let source
      try { source = JSON.parse(json) }
      catch { throw new Error(`${module}.json no contiene JSON válido. Revisa templates/${module}.json.`) }
      let normalized
      try { normalized = normalizeModule(module, source).data }
      catch { throw new Error(`${module}.json no coincide con templates/${module}.json y no se ha descargado.`) }
      if (!validateModule(module, normalized)) throw new Error(`${module}.json no coincide con el formato de templates/${module}.json y no se ha descargado.`)
      const blob = new Blob([JSON.stringify(normalized, null, 2) + '\n'], { type: 'application/json' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${module}.json`
      link.click()
      URL.revokeObjectURL(link.href)
      onDownload?.(module)
    } catch (error) {
      alert(`${error.message || 'El contenido no es JSON válido para este módulo.'} No se ha descargado.`)
    }
  }
  return <div className="modal-backdrop"><div className="modal fallback-modal">
    <button className="modal-close" onClick={onClose}>×</button><span className="eyebrow">ACCESO AL ALMACENAMIENTO</span><h2>{readOnlyCv ? s.cvEditor.fallbackTitle : 'Guardar un JSON individual'}</h2>
    <p>{readOnlyCv ? s.cvEditor.fallbackReadOnly : <>Este navegador no ofrece conexión directa a carpetas. Puedes abrir <b>{module}.json</b>, cargarlo y descargar una versión editada. Sustituye el fichero manualmente en tu carpeta privada.</>}</p>
    <label className="button secondary file-button">Abrir {module}.json<input type="file" accept="application/json,.json" onChange={(event) => { const file = event.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = () => setJson(String(reader.result)); reader.readAsText(file) } }}/></label>
    <textarea className="json-editor" aria-label="Contenido del archivo JSON" value={json} onChange={(event) => setJson(event.target.value)} readOnly={readOnlyCv} spellCheck="false"/>
    <div className="modal-actions"><button className="button secondary" onClick={onClose}>Cerrar</button>{!readOnlyCv && <button className="button primary" onClick={download}>Descargar {module}.json actualizado</button>}</div>
    <small className="limit-note">{readOnlyCv ? s.cvEditor.fallbackLimitNote : 'El modo manual no detecta cambios externos ni sincroniza el fichero con esta página.'}</small>
  </div></div>
}
