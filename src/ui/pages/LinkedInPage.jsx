import { useState } from 'react'
import { PageHeading, Status } from '../components/PagePrimitives.jsx'
import { Check, TextField, useDraft } from '../components/FormPrimitives.jsx'
import { STRINGS as s } from '../../i18n/es.js'
import { id } from '../utils.js'

const copy = s.linkedinPage
const LINKEDIN_SECTION_KEYS = [
  'headline',
  'about',
  'experience',
  'education',
  'skills',
  'certifications',
  'projects',
  'featured',
]
const PROFILE_EVIDENCE_KEYS = [
  'experience',
  'education',
  'skills',
  'certifications',
  'languages',
  'projects',
  'evidence',
  'learnings',
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
  const [view, setView] = useState('edit')
  const pub = draft.published
  const setPub = (key, val) =>
    setDraft({ ...draft, published: { ...pub, [key]: val } })
  const evidenceItems = PROFILE_EVIDENCE_KEYS.flatMap((key) =>
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
  const hasPublishedContent = Boolean(
    pub.name?.trim() ||
    pub.headline.trim() ||
    pub.about.trim() ||
    previewKeys.some((key) => pub[key]?.some((entry) => entry.trim())),
  )
  const hasActiveAudits = draft.audits.some(
    (item) => item.status !== 'descartada',
  )
  const initials =
    pub.name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'P'
  return (
    <>
      <PageHeading
        eyebrow={copy.eyebrow}
        title={copy.title}
        subtitle={copy.subtitle}
      />
      <Status state={state} warning={warning} onReload={onReload} />
      <div className="linkedin-mode-row">
        <div
          className="linkedin-mode-switch"
          role="group"
          aria-label={copy.modeLabel}
        >
          <button
            type="button"
            className={view === 'edit' ? 'active' : ''}
            aria-pressed={view === 'edit'}
            onClick={() => setView('edit')}
          >
            {copy.editButton}
          </button>
          <button
            type="button"
            className={view === 'preview' ? 'active' : ''}
            aria-pressed={view === 'preview'}
            onClick={() => setView('preview')}
          >
            {copy.previewButton}
          </button>
        </div>
        <span>{copy.separationNotice}</span>
      </div>
      {view === 'edit' ? (
        <section
          className="panel linkedin-edit-panel"
          id="linkedin-content-form"
          aria-labelledby="linkedin-edit-title"
        >
          <div className="linkedin-form-intro">
            <span className="eyebrow">{copy.formEyebrow}</span>
            <h2 id="linkedin-edit-title">{copy.formTitle}</h2>
            <p>{copy.formDescription}</p>
          </div>
          <TextField
            label={copy.nameLabel}
            value={pub.name || ''}
            onChange={(v) => setPub('name', v)}
          />
          <TextField
            label={copy.sectionLabels.headline}
            value={pub.headline}
            onChange={(v) => setPub('headline', v)}
          />
          <AuditPoints
            notes={auditNotes('headline')}
            evidence={evidenceItems}
          />
          <TextField
            label={copy.sectionLabels.about}
            rows={7}
            value={pub.about}
            onChange={(v) => setPub('about', v)}
          />
          <AuditPoints notes={auditNotes('about')} evidence={evidenceItems} />
          <div className="linkedin-edit-sections">
            {previewKeys.map((key) => (
              <LinkedInListEditor
                key={key}
                title={copy.sectionLabels[key]}
                items={pub[key]}
                onChange={(v) => setPub(key, v)}
              >
                <AuditPoints notes={auditNotes(key)} evidence={evidenceItems} />
              </LinkedInListEditor>
            ))}
          </div>
          <TextField
            label={copy.lastUpdatedLabel}
            value={draft.lastUpdated}
            onChange={(v) => setDraft({ ...draft, lastUpdated: v })}
            hint={copy.lastUpdatedHint}
          />
          <section
            className="linkedin-audit-editor"
            aria-labelledby="linkedin-audit-title"
          >
            <div className="linkedin-audit-heading">
              <div>
                <h3 id="linkedin-audit-title">{copy.auditTitle}</h3>
                <p>{copy.auditDescription}</p>
              </div>
              <button
                className="button secondary small"
                type="button"
                onClick={addAudit}
              >
                {copy.addAudit}
              </button>
            </div>
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
              <p className="quiet-empty">{copy.emptyAudit}</p>
            )}
          </section>
          <button
            className="button primary save-button"
            onClick={() => onSave(draft)}
          >
            {copy.save}
          </button>
        </section>
      ) : (
        <section
          className="linkedin-preview-view"
          id="linkedin-profile-preview"
          aria-labelledby="linkedin-preview-title"
        >
          <div className="linkedin-preview-heading">
            <div>
              <span className="eyebrow">{copy.previewEyebrow}</span>
              <h2 id="linkedin-preview-title">{copy.previewTitle}</h2>
            </div>
            <p>{copy.previewDescription}</p>
          </div>
          {!hasPublishedContent && !hasActiveAudits ? (
            <div className="linkedin-preview-empty">
              <span className="linkedin-empty-mark" aria-hidden="true">
                in
              </span>
              <h3>{copy.emptyPreviewTitle}</h3>
              <p>{copy.emptyPreviewBody}</p>
              <button
                className="button secondary"
                type="button"
                onClick={() => setView('edit')}
              >
                {copy.editAction}
              </button>
            </div>
          ) : (
            <div className="linkedin-preview-card">
              <div className="linkedin-preview-cover" aria-hidden="true" />
              <div className="linkedin-preview-body">
                <div className="linkedin-preview-identity">
                  <div className="linkedin-avatar" aria-hidden="true">
                    {initials}
                  </div>
                  <div>
                    <h3>{pub.name || copy.nameFallback}</h3>
                    {pub.headline && <p>{pub.headline}</p>}
                  </div>
                </div>
                <AuditPoints
                  notes={auditNotes('headline')}
                  evidence={evidenceItems}
                />
                {(pub.about.trim() || auditNotes('about').length > 0) && (
                  <PreviewSection title={copy.sectionLabels.about}>
                    {pub.about.trim() && <p>{pub.about}</p>}
                    <AuditPoints
                      notes={auditNotes('about')}
                      evidence={evidenceItems}
                    />
                  </PreviewSection>
                )}
                {previewKeys
                  .filter(
                    (key) =>
                      pub[key]?.some((entry) => entry.trim()) ||
                      auditNotes(key).length,
                  )
                  .map((key) => (
                    <PreviewSection key={key} title={copy.sectionLabels[key]}>
                      {!!pub[key]?.length && (
                        <ul>
                          {pub[key]
                            .filter((entry) => entry.trim())
                            .map((entry, i) => (
                              <li key={i}>{entry}</li>
                            ))}
                        </ul>
                      )}
                      <AuditPoints
                        notes={auditNotes(key)}
                        evidence={evidenceItems}
                      />
                    </PreviewSection>
                  ))}
                {hasActiveAudits && !hasPublishedContent && (
                  <p className="linkedin-audit-only-note">
                    {copy.auditOnlyNote}
                  </p>
                )}
              </div>
            </div>
          )}
        </section>
      )}
    </>
  )
}

