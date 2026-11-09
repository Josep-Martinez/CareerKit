import { useState } from 'react'
import { PageHeading, Status } from '../components/PagePrimitives.jsx'
import {
  ArrayText,
  Check,
  TextField,
  useDraft,
} from '../components/FormPrimitives.jsx'
import { STRINGS as s } from '../../i18n/es.js'
import { id } from '../utils.js'

const copy = s.linkedinPage
const LINKEDIN_SECTION_KEYS = [
  'headline',
  'about',
  'experience',
  'education',
  'languages',
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
const LINKEDIN_BOOLEAN_FIELDS = ['descriptionTruncated']
const initialLinkedInField = (field) =>
  field === 'skills' ? [] : LINKEDIN_BOOLEAN_FIELDS.includes(field) ? false : ''
const LINKEDIN_OBJECT_FIELDS = {
  experience: [
    'title',
    'company',
    'employmentType',
    'location',
    'workplaceType',
    'dates',
    'description',
    'descriptionTruncated',
    'skills',
  ],
  education: [
    'institution',
    'degree',
    'fieldOfStudy',
    'dates',
    'grade',
    'activities',
    'description',
    'descriptionTruncated',
    'skills',
  ],
  languages: ['language', 'proficiency', 'details'],
  certifications: [
    'name',
    'issuer',
    'issueDate',
    'expirationDate',
    'credentialId',
    'credentialUrl',
    'description',
    'descriptionTruncated',
    'skills',
  ],
  projects: [
    'name',
    'associatedWith',
    'dates',
    'description',
    'descriptionTruncated',
    'skills',
    'url',
  ],
  featured: [
    'title',
    'description',
    'descriptionTruncated',
    'url',
    'mediaType',
  ],
}
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
  const additionalSections = pub.additionalSections || []
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
  const updateAdditionalSection = (sectionId, part) => {
    const updatedSections = additionalSections.map((section) =>
      section.id === sectionId ? { ...section, ...part } : section,
    )
    setDraft({
      ...draft,
      published: { ...pub, additionalSections: updatedSections },
      audits:
        part.title === undefined
          ? draft.audits
          : draft.audits.map((item) =>
              item.section === 'additionalSections' &&
              item.sectionId === sectionId
                ? {
                    ...item,
                    sectionLabel: part.title || copy.additionalSectionFallback,
                  }
                : item,
            ),
    })
  }
  const removeAdditionalSection = (sectionId) => {
    const removedSection = additionalSections.find(
      (section) => section.id === sectionId,
    )
    setDraft({
      ...draft,
      published: {
        ...pub,
        additionalSections: additionalSections.filter(
          (section) => section.id !== sectionId,
        ),
      },
      audits: draft.audits.map((item) =>
        item.section === 'additionalSections' && item.sectionId === sectionId
          ? {
              ...item,
              sectionLabel:
                removedSection?.title || copy.additionalSectionFallback,
            }
          : item,
      ),
    })
  }
  const removeAudit = (index) =>
    setDraft({ ...draft, audits: draft.audits.filter((_, n) => n !== index) })
  const previewKeys = [
    'experience',
    'education',
    'languages',
    'skills',
    'certifications',
    'projects',
    'featured',
  ]
  const auditNotes = (section, sectionId) =>
    draft.audits.filter(
      (item) =>
        item.section === section &&
        (section !== 'additionalSections' ||
          (sectionId ? item.sectionId === sectionId : !item.sectionId)) &&
        item.status !== 'descartada',
    )
  const hasPublishedContent = Boolean(
    pub.name?.trim() ||
    pub.headline?.trim() ||
    pub.about?.trim() ||
    hasEntryContent(additionalSections) ||
    previewKeys.some((key) => pub[key]?.some(hasEntryContent)),
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
                section={key}
                title={copy.sectionLabels[key]}
                items={pub[key]}
                onChange={(v) => setPub(key, v)}
              >
                <AuditPoints notes={auditNotes(key)} evidence={evidenceItems} />
              </LinkedInListEditor>
            ))}
          </div>
          <section
            className="linkedin-additional-editor"
            aria-labelledby="linkedin-additional-title"
          >
            <div className="linkedin-list-heading">
              <div>
                <h3 id="linkedin-additional-title">
                  {copy.additionalSectionsTitle}
                </h3>
                <p>{copy.additionalSectionsDescription}</p>
              </div>
              <button
                className="button secondary small"
                type="button"
                onClick={() =>
                  setPub('additionalSections', [
                    ...additionalSections,
                    { id: id(), title: '', content: '' },
                  ])
                }
              >
                {copy.addAdditionalSection}
              </button>
            </div>
            {!additionalSections.length && (
              <p className="quiet-empty">{copy.emptyAdditionalSections}</p>
            )}
            {additionalSections.map((section, index) => (
              <div
                className="linkedin-additional-entry"
                key={section.id || index}
              >
                <TextField
                  label={copy.additionalSectionTitleLabel}
                  value={section.title}
                  onChange={(title) =>
                    updateAdditionalSection(section.id, { title })
                  }
                />
                <TextField
                  label={copy.additionalSectionContentLabel}
                  rows={6}
                  value={section.content}
                  hint={copy.additionalSectionContentHint}
                  onChange={(content) =>
                    updateAdditionalSection(section.id, { content })
                  }
                />
                <AuditPoints
                  notes={auditNotes('additionalSections', section.id)}
                  evidence={evidenceItems}
                />
                <button
                  className="button quiet linkedin-remove-entry"
                  type="button"
                  aria-label={`${copy.removeAdditionalSection} ${section.title || index + 1}`}
                  onClick={() => removeAdditionalSection(section.id)}
                >
                  {copy.removeAdditionalSection}
                </button>
              </div>
            ))}
          </section>
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
                additionalSections={additionalSections}
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
                      pub[key]?.some(hasEntryContent) || auditNotes(key).length,
                  )
                  .map((key) => (
                    <PreviewSection key={key} title={copy.sectionLabels[key]}>
                      {!!pub[key]?.length && (
                        <ul>
                          {pub[key].filter(hasEntryContent).map((entry, i) => (
                            <li key={entry.id || i}>
                              <LinkedInEntryPreview
                                section={key}
                                item={entry}
                              />
                            </li>
                          ))}
                        </ul>
                      )}
                      <AuditPoints
                        notes={auditNotes(key)}
                        evidence={evidenceItems}
                      />
                    </PreviewSection>
                  ))}
                {additionalSections.map((section, index) => {
                  const notes = auditNotes('additionalSections', section.id)
                  if (!hasEntryContent(section) && !notes.length) return null
                  return (
                    <PreviewSection
                      key={section.id || index}
                      title={section.title || copy.additionalSectionFallback}
                    >
                      {section.content && (
                        <p className="linkedin-additional-preview-content">
                          {section.content}
                        </p>
                      )}
                      <AuditPoints notes={notes} evidence={evidenceItems} />
                    </PreviewSection>
                  )
                })}
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

