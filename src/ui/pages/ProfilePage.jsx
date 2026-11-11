import { useEffect } from 'react'
import { PageHeading, Status } from '../components/PagePrimitives.jsx'
import {
  ArrayText,
  CardTitle,
  Check,
  TextField,
  useDraft,
} from '../components/FormPrimitives.jsx'
import { id, invalidModuleStates } from '../utils.js'
import { STRINGS as s } from '../../i18n/es.js'
import {
  collectProfileEvidence,
  profileEvidenceAnchorId,
  profileEvidenceCollections,
} from '../profile-evidence.js'

const personalFields = [
  { key: 'aboutMe', rows: 4, hint: s.profilePage.aboutMeHint },
  { key: 'values', list: true },
  { key: 'interests', list: true },
  { key: 'motivations', rows: 3 },
  { key: 'thinkingStyle', rows: 3 },
  { key: 'learningStyle', rows: 3 },
  { key: 'workStyle', rows: 3 },
  { key: 'strengths', list: true },
  { key: 'growthAreas', list: true, hint: s.profilePage.growthAreasHint },
  { key: 'preferredEnvironment', rows: 3 },
  { key: 'boundaries', rows: 3 },
]
const careerFields = [
  { key: 'roleFamilies', list: true },
  { key: 'tasks', list: true },
  { key: 'industries', list: true },
  { key: 'workModes', list: true },
  { key: 'location', rows: 2 },
  { key: 'conditions', rows: 3 },
  { key: 'avoid', list: true },
]
const contentFields = [
  { key: 'themes', list: true },
  { key: 'viewpoints', list: true },
  { key: 'tone', rows: 3 },
  { key: 'languages', list: true },
  { key: 'versionPreference', rows: 2 },
  { key: 'avoid', list: true, label: s.profilePage.contentAvoid },
]
const collectionDetails = {
  skills: [
    { key: 'type' },
    { key: 'description', rows: 3 },
    { key: 'tags', list: true },
  ],
  education: [{ key: 'status' }],
  languages: [
    { key: 'type' },
    { key: 'proficiency' },
    { key: 'description', rows: 3 },
  ],
  projects: [
    { key: 'type' },
    { key: 'description', rows: 3 },
    { key: 'grade' },
    { key: 'tags', list: true },
  ],
}
function hasFieldContent(value) {
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.some(hasFieldContent)
  if (value && typeof value === 'object')
    return Object.values(value).some(hasFieldContent)
  return Boolean(value)
}

function countFieldsWithContent(value, fields) {
  return fields.filter(({ key }) => hasFieldContent(value?.[key])).length
}

function contentCountLabel(count, singular, plural) {
  if (!count) return s.profilePage.emptyBlock
  return `${count} ${count === 1 ? singular : plural}`
}

