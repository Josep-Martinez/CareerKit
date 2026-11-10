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
import { collectProfileEvidence } from '../profile-evidence.js'
import './vacancy-comparison.css'

const vacancyCopy = s.vacancyPage

function VacancyLink({ item }) {
  let url
  try {
    url = new URL(item.link?.trim())
  } catch {
    // Older or unfinished records can have no usable link.
  }
  return url && ['https:', 'http:'].includes(url.protocol) ? (
    <a
      className="button secondary"
      href={url.href}
      target="_blank"
      rel="noreferrer"
    >
      {vacancyCopy.openOffer} ↗
    </a>
  ) : (
    <small className="muted">{vacancyCopy.noLink}</small>
  )
}

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

function evidenceLabel(evidence, id) {
  const entry = evidence.get(id)
  if (!entry) return `Evidencia no disponible (${id})`
  const { item, collection } = entry
  const name = item.title || item.name || item.organization || id
  return `${name} · ${s.profilePage.collectionLabels[collection]}`
}

function EvidencePicker({ evidence, selected, onChange }) {
  const available = Array.from(evidence.keys()).filter(
    (id) => !selected.includes(id),
  )
  available.sort((a, b) =>
    evidenceLabel(evidence, a).localeCompare(evidenceLabel(evidence, b), 'es'),
  )
  return (
    <section
      className="vacancy-evidence-picker"
      aria-label="Evidencias de encaje"
    >
      <label className="field">
        <span>Añadir evidencia de Perfil</span>
        <select
          value=""
          disabled={!available.length}
          onChange={(event) => {
            if (event.target.value) onChange([...selected, event.target.value])
          }}
        >
          <option value="">
            {available.length
              ? 'Selecciona por título'
              : 'No hay más evidencias disponibles'}
          </option>
          {available.map((id) => (
            <option key={id} value={id}>
              {evidenceLabel(evidence, id)}
            </option>
          ))}
        </select>
      </label>
      {selected.length > 0 && (
        <ul>
          {selected.map((id, index) => (
            <li key={`${id}-${index}`}>
              {evidenceLabel(evidence, id)}
              <button
                type="button"
                className="text-button"
                aria-label={`Quitar vínculo con ${evidenceLabel(evidence, id)}`}
                onClick={() =>
                  onChange(selected.filter((_, position) => position !== index))
                }
              >
                Quitar vínculo
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function vacancyLabel(vacancy) {
  return (
    [vacancy.role, vacancy.company].filter(Boolean).join(' · ') ||
    'Vacante sin título'
  )
}

function VacancyComparison({ items, evidence, onClear }) {
  const rows = [
    ['Ubicación', (item) => item.location],
    ['Modalidad', (item) => item.modality],
    [
      'Salario',
      (item) =>
        item.salary &&
        `${item.salary} · ${item.salaryVerified ? 'verificado' : 'sin verificar'}`,
    ],
    ['Fecha de verificación', (item) => item.verifiedAt],
    ['Valoración', (item) => item.assessment],
    [
      'Evidencias de encaje',
      (item) =>
        (item.matchingEvidenceIds || [])
          .map((id) => evidenceLabel(evidence, id))
          .join('\n'),
    ],
    ['Carencias', (item) => item.gaps],
    ['Bloqueos', (item) => item.blockers],
    [
      'CV recomendado',
      (item) =>
        s.vacancyCvAdvice[item.cvAdvice?.recommendedVersion] ||
        s.vacancyCvAdvice.pending,
    ],
  ]
  return (
    <section
      className="panel vacancy-comparison"
      aria-labelledby="comparison-heading"
    >
      <div className="panel-heading">
        <h2 id="comparison-heading">Comparación de vacantes</h2>
        <button
          type="button"
          className="button secondary small"
          onClick={onClear}
        >
          Limpiar selección
        </button>
      </div>
      <div
        className="vacancy-comparison-scroll"
        tabIndex={0}
        role="region"
        aria-label="Tabla de comparación"
      >
        <table aria-labelledby="comparison-heading">
          <thead>
            <tr>
              <th scope="col">Criterio</th>
              {items.map((item) => (
                <th key={item.id} scope="col">
                  {vacancyLabel(item)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, getValue]) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                {items.map((item) => (
                  <td key={item.id}>{pretty(getValue(item))}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export function VacanciesPage({
  value,
  profile,
  onOpenAdaptation,
  onOpenResearch,
  onDirtyChange,
  onDraftChange,
  saving,
  savedDraft,
  state,
  warning,
  savedAt,
  onSave,
  onReload,
  initialVacancyId,
}) {
  const [draft, setDraft] = useDraft(value, {
    onDirtyChange,
    onDraftChange,
    savedDraft,
  })
  const [selected, setSelected] = useState(initialVacancyId ?? null)
  const [editing, setEditing] = useState(false)
  const [comparison, setComparison] = useState([])
  const [search, setSearch] = useState('')
  const evidence = collectProfileEvidence(profile)
  const items = [...draft.items].sort(
    (a, b) => (a.preference || 999) - (b.preference || 999),
  )

  const comparedItems = items.filter((item) => comparison.includes(item.id))
  const normalizeSearch = (value) =>
    value.toLocaleLowerCase('es').normalize('NFD').replace(/\p{M}/gu, '')
  const terms = normalizeSearch(search).trim().split(/\s+/).filter(Boolean)
  const results = items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => {
      const searchable = normalizeSearch(
        [item.role, item.company, item.location, item.modality]
          .filter(Boolean)
          .join(' '),
      )
      return (
        (editing && item.id === selected) ||
        terms.every((term) => searchable.includes(term))
      )
    })

  function add() {
    setSearch('')
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
    setEditing(true)
  }

  function patch(idValue, part) {
    setDraft({
      ...draft,
      items: draft.items.map((item) =>
        item.id === idValue ? { ...item, ...part } : item,
      ),
    })
  }

  function remove(item) {
    const message = vacancyCopy.confirmRemoval.replace(
      '{offer}',
      vacancyLabel(item),
    )
    if (!window.confirm(message)) return
    setDraft((current) => ({
      ...current,
      items: current.items.filter((candidate) => candidate.id !== item.id),
    }))
    setSelected(null)
    setEditing(false)
  }

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(value)
  const detail = draft.items.find((item) => item.id === selected)
  const editor =
    detail && editing ? (
      <section className="panel form-panel vacancy-form">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">DETALLE DE LA OFERTA</span>
            <h2>{detail.role || 'Nueva vacante'}</h2>
          </div>
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
        <EvidencePicker
          evidence={evidence}
          selected={detail.matchingEvidenceIds || []}
          onChange={(matchingEvidenceIds) =>
            patch(detail.id, { matchingEvidenceIds })
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
            onChange={(text) => patch(detail.id, { preference: Number(text) })}
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
        {value.items.some((item) => item.id === detail.id) && (
          <button
            type="button"
            className="button secondary"
            onClick={() => onOpenAdaptation?.(detail.id)}
          >
            Abrir prompt de adaptación del CV
          </button>
        )}
        <button
          className="button secondary"
          disabled={saving}
          onClick={() => onSave(draft)}
        >
          Guardar cambios
        </button>
      </section>
    ) : null
  return (
    <>
      <PageHeading
        eyebrow="OPCIONES PROFESIONALES"
        title="Vacantes"
        subtitle="Registra oportunidades investigadas y ordénalas por preferencia."
        action={
          <div className="modal-actions">
            <button
              type="button"
              className="button secondary"
              onClick={onOpenResearch}
            >
              Buscar nuevas ofertas con el agente
            </button>
            <button type="button" className="button primary" onClick={add}>
              ＋ Añadir vacante
            </button>
            {hasChanges && (
              <button
                type="button"
                className="button primary"
                disabled={saving}
                onClick={() => onSave(draft)}
              >
                {vacancyCopy.saveOffers}
              </button>
            )}
          </div>
        }
      />
      <Status
        fileName="vacancies"
        state={state}
        warning={warning}
        savedAt={savedAt}
        onReload={onReload}
      />
      {comparedItems.length >= 2 && (
        <VacancyComparison
          items={comparedItems}
          evidence={evidence}
          onClear={() => setComparison([])}
        />
      )}
      <div className="vacancies-workspace">
        <section className="vacancy-list">
          {items.length > 0 && (
            <TextField
              label="Buscar en todas tus vacantes"
              value={search}
              onChange={setSearch}
              placeholder="Puesto, empresa, ubicación o modalidad"
            />
          )}
          {terms.length > 0 && (
            <p role="status">
              {results.length} de {items.length} ofertas
            </p>
          )}
          {items.length >= 2 && (
            <p>
              Selecciona entre dos y tres ofertas para compararlas (
              {comparedItems.length}/3).
            </p>
          )}
          {results.length ? (
            results.map(({ item, index }) => (
              <article
                key={item.id}
                className={`vacancy-card ${selected === item.id ? 'selected' : ''}`}
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
                <div className="vacancy-card-actions">
                  <VacancyLink item={item} />
                  <button
                    type="button"
                    className="button secondary"
                    aria-expanded={selected === item.id}
                    onClick={() => {
                      setSelected(selected === item.id ? null : item.id)
                      setEditing(false)
                    }}
                  >
                    {selected === item.id
                      ? vacancyCopy.closeDetails
                      : vacancyCopy.viewDetails}
                  </button>
                  {items.length >= 2 && (
                    <label className="check vacancy-compare-option">
                      <input
                        type="checkbox"
                        aria-label={`Comparar ${vacancyLabel(item)}`}
                        checked={comparison.includes(item.id)}
                        disabled={
                          comparedItems.length >= 3 &&
                          !comparison.includes(item.id)
                        }
                        onChange={(event) =>
                          setComparison((current) => {
                            const available = current.filter((id) =>
                              items.some((candidate) => candidate.id === id),
                            )
                            return event.target.checked
                              ? [...available, item.id]
                              : available.filter((id) => id !== item.id)
                          })
                        }
                      />
                      <span>Comparar</span>
                    </label>
                  )}
                </div>
                {selected === item.id && (
                  <div className="vacancy-expanded">
                    <div className="vacancy-card-actions">
                      {!editing && (
                        <button
                          type="button"
                          className="button secondary"
                          onClick={() => setEditing(true)}
                        >
                          {vacancyCopy.editOffer}
                        </button>
                      )}
                      <button
                        type="button"
                        className="button danger"
                        disabled={saving}
                        onClick={() => remove(item)}
                      >
                        {vacancyCopy.removeOffer}
                      </button>
                    </div>
                    {editing ? (
                      editor
                    ) : (
                      <VacancyDetail
                        value={item}
                        profile={profile}
                        onOpenAdaptation={
                          value.items.some((saved) => saved.id === item.id)
                            ? onOpenAdaptation
                            : undefined
                        }
                      />
                    )}
                  </div>
                )}
              </article>
            ))
          ) : items.length ? (
            <EmptyState
              text="No hay ofertas que coincidan con la búsqueda."
              action="Limpiar búsqueda"
              onClick={() => setSearch('')}
            />
          ) : (
            <EmptyState
              text="Añade ofertas cuando tú o un agente las hayáis investigado."
              action="Crear primera vacante"
              onClick={add}
            />
          )}
          {hasChanges && (
            <button
              type="button"
              className="button primary save-button"
              disabled={saving}
              onClick={() => onSave(draft)}
            >
              {vacancyCopy.saveOffers}
            </button>
          )}
        </section>
      </div>
    </>
  )
}

function VacancyDetail({ value, profile, onOpenAdaptation }) {
  const evidence = collectProfileEvidence(profile)
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
        <p>
          {value.matchingEvidenceIds
            ?.map((id) => evidenceLabel(evidence, id))
            .join(', ') || 'Sin registrar'}
        </p>
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
          {onOpenAdaptation && (
            <button
              type="button"
              className="button secondary"
              onClick={() => onOpenAdaptation(value.id)}
            >
              Abrir prompt de adaptación del CV
            </button>
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
      </aside>
    </div>
  )
}
