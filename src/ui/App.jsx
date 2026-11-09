import { Modal } from './components/Modal.jsx'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useCvReviewTask } from '../data/cv-review-task.js'
import { EMPTY } from '../data/catalog.js'
import { hasCvRelevantLinkedInChanges } from '../data/linkedin-changes.js'
import { hasCvRelevantProfileChanges } from '../data/profile-changes.js'
import { NAV, STRINGS as s, TITLES } from '../i18n/es.js'
import {
  normalizeModule,
  useStorageState,
  validateModule,
} from '../data/storage.js'
import { isKnownEmpty, isKnownPopulated } from './utils.js'
import { checkEvidenceRemoval } from './profile-evidence-guard.js'
import { SectionIcon } from './components/SectionIcon.jsx'
import { WorkspaceGate } from './components/WorkspaceGate.jsx'
import {
  DisconnectDialog,
  FallbackDialog,
  FolderDataDialog,
} from './components/DataDialogs.jsx'
import { FallbackConnectDialog } from './components/FallbackConnectDialog.jsx'
import { HomePage } from './pages/HomePage.jsx'
import { ProfilePage } from './pages/ProfilePage.jsx'
import { LinkedInPage } from './pages/LinkedInPage.jsx'
import { CVPage } from './pages/CVPage.jsx'
import { VacancyDetail, VacanciesPage } from './pages/VacanciesPage.jsx'
import { PromptInboxPage } from './pages/PromptInboxPage.jsx'

function readRoute() {
  const [section, vacancy] = window.location.hash.slice(1).split('/')
  const page = NAV.some(([key]) => key === section) ? section : 'home'
  let vacancyId = null
  if (page === 'vacancies' && vacancy) {
    try {
      vacancyId = decodeURIComponent(vacancy)
    } catch {
      // A malformed link opens the vacancy list.
    }
  }
  return { page, vacancyId }
}

function routeHash(page, vacancyId) {
  return (
    '#' +
    page +
    (page === 'vacancies' && vacancyId
      ? '/' + encodeURIComponent(vacancyId)
      : '')
  )
}

