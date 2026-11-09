import { useState } from 'react'
import {
  PageHeading,
  Status,
  EmptyState,
} from '../components/PagePrimitives.jsx'
import {
  ArrayText,
  CardTitle,
  Check,
  TextField,
  useDraft,
} from '../components/FormPrimitives.jsx'
import { STRINGS as s } from '../../i18n/es.js'
import { id, pretty } from '../utils.js'

function emptyCvAdvice() {
  return {
    recommendedVersion: 'pending',
    reason: '',
    assessedAt: '',
    spanishAdjustments: [],
    englishAdjustments: [],
  }
}

function CvAdviceEditor({ value, onChange }) {
  const copy = s.vacancyCvAdvice
  const advice = { ...emptyCvAdvice(), ...value }
  const update = (part) => onChange({ ...advice, ...part })
  return (
    <section className="vacancy-cv-editor" aria-label={copy.title}>
      <CardTitle title={copy.title} description={copy.description} />
      <label className="field">
        <span>{copy.recommendedVersion}</span>
        <select
          value={advice.recommendedVersion}
          onChange={(event) =>
            update({ recommendedVersion: event.target.value })
          }
        >
          <option value="pending">{copy.pending}</option>
          <option value="spanish">{copy.spanish}</option>
          <option value="english">{copy.english}</option>
          <option value="both">{copy.both}</option>
        </select>
      </label>
      <TextField
        label={copy.reason}
        rows={3}
        value={advice.reason}
        onChange={(text) => update({ reason: text })}
      />
      <TextField
        label={copy.assessedAt}
        value={advice.assessedAt}
        onChange={(text) => update({ assessedAt: text })}
        hint={copy.dateHint}
      />
      <p className="cv-advice-hint">{copy.profileBasis}</p>
      <ArrayText
        title={copy.spanishAdjustments}
        items={advice.spanishAdjustments}
        onChange={(items) => update({ spanishAdjustments: items })}
        lang="es"
      />
      <ArrayText
        title={copy.englishAdjustments}
        items={advice.englishAdjustments}
        onChange={(items) => update({ englishAdjustments: items })}
        lang="en"
      />
      <small className="cv-advice-hint">{copy.editHint}</small>
    </section>
  )
}

function CvAdjustmentList({ title, items = [], emptyLabel }) {
  const visible = items.filter(
    (item) => typeof item === 'string' && item.trim(),
  )
  return (
    <section className="cv-adjustment-list">
      <h3>{title}</h3>
      {visible.length ? (
        <ul>
          {visible.map((item, index) => (
            <li key={`${index}-${item}`}>{item}</li>
          ))}
        </ul>
      ) : (
        <p>{emptyLabel}</p>
      )}
    </section>
  )
}

