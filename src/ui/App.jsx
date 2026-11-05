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
  const [fallbackOpen, setFallbackOpen] = useState(false)
  const [vacancyId, setVacancyId] = useState(null)
  const [confirmDisconnect, setConfirmDisconnect] = useState(false)
  const currentModule = page === 'home' ? null : page

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
            store.setStates((prev) => prev[key] === 'Cambio externo' ? prev : ({ ...prev, [key]: 'Cambio externo' }))
            store.setWarnings((prev) => ({ ...prev, [key]: `${key}.json cambió fuera de la aplicación. Recárgalo para cargar la versión externa antes de guardar.` }))
          }
        } catch { /* missing files are surfaced on initial connection */ }
      }
    }
    const timer = setInterval(checks, 2200)
    return () => { cancelled = true; clearInterval(timer) }
  }, [store.folder, store.revision])

  async function connect() {
    const result = await store.connect()
    if (result.fallback) setFallbackOpen(true)
    else if (result.connected) setNotice('Carpeta conectada. Revisa el estado de cada archivo en su sección.')
    else if (result.error) setNotice(result.error)
  }
  async function save(module, value) {
    const result = await store.save(module, value)
    if (result.conflict) setNotice(`${module}.json cambió fuera de la aplicación. Recárgalo antes de volver a guardar.`)
    else if (result.fallback) { setNotice('Cambios preparados. Usa «Guardar JSON individual» para guardar este módulo en tu dispositivo.'); setFallbackOpen(true) }
    else if (result.saved) setNotice(`${module}.json guardado.`)
    else if (result.error) setNotice(result.error)
  }
  const activeVacancy = store.data.vacancies.items.find((v) => v.id === vacancyId)

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">C</div><div><strong>CareerKit</strong><span>Tu espacio profesional</span></div></div>
      <div className="side-label">ESPACIO</div>
      <nav aria-label="Secciones principales">{NAV.map(([key, label]) => <button key={key} className={`nav-link ${page === key ? 'active' : ''}`} onClick={() => { setPage(key); setVacancyId(null) }}><span className="nav-icon"><SectionIcon name={key}/></span>{label}{page === key && <span className="nav-dot" />}</button>)}</nav>
      <div className="sidebar-bottom"><div className="privacy-card"><span className="privacy-icon">♧</span><div><strong>Datos en tu dispositivo</strong><p>La app no envía información a ningún servidor.</p></div></div><button className="connect-button" onClick={connect}><span>↗</span>{store.folder ? 'Carpeta conectada' : s.connect}</button><p className="side-note">Permisos de lectura y escritura solicitados al conectar.</p></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div className="breadcrumbs">CareerKit <span>/</span> {page === 'home' ? 'Inicio' : TITLES[page]}</div><div className="top-actions"><span className={`connection ${store.folder ? 'is-connected' : ''}`}><i />{store.folder ? 'Datos conectados' : 'Solo vista previa'}</span><button className="avatar">C</button></div></header>
      <section className="page-content">
        {notice && <div className="toast" role="status"><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Cerrar aviso">×</button></div>}
        {page === 'home' && <Home data={store.data} onNavigate={setPage} onVacancy={(v) => { setVacancyId(v.id); setPage('vacancies') }} />}
        {page === 'profile' && <ProfileEditor value={store.data.profile} state={store.states.profile} warning={store.warnings.profile} onSave={(v) => save('profile', v)} onReload={() => store.reload('profile')} />}
        {page === 'linkedin' && <LinkedInEditor value={store.data.linkedin} profile={store.data.profile} state={store.states.linkedin} warning={store.warnings.linkedin} onSave={(v) => save('linkedin', v)} onReload={() => store.reload('linkedin')} />}
        {page === 'cv' && <CVEditor value={store.data.cv} state={store.states.cv} warning={store.warnings.cv} onSave={(v) => save('cv', v)} onReload={() => store.reload('cv')} />}
        {page === 'vacancies' && (activeVacancy ? <VacancyDetail value={activeVacancy} onBack={() => setVacancyId(null)} /> : <Vacancies value={store.data.vacancies} state={store.states.vacancies} warning={store.warnings.vacancies} onSave={(v) => save('vacancies', v)} onReload={() => store.reload('vacancies')} onSelect={() => {}} />)}
        <footer className="page-footer"><span>Privado por diseño · Sin cuentas ni sincronización</span>{store.folder && <button className="text-button" onClick={() => setConfirmDisconnect(true)}>{s.disconnect}</button>}</footer>
      </section>
    </main>
    {fallbackOpen && <FallbackDialog module={currentModule || 'profile'} data={store.data[currentModule || 'profile']} onClose={() => setFallbackOpen(false)} />}
    {confirmDisconnect && <div className="modal-backdrop"><div className="modal"><button className="modal-close" onClick={() => setConfirmDisconnect(false)}>×</button><span className="eyebrow">Privacidad</span><h2>Desconectar carpeta</h2><p>La web dejará de leer y guardar los JSON. Puedes borrar también los datos cargados en esta sesión.</p><div className="modal-actions"><button className="button secondary" onClick={() => setConfirmDisconnect(false)}>Cancelar</button><button className="button secondary" onClick={() => { store.disconnect(false); setConfirmDisconnect(false); setNotice('Carpeta desconectada.') }}>Desconectar</button><button className="button danger" onClick={() => { store.disconnect(true); setConfirmDisconnect(false); setNotice('Carpeta desconectada y datos de sesión borrados.') }}>Desconectar y borrar datos de sesión</button></div></div></div>}
  </div>
}