function LinkedInListEditor({ title, items = [], onChange, children }) {
  const update = (index, value) =>
    onChange(
      items.map((item, itemIndex) => (itemIndex === index ? value : item)),
    )
  return (
    <section className="linkedin-list-editor">
      <div className="linkedin-list-heading">
        <h3>{title}</h3>
        <button
          className="button secondary small"
          type="button"
          onClick={() => onChange([...items, ''])}
        >
          {copy.addSection} {title.toLowerCase()}
        </button>
      </div>
      {!items.length && <p className="quiet-empty">{copy.emptyList}</p>}
      {items.map((item, index) => (
        <div className="linkedin-list-entry" key={index}>
          <TextField
            label={`${title} ${index + 1}`}
            rows={title === 'Aptitudes' ? 2 : 3}
            value={item}
            onChange={(value) => update(index, value)}
          />
          <button
            className="button quiet linkedin-remove-entry"
            type="button"
            aria-label={`${copy.removeEntry} ${title.toLowerCase()} ${index + 1}`}
            onClick={() =>
              onChange(items.filter((_, itemIndex) => itemIndex !== index))
            }
          >
            {copy.removeEntry}
          </button>
        </div>
      ))}
      {children}
    </section>
  )
}

function PreviewSection({ title, children }) {
  return (
    <section className="linkedin-preview-section">
      <h4>{title}</h4>
      {children}
    </section>
  )
}

