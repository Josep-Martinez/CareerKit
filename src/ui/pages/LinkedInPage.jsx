import { useEffect, useRef, useState } from 'react'
import { PageHeading, Status } from '../components/PagePrimitives.jsx'
import {
  ArrayText,
  Check,
  TextField,
  useDraft,
} from '../components/FormPrimitives.jsx'
import { STRINGS as s } from '../../i18n/es.js'
import { id } from '../utils.js'
import {
  applyLinkedInAuditProposal,
  LINKEDIN_AUDIT_FIELDS,
  resolveLinkedInAuditTarget,
} from '../../data/linkedin-audit.js'
import {
  createEmptyLinkedInVariant,
  hasLinkedInUnsavedChanges,
  markLinkedInLanguageSyncPending,
} from '../../data/linkedin-variants.js'
import { hasLinkedInRecentChanges } from '../../data/linkedin-recent-changes.js'
import { summarizeAuditNotes } from '../linkedin-audit-popover.js'

const copy = s.linkedinPage
const languageBase = (language = '') => language.toLowerCase().split(/[-_]/)[0]
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
  languagesPending,
  state,
  warning,
  savedAt,
  recentChanges,
  onOpenEvidence,
  onOpenPrompts,
  onDirtyChange,
  onDraftChange,
  savedDraft,
  saving,
  onSave,
  onReload,
}) {
  const [draft, setDraft] = useDraft(value, {
    onDirtyChange,
    onDraftChange,
    savedDraft,
  })
  const hasUnsavedChanges = hasLinkedInUnsavedChanges(draft, value)
  const [view, setView] = useState('edit')
  const [applyNotice, setApplyNotice] = useState('')
  const [requestedLanguage, setRequestedLanguage] = useState('')
  const rootPublished = draft.published
  const variants = rootPublished.variants || []
  const primaryLanguage = languageBase(rootPublished.language)
  const hasEnglishVersion =
    primaryLanguage === 'en' ||
    variants.some((variant) => languageBase(variant.language) === 'en')
  const selectedLanguage =
    requestedLanguage || (hasEnglishVersion ? 'en' : primaryLanguage)
  const activeVariant =
    primaryLanguage === selectedLanguage
      ? undefined
      : variants.find(
          (variant) => languageBase(variant.language) === selectedLanguage,
        )
  const activeVariantId = activeVariant?.id || ''
  const pub = activeVariant || rootPublished
  const recentVersion = recentChanges?.byLanguage?.[selectedLanguage] ||
    recentChanges?.byLanguage?.[languageBase(pub.language) || 'main'] || {
      fields: [],
      sections: [],
      entries: {},
      additionalSections: [],
    }
  const recentAuditIds = new Set(recentChanges?.auditIds || [])
  const hasRecentChanges = hasLinkedInRecentChanges(recentChanges)
  const hasRecentField = (field) => recentVersion.fields.includes(field)
  const hasRecentSection = (section) => recentVersion.sections.includes(section)
  const hasRecentChangesForLanguage = (language) => {
    const changes = recentChanges?.byLanguage?.[language]
    return Boolean(
      changes?.fields.length ||
      changes?.sections.length ||
      (language === selectedLanguage && recentAuditIds.size),
    )
  }
  const hasRecentEntry = (section, item, index) =>
    (recentVersion.entries[section] || []).includes(
      item && typeof item === 'object' && item.id
        ? String(item.id)
        : `index:${index}`,
    )
  const missingLanguage =
    requestedLanguage && primaryLanguage !== requestedLanguage && !activeVariant
      ? requestedLanguage
      : ''
  const canAssignLanguage = !rootPublished.language
  const withSelectedPublished = (root, next) =>
    activeVariantId
      ? {
          ...root,
          variants: (root.variants || []).map((variant) =>
            variant.id === activeVariantId ? next : variant,
          ),
        }
      : next
  const replaceSelectedPublished = (next) =>
    setDraft({
      ...draft,
      published: withSelectedPublished(rootPublished, next),
    })
  const additionalSections = pub.additionalSections || []
  const setPub = (key, val) => replaceSelectedPublished({ ...pub, [key]: val })
  const createVariant = (language) => {
    const variant = createEmptyLinkedInVariant(id(), language)
    setDraft({
      ...draft,
      published: {
        ...rootPublished,
        variants: [...variants, variant],
      },
    })
    setApplyNotice('')
  }
  const selectLanguage = (language) => {
    setApplyNotice('')
    setRequestedLanguage(language)
  }
  const prepareMissingLanguage = () => {
    if (canAssignLanguage) {
      setDraft({
        ...draft,
        published: { ...rootPublished, language: missingLanguage },
      })
    } else {
      createVariant(missingLanguage)
    }
  }
  const isEditingVariant = (variantId) => (variantId || '') === activeVariantId
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
          ...(activeVariantId ? { variantId: activeVariantId } : {}),
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
      published: withSelectedPublished(rootPublished, {
        ...pub,
        additionalSections: updatedSections,
      }),
      audits:
        part.title === undefined
          ? draft.audits
          : draft.audits.map((item) =>
              isEditingVariant(item.variantId) &&
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
      published: withSelectedPublished(rootPublished, {
        ...pub,
        additionalSections: additionalSections.filter(
          (section) => section.id !== sectionId,
        ),
      }),
      audits: draft.audits.map((item) =>
        isEditingVariant(item.variantId) &&
        item.section === 'additionalSections' &&
        item.sectionId === sectionId
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
  const applyAudit = (index, { confirm = true } = {}) => {
    const item = draft.audits[index]
    const result = applyLinkedInAuditProposal(pub, item)
    if (result.error) {
      setApplyNotice(copy.auditCard.applyTargetUnavailable)
      return
    }
    if (confirm) {
      const confirmation = [
        copy.auditCard.applyConfirmation,
        `${copy.auditCard.currentText}: ${result.beforeValue || '—'}`,
        `${copy.proposedTextPrefix}: ${item.proposedText}`,
      ].join('\n\n')
      if (!window.confirm(confirmation)) return
    }
    setDraft({
      ...draft,
      published: withSelectedPublished(rootPublished, result.published),
      audits: draft.audits.map((audit, auditIndex) =>
        auditIndex === index ? { ...audit, status: 'aplicada' } : audit,
      ),
    })
    setApplyNotice(copy.auditCard.applySuccess)
  }
  const applyAuditFromPreview = (auditId) => {
    const index = draft.audits.findIndex((item) => item.id === auditId)
    if (index >= 0) applyAudit(index, { confirm: false })
  }
  const discardAuditFromPreview = (auditId) => {
    setDraft({
      ...draft,
      audits: draft.audits.map((item) =>
        item.id === auditId ? { ...item, status: 'descartada' } : item,
      ),
    })
    setApplyNotice(copy.auditCard.discardSuccess)
  }
  const previewKeys = [
    'experience',
    'education',
    'languages',
    'skills',
    'certifications',
    'projects',
    'featured',
  ]
  const editorSections = [
    {
      id: 'linkedin-section-presentation',
      label: copy.sectionIndexPresentation,
    },
    ...previewKeys.map((key) => ({
      id: `linkedin-section-${key}`,
      label: copy.sectionLabels[key],
    })),
    {
      id: 'linkedin-section-additional',
      label: copy.additionalSectionsTitle,
    },
    { id: 'linkedin-section-update', label: copy.lastUpdatedLabel },
    { id: 'linkedin-section-audits', label: copy.auditTitle },
  ]
  const activeAudits = draft.audits.filter((item) =>
    isEditingVariant(item.variantId),
  )
  const pendingAudits = activeAudits.filter(
    (item) => (item.status || 'pendiente') === 'pendiente',
  )
  const discardPendingAudits = () => {
    if (!pendingAudits.length) return
    const count = pendingAudits.length
    const confirmation = copy.auditCard.discardPendingConfirmation.replace(
      '{count}',
      String(count),
    )
    if (!window.confirm(confirmation)) return
    const pendingIds = new Set(pendingAudits.map((item) => item.id))
    setDraft({
      ...draft,
      audits: draft.audits.map((item) =>
        pendingIds.has(item.id) ? { ...item, status: 'descartada' } : item,
      ),
    })
    setApplyNotice(
      copy.auditCard.discardPendingSuccess.replace('{count}', String(count)),
    )
  }
  const auditNotes = (section, sectionId) =>
    draft.audits.filter(
      (item) =>
        isEditingVariant(item.variantId) &&
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
  const hasActiveAudits = activeAudits.some(
    (item) => item.status !== 'descartada',
  )
  const hasRecentChangesForCurrentVersion = Boolean(
    recentVersion.fields.length ||
    recentVersion.sections.length ||
    activeAudits.some((item) => recentAuditIds.has(String(item.id))),
  )
  const profileText = (profile) => {
    if (!profile) return null
    const content = { ...profile }
    delete content.language
    delete content.lastUpdated
    delete content.publicationStatus
    delete content.variants
    return content
  }
  const changedLanguages = () => {
    const collect = (root) => {
      const languages = new Map()
      const mainLanguage = languageBase(root.published.language)
      languages.set(
        ['es', 'en'].includes(mainLanguage) ? mainLanguage : 'unassigned:main',
        root.published,
      )
      for (const variant of root.published.variants || []) {
        const language = languageBase(variant.language)
        languages.set(
          ['es', 'en'].includes(language)
            ? language
            : `unassigned:${variant.id}`,
          variant,
        )
      }
      return languages
    }
    const original = collect(value)
    const next = collect(draft)
    const modified = [...new Set([...original.keys(), ...next.keys()])].filter(
      (language) => {
        const before = profileText(original.get(language))
        const after = profileText(next.get(language))
        return (
          JSON.stringify(before) !== JSON.stringify(after) &&
          (hasEntryContent(before) || hasEntryContent(after))
        )
      },
    )
    return {
      modified,
      sourceLanguage:
        modified.length === 1 &&
        next.has(modified[0]) &&
        ['es', 'en'].includes(modified[0])
          ? modified[0]
          : undefined,
    }
  }
  const saveLinkedInDraft = () => {
    const { modified, sourceLanguage } = changedLanguages()
    const next = modified.length
      ? markLinkedInLanguageSyncPending(draft, sourceLanguage)
      : draft
    onSave(next)
  }
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
        className="linkedin-page-heading"
        eyebrow={copy.eyebrow}
        title={copy.title}
        subtitle={copy.subtitle}
        action={
          <div className="linkedin-heading-actions">
            <div
              className="linkedin-language-switch linkedin-language-switch-header"
              role="group"
              aria-label={copy.languageSwitcherLabel}
            >
              {['en', 'es'].map((language) => {
                const isActive = selectedLanguage === language
                return (
                  <button
                    key={language}
                    className={`linkedin-language-option${isActive ? ' active' : ''}`}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => selectLanguage(language)}
                  >
                    <span className="linkedin-language-code" aria-hidden="true">
                      {language.toUpperCase()}
                    </span>
                    <span>{copy.variantLanguageNames[language]}</span>
                    {hasRecentChangesForLanguage(language) && (
                      <span
                        className="linkedin-language-change-dot"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                )
              })}
            </div>
            {languagesPending && (
              <div className="linkedin-sync-pending" role="status">
                <span className="linkedin-sync-dot" aria-hidden="true" />
                <span>{copy.languageSyncPending}</span>
                <button type="button" onClick={onOpenPrompts}>
                  {copy.openLanguageSyncPrompt}
                </button>
              </div>
            )}
          </div>
        }
      />
      <Status
        fileName="linkedin"
        state={state}
        warning={warning}
        savedAt={savedAt}
        onReload={onReload}
      />
      <div className="linkedin-mode-row">
        <div className="linkedin-mode-controls">
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
          {pendingAudits.length > 0 && (
            <button
              className="button secondary small linkedin-mode-discard"
              type="button"
              onClick={discardPendingAudits}
              disabled={saving}
            >
              {copy.auditCard.discardPendingAudits.replace(
                '{count}',
                String(pendingAudits.length),
              )}
            </button>
          )}
          {hasUnsavedChanges && (
            <button
              className="button primary small linkedin-mode-save"
              type="button"
              onClick={saveLinkedInDraft}
              disabled={saving}
            >
              {copy.save}
            </button>
          )}
        </div>
        <span>
          {hasUnsavedChanges ? copy.unsavedChangesLabel : copy.separationNotice}
        </span>
      </div>
      {hasRecentChanges && (
        <p className="linkedin-recent-change-legend" role="status">
          <span aria-hidden="true" />
          {copy.recentlySavedLegend}
        </p>
      )}
      {missingLanguage ? (
        <section className="panel linkedin-preview-panel">
          <div className="linkedin-preview-empty">
            <h2>{copy.variantLanguageNames[missingLanguage]}</h2>
            <p>
              {canAssignLanguage
                ? 'La copia principal todavía no tiene idioma asignado.'
                : 'Todavía no hay una versión guardada en este idioma.'}
            </p>
            {view === 'edit' ? (
              <button
                className="button secondary"
                type="button"
                onClick={prepareMissingLanguage}
              >
                {canAssignLanguage
                  ? 'Asignar este idioma a la copia principal'
                  : 'Crear versión en este idioma'}
              </button>
            ) : (
              <button
                className="button secondary"
                type="button"
                onClick={() => setView('edit')}
              >
                {copy.editAction}
              </button>
            )}
          </div>
        </section>
      ) : view === 'edit' ? (
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
          <details className="linkedin-section-index">
            <summary>
              <span>{copy.sectionIndexTitle}</span>
              <span className="linkedin-section-index-count">
                {editorSections.length}
              </span>
            </summary>
            <p>{copy.sectionIndexHint}</p>
            <nav aria-label={copy.sectionIndexTitle}>
              {editorSections.map((section) => (
                <a key={section.id} href={`#${section.id}`}>
                  {section.label}
                  <span aria-hidden="true">↗</span>
                </a>
              ))}
            </nav>
          </details>
          <section
            className="linkedin-presentation-fields"
            id="linkedin-section-presentation"
            tabIndex={-1}
            aria-labelledby="linkedin-presentation-title"
          >
            <h3 id="linkedin-presentation-title">
              {copy.sectionIndexPresentation}
            </h3>
            <TextField
              className={
                hasRecentField('name') ? 'linkedin-recently-saved' : ''
              }
              label={copy.nameLabel}
              value={pub.name || ''}
              onChange={(v) => setPub('name', v)}
            />
            <TextField
              className={
                hasRecentField('headline') ? 'linkedin-recently-saved' : ''
              }
              label={copy.sectionLabels.headline}
              value={pub.headline}
              onChange={(v) => setPub('headline', v)}
            />
            <AuditPoints
              notes={auditNotes('headline')}
              evidence={evidenceItems}
              onOpenEvidence={onOpenEvidence}
            />
            <TextField
              className={
                hasRecentField('about') ? 'linkedin-recently-saved' : ''
              }
              label={copy.sectionLabels.about}
              rows={7}
              value={pub.about}
              onChange={(v) => setPub('about', v)}
            />
            <AuditPoints
              notes={auditNotes('about')}
              evidence={evidenceItems}
              onOpenEvidence={onOpenEvidence}
            />
          </section>
          <div className="linkedin-edit-sections">
            {previewKeys.map((key) => (
              <LinkedInListEditor
                key={key}
                sectionId={`linkedin-section-${key}`}
                section={key}
                title={copy.sectionLabels[key]}
                items={pub[key]}
                recentlySavedSection={hasRecentSection(key)}
                recentlySavedEntries={new Set(recentVersion.entries[key] || [])}
                onChange={(v) => setPub(key, v)}
              >
                <AuditPoints
                  notes={auditNotes(key)}
                  evidence={evidenceItems}
                  onOpenEvidence={onOpenEvidence}
                />
              </LinkedInListEditor>
            ))}
          </div>
          <section
            className={`linkedin-additional-editor${hasRecentSection('additionalSections') ? ' linkedin-recently-saved-section' : ''}`}
            id="linkedin-section-additional"
            tabIndex={-1}
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
                className={`linkedin-additional-entry${(recentVersion.additionalSections || []).includes(String(section.id || `index:${index}`)) ? ' linkedin-recently-saved' : ''}`}
                key={section.id || index}
              >
                <TextField
                  className={
                    (recentVersion.additionalSections || []).includes(
                      String(section.id || `index:${index}`),
                    )
                      ? 'linkedin-recently-saved'
                      : ''
                  }
                  label={copy.additionalSectionTitleLabel}
                  value={section.title}
                  onChange={(title) =>
                    updateAdditionalSection(section.id, { title })
                  }
                />
                <TextField
                  className={
                    (recentVersion.additionalSections || []).includes(
                      String(section.id || `index:${index}`),
                    )
                      ? 'linkedin-recently-saved'
                      : ''
                  }
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
                  onOpenEvidence={onOpenEvidence}
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
          <section
            className="linkedin-date-editor"
            id="linkedin-section-update"
            tabIndex={-1}
          >
            <TextField
              className={
                hasRecentField('lastUpdated') ? 'linkedin-recently-saved' : ''
              }
              label={copy.lastUpdatedLabel}
              value={activeVariant ? pub.lastUpdated || '' : draft.lastUpdated}
              onChange={(v) =>
                activeVariant
                  ? setPub('lastUpdated', v)
                  : setDraft({ ...draft, lastUpdated: v })
              }
              hint={copy.lastUpdatedHint}
            />
          </section>
          <section
            className={`linkedin-audit-editor${recentAuditIds.size ? ' linkedin-recently-saved-section' : ''}`}
            id="linkedin-section-audits"
            tabIndex={-1}
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
            <div className="linkedin-audit-guide">
              <strong>{copy.auditGuideTitle}</strong>
              <ol>
                {copy.auditGuideSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
            {activeAudits.map((item) => {
              const index = draft.audits.indexOf(item)
              return (
                <div
                  className={
                    recentAuditIds.has(String(item.id))
                      ? 'linkedin-recently-saved'
                      : ''
                  }
                  key={item.id || index}
                >
                  <AuditCard
                    key={item.id || index}
                    item={item}
                    evidence={evidenceItems}
                    additionalSections={additionalSections}
                    published={pub}
                    onOpenEvidence={onOpenEvidence}
                    onApply={() => applyAudit(index)}
                    onChange={(part) => updateAudit(index, part)}
                    onDelete={() => removeAudit(index)}
                  />
                </div>
              )
            })}
            {!activeAudits.length && (
              <p className="quiet-empty">{copy.emptyAudit}</p>
            )}
            {applyNotice && (
              <p className="linkedin-apply-notice" role="status">
                {applyNotice}
              </p>
            )}
          </section>
          {hasUnsavedChanges && (
            <button
              className="button primary save-button"
              type="button"
              onClick={saveLinkedInDraft}
              disabled={saving}
            >
              {copy.save}
            </button>
          )}
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
          {applyNotice && (
            <p className="linkedin-apply-notice" role="status">
              {applyNotice}
            </p>
          )}
          {!hasPublishedContent &&
          !hasActiveAudits &&
          !hasRecentChangesForCurrentVersion ? (
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
                  <div className="linkedin-preview-profile-copy">
                    <div
                      className={
                        hasRecentField('name') || hasRecentField('headline')
                          ? 'linkedin-recently-saved-content'
                          : ''
                      }
                    >
                      <h3>{pub.name || copy.nameFallback}</h3>
                      {pub.headline && <p>{pub.headline}</p>}
                    </div>
                    <AuditPoints
                      sectionKey="headline"
                      sectionTitle={copy.sectionLabels.headline}
                      notes={auditNotes('headline')}
                      evidence={evidenceItems}
                      published={pub}
                      recentlySavedIds={recentAuditIds}
                      saving={saving}
                      onApplyProposal={applyAuditFromPreview}
                      onDiscardAudit={discardAuditFromPreview}
                      onOpenEvidence={onOpenEvidence}
                    />
                  </div>
                </div>
                {(pub.about.trim() || auditNotes('about').length > 0) && (
                  <PreviewSection
                    title={copy.sectionLabels.about}
                    recentlySaved={hasRecentField('about')}
                    action={
                      <AuditPoints
                        sectionKey="about"
                        sectionTitle={copy.sectionLabels.about}
                        notes={auditNotes('about')}
                        evidence={evidenceItems}
                        published={pub}
                        recentlySavedIds={recentAuditIds}
                        saving={saving}
                        onApplyProposal={applyAuditFromPreview}
                        onDiscardAudit={discardAuditFromPreview}
                        onOpenEvidence={onOpenEvidence}
                      />
                    }
                  >
                    {pub.about.trim() && <p>{pub.about}</p>}
                  </PreviewSection>
                )}
                {!pub.about.trim() &&
                  !auditNotes('about').length &&
                  hasRecentField('about') && (
                    <PreviewSection
                      title={copy.sectionLabels.about}
                      recentlySaved
                    >
                      <p className="linkedin-recently-saved-content">
                        {copy.recentlyChangedEmpty}
                      </p>
                    </PreviewSection>
                  )}
                {previewKeys
                  .filter(
                    (key) =>
                      pub[key]?.some(hasEntryContent) ||
                      auditNotes(key).length ||
                      hasRecentSection(key),
                  )
                  .map((key) => (
                    <PreviewSection
                      key={key}
                      title={copy.sectionLabels[key]}
                      recentlySaved={hasRecentSection(key)}
                      action={
                        <AuditPoints
                          sectionKey={key}
                          sectionTitle={copy.sectionLabels[key]}
                          notes={auditNotes(key)}
                          evidence={evidenceItems}
                          published={pub}
                          recentlySavedIds={recentAuditIds}
                          saving={saving}
                          onApplyProposal={applyAuditFromPreview}
                          onDiscardAudit={discardAuditFromPreview}
                          onOpenEvidence={onOpenEvidence}
                        />
                      }
                    >
                      {!!pub[key]?.length && (
                        <ul>
                          {pub[key]
                            .map((entry, index) => ({ entry, index }))
                            .filter(({ entry }) => hasEntryContent(entry))
                            .map(({ entry, index }) => (
                              <li key={entry.id || index}>
                                <LinkedInEntryPreview
                                  section={key}
                                  item={entry}
                                  recentlySaved={hasRecentEntry(
                                    key,
                                    entry,
                                    index,
                                  )}
                                />
                              </li>
                            ))}
                        </ul>
                      )}
                      {!pub[key]?.some(hasEntryContent) &&
                        hasRecentSection(key) && (
                          <p className="linkedin-recently-saved-content">
                            {copy.recentlyChangedEmpty}
                          </p>
                        )}
                    </PreviewSection>
                  ))}
                {additionalSections.map((section, index) => {
                  const notes = auditNotes('additionalSections', section.id)
                  if (!hasEntryContent(section) && !notes.length) return null
                  return (
                    <PreviewSection
                      key={section.id || index}
                      title={section.title || copy.additionalSectionFallback}
                      recentlySaved={(
                        recentVersion.additionalSections || []
                      ).includes(String(section.id || `index:${index}`))}
                      action={
                        <AuditPoints
                          sectionKey={`additional-${section.id || index}`}
                          sectionTitle={
                            section.title || copy.additionalSectionFallback
                          }
                          notes={notes}
                          evidence={evidenceItems}
                          published={pub}
                          recentlySavedIds={recentAuditIds}
                          saving={saving}
                          onApplyProposal={applyAuditFromPreview}
                          onDiscardAudit={discardAuditFromPreview}
                          onOpenEvidence={onOpenEvidence}
                        />
                      }
                    >
                      {section.content && (
                        <p className="linkedin-additional-preview-content">
                          {section.content}
                        </p>
                      )}
                    </PreviewSection>
                  )
                })}
                {!additionalSections.length &&
                  hasRecentSection('additionalSections') && (
                    <PreviewSection
                      title={copy.additionalSectionsTitle}
                      recentlySaved
                    >
                      <p className="linkedin-recently-saved-content">
                        {copy.recentlyChangedEmpty}
                      </p>
                    </PreviewSection>
                  )}
                {!hasPublishedContent &&
                  !hasActiveAudits &&
                  hasRecentChangesForCurrentVersion && (
                    <p className="linkedin-recently-saved-content">
                      {copy.recentlyChangedEmpty}
                    </p>
                  )}
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
  sectionId,
  section,
  title,
  items = [],
  recentlySavedSection,
  recentlySavedEntries = new Set(),
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
    <section
      id={sectionId}
      className={`linkedin-list-editor${recentlySavedSection ? ' linkedin-recently-saved-section' : ''}`}
      tabIndex={-1}
    >
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
        <div
          className={`linkedin-list-entry${recentlySavedEntries.has(itemKeyForDisplay(item, index)) ? ' linkedin-recently-saved' : ''}`}
          key={index}
        >
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

function itemKeyForDisplay(item, index) {
  return item && typeof item === 'object' && item.id
    ? String(item.id)
    : `index:${index}`
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

function ExpandablePreviewField({ label, value }) {
  const [expanded, setExpanded] = useState(false)
  const text = String(value)
  const shouldExpand = text.length > 320

  return (
    <div className="linkedin-preview-expandable-field">
      <p>
        <b>{label}:</b>{' '}
        {shouldExpand && !expanded ? `${text.slice(0, 320).trimEnd()}…` : text}
      </p>
      {shouldExpand && (
        <button
          className="text-button linkedin-preview-expand-button"
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? copy.descriptionShowLess : copy.descriptionShowMore}
        </button>
      )}
    </div>
  )
}

function LinkedInEntryPreview({ section, item, recentlySaved }) {
  if (typeof item === 'string')
    return (
      <span className={recentlySaved ? 'linkedin-recently-saved-content' : ''}>
        {item}
      </span>
    )
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
    <div
      className={`linkedin-preview-entry${recentlySaved ? ' linkedin-recently-saved-content' : ''}`}
    >
      {hasEntryContent(item[titleKey]) && <h5>{item[titleKey]}</h5>}
      {fields.map((key) =>
        key === 'description' && typeof item[key] === 'string' ? (
          <ExpandablePreviewField
            key={key}
            label={copy.entryFieldLabels[key]}
            value={item[key]}
          />
        ) : (
          <p key={key}>
            <b>{copy.entryFieldLabels[key]}:</b> {renderValue(key, item[key])}
          </p>
        ),
      )}
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

function PreviewSection({ title, children, recentlySaved, action }) {
  return (
    <section
      className={`linkedin-preview-section${recentlySaved ? ' linkedin-recently-saved-section' : ''}`}
    >
      <div className="linkedin-preview-section-head">
        <h4>{title}</h4>
        {action}
      </div>
      {children}
    </section>
  )
}

function AuditPoints({
  sectionKey,
  sectionTitle,
  notes,
  evidence,
  published,
  onApplyProposal,
  onDiscardAudit,
  saving,
  onOpenEvidence,
  recentlySavedIds = new Set(),
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const triggerRef = useRef(null)
  const popupId = `linkedin-audit-popup-${encodeURIComponent(sectionKey)}`
  const headingId = `${popupId}-heading`
  const summary = summarizeAuditNotes(notes)

  useEffect(() => {
    if (!open) return undefined
    const closeOnOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false)
    }
    const closeOnEscape = (event) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      triggerRef.current?.focus()
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  if (!notes.length) return null

  const closePopup = () => {
    setOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <div
      ref={containerRef}
      className={`preview-audit-anchor${open ? ' is-open' : ''}`}
    >
      <button
        ref={triggerRef}
        className="preview-audit-trigger"
        type="button"
        aria-expanded={open}
        aria-controls={popupId}
        aria-label={copy.auditMarkerLabel
          .replace('{count}', String(summary.count))
          .replace('{priority}', copy.auditCard.priorities[summary.priority])}
        data-priority={summary.priority}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="preview-audit-trigger-mark" aria-hidden="true">
          ✳
        </span>
        <span>{summary.count}</span>
        <span className="preview-audit-trigger-priority">
          {copy.auditCard.priorities[summary.priority]}
        </span>
      </button>
      {open && (
        <div
          className="preview-audit-popover"
          id={popupId}
          role="region"
          aria-labelledby={headingId}
        >
          <div className="preview-audit-popover-topline">
            <span>{copy.auditPopoverEyebrow}</span>
            <button
              type="button"
              className="preview-audit-popover-close"
              aria-label={copy.auditPopoverClose}
              onClick={closePopup}
            >
              ×
            </button>
          </div>
          <h5 id={headingId}>{sectionTitle}</h5>
          <p className="preview-audit-popover-subtitle">
            {notes.length === 1
              ? copy.auditPopoverCountOne
              : copy.auditPopoverCountMany.replace(
                  '{count}',
                  String(notes.length),
                )}
          </p>
          <div className="preview-audit-note-list">
            <ul>
              {notes.map((note) => {
                const linked = evidence.filter((item) =>
                  (note.profileEvidenceIds || []).includes(item.id),
                )
                const basis = (note.profileEvidenceIds || []).join(' · ')
                return (
                  <li
                    key={note.id}
                    className={`preview-audit-note${recentlySavedIds.has(String(note.id)) ? ' linkedin-recently-saved-content' : ''}`}
                  >
                    <div className="preview-audit-note-meta">
                      <span className="preview-audit-note-action">
                        {copy.auditActions[note.action] ||
                          copy.auditActions.fallback}
                      </span>
                      <span
                        className="preview-audit-note-priority"
                        data-priority={note.priority || 'media'}
                      >
                        {copy.auditCard.priorities[note.priority] ||
                          copy.auditCard.priorities.media}
                      </span>
                      <span className="preview-audit-note-status">
                        {copy.auditStatuses[note.status] || note.status}
                      </span>
                    </div>
                    {note.problem && (
                      <p>
                        <b>{copy.auditPopoverProblem}:</b> {note.problem}
                      </p>
                    )}
                    {note.reasonEvidence && (
                      <p>
                        <b>{copy.auditPopoverReason}:</b> {note.reasonEvidence}
                      </p>
                    )}
                    {(linked.length > 0 ||
                      (!basis && !note.reasonEvidence)) && (
                      <p>
                        <b>{copy.evidenceBasePrefix}:</b>{' '}
                        {linked.length ? (
                          <span className="preview-audit-evidence-links">
                            {linked.map((item, index) => (
                              <span key={item.id}>
                                {index > 0 && ' · '}
                                {onOpenEvidence ? (
                                  <button
                                    className="preview-audit-evidence-link"
                                    type="button"
                                    onClick={() => onOpenEvidence(item.id)}
                                  >
                                    {item.title || item.name || item.id}
                                  </button>
                                ) : (
                                  item.title || item.name || item.id
                                )}
                              </span>
                            ))}
                          </span>
                        ) : (
                          copy.missingEvidenceHint
                        )}
                      </p>
                    )}
                    {basis && !linked.length && (
                      <p>
                        <b>{copy.evidenceBasePrefix}:</b> {basis}
                      </p>
                    )}
                    <p className="preview-audit-note-recommendation">
                      <b>{copy.auditPopoverRecommendation}:</b>{' '}
                      {note.recommendation || note.problem || copy.auditPending}
                    </p>
                    {note.proposedText && (
                      <blockquote>
                        <b>{copy.auditPopoverProposed}:</b> {note.proposedText}
                      </blockquote>
                    )}
                    {(onApplyProposal || onDiscardAudit) && (
                      <div className="preview-audit-actions">
                        {onApplyProposal &&
                          note.proposedText &&
                          (note.status === 'aplicada' ? (
                            <span role="status">
                              {copy.auditCard.proposalApplied}
                            </span>
                          ) : (
                            <>
                              <button
                                className="button secondary small"
                                type="button"
                                disabled={
                                  saving ||
                                  !published ||
                                  !note.proposedText.trim() ||
                                  Boolean(
                                    resolveLinkedInAuditTarget(published, note)
                                      .error,
                                  )
                                }
                                onClick={() => onApplyProposal(note.id)}
                              >
                                {copy.auditCard.acceptProposal}
                              </button>
                              {published &&
                                resolveLinkedInAuditTarget(published, note)
                                  .error && (
                                  <p className="quiet-empty">
                                    {copy.auditCard.chooseExactTarget}
                                  </p>
                                )}
                            </>
                          ))}
                        {onDiscardAudit && note.status !== 'descartada' && (
                          <button
                            className="button quiet small"
                            type="button"
                            disabled={saving}
                            onClick={() => onDiscardAudit(note.id)}
                          >
                            {copy.auditCard.discardSuggestion}
                          </button>
                        )}
                      </div>
                    )}
                    {note.date && (
                      <small className="preview-audit-note-date">
                        {copy.auditPopoverDate}: {note.date}
                      </small>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

function AuditCard({
  item,
  evidence,
  additionalSections,
  published,
  onOpenEvidence,
  onApply,
  onChange,
  onDelete,
}) {
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
  const sectionItems = Array.isArray(published[item.section])
    ? published[item.section]
    : []
  const selectedEntryIndex =
    typeof item.targetEntryId === 'string'
      ? sectionItems.findIndex(
          (entry) =>
            entry &&
            typeof entry === 'object' &&
            entry.id === item.targetEntryId,
        )
      : Number.isInteger(item.targetEntryIndex)
        ? item.targetEntryIndex
        : -1
  const selectedEntry = sectionItems[selectedEntryIndex]
  const targetFieldOptions =
    typeof selectedEntry === 'string'
      ? ['value']
      : (LINKEDIN_AUDIT_FIELDS[item.section] || []).filter(
          (field) =>
            selectedEntry &&
            (selectedEntry[field] === undefined ||
              typeof selectedEntry[field] === 'string'),
        )
  const canApply = Boolean(
    item.status !== 'aplicada' &&
    item.proposedText?.trim() &&
    !resolveLinkedInAuditTarget(published, item).error,
  )
  const clearSectionLink = (section) => {
    onChange({
      section,
      sectionId: undefined,
      sectionLabel: undefined,
      targetEntryId: undefined,
      targetEntryIndex: undefined,
      targetField: undefined,
    })
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
                  targetEntryId: undefined,
                  targetEntryIndex: undefined,
                  targetField: 'content',
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
          <small>{labels.actionHint}</small>
        </label>
      </div>
      {item.section === 'additionalSections' && selectedAdditionalSection && (
        <>
          <label className="field">
            <span>{labels.proposalTarget}</span>
            <select
              value={item.targetField || 'content'}
              onChange={(e) => onChange({ targetField: e.target.value })}
            >
              <option value="content">{labels.additionalContent}</option>
              <option value="title">{labels.additionalTitle}</option>
            </select>
          </label>
          <p className="quiet-empty audit-target-hint">
            {labels.additionalTargetHint}
          </p>
        </>
      )}
      {LINKEDIN_AUDIT_FIELDS[item.section] || item.section === 'skills' ? (
        <div className="form-two audit-target-fields">
          <label className="field">
            <span>{labels.targetEntry}</span>
            <select
              value={
                selectedEntryIndex < 0
                  ? ''
                  : typeof sectionItems[selectedEntryIndex] === 'object' &&
                      sectionItems[selectedEntryIndex]?.id
                    ? `id:${sectionItems[selectedEntryIndex].id}`
                    : `index:${selectedEntryIndex}`
              }
              onChange={(e) => {
                const value = e.target.value
                const isId = value.startsWith('id:')
                const nextIndex = isId
                  ? -1
                  : Number(value.slice('index:'.length))
                const nextEntry = isId
                  ? sectionItems.find((entry) => entry?.id === value.slice(3))
                  : sectionItems[nextIndex]
                const fields =
                  typeof nextEntry === 'string'
                    ? ['value']
                    : (LINKEDIN_AUDIT_FIELDS[item.section] || []).filter(
                        (field) =>
                          nextEntry &&
                          (nextEntry[field] === undefined ||
                            typeof nextEntry[field] === 'string'),
                      )
                onChange({
                  targetEntryId: isId ? value.slice(3) : undefined,
                  targetEntryIndex: isId ? undefined : nextIndex,
                  targetField: fields[0] || undefined,
                })
              }}
            >
              <option value="">{labels.chooseTargetEntry}</option>
              {sectionItems.map((entry, index) => {
                const value =
                  entry && typeof entry === 'object' && entry.id
                    ? `id:${entry.id}`
                    : `index:${index}`
                const title =
                  typeof entry === 'string'
                    ? entry
                    : entry?.title ||
                      entry?.name ||
                      entry?.degree ||
                      entry?.language ||
                      entry?.institution ||
                      labels.untitledEvidence
                return (
                  <option key={value} value={value}>
                    {`${index + 1}. ${title}`}
                  </option>
                )
              })}
            </select>
          </label>
          <label className="field">
            <span>{labels.targetField}</span>
            <select
              value={item.targetField || ''}
              onChange={(e) => onChange({ targetField: e.target.value })}
              disabled={selectedEntryIndex < 0}
            >
              <option value="">{labels.chooseTargetField}</option>
              {targetFieldOptions.map((field) => (
                <option key={field} value={field}>
                  {field === 'value'
                    ? labels.plainTextValue
                    : copy.entryFieldLabels[field] || field}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}
      {(LINKEDIN_AUDIT_FIELDS[item.section] || item.section === 'skills') && (
        <p className="quiet-empty audit-target-hint">{labels.targetHint}</p>
      )}
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
        hint={labels.problemHint}
        value={item.problem}
        onChange={(v) => onChange({ problem: v })}
      />
      <TextField
        label={labels.reasonEvidence}
        hint={labels.reasonEvidenceHint}
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
      {onOpenEvidence &&
        evidence.some((entry) => selectedIds.includes(entry.id)) && (
          <div className="audit-open-evidence">
            {evidence
              .filter((entry) => selectedIds.includes(entry.id))
              .map((entry) => (
                <button
                  className="text-button"
                  key={entry.id}
                  type="button"
                  onClick={() => onOpenEvidence(entry.id)}
                >
                  {labels.openInProfile}:{' '}
                  {entry.title || entry.name || entry.id}
                </button>
              ))}
          </div>
        )}
      <TextField
        label={labels.recommendation}
        hint={labels.recommendationHint}
        rows={2}
        value={item.recommendation}
        onChange={(v) => onChange({ recommendation: v })}
      />
      <TextField
        label={labels.proposedText}
        hint={labels.proposedTextHint}
        rows={3}
        value={item.proposedText}
        onChange={(v) => onChange({ proposedText: v })}
      />
      <div className="audit-apply-row">
        <button
          className="button secondary small"
          type="button"
          disabled={!canApply}
          onClick={onApply}
        >
          {labels.applyProposal}
        </button>
        {canApply && <p className="quiet-empty">{labels.applyProposalHint}</p>}
        {!canApply &&
          item.proposedText?.trim() &&
          item.status !== 'aplicada' && (
            <p className="quiet-empty">{labels.chooseExactTarget}</p>
          )}
      </div>
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
          <small>{labels.statusHint}</small>
        </label>
      </div>
    </div>
  )
}