function SectionIcon({ name }) {
  const common = { className: 'section-icon-svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, focusable: false }
  if (name === 'home') return <svg {...common}><path d="m3.5 10 8.5-6.5 8.5 6.5"/><path d="M5.5 9v11h13V9M9.5 20v-6h5v6"/></svg>
  if (name === 'profile') return <svg {...common}><circle cx="9" cy="8" r="3.2"/><path d="M3.8 19a5.2 5.2 0 0 1 10.4 0M16 7.2h4.5M18.25 5v4.5"/></svg>
  if (name === 'linkedin') return <svg {...common}><rect x="3.5" y="3.5" width="17" height="17" rx="4"/><circle cx="8" cy="8" r=".9" fill="currentColor" stroke="none"/><path d="M7.2 11v5.6M10.8 16.6v-3.1a2 2 0 0 1 4 0v3.1M10.8 12.5V11"/></svg>
  if (name === 'cv') return <svg {...common}><path d="M6 3.5h8l4 4V20H6z"/><path d="M14 3.5V8h4M9 12h6M9 15h6M9 18h4"/></svg>
  return <svg {...common}><rect x="3.5" y="7.5" width="17" height="12.5" rx="2"/><path d="M8.5 7.5V5h7v2.5M3.5 12h17M10 12v2h4v-2"/></svg>
}
function PageHeading({ eyebrow, title, subtitle, action }) { return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{subtitle}</p></div>{action}</div> }
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
function Status({ state, warning, onReload }) { return <>{state && <div className={`save-state ${state.includes('Error') || state.includes('externo') ? 'state-error' : ''}`} role="status"><span>●</span> {state}{state?.includes('externo') && <button onClick={onReload}>Recargar archivo</button>}</div>}{warning && <div className="warning-box">{warning}{state === 'Error' && <button onClick={onReload}>Volver a intentar</button>}{state === 'Cambio externo' && <button onClick={onReload}>Recargar archivo</button>}</div>}</> }
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
function ArrayText({ title, items = [], onChange }) { return <div className="collection"><CardTitle title={title} onAdd={() => onChange([...(items || []), ''])}/>{items.map((item, i) => <div className="array-row" key={i}><input aria-label={`${title} ${i+1}`} value={typeof item === 'string' ? item : item.title || ''} onChange={(e) => onChange(items.map((x,n) => n === i ? e.target.value : x))}/><button className="icon-button" aria-label={`Eliminar ${title.toLowerCase()}`} onClick={() => onChange(items.filter((_,n) => n !== i))}>×</button></div>)}</div> }
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
function CVEditor({ value, state, warning, onSave, onReload }) {
  const [draft, setDraft] = useDraft(value)
  const [activeVersion, setActiveVersion] = useState('spanish')
  const copy = s.cvEditor
  const spanish = activeVersion === 'spanish'
  const current = draft.versions[activeVersion]
  const targetVersion = (name) => draft.versions[name]
  const hasContent = (version) => Boolean(version.masterText || version.lastUpdated || version.lastReviewed)
  const guide = spanish ? copy.spanishGuide : copy.englishGuide
  const guideTitle = spanish ? copy.spanishGuideTitle : copy.englishGuideTitle

  function updateVersion(field, nextValue) {
    setDraft({ ...draft, versions: { ...draft.versions, [activeVersion]: { ...current, [field]: nextValue } } })
  }

  function assignPrevious(target) {
    const existing = targetVersion(target)
    if (!draft.previousVersion || hasContent(existing)) return
    const next = {
      ...draft,
      versions: { ...draft.versions, [target]: { ...draft.previousVersion } },
    }
    delete next.previousVersion
    setDraft(next)
    setActiveVersion(target)
  }

  return <>
    <PageHeading eyebrow="DOCUMENTO PRINCIPAL" title={copy.title} subtitle={copy.subtitle}/>
    <Status state={state} warning={warning} onReload={onReload}/>
    <div className="cv-version-switch" role="group" aria-label={copy.versionGroup}>
      <button type="button" className={spanish ? 'selected' : ''} aria-pressed={spanish} onClick={() => setActiveVersion('spanish')}>
        <span>{copy.spanishTab}</span>
      </button>
      <button type="button" className={!spanish ? 'selected' : ''} aria-pressed={!spanish} onClick={() => setActiveVersion('english')}>
        <span>{copy.englishTab}</span>
      </button>
    </div>
    {draft.previousVersion && <section className="cv-legacy-notice" aria-labelledby="cv-legacy-title">
      <div><h2 id="cv-legacy-title">{copy.legacyTitle}</h2><p>{copy.legacyText}</p></div>
      <pre className="cv-legacy-content">{draft.previousVersion.masterText || copy.noLegacyText}</pre>
      <div className="cv-legacy-actions">
        <button className="button secondary small" disabled={hasContent(targetVersion('spanish'))} onClick={() => assignPrevious('spanish')}>{copy.legacySpanish}</button>
        <button className="button secondary small" disabled={hasContent(targetVersion('english'))} onClick={() => assignPrevious('english')}>{copy.legacyEnglish}</button>
      </div>
      {(hasContent(targetVersion('spanish')) || hasContent(targetVersion('english'))) && <small>{copy.legacyOccupied}</small>}
    </section>}
    <div className="cv-layout">
      <section className="panel form-panel">
        <div className={`cv-format-guide ${spanish ? 'spanish' : 'english'}`}>
          <span className="eyebrow">{guideTitle}</span>
          <p>{guide}</p>
          {spanish && <small>{copy.photoNote}</small>}
        </div>
        <TextField label={spanish ? copy.contentSpanish : copy.contentEnglish} lang={spanish ? 'es' : 'en'} rows={22} value={current.masterText} onChange={(v) => updateVersion('masterText', v)} placeholder={spanish ? copy.placeholderSpanish : copy.placeholderEnglish}/>
        <div className="form-two">
          <TextField label={copy.lastUpdated} value={current.lastUpdated} onChange={(v) => updateVersion('lastUpdated', v)} hint={copy.dateHint}/>
          <TextField label={copy.lastReviewed} value={current.lastReviewed} onChange={(v) => updateVersion('lastReviewed', v)} hint={copy.dateHint}/>
        </div>
        <button className="button primary save-button" onClick={() => onSave(draft)}>{spanish ? copy.saveSpanish : copy.saveEnglish}</button>
      </section>
      <aside className="tip-card cv-tip"><span className="tip-icon">▤</span><h3>{copy.tipTitle}</h3><p>{copy.tipBody}</p><span className="privacy-tag">La app no genera CV automáticamente</span></aside>
    </div>
  </>
}
function Vacancies({ value, state, warning, onSave, onReload, onSelect }) {
  const [draft, setDraft] = useDraft(value)
  const [selected, setSelected] = useState(null)
  const items = [...draft.items].sort((a,b) => (a.preference || 999) - (b.preference || 999))
  function add() { const item = { id: id(), role: '', company: '', location: '', modality: '', link: '', source: '', searchedAt: '', verifiedAt: '', description: '', salary: '', salaryVerified: false, level: '', jobType: '', assessment: '', matchingEvidenceIds: [], gaps: '', blockers: '', preference: draft.items.length + 1, featured: false }; setDraft({ ...draft, items: [...draft.items, item] }); setSelected(item.id) }
  function patch(idValue, part) { setDraft({ ...draft, items: draft.items.map((v) => v.id === idValue ? { ...v, ...part } : v) }) }
  const detail = draft.items.find((v) => v.id === selected)
  return <><PageHeading eyebrow="OPCIONES PROFESIONALES" title="Vacantes" subtitle="Registra oportunidades investigadas y ordénalas por preferencia." action={<button className="button primary" onClick={add}>＋ Añadir vacante</button>}/><Status state={state} warning={warning} onReload={onReload}/><div className="vacancies-layout"><section className="vacancy-list">{items.length ? items.map((v, i) => <button key={v.id} className={`vacancy-card ${selected === v.id ? 'selected' : ''}`} onClick={() => { setSelected(v.id); onSelect(v.id) }}><div className="vacancy-card-top"><span className="rank">{String(i+1).padStart(2,'0')}</span><span className="vacancy-logo">{(v.company || '·')[0].toUpperCase()}</span><span className="vacancy-card-title"><b>{v.role || 'Puesto sin título'}</b><small>{v.company || 'Empresa sin registrar'}</small></span><span className="row-arrow">↗</span></div><div className="vacancy-tags"><span>{v.location || 'Ubicación sin registrar'}</span><span>{v.modality || 'Modalidad sin registrar'}</span>{v.featured && <span className="highlight-tag">Destacada</span>}</div><div className="vacancy-card-bottom"><span>Preferencia {v.preference || '—'}</span><span>{v.salary || 'Salario sin registrar'}</span></div></button>) : <EmptyState text="Añade ofertas cuando tú o un agente las hayáis investigado." action="Crear primera vacante" onClick={add}/>}<button className="button primary save-button" onClick={() => onSave(draft)}>Guardar vacantes</button></section>
    {detail ? <section className="panel form-panel vacancy-form"><div className="panel-heading"><div><span className="eyebrow">DETALLE DE LA OFERTA</span><h2>{detail.role || 'Nueva vacante'}</h2></div><button className="icon-button" aria-label="Eliminar vacante" onClick={() => { setDraft({ ...draft, items: draft.items.filter((v) => v.id !== detail.id) }); setSelected(null) }}>×</button></div><div className="form-two"><TextField label="Puesto" value={detail.role} onChange={(v) => patch(detail.id, { role: v })}/><TextField label="Empresa" value={detail.company} onChange={(v) => patch(detail.id, { company: v })}/></div><div className="form-two"><TextField label="Ubicación" value={detail.location} onChange={(v) => patch(detail.id, { location: v })}/><TextField label="Modalidad" value={detail.modality} onChange={(v) => patch(detail.id, { modality: v })}/></div><div className="form-two"><TextField label="Enlace" value={detail.link} onChange={(v) => patch(detail.id, { link: v })}/><TextField label="Fuente" value={detail.source} onChange={(v) => patch(detail.id, { source: v })}/></div><div className="form-two"><TextField label="Fecha de búsqueda" value={detail.searchedAt} onChange={(v) => patch(detail.id, { searchedAt: v })}/><TextField label="Fecha de verificación" value={detail.verifiedAt} onChange={(v) => patch(detail.id, { verifiedAt: v })}/></div><TextField label="Descripción completa" rows={7} value={detail.description} onChange={(v) => patch(detail.id, { description: v })}/><div className="form-two"><TextField label="Salario o banda" value={detail.salary} onChange={(v) => patch(detail.id, { salary: v })}/><Check label="Salario verificado" checked={detail.salaryVerified} onChange={(v) => patch(detail.id, { salaryVerified: v })}/></div><div className="form-two"><TextField label="Nivel" value={detail.level} onChange={(v) => patch(detail.id, { level: v })}/><TextField label="Tipo de puesto" value={detail.jobType} onChange={(v) => patch(detail.id, { jobType: v })}/></div><TextField label="Valoración del agente" rows={3} value={detail.assessment} onChange={(v) => patch(detail.id, { assessment: v })}/><TextField label="Evidencias de encaje (IDs estables del perfil)" value={detail.matchingEvidenceIds.join(', ')} onChange={(v) => patch(detail.id, { matchingEvidenceIds: v.split(',').map((x) => x.trim()).filter(Boolean) })}/><TextField label="Carencias demostrables" rows={2} value={detail.gaps} onChange={(v) => patch(detail.id, { gaps: v })}/><TextField label="Posibles bloqueos" rows={2} value={detail.blockers} onChange={(v) => patch(detail.id, { blockers: v })}/><div className="form-two"><TextField label="Orden de preferencia" value={detail.preference} onChange={(v) => patch(detail.id, { preference: Number(v) })}/><Check label="Destacar en Inicio" checked={detail.featured} onChange={(v) => patch(detail.id, { featured: v })}/></div><button className="button secondary" onClick={() => onSave(draft)}>Guardar cambios</button></section> : <aside className="vacancy-aside"><div className="tip-card"><span className="tip-icon">◎</span><h3>Tu lista, a tu ritmo</h3><p>Las ofertas no se buscan automáticamente. Añade una cuando la hayas investigado.</p></div><div className="legend-card"><h3>Relación con el perfil</h3><p>Relaciona cada valoración con evidencias mediante sus identificadores estables.</p></div></aside>}</div></>
}
function VacancyDetail({ value, onBack }) { return <><button className="back-link" onClick={onBack}>← Volver a vacantes</button><PageHeading eyebrow="DETALLE DE LA OFERTA" title={value.role || 'Vacante'} subtitle={`${value.company || 'Empresa sin registrar'} · ${value.location || 'Ubicación sin registrar'}`}/><div className="detail-grid"><section className="panel detail-panel"><div className="detail-tags"><span>{value.modality || 'Modalidad sin registrar'}</span><span>Preferencia {value.preference || '—'}</span></div><h2>Descripción</h2><p className="preline">{value.description || 'Sin registrar'}</p><h2>Valoración</h2><p className="preline">{value.assessment || 'Sin registrar'}</p><h2>Evidencias de encaje</h2><p>{value.matchingEvidenceIds?.join(', ') || 'Sin registrar'}</p><h2>Carencias y bloqueos</h2><p className="preline">{[value.gaps, value.blockers].filter(Boolean).join('\n') || 'Sin registrar'}</p></section><aside className="legend-card"><h3>Datos de la oferta</h3><dl><dt>Salario</dt><dd>{value.salary ? `${value.salary} · ${value.salaryVerified ? 'verificado' : 'sin verificar'}` : 'Sin registrar'}</dd><dt>Nivel</dt><dd>{pretty(value.level)}</dd><dt>Tipo</dt><dd>{pretty(value.jobType)}</dd><dt>Fuente</dt><dd>{pretty(value.source)}</dd><dt>Verificada</dt><dd>{pretty(value.verifiedAt)}</dd></dl>{value.link && <a className="button secondary" href={value.link} target="_blank" rel="noreferrer">Abrir fuente ↗</a>}</aside></div></> }
function FallbackDialog({ module, data, onClose }) {
  const [json, setJson] = useState(JSON.stringify(data, null, 2))
  useEffect(() => setJson(JSON.stringify(data, null, 2)), [data, module])
  function download() {
    try {
      const normalized = normalizeModule(module, JSON.parse(json)).data
      if (!validateModule(module, normalized)) throw new Error('El contenido no cumple el esquema del módulo.')
      const blob = new Blob([JSON.stringify(normalized, null, 2) + '\n'], { type: 'application/json' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${module}.json`
      link.click()
      URL.revokeObjectURL(link.href)
    } catch (error) {
      alert(`${error.message || 'El contenido no es JSON válido para este módulo.'} No se ha descargado.`)
    }
  }
  return <div className="modal-backdrop"><div className="modal fallback-modal">
    <button className="modal-close" onClick={onClose}>×</button><span className="eyebrow">ACCESO AL ALMACENAMIENTO</span><h2>Guardar un JSON individual</h2>
    <p>Este navegador no ofrece conexión directa a carpetas. Puedes abrir <b>{module}.json</b>, cargarlo y descargar una versión editada. Sustituye el fichero manualmente en tu carpeta privada.</p>
    <label className="button secondary file-button">Abrir {module}.json<input type="file" accept="application/json,.json" onChange={(event) => { const file = event.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = () => setJson(String(reader.result)); reader.readAsText(file) } }}/></label>
    <textarea className="json-editor" aria-label="Contenido del archivo JSON" value={json} onChange={(event) => setJson(event.target.value)} spellCheck="false"/>
    <div className="modal-actions"><button className="button secondary" onClick={onClose}>Cerrar</button><button className="button primary" onClick={download}>Descargar {module}.json actualizado</button></div>
    <small className="limit-note">El modo manual no detecta cambios externos ni sincroniza el fichero con esta página.</small>
  </div></div>
}