function AuditPoints({ notes, evidence }) {
  if (!notes.length) return null
  return (
    <div className="preview-audit-points">
      <span>{copy.auditLabel}</span>
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
              <b>
                {copy.auditActions[note.action] || copy.auditActions.fallback}:
              </b>{' '}
              {note.recommendation || note.problem || copy.auditPending}
              {note.proposedText && (
                <small>
                  {copy.proposedTextPrefix}: {note.proposedText}
                </small>
              )}
              <small>
                {note.reasonEvidence ? `${note.reasonEvidence} · ` : ''}
                {basis
                  ? `${copy.evidenceBasePrefix}: ${basis}`
                  : copy.missingEvidenceHint}{' '}
                · {copy.auditPriority}{' '}
                {copy.auditCard.priorities[note.priority] ||
                  copy.auditCard.priorities.media}{' '}
                · {copy.auditStatuses[note.status] || note.status}
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
  const sectionKeys = LINKEDIN_SECTION_KEYS
  const categoryLabels = copy.evidenceLabels
  const labels = copy.auditCard
  return (
    <div className="item-card audit-card">
      <div className="item-heading">
        <span>
          {labels.title} · {item.date || s.noData}
        </span>
        <button
          className="icon-button"
          aria-label={labels.delete}
          onClick={onDelete}
        >
          ×
        </button>
      </div>
      <div className="form-two">
        <label className="field">
          <span>{labels.section}</span>
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
            {sectionKeys.map((key) => (
              <option key={key} value={key}>
                {copy.sectionLabels[key]}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>{labels.action}</span>
          <select
            value={item.action || 'corregir'}
            onChange={(e) => onChange({ action: e.target.value })}
          >
            {Object.entries(labels.actions).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="field">
        <span>{copy.auditPriority}</span>
        <select
          value={item.priority || 'media'}
          onChange={(e) => onChange({ priority: e.target.value })}
        >
          {Object.entries(labels.priorities).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <TextField
        label={labels.problem}
        value={item.problem}
        onChange={(v) => onChange({ problem: v })}
      />
      <TextField
        label={labels.reasonEvidence}
        rows={2}
        value={item.reasonEvidence}
        onChange={(v) => onChange({ reasonEvidence: v })}
      />
      <fieldset className="audit-evidence">
        <legend>{labels.relatedEvidence}</legend>
        {PROFILE_EVIDENCE_KEYS.map((key) => {
          const group = evidence.filter((entry) => entry.category === key)
          if (!group.length) return null
          return (
            <div className="audit-evidence-group" key={key}>
              <b>{categoryLabels[key]}</b>
              {group.map((entry) => (
                <Check
                  key={entry.id}
                  label={`${entry.title || entry.name || labels.untitledEvidence} · ${entry.id}`}
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
        {!evidence.length && <p className="quiet-empty">{labels.noEvidence}</p>}
        <TextField
          label={labels.otherEvidenceIds}
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
          hint={labels.evidenceIdsHint}
        />
      </fieldset>
      <TextField
        label={labels.recommendation}
        rows={2}
        value={item.recommendation}
        onChange={(v) => onChange({ recommendation: v })}
      />
      <TextField
        label={labels.proposedText}
        rows={3}
        value={item.proposedText}
        onChange={(v) => onChange({ proposedText: v })}
      />
      <div className="form-two">
        <TextField
          label={labels.date}
          value={item.date}
          onChange={(v) => onChange({ date: v })}
        />
        <label className="field">
          <span>{labels.status}</span>
          <select
            value={item.status || 'pendiente'}
            onChange={(e) => onChange({ status: e.target.value })}
          >
            {Object.entries(labels.statuses).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}
