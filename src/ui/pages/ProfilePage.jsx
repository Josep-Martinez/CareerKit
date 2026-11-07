import { PageHeading, Status } from '../components/PagePrimitives.jsx'
import {
  CardTitle,
  Check,
  TextField,
  useDraft,
} from '../components/FormPrimitives.jsx'
import { id } from '../utils.js'
import { STRINGS as s } from '../../i18n/es.js'

export function ProfilePage({ value, state, warning, onSave, onReload }) {
  const [draft, setDraft] = useDraft(value)
  const update = (key, val) => setDraft({ ...draft, [key]: val })
  const add = (key, type) =>
    update(key, [
      ...(draft[key] || []),
      {
        id: id(),
        ...(type ? { type } : {}),
        title: '',
        organization: '',
        dates: '',
        actions: '',
        results: '',
        evidenceIds: [],
        confirmed: false,
        cvEvidence: false,
        onLinkedIn: false,
        internal: false,
      },
    ])
  const patchItem = (key, idx, part) =>
    update(
      key,
      draft[key].map((item, i) => (i === idx ? { ...item, ...part } : item)),
    )
  return (
    <>
      <PageHeading
        eyebrow="BASE DE TU HISTORIA"
        title="Perfil y aprendizajes"
        subtitle="Guarda experiencias, metas y evidencias a tu manera."
      />
      <Status state={state} warning={warning} onReload={onReload} />
      <div className="editor-grid">
        <section className="panel form-panel" id="profile-main-form">
          <CardTitle
            title="Perfil profesional"
            description="Una descripción de tu perfil, editable por ti."
          />
          <TextField
            label="Perfil profesional"
            rows={5}
            value={draft.professionalProfile}
            onChange={(v) => update('professionalProfile', v)}
            placeholder="Escribe tu perfil profesional…"
          />
          <CardTitle
            title="Objetivos"
            description="Metas a corto, medio y largo plazo."
          />
          <div className="form-two">
            <TextField
              label="Corto plazo"
              rows={3}
              value={draft.objectives.shortTerm}
              onChange={(v) =>
                update('objectives', { ...draft.objectives, shortTerm: v })
              }
            />
            <TextField
              label="Medio plazo"
              rows={3}
              value={draft.objectives.mediumTerm}
              onChange={(v) =>
                update('objectives', { ...draft.objectives, mediumTerm: v })
              }
            />
          </div>
          <TextField
            label="Largo plazo"
            rows={3}
            value={draft.objectives.longTerm}
            onChange={(v) =>
              update('objectives', { ...draft.objectives, longTerm: v })
            }
          />
          {[
            'experience',
            'education',
            'skills',
            'certifications',
            'languages',
            'projects',
            'evidence',
            'learnings',
          ].map((key) => (
            <div className="collection" key={key}>
              <CardTitle
                title={
                  {
                    experience: 'Experiencia',
                    education: 'Formación',
                    skills: 'Habilidades',
                    certifications: 'Certificaciones',
                    languages: 'Idiomas',
                    projects: 'Proyectos',
                    evidence: 'Otras evidencias',
                    learnings: 'Aprendizajes',
                  }[key]
                }
                onAdd={() => add(key)}
              />
              {key === 'evidence' && (
                <button
                  className="button secondary small"
                  type="button"
                  onClick={() => add(key, 'star-story')}
                >
                  {s.profileEntry.addStarStory}
                </button>
              )}
              {(draft[key] || []).map((item, i) => (
                <div className="item-card" key={item.id || i}>
                  <div className="item-heading">
                    <span>
                      {item.type === 'star-story'
                        ? s.profileEntry.starStory
                        : `Elemento ${i + 1}`}
                    </span>
                    <button
                      className="icon-button"
                      aria-label="Eliminar elemento"
                      onClick={() =>
                        update(
                          key,
                          draft[key].filter((_, n) => n !== i),
                        )
                      }
                    >
                      ×
                    </button>
                  </div>
                  {key === 'evidence' && item.type === 'star-story' && (
                    <>
                      <TextField
                        label={s.profileEntry.situation}
                        rows={3}
                        value={item.situation}
                        onChange={(v) => patchItem(key, i, { situation: v })}
                      />
                      <TextField
                        label={s.profileEntry.task}
                        rows={3}
                        value={item.task}
                        onChange={(v) => patchItem(key, i, { task: v })}
                      />
                      <TextField
                        label={s.profileEntry.tags}
                        value={(item.tags || []).join(', ')}
                        onChange={(v) =>
                          patchItem(key, i, {
                            tags: v
                              .split(',')
                              .map((tag) => tag.trim())
                              .filter(Boolean),
                          })
                        }
                      />
                    </>
                  )}
                  <div className="form-two">
                    <TextField
                      label={
                        key === 'skills' || key === 'languages'
                          ? 'Nombre'
                          : 'Título'
                      }
                      value={item.title || item.name}
                      onChange={(v) =>
                        patchItem(
                          key,
                          i,
                          key === 'skills' || key === 'languages'
                            ? { title: v, name: v }
                            : { title: v },
                        )
                      }
                    />
                    <TextField
                      label="Organización / contexto"
                      value={item.organization}
                      onChange={(v) => patchItem(key, i, { organization: v })}
                    />
                  </div>
                  <div className="form-two">
                    <TextField
                      label="Fechas"
                      value={item.dates}
                      onChange={(v) => patchItem(key, i, { dates: v })}
                    />
                    <TextField
                      label="Acciones"
                      value={item.actions}
                      onChange={(v) => patchItem(key, i, { actions: v })}
                    />
                  </div>
                  <TextField
                    label="Resultados demostrables"
                    value={item.results}
                    onChange={(v) => patchItem(key, i, { results: v })}
                  />
                  <div className="checks">
                    <Check
                      label="Evidencia para el CV"
                      checked={item.cvEvidence}
                      onChange={(v) => patchItem(key, i, { cvEvidence: v })}
                    />
                    <Check
                      label="Aparece en LinkedIn"
                      checked={item.onLinkedIn}
                      onChange={(v) => patchItem(key, i, { onLinkedIn: v })}
                    />
                    <Check
                      label="Información interna"
                      checked={item.internal}
                      onChange={(v) => patchItem(key, i, { internal: v })}
                    />
                    <Check
                      label="Confirmado"
                      checked={item.confirmed}
                      onChange={(v) => patchItem(key, i, { confirmed: v })}
                    />
                  </div>
                </div>
              ))}
              {!(draft[key] || []).length && (
                <p className="quiet-empty">
                  Sin elementos. Añade uno cuando quieras.
                </p>
              )}
            </div>
          ))}
          <button
            className="button primary save-button"
            onClick={() => onSave(draft)}
          >
            Guardar perfil
          </button>
        </section>
        <aside className="side-info">
          <div className="tip-card">
            <span className="tip-icon">✳</span>
            <h3>Una historia completa</h3>
            <p>
              Guarda aquí también proyectos universitarios y actividades que no
              formen parte de LinkedIn.
            </p>
          </div>
          <div className="legend-card">
            <h3>Estado de la información</h3>
            <div>
              <i className="legend-confirmed" /> Confirmado
            </div>
            <div>
              <i className="legend-pending" /> Pendiente de confirmar
            </div>
            <p>
              Cada elemento incluye un identificador para relacionarlo con
              vacantes.
            </p>
          </div>
        </aside>
      </div>
    </>
  )
}