export default function App() {
  const store = useStorageState()
  const [route, setRoute] = useState(readRoute)
  const { page, vacancyId } = route
  const pageContent = useRef(null)
  const [notice, setNotice] = useState('')
  const [adaptationVacancyId, setAdaptationVacancyId] = useState(null)
  const [noticeAction, setNoticeAction] = useState(null)
  const [fallbackOpen, setFallbackOpen] = useState(false)
  const [fallbackConnectOpen, setFallbackConnectOpen] = useState(false)
  const [fallbackConnectBusy, setFallbackConnectBusy] = useState(false)
  const [fallbackConnectError, setFallbackConnectError] = useState('')
  const [fallbackSavedModule, setFallbackSavedModule] = useState(null)
  const [fallbackSavedCvRelevant, setFallbackSavedCvRelevant] = useState(false)
  const [folderDialog, setFolderDialog] = useState(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [focusEvidenceId, setFocusEvidenceId] = useState('')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const editorSnapshots = useRef({})
  const pendingSave = useRef(null)
  const [savingModule, setSavingModule] = useState(null)
  const [savedDrafts, setSavedDrafts] = useState({})
  const [editorReset, setEditorReset] = useState({})
  const [conflict, setConflict] = useState(null)
  const [copyDraftStatus, setCopyDraftStatus] = useState('')
  const [showDraftText, setShowDraftText] = useState(false)
  const [conflictBusy, setConflictBusy] = useState(false)
  const confirmDiscard = () =>
    !hasUnsavedChanges ||
    window.confirm('Tienes cambios sin guardar. ¿Quieres descartarlos?')
  const resetEditor = (module) => {
    setEditorReset((previous) => ({
      ...previous,
      [module]: (previous[module] || 0) + 1,
    }))
    delete editorSnapshots.current[module]
    setHasUnsavedChanges(false)
  }
  const draftProps = (module) => ({
    key: editorReset[module] || 0,
    savedDraft: savedDrafts[module],
    saving: savingModule === module,
    onDirtyChange: setHasUnsavedChanges,
    onDraftChange: (snapshot) => {
      editorSnapshots.current[module] = snapshot
    },
  })
  const clearFocusEvidenceId = useCallback(() => setFocusEvidenceId(''), [])
  const [confirmDisconnect, setConfirmDisconnect] = useState(false)
  const cvReview = useCvReviewTask()
  const cvPromptPending = Boolean(cvReview.task)
  const observedCv = useRef(null)
  const [connecting, setConnecting] = useState(false)
  const [savedAt, setSavedAt] = useState({})
  const [externalLinkedinPending, setExternalLinkedinPending] = useState(null)
  const externalRevisions = useRef({})
  const observedSources = useRef({})
  const linkedinLanguagesPending =
    externalLinkedinPending ??
    store.data.linkedin.languageSync?.status === 'pending'
  const pendingPromptCount =
    Number(cvPromptPending) + Number(linkedinLanguagesPending)
  const currentModule = Object.hasOwn(store.data, page) ? page : null

  function showNotice(message, action = null) {
    setNotice(message)
    setNoticeAction(action)
  }

  function remindCvPrompt(message, source) {
    cvReview.record(source, observedCv.current || store.data.cv)
    showNotice(message, 'cv-prompt')
  }

  function navigateTo(nextPage, { vacancyId: nextVacancyId = null } = {}) {
    const changing = nextPage !== page || nextVacancyId !== vacancyId
    if (changing && (pendingSave.current || !confirmDiscard())) return false
    if (changing) setHasUnsavedChanges(false)
    if (nextPage !== page || nextVacancyId !== vacancyId) {
      window.history.pushState(null, '', routeHash(nextPage, nextVacancyId))
      setRoute({ page: nextPage, vacancyId: nextVacancyId })
    }
    setMobileNavOpen(false)
    setAdaptationVacancyId(null)
    return true
  }

  useEffect(() => {
    function restoreRoute() {
      const next = readRoute()
      if (next.page === page && next.vacancyId === vacancyId) return
      if (pendingSave.current || !confirmDiscard()) {
        window.history.pushState(null, '', routeHash(page, vacancyId))
        return
      }
      setHasUnsavedChanges(false)
      setRoute(next)
      setMobileNavOpen(false)
    }
    window.addEventListener('popstate', restoreRoute)
    return () => window.removeEventListener('popstate', restoreRoute)
  }, [page, vacancyId, hasUnsavedChanges])

  useEffect(() => {
    if (!pageContent.current) return
    pageContent.current.focus({ preventScroll: true })
    window.scrollTo(0, 0)
  }, [page, vacancyId])

  function openProfileEvidence(evidenceId) {
    if (!navigateTo('profile')) return
    setFocusEvidenceId(evidenceId)
  }

  async function reload(module, { remind = true } = {}) {
    const result = await store.reload(module)
    if (result.error && store.folder) setFolderDialog(await store.recheck())
    if (result.ok && module === 'linkedin') setExternalLinkedinPending(null)
    if (result.ok && module === 'cv') {
      observedCv.current = result.data
      cvReview.check(result.data)
    }
    const seen = observedSources.current[module]
    const alreadyObserved = result.ok && seen === JSON.stringify(result.data)
    if (
      remind &&
      !alreadyObserved &&
      result.ok &&
      module === 'profile' &&
      hasCvRelevantProfileChanges(store.data.profile, result.data)
    ) {
      remindCvPrompt(s.promptInbox.sourceReloaded, module)
    } else if (
      remind &&
      !alreadyObserved &&
      result.ok &&
      module === 'linkedin' &&
      hasCvRelevantLinkedInChanges(store.data.linkedin, result.data)
    ) {
      remindCvPrompt(s.promptInbox.sourceReloaded, module)
    }
    return result
  }

  async function showConflict(module) {
    const snapshot = editorSnapshots.current[module]
    const base = snapshot?.base || store.data[module]
    setCopyDraftStatus('')
    setShowDraftText(false)
    setConflict({ module, fields: null })
    try {
      const handle = await store.folder.getFileHandle(`${module}.json`)
      const external = JSON.parse(await (await handle.getFile()).text())
      const normalized = normalizeModule(module, external).data
      if (!validateModule(module, normalized)) return
      const fields = [
        ...new Set([...Object.keys(base), ...Object.keys(normalized)]),
      ].filter(
        (key) => JSON.stringify(base[key]) !== JSON.stringify(normalized[key]),
      )
      setConflict((current) =>
        current?.module === module ? { module, fields } : current,
      )
    } catch {
      // Leave the editor intact if the external file cannot be read or validated.
    }
  }

  async function reloadWithUnsavedGuard(module) {
    if (pendingSave.current) return
    if (
      ['Cambio externo', 'Conflicto externo'].includes(store.states[module]) ||
      editorSnapshots.current[module]?.base !== store.data[module]
    ) {
      await showConflict(module)
      return
    }
    if (!confirmDiscard()) return
    await reloadEditor(module)
  }

  async function reloadEditor(module) {
    const snapshot = editorSnapshots.current[module]
    const result = await reload(module)
    if (
      result.ok &&
      editorSnapshots.current[module]?.draft === snapshot?.draft
    ) {
      resetEditor(module)
    }
    return result
  }

  function handlePromptCopied() {
    showNotice(s.promptInbox.promptCopiedNotice)
  }

  function handleFallbackDownload(module) {
    if (fallbackSavedModule !== module) return
    setFallbackSavedModule(null)
    store.markFallbackSaved(module)
    if (fallbackSavedCvRelevant)
      remindCvPrompt(
        `${s.promptInbox.fallbackSaved} ${s.fallbackFiles.saved}`,
        module,
      )
    else showNotice(s.fallbackFiles.saved)
    setFallbackSavedCvRelevant(false)
  }

  useEffect(() => {
    if (store.revision.cv === undefined) return
    observedCv.current = store.data.cv
    cvReview.check(store.data.cv)
  }, [store.revision.cv, store.data.cv])

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
          if (cancelled) return
          if (key === 'linkedin' && txt === store.revision[key]) {
            delete externalRevisions.current[key]
            setExternalLinkedinPending(null)
          }
          if (
            txt !== store.revision[key] &&
            store.revision[key] !== undefined
          ) {
            if (externalRevisions.current[key] === txt) continue
            externalRevisions.current[key] = txt
            if (store.states[key] !== 'Cambio externo') {
              store.setStates((prev) => ({ ...prev, [key]: 'Cambio externo' }))
              store.setWarnings((prev) => ({
                ...prev,
                [key]: s.saveStatus.changedExternally.replace(
                  '{file}',
                  `${key}.json`,
                ),
              }))
            }
            if (key === 'profile') {
              try {
                const external = normalizeModule(
                  'profile',
                  JSON.parse(txt),
                ).data
                if (
                  validateModule('profile', external) &&
                  hasCvRelevantProfileChanges(store.data.profile, external)
                ) {
                  observedSources.current[key] = JSON.stringify(external)
                  remindCvPrompt(s.promptInbox.sourceChanged, key)
                }
              } catch {
                /* The explicit reload flow reports invalid JSON to the user. */
              }
            }
            if (key === 'linkedin') {
              setExternalLinkedinPending(null)
              try {
                const external = normalizeModule(
                  'linkedin',
                  JSON.parse(txt),
                ).data
                if (validateModule('linkedin', external)) {
                  setExternalLinkedinPending(
                    external.languageSync?.status === 'pending',
                  )
                  const previous = normalizeModule(
                    'linkedin',
                    JSON.parse(store.revision[key]),
                  ).data
                  if (
                    validateModule('linkedin', previous) &&
                    hasCvRelevantLinkedInChanges(previous, external)
                  ) {
                    observedSources.current[key] = JSON.stringify(external)
                    remindCvPrompt(s.promptInbox.sourceChanged, key)
                  }
                }
              } catch {
                /* The explicit reload flow reports invalid JSON to the user. */
              }
            }
            if (key === 'cv') {
              try {
                const external = normalizeModule('cv', JSON.parse(txt)).data
                if (validateModule('cv', external)) {
                  observedCv.current = external
                  cvReview.check(external)
                }
              } catch {
                /* The explicit reload flow reports invalid JSON to the user. */
              }
            }
          }
        } catch {
          /* missing files are surfaced on initial connection */
        }
      }
    }
    let checking = false
    async function refreshExternalChanges() {
      if (checking || cancelled) return
      checking = true
      try {
        await checks()
      } finally {
        checking = false
      }
    }
    const timer = setInterval(refreshExternalChanges, 2200)
    window.addEventListener('focus', refreshExternalChanges)
    function refreshWhenVisible() {
      if (document.visibilityState === 'visible') refreshExternalChanges()
    }
    document.addEventListener('visibilitychange', refreshWhenVisible)
    return () => {
      cancelled = true
      clearInterval(timer)
      window.removeEventListener('focus', refreshExternalChanges)
      document.removeEventListener('visibilitychange', refreshWhenVisible)
    }
  }, [store.folder, store.revision, store.states])

  useEffect(() => {
    if (store.restoreStatus !== 'restored' || !store.restoreResult) return
    const result = store.restoreResult
    const needsHelp = result.missing.length || result.invalid.length
    setFolderDialog(needsHelp ? result : null)
    if (!needsHelp && !result.emptyData)
      showNotice(s.dataConnection.restoredNotice)
  }, [store.restoreResult, store.restoreStatus])

  useEffect(() => {
    if (!mobileNavOpen) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setMobileNavOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [mobileNavOpen])

  async function connect(options = {}) {
    if (pendingSave.current || !confirmDiscard()) return
    setConnecting(true)
    try {
      const result = await store.connect(options)
      if (result.fallback) {
        setFallbackConnectError('')
        setFallbackConnectOpen(true)
        showNotice(s.workspaceGate.browserUnsupported)
      } else if (result.localMissing) showNotice(s.workspaceGate.localMissing)
      else if (result.wrongFolder)
        showNotice(
          s.workspaceGate.wrongFolder.replace(
            '{name}',
            result.selectedName || 'otra carpeta',
          ),
        )
      else if (result.permissionDenied)
        showNotice(s.workspaceGate.permissionNotice, 'open-data-files')
      else if (result.cancelled)
        showNotice(s.workspaceGate.connectCancelled, 'open-data-files')
      else if (result.connected) {
        setExternalLinkedinPending(null)
        const needsHelp = result.missing.length || result.invalid.length
        setFolderDialog(needsHelp ? result : null)
        showNotice(
          result.persistenceError
            ? s.workspaceGate.persistenceNotice
            : needsHelp || result.emptyData
              ? ''
              : result.reconnected
                ? s.dataConnection.reconnectedReady
                : s.dataConnection.connectedReady,
        )
      } else if (result.error)
        showNotice(s.workspaceGate.connectUnexpected, 'open-data-files')
    } catch {
      showNotice(s.workspaceGate.connectUnexpected, 'open-data-files')
    } finally {
      setConnecting(false)
    }
  }
  async function connectFiles(files) {
    if (pendingSave.current || !confirmDiscard()) return
    setFallbackConnectBusy(true)
    setFallbackConnectError('')
    try {
      const result = await store.connectFiles(files)
      if (result.error) {
        setFallbackConnectError(s.fallbackFiles.noRecognized)
        return
      }
      resetEditor(page)
      setFallbackConnectOpen(false)
      showNotice(
        result.invalid.length || result.missing.length
          ? s.fallbackFiles.connectedWithIssues
          : s.fallbackFiles.connected,
      )
    } catch {
      setFallbackConnectError(s.fallbackFiles.openError)
    } finally {
      setFallbackConnectBusy(false)
    }
  }
  async function prepareMissing() {
    const result = await store.prepareMissing(folderDialog?.missing || [])
    if (result.error) {
      const scan = await store.recheck()
      setFolderDialog({ ...scan, preparationError: true })
      return
    }
    setFolderDialog(
      result.missing.length || result.invalid.length ? result : null,
    )
    if (result.created.length) showNotice(s.dataConnection.prepared)
  }
  async function recheckFolder() {
    const result = await store.recheck()
    if (result.error) {
      setFolderDialog((previous) => ({ ...previous, recheckError: true }))
      return
    }
    setFolderDialog(
      result.missing.length || result.invalid.length ? result : null,
    )
    if (!result.missing.length && !result.invalid.length && !result.emptyData)
      showNotice(s.dataConnection.loadedSuccessfully)
  }
  function openSetupPrompt() {
    if (!navigateTo('prompts')) return
    setFolderDialog(null)
    showNotice('')
  }
  async function save(module, value) {
    if (pendingSave.current) return
    const snapshot =
      page === module ? editorSnapshots.current[module] : undefined
    if (snapshot && snapshot.base !== store.data[module]) {
      await showConflict(module)
      return
    }
    pendingSave.current = module
    setSavingModule(module)
    try {
      await saveModule(module, value, snapshot)
    } finally {
      pendingSave.current = null
      setSavingModule(null)
    }
  }

  async function saveModule(module, value, snapshot) {
    if (module === 'profile') {
      const blockedRemoval = await checkEvidenceRemoval(store, value)
      if (blockedRemoval) {
        showNotice(
          blockedRemoval.unavailable
            ? 'No se pudo comprobar si Vacantes usa las evidencias eliminadas. Revisa o vuelve a abrir vacancies.json y conserva el borrador.'
            : 'Hay vacantes que todavía usan las evidencias eliminadas. Conserva las evidencias o retira sus referencias desde Vacantes antes de guardar.',
        )
        return
      }
    }
    const cvRelevantProfileChange =
      module === 'profile' &&
      hasCvRelevantProfileChanges(store.data.profile, value)
    const cvRelevantLinkedInChange =
      module === 'linkedin' &&
      hasCvRelevantLinkedInChanges(store.data.linkedin, value)
    const result = await store.save(module, value)
    if (snapshot && (result.saved || result.fallback))
      setSavedDrafts((previous) => ({
        ...previous,
        [module]: {
          ...snapshot,
          submitted: {
            ...value,
            schemaVersion: store.data[module].schemaVersion,
          },
        },
      }))
    if (result.saved)
      setSavedAt((previous) => ({
        ...previous,
        [module]: new Date().toISOString(),
      }))
    if (result.saved && module === 'cv') {
      observedCv.current = value
      cvReview.check(value)
    }
    if (result.conflict) await showConflict(module)
    else if (result.needsReview) setFolderDialog(await store.recheck())
    else if (result.fallback) {
      setFallbackSavedModule(module)
      setFallbackSavedCvRelevant(
        cvRelevantProfileChange || cvRelevantLinkedInChange,
      )
      if (module === 'linkedin') setExternalLinkedinPending(null)
      showNotice(s.fallbackFiles.savePrepared)
      setFallbackOpen(true)
    } else if (result.saved && ['profile', 'linkedin'].includes(module)) {
      setFallbackSavedModule(null)
      setFallbackSavedCvRelevant(false)
      if (module === 'linkedin') setExternalLinkedinPending(null)
      if (cvRelevantProfileChange || cvRelevantLinkedInChange)
        remindCvPrompt(
          module === 'profile'
            ? s.promptInbox.sourceSavedProfile
            : s.promptInbox.sourceSavedLinkedin,
          module,
        )
      else showNotice(`${module}.json guardado.`)
    } else if (result.saved) {
      setFallbackSavedModule(null)
      showNotice(`${module}.json guardado.`)
    } else if (result.error) showNotice(result.error)
  }
  function openVacancyAdaptation(id) {
    if (!navigateTo('prompts')) return
    setAdaptationVacancyId(id)
    showNotice('')
  }

  function openCvPrompt() {
    if (!navigateTo('prompts')) return
    showNotice('')
  }

  async function checkLinkedInSync() {
    const result = await reload('linkedin', { remind: false })
    if (!result.ok) return
    setHasUnsavedChanges(false)
    showNotice(
      result.data.languageSync?.status !== 'pending'
        ? s.promptInbox.linkedinSyncConfirmed
        : s.promptInbox.linkedinSyncStillPending,
    )
  }

  async function confirmLinkedInSync() {
    if (!store.folder || !linkedinLanguagesPending) return
    if (!window.confirm(s.promptInbox.confirmLinkedInSyncQuestion)) return
    await save('linkedin', {
      ...store.data.linkedin,
      languageSync: {
        ...store.data.linkedin.languageSync,
        status: 'current',
        sourceLanguage: undefined,
      },
    })
  }

  function requestDisconnect() {
    if (pendingSave.current || !confirmDiscard()) return
    setConfirmDisconnect(true)
  }

  async function disconnectWorkspace(clear) {
    const result = await store.disconnect(clear)
    setHasUnsavedChanges(false)
    observedCv.current = null
    if (clear) cvReview.clear()
    setExternalLinkedinPending(null)
    externalRevisions.current = {}
    observedSources.current = {}
    setConfirmDisconnect(false)
    setNotice(
      result.persistenceCleared
        ? clear
          ? s.dataConnection.disconnectedClearedNotice
          : s.dataConnection.disconnectedNotice
        : s.workspaceGate.disconnectPersistenceNotice,
    )
  }

  const activeVacancy = store.data.vacancies.items.find(
    (v) => v.id === vacancyId,
  )

  useEffect(() => {
    if (!hasUnsavedChanges && !savingModule) return undefined
    const warnBeforeUnload = (event) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warnBeforeUnload)
    return () => window.removeEventListener('beforeunload', warnBeforeUnload)
  }, [hasUnsavedChanges, savingModule])

  if (!store.folder && !store.fallbackConnected) {
    return (
      <>
        <WorkspaceGate
          connecting={connecting}
          notice={notice}
          noticeAction={noticeAction}
          restoreStatus={store.restoreStatus}
          hasRememberedFolder={store.hasRememberedFolder}
          onConnect={() => connect()}
          onChooseFolder={() => connect({ selectAnother: true })}
          onConnectLocal={
            import.meta.env.DEV ? () => connect({ useLocal: true }) : undefined
          }
          onOpenFiles={() => {
            setFallbackConnectError('')
            setFallbackConnectOpen(true)
            showNotice('')
          }}
        />
        {fallbackConnectOpen && (
          <FallbackConnectDialog
            busy={fallbackConnectBusy}
            error={fallbackConnectError}
            onClose={() => {
              setFallbackConnectOpen(false)
              setFallbackConnectError('')
            }}
            onFiles={connectFiles}
          />
        )}
      </>
    )
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNavOpen ? 'is-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">C</div>
          <div>
            <strong>CareerKit</strong>
            <span>Tu espacio profesional</span>
          </div>
          <button
            className="sidebar-close"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Ocultar menú"
          >
            ×
          </button>
        </div>
        <div className="side-label">ESPACIO</div>
        <nav id="primary-nav" aria-label="Secciones principales">
          {NAV.map(([key, label]) => (
            <button
              key={key}
              className={`nav-link ${page === key ? 'active' : ''}`}
              aria-current={page === key ? 'page' : undefined}
              onClick={() => navigateTo(key)}
            >
              <span className="nav-icon">
                <SectionIcon name={key} />
              </span>
              {label}
              {key === 'prompts' && pendingPromptCount > 0 && (
                <span
                  className="nav-badge"
                  aria-label={s.promptInbox.pendingTag.replace(
                    '{count}',
                    pendingPromptCount,
                  )}
                >
                  {pendingPromptCount}
                </span>
              )}
              {page === key && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="privacy-card">
            <span className="privacy-icon">♧</span>
            <div>
              <strong>Datos en tu dispositivo</strong>
              <p>La app no envía información a ningún servidor.</p>
            </div>
          </div>
          <button
            className="connect-button"
            onClick={() => {
              setMobileNavOpen(false)
              connect({ selectAnother: true })
            }}
          >
            <span>↗</span>
            {store.folder ? s.changeFolder : s.connect}
          </button>
          <p className="side-note">
            {store.fallbackConnected
              ? s.fallbackFiles.manualSideNote
              : store.rememberFailed
                ? s.dataConnection.folderRememberFailed
                : store.hasRememberedFolder
                  ? s.dataConnection.folderRemembered
                  : s.dataConnection.folderNotRemembered}
          </p>
        </div>
      </aside>
      <button
        className={`nav-backdrop ${mobileNavOpen ? 'is-visible' : ''}`}
        onClick={() => setMobileNavOpen(false)}
        aria-label="Ocultar menú"
        tabIndex={mobileNavOpen ? 0 : -1}
      />
      <main className="main-area">
        <header className="topbar">
          <button
            className="mobile-menu-toggle"
            aria-controls="primary-nav"
            aria-expanded={mobileNavOpen}
            aria-label={
              mobileNavOpen ? 'Ocultar secciones' : 'Mostrar secciones'
            }
            onClick={() => setMobileNavOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
          <div className="breadcrumbs">
            CareerKit <span>/</span> {page === 'home' ? 'Inicio' : TITLES[page]}
          </div>
          <div className="top-actions">
            <span
              className={`connection ${store.folder || store.fallbackConnected ? 'is-connected' : ''} ${store.fallbackConnected ? 'is-manual' : ''}`}
            >
              <i />
              {store.folder
                ? s.connected
                : store.fallbackConnected
                  ? s.fallbackFiles.manualStatus
                  : s.workspaceGate.previewOnly}
            </span>
            <button className="avatar">C</button>
          </div>
        </header>
        <section
          className="page-content"
          ref={pageContent}
          tabIndex={-1}
          aria-label={TITLES[page] || 'Inicio'}
        >
          {store.fallbackConnected && (
            <section className="fallback-storage-banner" role="note">
              <div>
                <span className="eyebrow">{s.fallbackFiles.eyebrow}</span>
                <b>{s.fallbackFiles.bannerTitle}</b>
                <p>{s.fallbackFiles.bannerBody}</p>
              </div>
              <div className="fallback-storage-actions">
                <button
                  className="button secondary"
                  type="button"
                  onClick={() => {
                    setFallbackConnectError('')
                    setFallbackConnectOpen(true)
                  }}
                >
                  {s.fallbackFiles.chooseAgain}
                </button>
                <button
                  className="button secondary"
                  type="button"
                  disabled={connecting}
                  onClick={() => connect({ selectAnother: true })}
                >
                  {s.fallbackFiles.tryDirect}
                </button>
              </div>
            </section>
          )}
          {notice && (
            <div className="toast" role="status">
              <span>{notice}</span>
              {noticeAction === 'cv-prompt' && (
                <button className="toast-action" onClick={openCvPrompt}>
                  {s.promptInbox.openButton}
                </button>
              )}
              {noticeAction === 'open-data-files' && (
                <button
                  className="toast-action"
                  type="button"
                  onClick={() => {
                    setFallbackConnectError('')
                    setFallbackConnectOpen(true)
                    showNotice('')
                  }}
                >
                  {s.fallbackFiles.choose}
                </button>
              )}
              <button onClick={() => showNotice('')} aria-label="Cerrar aviso">
                ×
              </button>
            </div>
          )}
          {page === 'home' && (
            <HomePage
              data={store.data}
              connected={Boolean(store.folder || store.fallbackConnected)}
              fallbackConnected={store.fallbackConnected}
              states={store.states}
              cvPromptPending={cvPromptPending}
              linkedinLanguagesPending={linkedinLanguagesPending}
              warnings={store.warnings}
              onReviewData={store.folder ? recheckFolder : undefined}
              onNavigate={navigateTo}
              onVacancy={(v) => navigateTo('vacancies', { vacancyId: v.id })}
            />
          )}
          {page === 'profile' && (
            <ProfilePage
              {...draftProps('profile')}
              value={store.data.profile}
              vacancies={store.data.vacancies.items}
              vacanciesState={store.states.vacancies}
              state={store.states.profile}
              warning={store.warnings.profile}
              savedAt={savedAt.profile}
              focusEvidenceId={focusEvidenceId}
              onEvidenceFocusComplete={clearFocusEvidenceId}
              onSave={(v) => save('profile', v)}
              onReload={() => reloadWithUnsavedGuard('profile')}
            />
          )}
          {page === 'linkedin' && (
            <LinkedInPage
              {...draftProps('linkedin')}
              value={store.data.linkedin}
              profile={store.data.profile}
              languagesPending={linkedinLanguagesPending}
              state={store.states.linkedin}
              warning={store.warnings.linkedin}
              savedAt={savedAt.linkedin}
              onOpenEvidence={openProfileEvidence}
              onOpenPrompts={openCvPrompt}
              onSave={(v) => save('linkedin', v)}
              onReload={() => reloadWithUnsavedGuard('linkedin')}
            />
          )}
          {page === 'cv' && (
            <CVPage
              value={store.data.cv}
              connected={Boolean(store.folder || store.fallbackConnected)}
              isEmpty={isKnownEmpty('cv', store.data.cv, store.states.cv)}
              profileReady={isKnownPopulated(
                'profile',
                store.data.profile,
                store.states.profile,
              )}
              linkedinReady={isKnownPopulated(
                'linkedin',
                store.data.linkedin,
                store.states.linkedin,
              )}
              state={store.states.cv}
              warning={store.warnings.cv}
              savedAt={savedAt.cv}
              onNavigate={navigateTo}
              onReload={() => reload('cv')}
              onPromptCopied={handlePromptCopied}
            />
          )}
          {page === 'vacancies' &&
            (activeVacancy ? (
              <VacancyDetail
                value={activeVacancy}
                profile={store.data.profile}
                onOpenAdaptation={openVacancyAdaptation}
                onBack={() => navigateTo('vacancies')}
              />
            ) : (
              <VacanciesPage
                {...draftProps('vacancies')}
                value={store.data.vacancies}
                profile={store.data.profile}
                onOpenAdaptation={openVacancyAdaptation}
                state={store.states.vacancies}
                warning={store.warnings.vacancies}
                savedAt={savedAt.vacancies}
                onSave={(v) => save('vacancies', v)}
                onReload={() => reloadWithUnsavedGuard('vacancies')}
                onSelect={() => {}}
              />
            ))}
          {page === 'prompts' && (
            <PromptInboxPage
              key={adaptationVacancyId || 'catalog'}
              adaptationVacancyId={adaptationVacancyId}
              pending={{
                cv: cvPromptPending,
                cvSources: cvReview.task?.sources,
                linkedinLanguages: linkedinLanguagesPending,
                linkedinNeedsReload: [
                  'Cambio externo',
                  'Conflicto externo',
                ].includes(store.states.linkedin),
                linkedinCanCheck: Boolean(store.folder),
              }}
              onCheckLinkedIn={checkLinkedInSync}
              onConfirmLinkedIn={confirmLinkedInSync}
              onCopy={handlePromptCopied}
            />
          )}
          <footer className="page-footer">
            <span>Privado por diseño · Sin cuentas ni sincronización</span>
            {(store.folder || store.fallbackConnected) && (
              <button className="text-button" onClick={requestDisconnect}>
                {store.fallbackConnected
                  ? s.fallbackFiles.closeManual
                  : s.disconnect}
              </button>
            )}
          </footer>
        </section>
      </main>
      {fallbackOpen && (
        <FallbackDialog
          module={currentModule || 'profile'}
          data={store.data[currentModule || 'profile']}
          onClose={() => {
            setFallbackOpen(false)
            setFallbackSavedModule(null)
          }}
          onDownload={handleFallbackDownload}
        />
      )}
      {fallbackConnectOpen && (
        <FallbackConnectDialog
          busy={fallbackConnectBusy}
          error={fallbackConnectError}
          onClose={() => {
            setFallbackConnectOpen(false)
            setFallbackConnectError('')
          }}
          onFiles={connectFiles}
        />
      )}
      {folderDialog && (
        <FolderDataDialog
          scan={folderDialog}
          onClose={() => setFolderDialog(null)}
          onPrepare={prepareMissing}
          onRecheck={recheckFolder}
          onStartProfile={() => {
            if (!navigateTo('profile')) return
            setFolderDialog(null)
          }}
          onOpenPrompts={openSetupPrompt}
        />
      )}
      {conflict && (
        <Modal
          labelledBy="editor-conflict-title"
          onClose={() => !conflictBusy && setConflict(null)}
        >
          <h2 id="editor-conflict-title">
            Cambios externos en {conflict.module}.json
          </h2>
          <p>
            El archivo no se ha sobrescrito. Puedes conservar una copia de tu
            borrador antes de cargar la versión actual.
          </p>
          {conflict.fields?.length > 0 && (
            <>
              <p>Secciones modificadas en el archivo:</p>
              <ul>
                {conflict.fields.map((field) => (
                  <li key={field}>{field}</li>
                ))}
              </ul>
            </>
          )}
          {conflict.fields === null && (
            <p>No se ha podido comparar el archivo todavía.</p>
          )}
          {copyDraftStatus && <p role="status">{copyDraftStatus}</p>}
          {showDraftText && (
            <textarea
              aria-label="Copia del borrador"
              readOnly
              rows={8}
              value={JSON.stringify(
                editorSnapshots.current[conflict.module]?.draft,
                null,
                2,
              )}
              onFocus={(event) => event.target.select()}
            />
          )}
          <div className="modal-actions">
            <button
              type="button"
              className="button secondary"
              disabled={conflictBusy}
              onClick={() => setConflict(null)}
            >
              Seguir editando
            </button>
            {editorSnapshots.current[conflict.module] && (
              <button
                type="button"
                className="button secondary"
                onClick={async () => {
                  const draft = editorSnapshots.current[conflict.module]?.draft
                  try {
                    await navigator.clipboard.writeText(
                      JSON.stringify(draft, null, 2),
                    )
                    setCopyDraftStatus('Borrador copiado.')
                  } catch {
                    setShowDraftText(true)
                    setCopyDraftStatus(
                      'Selecciona y copia el borrador de forma manual.',
                    )
                  }
                }}
              >
                Copiar borrador
              </button>
            )}
            <button
              type="button"
              className="button primary"
              disabled={conflictBusy || !store.folder}
              onClick={async () => {
                if (!confirmDiscard()) return
                setConflictBusy(true)
                try {
                  const result = await reloadEditor(conflict.module)
                  if (result.ok || result.error) setConflict(null)
                } finally {
                  setConflictBusy(false)
                }
              }}
            >
              Cargar versión del archivo
            </button>
          </div>
        </Modal>
      )}
      {confirmDisconnect && (
        <DisconnectDialog
          manual={store.fallbackConnected}
          onClose={() => setConfirmDisconnect(false)}
          onDisconnect={disconnectWorkspace}
        />
      )}
    </div>
  )
}