export function ProfilePage({
  value,
  vacancies = [],
  vacanciesState,
  onDirtyChange,
  onDraftChange,
  saving,
  savedDraft,
  state,
  warning,
  savedAt,
  focusEvidenceId,
  onEvidenceFocusComplete,
  onSave,
  onReload,
}) {
  const [draft, setDraft, draftDirty] = useDraft(value, {
    onDirtyChange,
    onDraftChange,
    savedDraft,
  })
  const persistedEvidence = collectProfileEvidence(value)
  function removeEvidence(key, index, item) {
    const linked = vacancies.filter((vacancy) =>
      vacancy.matchingEvidenceIds?.includes(item.id),
    )
    if (linked.length) {
      const labels = linked.map(
        (vacancy) =>
          [vacancy.role, vacancy.company].filter(Boolean).join(' · ') ||
          vacancy.id,
      )
      window.alert(
        `Esta evidencia está vinculada a: ${labels.join(', ')}. Quita esos vínculos y guarda Vacantes antes de eliminarla.`,
      )
      return
    }
    if (
      persistedEvidence.has(item.id) &&
      (!vacanciesState ||
        invalidModuleStates.includes(vacanciesState) ||
        ['Error', 'Pendiente de guardar', 'Guardado manual'].includes(
          vacanciesState,
        ))
    ) {
      window.alert(
        'Revisa y carga el archivo de Vacantes antes de eliminar una evidencia guardada. Así se pueden comprobar sus vínculos.',
      )
      return
    }
    update(
      key,
      draft[key].filter((_, position) => position !== index),
    )
  }

  useEffect(() => {
    if (!focusEvidenceId) return undefined
    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(
        profileEvidenceAnchorId(focusEvidenceId),
      )
      if (target) {
        const disclosure = target.closest('details')
        if (disclosure) disclosure.open = true
        target.scrollIntoView({ behavior: 'smooth', block: 'center' })
        target.focus({ preventScroll: true })
      }
      onEvidenceFocusComplete?.()
    })
    return () => window.cancelAnimationFrame(frame)
  }, [focusEvidenceId, onEvidenceFocusComplete])
  const update = (key, val) =>
    setDraft((current) => ({ ...current, [key]: val }))
  const updateNested = (objectKey, key, val) =>
    setDraft((current) => ({
      ...current,
      [objectKey]: { ...(current[objectKey] || {}), [key]: val },
    }))
  const add = (key, type) =>
    setDraft((current) => ({
      ...current,
      [key]: [
        ...(current[key] || []),
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
      ],
    }))
  const patchItem = (key, idx, part) =>
    setDraft((current) => ({
      ...current,
      [key]: current[key].map((item, i) =>
        i === idx ? { ...item, ...part } : item,
      ),
    }))
  const renderContextFields = (objectKey, fields) => {
    const values = draft[objectKey] || {}
    return fields.map(({ key, list, rows, hint, label }) => {
      const fieldLabel = label || s.profilePage[key]
      if (list)
        return (
          <ArrayText
            key={`${objectKey}-${key}`}
            title={fieldLabel}
            items={values[key] || []}
            onChange={(next) => updateNested(objectKey, key, next)}
          />
        )
      return (
        <TextField
          key={`${objectKey}-${key}`}
          label={fieldLabel}
          rows={rows}
          value={values[key]}
          onChange={(next) => updateNested(objectKey, key, next)}
          hint={hint}
        />
      )
    })
  }
  const personalCount = countFieldsWithContent(
    draft.personalContext,
    personalFields,
  )
  const objectiveFields = ['shortTerm', 'mediumTerm', 'longTerm'].map(
    (key) => ({ key }),
  )
  const goalsAndPreferencesCount =
    countFieldsWithContent(draft.objectives, objectiveFields) +
    countFieldsWithContent(draft.careerPreferences, careerFields)
  const contentDirectionCount = countFieldsWithContent(
    draft.contentDirection,
    contentFields,
  )
  const evidenceCount =
    (hasFieldContent(draft.professionalProfile) ? 1 : 0) +
    profileEvidenceCollections.reduce(
      (total, key) => total + (draft[key] || []).length,
      0,
    )

  return (
    <>
      <PageHeading
        eyebrow={s.profilePage.eyebrow}
        title={s.profilePage.title}
        subtitle={s.profilePage.subtitle}
      />
      <Status
        fileName="profile"
        state={state}
        dirty={draftDirty}
        warning={warning}
        savedAt={savedAt}
        onReload={onReload}
      />
      <div className="editor-grid profile-editor-grid">
        <div className="profile-main">
          <ProfileDisclosure
            kind="internal"
            count={contentCountLabel(
              personalCount,
              s.profilePage.fieldSingular,
              s.profilePage.fieldPlural,
            )}
            title={s.profilePage.personalTitle}
            description={s.profilePage.personalDescription}
          >
            <div className="profile-fields-grid">
              {renderContextFields('personalContext', personalFields)}
            </div>
          </ProfileDisclosure>

          <ProfileDisclosure
            kind="internal"
            count={contentCountLabel(
              goalsAndPreferencesCount,
              s.profilePage.fieldSingular,
              s.profilePage.fieldPlural,
            )}
            title={s.profilePage.careerTitle}
            description={s.profilePage.careerDescription}
          >
            <CardTitle
              title={s.profilePage.objectivesTitle}
              description={s.profilePage.objectivesDescription}
            />
            <div className="form-two">
              {['shortTerm', 'mediumTerm'].map((key) => (
                <TextField
                  key={key}
                  label={s.profilePage[key]}
                  rows={3}
                  value={draft.objectives[key]}
                  onChange={(next) =>
                    update('objectives', {
                      ...draft.objectives,
                      [key]: next,
                    })
                  }
                />
              ))}
            </div>
            <TextField
              label={s.profilePage.longTerm}
              rows={3}
              value={draft.objectives.longTerm}
              onChange={(next) =>
                update('objectives', {
                  ...draft.objectives,
                  longTerm: next,
                })
              }
            />
            <div className="profile-fields-grid">
              {renderContextFields('careerPreferences', careerFields)}
            </div>
          </ProfileDisclosure>

          <ProfileDisclosure
            kind="internal"
            count={contentCountLabel(
              contentDirectionCount,
              s.profilePage.fieldSingular,
              s.profilePage.fieldPlural,
            )}
            title={s.profilePage.contentTitle}
            description={s.profilePage.contentDescription}
          >
            <div className="profile-fields-grid">
              {renderContextFields('contentDirection', contentFields)}
            </div>
          </ProfileDisclosure>

          <ProfileDisclosure
            kind="evidence"
            count={contentCountLabel(
              evidenceCount,
              s.profilePage.itemSingular,
              s.profilePage.itemPlural,
            )}
            title={s.profilePage.journeyTitle}
            description={s.profilePage.journeyDescription}
            id="profile-main-form"
          >
            <TextField
              label={s.profilePage.professionalSummary}
              rows={4}
              value={draft.professionalProfile}
              onChange={(next) => update('professionalProfile', next)}
              hint={s.profilePage.professionalSummaryHint}
            />
            {profileEvidenceCollections.map((key) => (
              <div className="collection" key={key}>
                <CardTitle
                  title={s.profilePage.collectionLabels[key]}
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
                  <div
                    className="item-card"
                    key={item.id || i}
                    id={item.id ? profileEvidenceAnchorId(item.id) : undefined}
                    tabIndex={item.id ? -1 : undefined}
                    aria-label={`${s.profilePage.collectionLabels[key]} · ${item.title || item.name || s.profilePage.itemLabel}`}
                  >
                    <div className="item-heading">
                      <span>
                        {item.type === 'star-story'
                          ? s.profileEntry.starStory
                          : `${s.profilePage.itemLabel} ${i + 1}`}
                      </span>
                      <button
                        className="icon-button"
                        type="button"
                        aria-label={s.profilePage.deleteItem}
                        onClick={() => removeEvidence(key, i, item)}
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
                          onChange={(next) =>
                            patchItem(key, i, { situation: next })
                          }
                        />
                        <TextField
                          label={s.profileEntry.task}
                          rows={3}
                          value={item.task}
                          onChange={(next) => patchItem(key, i, { task: next })}
                        />
                        <TextField
                          label={s.profileEntry.tags}
                          value={(item.tags || []).join(', ')}
                          onChange={(next) =>
                            patchItem(key, i, {
                              tags: next
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
                            ? s.profilePage.nameLabel
                            : s.profilePage.titleLabel
                        }
                        value={item.title || item.name}
                        onChange={(next) =>
                          patchItem(
                            key,
                            i,
                            key === 'skills' || key === 'languages'
                              ? { title: next, name: next }
                              : { title: next },
                          )
                        }
                      />
                      <TextField
                        label={s.profilePage.organizationLabel}
                        value={item.organization}
                        onChange={(next) =>
                          patchItem(key, i, { organization: next })
                        }
                      />
                    </div>
                    <div className="form-two">
                      <TextField
                        label={s.profilePage.datesLabel}
                        value={item.dates}
                        onChange={(next) => patchItem(key, i, { dates: next })}
                      />
                      <TextField
                        label={s.profilePage.actionsLabel}
                        value={item.actions}
                        onChange={(next) =>
                          patchItem(key, i, { actions: next })
                        }
                      />
                    </div>
                    <TextField
                      label={s.profilePage.resultsLabel}
                      value={item.results}
                      onChange={(next) => patchItem(key, i, { results: next })}
                    />
                    {(collectionDetails[key] || []).map(
                      ({ key: fieldKey, list, rows }) =>
                        list ? (
                          <ArrayText
                            key={`${fieldKey}-${i}`}
                            title={s.profilePage[fieldKey]}
                            items={item[fieldKey] || []}
                            onChange={(next) =>
                              patchItem(key, i, { [fieldKey]: next })
                            }
                          />
                        ) : (
                          <TextField
                            key={`${fieldKey}-${i}`}
                            label={s.profilePage[fieldKey]}
                            rows={rows}
                            value={item[fieldKey]}
                            onChange={(next) =>
                              patchItem(key, i, { [fieldKey]: next })
                            }
                          />
                        ),
                    )}
                    <div className="checks">
                      <Check
                        label={s.profilePage.cvEvidenceLabel}
                        checked={item.cvEvidence}
                        onChange={(next) =>
                          patchItem(key, i, { cvEvidence: next })
                        }
                      />
                      <Check
                        label={s.profilePage.linkedInLabel}
                        checked={item.onLinkedIn}
                        onChange={(next) =>
                          patchItem(key, i, { onLinkedIn: next })
                        }
                      />
                      <Check
                        label={s.profilePage.internalLabel}
                        checked={item.internal}
                        onChange={(next) =>
                          patchItem(key, i, { internal: next })
                        }
                      />
                      <Check
                        label={s.profilePage.confirmedLabel}
                        checked={item.confirmed}
                        onChange={(next) =>
                          patchItem(key, i, { confirmed: next })
                        }
                      />
                    </div>
                  </div>
                ))}
                {!(draft[key] || []).length && (
                  <p className="quiet-empty">{s.profilePage.noItems}</p>
                )}
              </div>
            ))}
          </ProfileDisclosure>

          <div className="profile-save-bar">
            <p>{s.profilePage.saveHint}</p>
            <button
              className="button primary save-button"
              type="button"
              disabled={saving}
              onClick={() => onSave(draft)}
            >
              {s.profilePage.save}
            </button>
          </div>
        </div>
        <aside className="side-info profile-side-info">
          <div className="tip-card">
            <span className="tip-icon" aria-hidden="true">
              ✳
            </span>
            <h3>{s.profilePage.sideTitle}</h3>
            <p>{s.profilePage.sideBody}</p>
          </div>
          <div className="legend-card">
            <h3>{s.profilePage.legendTitle}</h3>
            <div>
              <i className="legend-confirmed" /> {s.profilePage.confirmedState}
            </div>
            <div>
              <i className="legend-pending" /> {s.profilePage.pendingState}
            </div>
            <p>{s.profilePage.evidenceRelationHint}</p>
          </div>
        </aside>
      </div>
    </>
  )
}

function ProfileDisclosure({
  kind,
  count,
  title,
  description,
  id: elementId,
  children,
}) {
  const isInternal = kind === 'internal'
  return (
    <details
      className={`panel profile-disclosure ${isInternal ? 'is-internal' : 'is-evidence'}`}
      id={elementId}
    >
      <summary className="profile-disclosure-summary">
        <span className="profile-disclosure-copy">
          <span className="profile-disclosure-kind">
            {isInternal
              ? s.profilePage.internalBadge
              : s.profilePage.evidenceBadge}
          </span>
          <span className="profile-disclosure-title">{title}</span>
          <span className="profile-disclosure-description">{description}</span>
        </span>
        <span className="profile-disclosure-count">{count}</span>
      </summary>
      <div className="profile-disclosure-content">{children}</div>
    </details>
  )
}
