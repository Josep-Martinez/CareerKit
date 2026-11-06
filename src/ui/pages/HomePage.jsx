import { PageHeading, EmptyState } from '../components/PagePrimitives.jsx'
import { SectionIcon } from '../components/SectionIcon.jsx'
import { STRINGS as s } from '../../i18n/es.js'
import { isKnownEmpty, isKnownPopulated, pretty } from '../utils.js'

export function HomePage({ data, connected, states, onNavigate, onVacancy }) {
  const vacancies = [...data.vacancies.items].filter((item) => item.featured).sort((a, b) => (a.preference || 999) - (b.preference || 999)).slice(0, 3)
  const priorities = [...data.priorities.items].sort((a, b) => (a.order || 999) - (b.order || 999) || ({ alta: 0, media: 1, baja: 2 }[a.level] ?? 3) - ({ alta: 0, media: 1, baja: 2 }[b.level] ?? 3))
  const empty = connected ? {
    profile: isKnownEmpty('profile', data.profile, states.profile),
    linkedin: isKnownEmpty('linkedin', data.linkedin, states.linkedin),
    cv: isKnownEmpty('cv', data.cv, states.cv),
  } : {}
  const sourcesReady = connected && isKnownPopulated('profile', data.profile, states.profile) && isKnownPopulated('linkedin', data.linkedin, states.linkedin)
  const urgentSetup = empty.profile || empty.linkedin
  const pendingCV = empty.cv && !urgentSetup && sourcesReady
  return <><PageHeading eyebrow="TU ESPACIO PROFESIONAL" title="Inicio" subtitle="Una vista clara de lo que estás construyendo." />
    <div className="welcome-card"><div className="welcome-copy"><span className="welcome-label">TU ESPACIO DE TRABAJO</span><h2>Una historia profesional,<br/>bien ordenada.</h2><p>Reúne tu experiencia, materiales y oportunidades en un espacio privado que controlas tú.</p><button className="button light" onClick={() => onNavigate('profile')}>Abrir mi perfil <span>→</span></button></div><div className="welcome-art"><div className="folio-sheet"><span>CAREER NOTES <i>01</i></span><b>Trayectoria<br/>con intención.</b><div className="folio-rule"/><small>PERFIL · APRENDIZAJES · PRÓXIMOS PASOS</small></div><div className="folio-stamp">CK<br/><i>EST. LOCAL</i></div></div></div>
    {(urgentSetup || pendingCV) && <section className={`home-setup-card ${urgentSetup ? 'is-urgent' : ''}`} role={urgentSetup ? 'alert' : 'status'} aria-labelledby="home-setup-title"><div className="home-setup-copy"><span className="setup-severity">{urgentSetup ? s.homeSetup.urgentLabel : s.homeSetup.pendingLabel}</span><h2 id="home-setup-title">{urgentSetup ? s.homeSetup.urgentTitle : s.homeSetup.cvTitle}</h2><p>{urgentSetup ? s.homeSetup[empty.profile && empty.linkedin ? 'urgentBodyBoth' : empty.profile ? 'urgentBodyProfile' : 'urgentBodyLinkedin'] : s.homeSetup.cvBody}</p></div><div className="home-setup-actions">{empty.profile && <button className="button primary" onClick={() => onNavigate('profile')}>{s.homeSetup.profileAction}</button>}{empty.linkedin && <button className="button secondary" onClick={() => onNavigate('linkedin')}>{s.homeSetup.linkedinAction}</button>}{empty.cv && <button className="button secondary" onClick={() => onNavigate('prompts')}>{s.homeSetup.promptsAction}</button>}</div></section>}
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