function LinkedInListEditor({
  section,
  title,
  items = [],
  onChange,
  children,
}) {
  const update = (index, value) =>
    onChange(
      items.map((item, itemIndex) => (itemIndex === index ? value : item)),
    )
  const updateField = (index, field, value) =>
    update(index, { ...items[index], [field]: value })
  const fields = LINKEDIN_OBJECT_FIELDS[section] || []
  return (
    <section className="linkedin-list-editor">
      <div className="linkedin-list-heading">
        <h3>{title}</h3>
        <button
          className="button secondary small"
          type="button"
          onClick={() =>
            onChange([
              ...items,
              section === 'skills'
                ? ''
                : {
                    id: id(),
                    ...Object.fromEntries(
                      fields.map((field) => [
                        field,
                        initialLinkedInField(field),
                      ]),
                    ),
                  },
            ])
          }
        >
          {copy.addSection} {title.toLowerCase()}
        </button>
      </div>
      {!items.length && <p className="quiet-empty">{copy.emptyList}</p>}
      {items.map((item, index) => (
        <div className="linkedin-list-entry" key={index}>
          {typeof item === 'string' || section === 'skills' ? (
            <TextField
              label={`${title} ${index + 1}`}
              rows={section === 'skills' ? 2 : 4}
              value={typeof item === 'string' ? item : ''}
              onChange={(value) => update(index, value)}
            />
          ) : (
            <div className="linkedin-item-fields">
              {fields.map((field) =>
                LINKEDIN_BOOLEAN_FIELDS.includes(field) ? (
                  <Check
                    key={field}
                    label={copy.entryFieldLabels[field]}
                    checked={item[field]}
                    onChange={(value) => updateField(index, field, value)}
                  />
                ) : field === 'skills' ? (
                  <ArrayText
                    key={field}
                    title={copy.entryFieldLabels[field]}
                    items={item[field] || []}
                    onChange={(value) => updateField(index, field, value)}
                  />
                ) : (
                  <TextField
                    key={field}
                    label={copy.entryFieldLabels[field]}
                    rows={
                      ['description', 'activities', 'details'].includes(field)
                        ? 4
                        : undefined
                    }
                    value={item[field]}
                    onChange={(value) => updateField(index, field, value)}
                  />
                ),
              )}
            </div>
          )}
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

function hasEntryContent(item) {
  if (typeof item === 'string') return Boolean(item.trim())
  if (typeof item === 'boolean') return item
  if (Array.isArray(item)) return item.some(hasEntryContent)
  if (!item || typeof item !== 'object') return false
  return Object.entries(item).some(
    ([key, value]) => key !== 'id' && hasEntryContent(value),
  )
}

function LinkedInEntryPreview({ section, item }) {
  if (typeof item === 'string') return <span>{item}</span>
  const titleKey = {
    experience: 'title',
    education: 'degree',
    languages: 'language',
    certifications: 'name',
    projects: 'name',
    featured: 'title',
  }[section]
  const known = new Set(LINKEDIN_OBJECT_FIELDS[section] || [])
  const extras = Object.entries(item).filter(
    ([key, value]) => key !== 'id' && !known.has(key) && hasEntryContent(value),
  )
  const fields = (LINKEDIN_OBJECT_FIELDS[section] || []).filter(
    (key) =>
      key !== titleKey &&
      key !== 'descriptionTruncated' &&
      hasEntryContent(item[key]),
  )
  const renderValue = (key, value) =>
    Array.isArray(value) ? value.join(' · ') : String(value)
  return (
    <div className="linkedin-preview-entry">
      {hasEntryContent(item[titleKey]) && <h5>{item[titleKey]}</h5>}
      {fields.map((key) => (
        <p key={key}>
          <b>{copy.entryFieldLabels[key]}:</b> {renderValue(key, item[key])}
        </p>
      ))}
      {item.descriptionTruncated === true && (
        <p className="linkedin-truncation-note">
          {copy.descriptionTruncatedNotice}
        </p>
      )}
      {extras.map(([key, value]) => (
        <p key={key}>
          <b>{copy.entryFieldLabels[key] || key}:</b>{' '}
          {typeof value === 'string' ? value : JSON.stringify(value)}
        </p>
      ))}
    </div>
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

function AuditCard({ item, evidence, additionalSections, onChange, onDelete }) {
  const selectedIds = item.profileEvidenceIds || []
  const sectionKeys = LINKEDIN_SECTION_KEYS
  const categoryLabels = copy.evidenceLabels
  const labels = copy.auditCard
  const selectedAdditionalSection =
    item.section === 'additionalSections' && item.sectionId
      ? additionalSections.find((section) => section.id === item.sectionId)
      : null
  const selectedSectionValue = selectedAdditionalSection
    ? `additional:${selectedAdditionalSection.id}`
    : item.section === 'additionalSections' && item.sectionId
      ? `additional:${item.sectionId}`
      : sectionKeys.includes(item.section)
        ? item.section
        : item.section || 'about'
  const clearSectionLink = (section) => {
    onChange({ section, sectionId: undefined, sectionLabel: undefined })
  }
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
            value={selectedSectionValue}
            onChange={(e) => {
              const value = e.target.value
              if (value.startsWith('additional:')) {
                const sectionId = value.slice('additional:'.length)
                const target = additionalSections.find(
                  (section) => section.id === sectionId,
                )
                onChange({
                  section: 'additionalSections',
                  sectionId,
                  sectionLabel: target?.title || copy.additionalSectionFallback,
                })
                return
              }
              clearSectionLink(value)
            }}
          >
            {!sectionKeys.includes(item.section) && item.section && (
              <option value={item.section}>
                {item.section === 'additionalSections' && !item.sectionId
                  ? labels.unlinkedAdditionalSection
                  : item.section}
              </option>
            )}
            {item.section === 'additionalSections' &&
              item.sectionId &&
              !selectedAdditionalSection && (
                <option value={`additional:${item.sectionId}`}>
                  {item.sectionLabel || copy.additionalSectionFallback} ·{' '}
                  {labels.sectionUnavailable}
                </option>
              )}
            {sectionKeys.map((key) => (
              <option key={key} value={key}>
                {copy.sectionLabels[key]}
              </option>
            ))}
            {additionalSections.map((section) => (
              <option key={section.id} value={`additional:${section.id}`}>
                {labels.additionalSectionOption.replace(
                  '{title}',
                  section.title || copy.additionalSectionFallback,
                )}
              </option>
            ))}
          </select>
        </label>
        {item.section === 'additionalSections' && !item.sectionId && (
          <p className="quiet-empty audit-section-unavailable">
            {labels.unlinkedAdditionalSectionHint}
          </p>
        )}
        {item.section === 'additionalSections' &&
          item.sectionId &&
          !selectedAdditionalSection && (
            <p className="quiet-empty audit-section-unavailable">
              {labels.sectionUnavailableHint}
            </p>
          )}
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
