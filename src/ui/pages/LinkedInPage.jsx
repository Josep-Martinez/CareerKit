import { PageHeading, Status } from '../components/PagePrimitives.jsx'
import {
  ArrayText,
  CardTitle,
  Check,
  TextField,
  useDraft,
} from '../components/FormPrimitives.jsx'
import { STRINGS as s } from '../../i18n/es.js'
import { id } from '../utils.js'

const LINKEDIN_SECTIONS = [
  ['headline', 'Titular'],
  ['about', 'Acerca de'],
  ['experience', 'Experiencia'],
  ['education', 'Educación'],
  ['skills', 'Aptitudes'],
  ['certifications', 'Certificaciones'],
  ['projects', 'Proyectos'],
  ['featured', 'Destacados'],
]
const PROFILE_EVIDENCE_GROUPS = [
  ['experience', 'Experiencia'],
  ['education', 'Formación'],
  ['skills', 'Habilidades'],
  ['certifications', 'Certificaciones'],
  ['languages', 'Idiomas'],
  ['projects', 'Proyectos'],
  ['evidence', 'Otras evidencias'],
  ['learnings', 'Aprendizajes'],
]
export function LinkedInPage({
  value,
  profile,
  state,
  warning,
  onSave,
  onReload,
}) {
  const [draft, setDraft] = useDraft(value)
  const pub = draft.published
  const setPub = (key, val) =>
    setDraft({ ...draft, published: { ...pub, [key]: val } })
  const evidenceItems = PROFILE_EVIDENCE_GROUPS.flatMap(([key]) =>
    (profile[key] || []).map((item) => ({ ...item, category: key })),
  )
  const addAudit = () =>
    setDraft({
      ...draft,
      audits: [
        ...draft.audits,
        {
          id: id(),
          section: 'about',
          action: 'corregir',
          priority: 'media',
          problem: '',
          reasonEvidence: '',
          profileEvidenceIds: [],
          recommendation: '',
          proposedText: '',
          date: '',
          status: 'pendiente',
        },
      ],
    })
  const updateAudit = (index, part) =>
    setDraft({
      ...draft,
      audits: draft.audits.map((item, n) =>
        n === index ? { ...item, ...part } : item,
      ),
    })
  const removeAudit = (index) =>
    setDraft({ ...draft, audits: draft.audits.filter((_, n) => n !== index) })
  const previewKeys = [
    'experience',
    'education',
    'skills',
    'certifications',
    'projects',
    'featured',
  ]
  const auditNotes = (section) =>
    draft.audits.filter(
      (item) => item.section === section && item.status !== 'descartada',
    )
  return (
    <>
      <PageHeading
        eyebrow="COPIA DEL PERFIL PUBLICADO"
        title="LinkedIn"
        subtitle="Conserva el contenido publicado y anota qué corregir o añadir, con su base en perfil y aprendizajes."
      />
      <Status state={state} warning={warning} onReload={onReload} />
      <div className="linkedin-layout">
        <section className="panel form-panel" id="linkedin-content-form">
          <CardTitle
            title="Contenido actual"
            description="Transcribe el contenido tal como aparece publicado."
          />
          <TextField
            label="Titular"
            value={pub.headline}
            onChange={(v) => setPub('headline', v)}
          />
          <AuditPoints
            notes={auditNotes('headline')}
            evidence={evidenceItems}
          />
          <TextField
            label="Acerca de"
            rows={6}
            value={pub.about}
            onChange={(v) => setPub('about', v)}
          />
          <AuditPoints notes={auditNotes('about')} evidence={evidenceItems} />
          {previewKeys.map((key) => (
            <ArrayText
              key={key}
              title={
                {
                  experience: 'Experiencia',
                  education: 'Educación',
                  skills: 'Aptitudes',
                  certifications: 'Certificaciones',
                  projects: 'Proyectos',
                  featured: 'Destacados',
                }[key]
              }
              items={pub[key]}
              onChange={(v) => setPub(key, v)}
            />
          ))}
          <TextField
            label="Última actualización del perfil"
            value={draft.lastUpdated}
            onChange={(v) => setDraft({ ...draft, lastUpdated: v })}
            hint="Fecha manual; déjala vacía si no está registrada."
          />
          <div className="divider" />
          <CardTitle
            title="Qué corregir o añadir"
            description="Cada punto se vincula a una sección de LinkedIn y a evidencias de tu perfil o aprendizajes."
            onAdd={addAudit}
          />
          {draft.audits.map((item, i) => (
            <AuditCard
              key={item.id || i}
              item={item}
              evidence={evidenceItems}
              onChange={(part) => updateAudit(i, part)}
              onDelete={() => removeAudit(i)}
            />
          ))}
          {!draft.audits.length && (
            <p className="quiet-empty">Sin puntos de auditoría.</p>
          )}
          <button
            className="button primary save-button"
            onClick={() => onSave(draft)}
          >
            Guardar LinkedIn y auditoría
          </button>
        </section>
        <aside className="linkedin-preview">
          <div className="preview-label">
            <span className="eyebrow">VISTA PREVIA</span>
            <span>La copia y las sugerencias se mantienen separadas</span>
          </div>
          <div className="preview-card">
            <div className="preview-cover" />
            <div className="preview-avatar">
              {pub.headline ? pub.headline[0].toUpperCase() : '·'}
            </div>
            <div className="preview-content">
              <h3>Nombre sin registrar</h3>
              <p>{pub.headline || 'Tu titular profesional aparecerá aquí'}</p>
              <AuditPoints
                notes={auditNotes('headline')}
                evidence={evidenceItems}
              />
              <div className="preview-about">
                <b>Acerca de</b>
                <small>
                  {pub.about ||
                    'El texto publicado aparecerá aquí tal como lo escribas.'}
                </small>
                <AuditPoints
                  notes={auditNotes('about')}
                  evidence={evidenceItems}
                />
              </div>
              <div className="preview-sections">
                {previewKeys
                  .filter((key) => pub[key]?.length || auditNotes(key).length)
                  .map((key) => (
                    <div className="preview-section" key={key}>
                      <b>
                        {
                          {
                            experience: 'Experiencia',
                            education: 'Educación',
                            skills: 'Aptitudes',
                            certifications: 'Certificaciones',
                            projects: 'Proyectos',
                            featured: 'Destacados',
                          }[key]
                        }
                      </b>
                      {(pub[key] || []).map((entry, i) => (
                        <small key={i}>
                          {typeof entry === 'string' ? entry : entry.title}
                        </small>
                      ))}
                      <AuditPoints
                        notes={auditNotes(key)}
                        evidence={evidenceItems}
                      />
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}

function AuditPoints({ notes, evidence }) {
  if (!notes.length) return null
  const actionLabel = {
    corregir: 'Corregir',
    anadir: 'Añadir',
    aclarar: 'Aclarar',
  }
  return (
    <div className="preview-audit-points">
      <span>PARA REVISAR</span>
      <ul>
        {notes.map((note) => {
          const linked = evidence.filter((item) =>
            (note.profileEvidenceIds || []).includes(item.id),
          )
          const basis = linked.length
            ? linked
                .map((item) => item.title || item.name || item.id)
                .join(' · ')
            : (note.profileEvidenceIds || []).join(' · ')
          return (
            <li key={note.id}>
              <b>{actionLabel[note.action] || 'Revisar'}:</b>{' '}
              {note.recommendation || note.problem || 'Anotación pendiente'}
              {note.proposedText && (
                <small>Texto propuesto: {note.proposedText}</small>
              )}
              <small>
                {note.reasonEvidence ? `${note.reasonEvidence} · ` : ''}
                {basis
                  ? `Base: ${basis}`
                  : 'Vincula una evidencia del perfil o un aprendizaje.'}{' '}
                · Prioridad {note.priority || 'media'} · {note.status}
              </small>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function AuditCard({ item, evidence, onChange, onDelete }) {
  const selectedIds = item.profileEvidenceIds || []
  const sectionKeys = LINKEDIN_SECTIONS.map(([key]) => key)
  const categoryLabels = Object.fromEntries(PROFILE_EVIDENCE_GROUPS)
  return (
    <div className="item-card audit-card">
      <div className="item-heading">
        <span>Punto de auditoría · {item.date || s.noData}</span>
        <button
          className="icon-button"
          aria-label="Eliminar punto de auditoría"
          onClick={onDelete}
        >
          ×
        </button>
      </div>
      <div className="form-two">
        <label className="field">
          <span>Sección de LinkedIn</span>
          <select
            value={
              sectionKeys.includes(item.section)
                ? item.section
                : item.section || 'about'
            }
            onChange={(e) => onChange({ section: e.target.value })}
          >
            {!sectionKeys.includes(item.section) && item.section && (
              <option value={item.section}>{item.section}</option>
            )}
            {LINKEDIN_SECTIONS.map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Acción</span>
          <select
            value={item.action || 'corregir'}
            onChange={(e) => onChange({ action: e.target.value })}
          >
            <option value="corregir">Corregir</option>
            <option value="anadir">Añadir</option>
            <option value="aclarar">Aclarar</option>
          </select>
        </label>
      </div>
      <label className="field">
        <span>Prioridad</span>
        <select
          value={item.priority || 'media'}
          onChange={(e) => onChange({ priority: e.target.value })}
        >
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>
      </label>
      <TextField
        label="Qué se observa"
        value={item.problem}
        onChange={(v) => onChange({ problem: v })}
      />
      <TextField
        label="Por qué, según el perfil o los aprendizajes"
        rows={2}
        value={item.reasonEvidence}
        onChange={(v) => onChange({ reasonEvidence: v })}
      />
      <fieldset className="audit-evidence">
        <legend>Evidencias relacionadas</legend>
        {PROFILE_EVIDENCE_GROUPS.map(([key]) => {
          const group = evidence.filter((entry) => entry.category === key)
          if (!group.length) return null
          return (
            <div className="audit-evidence-group" key={key}>
              <b>{categoryLabels[key]}</b>
              {group.map((entry) => (
                <Check
                  key={entry.id}
                  label={`${entry.title || entry.name || 'Sin título'} · ${entry.id}`}
                  checked={selectedIds.includes(entry.id)}
                  onChange={(checked) =>
                    onChange({
                      profileEvidenceIds: checked
                        ? [...selectedIds, entry.id]
                        : selectedIds.filter((value) => value !== entry.id),
                    })
                  }
                />
              ))}
            </div>
          )
        })}
        {!evidence.length && (
          <p className="quiet-empty">
            Añade primero evidencias o aprendizajes en Perfil.
          </p>
        )}
        <TextField
          label="Otros IDs de perfil/aprendizajes"
          value={selectedIds
            .filter((value) => !evidence.some((entry) => entry.id === value))
            .join(', ')}
          onChange={(v) => {
            const known = selectedIds.filter((value) =>
              evidence.some((entry) => entry.id === value),
            )
            const extra = v
              .split(',')
              .map((value) => value.trim())
              .filter(Boolean)
            onChange({ profileEvidenceIds: [...known, ...extra] })
          }}
          hint="Los IDs deben existir en profile.json."
        />
      </fieldset>
      <TextField
        label="Qué corregir o añadir"
        rows={2}
        value={item.recommendation}
        onChange={(v) => onChange({ recommendation: v })}
      />
      <TextField
        label="Texto propuesto (opcional)"
        rows={3}
        value={item.proposedText}
        onChange={(v) => onChange({ proposedText: v })}
      />
      <div className="form-two">
        <TextField
          label="Fecha de auditoría"
          value={item.date}
          onChange={(v) => onChange({ date: v })}
        />
        <label className="field">
          <span>Estado</span>
          <select
            value={item.status || 'pendiente'}
            onChange={(e) => onChange({ status: e.target.value })}
          >
            <option value="pendiente">Pendiente</option>
            <option value="aplicada">Aplicada</option>
            <option value="descartada">Descartada</option>
          </select>
        </label>
      </div>
    </div>
  )
}