export function VacanciesPage({
  value,
  state,
  warning,
  savedAt,
  onSave,
  onReload,
  onSelect,
}) {
  const [draft, setDraft] = useDraft(value)
  const [selected, setSelected] = useState(null)
  const items = [...draft.items].sort(
    (a, b) => (a.preference || 999) - (b.preference || 999),
  )

  function add() {
    const item = {
      id: id(),
      role: '',
      company: '',
      location: '',
      modality: '',
      link: '',
      source: '',
      searchedAt: '',
      verifiedAt: '',
      description: '',
      salary: '',
      salaryVerified: false,
      level: '',
      jobType: '',
      assessment: '',
      matchingEvidenceIds: [],
      gaps: '',
      blockers: '',
      preference: draft.items.length + 1,
      featured: false,
      cvAdvice: emptyCvAdvice(),
    }
    setDraft({ ...draft, items: [...draft.items, item] })
    setSelected(item.id)
  }

  function patch(idValue, part) {
    setDraft({
      ...draft,
      items: draft.items.map((item) =>
        item.id === idValue ? { ...item, ...part } : item,
      ),
    })
  }

  const detail = draft.items.find((item) => item.id === selected)
  return (
    <>
      <PageHeading
        eyebrow="OPCIONES PROFESIONALES"
        title="Vacantes"
        subtitle="Registra oportunidades investigadas y ordénalas por preferencia."
        action={
          <button className="button primary" onClick={add}>
            ＋ Añadir vacante
          </button>
        }
      />
      <Status
        fileName="vacancies"
        state={state}
        warning={warning}
        savedAt={savedAt}
        onReload={onReload}
      />
      <div className="vacancies-layout">
        <section className="vacancy-list">
          {items.length ? (
            items.map((item, index) => (
              <button
                key={item.id}
                className={`vacancy-card ${selected === item.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelected(item.id)
                  onSelect(item.id)
                }}
              >
                <div className="vacancy-card-top">
                  <span className="rank">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="vacancy-logo">
                    {(item.company || '·')[0].toUpperCase()}
                  </span>
                  <span className="vacancy-card-title">
                    <b>{item.role || 'Puesto sin título'}</b>
                    <small>{item.company || 'Empresa sin registrar'}</small>
                  </span>
                  <span className="row-arrow">↗</span>
                </div>
                <div className="vacancy-tags">
                  <span>{item.location || 'Ubicación sin registrar'}</span>
                  <span>{item.modality || 'Modalidad sin registrar'}</span>
                  {item.featured && (
                    <span className="highlight-tag">Destacada</span>
                  )}
                </div>
                <div className="vacancy-card-bottom">
                  <span>Preferencia {item.preference || '—'}</span>
                  <span>{item.salary || 'Salario sin registrar'}</span>
                </div>
              </button>
            ))
          ) : (
            <EmptyState
              text="Añade ofertas cuando tú o un agente las hayáis investigado."
              action="Crear primera vacante"
              onClick={add}
            />
          )}
          <button
            className="button primary save-button"
            onClick={() => onSave(draft)}
          >
            Guardar vacantes
          </button>
        </section>
        {detail ? (
          <section className="panel form-panel vacancy-form">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">DETALLE DE LA OFERTA</span>
                <h2>{detail.role || 'Nueva vacante'}</h2>
              </div>
              <button
                className="icon-button"
                aria-label="Eliminar vacante"
                onClick={() => {
                  setDraft({
                    ...draft,
                    items: draft.items.filter((item) => item.id !== detail.id),
                  })
                  setSelected(null)
                }}
              >
                ×
              </button>
            </div>
            <div className="form-two">
              <TextField
                label="Puesto"
                value={detail.role}
                onChange={(text) => patch(detail.id, { role: text })}
              />
              <TextField
                label="Empresa"
                value={detail.company}
                onChange={(text) => patch(detail.id, { company: text })}
              />
            </div>
            <div className="form-two">
              <TextField
                label="Ubicación"
                value={detail.location}
                onChange={(text) => patch(detail.id, { location: text })}
              />
              <TextField
                label="Modalidad"
                value={detail.modality}
                onChange={(text) => patch(detail.id, { modality: text })}
              />
            </div>
            <div className="form-two">
              <TextField
                label="Enlace"
                value={detail.link}
                onChange={(text) => patch(detail.id, { link: text })}
              />
              <TextField
                label="Fuente"
                value={detail.source}
                onChange={(text) => patch(detail.id, { source: text })}
              />
            </div>
            <div className="form-two">
              <TextField
                label="Fecha de búsqueda"
                value={detail.searchedAt}
                onChange={(text) => patch(detail.id, { searchedAt: text })}
              />
              <TextField
                label="Fecha de verificación"
                value={detail.verifiedAt}
                onChange={(text) => patch(detail.id, { verifiedAt: text })}
              />
            </div>
            <TextField
              label="Descripción completa"
              rows={7}
              value={detail.description}
              onChange={(text) => patch(detail.id, { description: text })}
            />
            <div className="form-two">
              <TextField
                label="Salario o banda"
                value={detail.salary}
                onChange={(text) => patch(detail.id, { salary: text })}
              />
              <Check
                label="Salario verificado"
                checked={detail.salaryVerified}
                onChange={(checked) =>
                  patch(detail.id, { salaryVerified: checked })
                }
              />
            </div>
            <div className="form-two">
              <TextField
                label="Nivel"
                value={detail.level}
                onChange={(text) => patch(detail.id, { level: text })}
              />
              <TextField
                label="Tipo de puesto"
                value={detail.jobType}
                onChange={(text) => patch(detail.id, { jobType: text })}
              />
            </div>
            <TextField
              label="Valoración del agente"
              rows={3}
              value={detail.assessment}
              onChange={(text) => patch(detail.id, { assessment: text })}
            />
            <TextField
              label="Evidencias de encaje (IDs estables del perfil)"
              value={(detail.matchingEvidenceIds || []).join(', ')}
              onChange={(text) =>
                patch(detail.id, {
                  matchingEvidenceIds: text
                    .split(',')
                    .map((item) => item.trim())
                    .filter(Boolean),
                })
              }
            />
            <TextField
              label="Carencias demostrables"
              rows={2}
              value={detail.gaps}
              onChange={(text) => patch(detail.id, { gaps: text })}
            />
            <TextField
              label="Posibles bloqueos"
              rows={2}
              value={detail.blockers}
              onChange={(text) => patch(detail.id, { blockers: text })}
            />
            <div className="form-two">
              <TextField
                label="Orden de preferencia"
                value={detail.preference}
                onChange={(text) =>
                  patch(detail.id, { preference: Number(text) })
                }
              />
              <Check
                label="Destacar en Inicio"
                checked={detail.featured}
                onChange={(checked) => patch(detail.id, { featured: checked })}
              />
            </div>
            <CvAdviceEditor
              value={detail.cvAdvice}
              onChange={(cvAdvice) => patch(detail.id, { cvAdvice })}
            />
            <button className="button secondary" onClick={() => onSave(draft)}>
              Guardar cambios
            </button>
          </section>
        ) : (
          <aside className="vacancy-aside">
            <div className="tip-card">
              <span className="tip-icon">◎</span>
              <h3>Tu lista, a tu ritmo</h3>
              <p>
                Las ofertas no se buscan automáticamente. Añade una cuando la
                hayas investigado.
              </p>
            </div>
            <div className="legend-card">
              <h3>Relación con el perfil</h3>
              <p>
                Relaciona cada valoración con evidencias mediante sus
                identificadores estables.
              </p>
            </div>
          </aside>
        )}
      </div>
    </>
  )
}

export function VacancyDetail({ value, onBack }) {
  const copy = s.vacancyCvAdvice
  const advice = { ...emptyCvAdvice(), ...value.cvAdvice }
  const hasAssessment =
    advice.assessedAt ||
    advice.reason ||
    advice.recommendedVersion !== 'pending' ||
    advice.spanishAdjustments.some((item) => item.trim()) ||
    advice.englishAdjustments.some((item) => item.trim())
  const recommendedLabel = copy[advice.recommendedVersion] || copy.pending
  return (
    <>
      <button className="back-link" onClick={onBack}>
        ← Volver a vacantes
      </button>
      <PageHeading
        eyebrow="DETALLE DE LA OFERTA"
        title={value.role || 'Vacante'}
        subtitle={`${value.company || 'Empresa sin registrar'} · ${value.location || 'Ubicación sin registrar'}`}
      />
      <div className="detail-grid">
        <section className="panel detail-panel">
          <div className="detail-tags">
            <span>{value.modality || 'Modalidad sin registrar'}</span>
            <span>Preferencia {value.preference || '—'}</span>
          </div>
          <h2>Descripción</h2>
          <p className="preline">{value.description || 'Sin registrar'}</p>
          <h2>Valoración</h2>
          <p className="preline">{value.assessment || 'Sin registrar'}</p>
          <h2>Evidencias de encaje</h2>
          <p>{value.matchingEvidenceIds?.join(', ') || 'Sin registrar'}</p>
          <h2>Carencias y bloqueos</h2>
          <p className="preline">
            {[value.gaps, value.blockers].filter(Boolean).join('\n') ||
              'Sin registrar'}
          </p>
          <section
            className="cv-advice-detail"
            aria-labelledby="cv-advice-heading"
          >
            <div className="cv-advice-heading">
              <div>
                <span className="eyebrow">CV PARA ESTA OFERTA</span>
                <h2 id="cv-advice-heading">{copy.title}</h2>
              </div>
              <span className="cv-recommendation-tag">{recommendedLabel}</span>
            </div>
            <p className="cv-advice-reason">
              {advice.reason ||
                (hasAssessment ? copy.noAdjustments : copy.noAssessment)}
            </p>
            {advice.assessedAt && (
              <small className="cv-advice-date">
                {copy.assessmentDate}: {advice.assessedAt}
              </small>
            )}
            <div className="cv-adjustment-columns">
              <CvAdjustmentList
                title={copy.spanishAdjustments}
                items={advice.spanishAdjustments}
                emptyLabel={copy.noAdjustments}
              />
              <CvAdjustmentList
                title={copy.englishAdjustments}
                items={advice.englishAdjustments}
                emptyLabel={copy.noAdjustments}
              />
            </div>
          </section>
        </section>
        <aside className="legend-card">
          <h3>Datos de la oferta</h3>
          <dl>
            <dt>Salario</dt>
            <dd>
              {value.salary
                ? `${value.salary} · ${value.salaryVerified ? 'verificado' : 'sin verificar'}`
                : 'Sin registrar'}
            </dd>
            <dt>Nivel</dt>
            <dd>{pretty(value.level)}</dd>
            <dt>Tipo</dt>
            <dd>{pretty(value.jobType)}</dd>
            <dt>Fuente</dt>
            <dd>{pretty(value.source)}</dd>
            <dt>Verificada</dt>
            <dd>{pretty(value.verifiedAt)}</dd>
          </dl>
          {value.link && (
            <a
              className="button secondary"
              href={value.link}
              target="_blank"
              rel="noreferrer"
            >
              Abrir fuente ↗
            </a>
          )}
        </aside>
      </div>
    </>
  )
}
