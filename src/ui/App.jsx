import React, { useEffect, useState } from 'react'
import { EMPTY } from '../data/catalog.js'
import { NAV, STRINGS as s, TITLES } from '../i18n/es.js'
import { useStorageState } from '../data/storage.js'
import { isKnownEmpty, isKnownPopulated } from './utils.js'
import { SectionIcon } from './components/SectionIcon.jsx'
import { WorkspaceGate } from './components/WorkspaceGate.jsx'
import { FallbackDialog, FolderDataDialog } from './components/DataDialogs.jsx'
import { HomePage } from './pages/HomePage.jsx'
import { ProfilePage } from './pages/ProfilePage.jsx'
import { LinkedInPage } from './pages/LinkedInPage.jsx'
import { CVPage } from './pages/CVPage.jsx'
import { VacancyDetail, VacanciesPage } from './pages/VacanciesPage.jsx'
import { PromptInboxPage } from './pages/PromptInboxPage.jsx'

export default function App() {
  const store = useStorageState()
  const [page, setPage] = useState('home')
  const [notice, setNotice] = useState('')
  const [noticeAction, setNoticeAction] = useState(null)
  const [fallbackOpen, setFallbackOpen] = useState(false)
  const [fallbackSavedModule, setFallbackSavedModule] = useState(null)
  const [folderDialog, setFolderDialog] = useState(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [vacancyId, setVacancyId] = useState(null)
  const [confirmDisconnect, setConfirmDisconnect] = useState(false)
  const [cvPromptPending, setCvPromptPending] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const currentModule = Object.hasOwn(store.data, page) ? page : null

  function showNotice(message, action = null) {
    setNotice(message)
    setNoticeAction(action)
  }

  function remindCvPrompt(message) {
    setCvPromptPending(true)
    showNotice(message, 'cv-prompt')
  }

  async function reload(module) {
    const result = await store.reload(module)
    if (result.error && store.folder) setFolderDialog(await store.recheck())
    if (result.ok && ['profile', 'linkedin'].includes(module)) {
      remindCvPrompt(s.promptInbox.sourceReloaded)
    }
    return result
  }

  function handlePromptCopied(promptId) {
    if (promptId === 'refresh-cv') setCvPromptPending(false)
    showNotice(s.promptInbox.promptCopiedNotice)
  }

  function handleFallbackDownload(module) {
    if (fallbackSavedModule !== module) return
    setFallbackSavedModule(null)
    if (['profile', 'linkedin'].includes(module))
      remindCvPrompt(s.promptInbox.fallbackSaved)
    else showNotice(s.promptInbox.downloadPrepared)
  }

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
          if (
            txt !== store.revision[key] &&
            store.revision[key] !== undefined
          ) {
            if (store.states[key] !== 'Cambio externo') {
              store.setStates((prev) => ({ ...prev, [key]: 'Cambio externo' }))
              store.setWarnings((prev) => ({
                ...prev,
                [key]: `${key}.json cambió fuera de la aplicación. Recárgalo para cargar la versión externa antes de guardar.`,
              }))
              if (['profile', 'linkedin'].includes(key))
                remindCvPrompt(s.promptInbox.sourceChanged)
            }
          }
        } catch {
          /* missing files are surfaced on initial connection */
        }
      }
    }
    const timer = setInterval(checks, 2200)
    return () => {
      cancelled = true
      clearInterval(timer)
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
    setConnecting(true)
    try {
      const result = await store.connect(options)
      if (result.fallback) showNotice(s.workspaceGate.browserUnsupported)
      else if (result.localMissing) showNotice(s.workspaceGate.localMissing)
      else if (result.wrongFolder) showNotice(s.workspaceGate.wrongFolder)
      else if (result.permissionDenied)
        showNotice(s.workspaceGate.permissionNotice)
      else if (result.connected) {
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
      } else if (result.error) showNotice(s.dataConnection.connectFailed)
    } finally {
      setConnecting(false)
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
    setFolderDialog(null)
    setPage('prompts')
    setVacancyId(null)
    showNotice('')
  }
  async function save(module, value) {
    const result = await store.save(module, value)
    if (result.conflict)
      showNotice(
        `${module}.json cambió fuera de la aplicación. Recárgalo antes de volver a guardar.`,
      )
    else if (result.needsReview) setFolderDialog(await store.recheck())
    else if (result.fallback) {
      setFallbackSavedModule(module)
      showNotice(
        'Cambios preparados. Usa «Guardar JSON individual» para guardar este módulo en tu dispositivo.',
      )
      setFallbackOpen(true)
    } else if (result.saved && ['profile', 'linkedin'].includes(module)) {
      setFallbackSavedModule(null)
      remindCvPrompt(
        module === 'profile'
          ? s.promptInbox.sourceSavedProfile
          : s.promptInbox.sourceSavedLinkedin,
      )
    } else if (result.saved) {
      setFallbackSavedModule(null)
      showNotice(`${module}.json guardado.`)
    } else if (result.error) showNotice(result.error)
  }
  function openCvPrompt() {
    setPage('prompts')
    setVacancyId(null)
    showNotice('')
  }
  const activeVacancy = store.data.vacancies.items.find(
    (v) => v.id === vacancyId,
  )

  if (!store.folder) {
    return (
      <WorkspaceGate
        connecting={connecting}
        notice={notice}
        restoreStatus={store.restoreStatus}
        hasRememberedFolder={store.hasRememberedFolder}
        onConnect={() => connect()}
        onChooseFolder={() => connect({ selectAnother: true })}
        onConnectLocal={
          import.meta.env.DEV ? () => connect({ useLocal: true }) : undefined
        }
      />
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
              onClick={() => {
                setPage(key)
                setVacancyId(null)
                setMobileNavOpen(false)
              }}
            >
              <span className="nav-icon">
                <SectionIcon name={key} />
              </span>
              {label}
              {key === 'prompts' && cvPromptPending && (
                <span
                  className="nav-badge"
                  aria-label={s.promptInbox.pendingTag}
                >
                  1
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
            {store.rememberFailed
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
              className={`connection ${store.folder ? 'is-connected' : ''}`}
            >
              <i />
              {store.folder ? 'Datos conectados' : 'Solo vista previa'}
            </span>
            <button className="avatar">C</button>
          </div>
        </header>
        <section className="page-content">
          {notice && (
            <div className="toast" role="status">
              <span>{notice}</span>
              {noticeAction === 'cv-prompt' && (
                <button className="toast-action" onClick={openCvPrompt}>
                  {s.promptInbox.openButton}
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
              connected={Boolean(store.folder)}
              states={store.states}
              onNavigate={setPage}
              onVacancy={(v) => {
                setVacancyId(v.id)
                setPage('vacancies')
              }}
            />
          )}
          {page === 'profile' && (
            <ProfilePage
              value={store.data.profile}
              state={store.states.profile}
              warning={store.warnings.profile}
              onSave={(v) => save('profile', v)}
              onReload={() => reload('profile')}
            />
          )}
          {page === 'linkedin' && (
            <LinkedInPage
              value={store.data.linkedin}
              profile={store.data.profile}
              state={store.states.linkedin}
              warning={store.warnings.linkedin}
              onSave={(v) => save('linkedin', v)}
              onReload={() => reload('linkedin')}
            />
          )}
          {page === 'cv' && (
            <CVPage
              value={store.data.cv}
              connected={Boolean(store.folder)}
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
              onNavigate={setPage}
              onReload={() => reload('cv')}
              onPromptCopied={handlePromptCopied}
            />
          )}
          {page === 'vacancies' &&
            (activeVacancy ? (
              <VacancyDetail
                value={activeVacancy}
                onBack={() => setVacancyId(null)}
              />
            ) : (
              <VacanciesPage
                value={store.data.vacancies}
                state={store.states.vacancies}
                warning={store.warnings.vacancies}
                onSave={(v) => save('vacancies', v)}
                onReload={() => reload('vacancies')}
                onSelect={() => {}}
              />
            ))}
          {page === 'prompts' && (
            <PromptInboxPage
              pending={cvPromptPending}
              onCopy={handlePromptCopied}
            />
          )}
          <footer className="page-footer">
            <span>Privado por diseño · Sin cuentas ni sincronización</span>
            {store.folder && (
              <button
                className="text-button"
                onClick={() => setConfirmDisconnect(true)}
              >
                {s.disconnect}
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
      {folderDialog && (
        <FolderDataDialog
          scan={folderDialog}
          onClose={() => setFolderDialog(null)}
          onPrepare={prepareMissing}
          onRecheck={recheckFolder}
          onStartProfile={() => {
            setFolderDialog(null)
            setPage('profile')
            setVacancyId(null)
          }}
          onOpenPrompts={openSetupPrompt}
        />
      )}
      {confirmDisconnect && (
        <div className="modal-backdrop">
          <div className="modal">
            <button
              className="modal-close"
              onClick={() => setConfirmDisconnect(false)}
            >
              ×
            </button>
            <span className="eyebrow">Privacidad</span>
            <h2>Desconectar carpeta</h2>
            <p>
              La web dejará de leer y guardar los JSON. Puedes borrar también
              los datos cargados en esta sesión.
            </p>
            <div className="modal-actions">
              <button
                className="button secondary"
                onClick={() => setConfirmDisconnect(false)}
              >
                Cancelar
              </button>
              <button
                className="button secondary"
                onClick={async () => {
                  const result = await store.disconnect(false)
                  setConfirmDisconnect(false)
                  setNotice(
                    result.persistenceCleared
                      ? s.dataConnection.disconnectedNotice
                      : s.workspaceGate.disconnectPersistenceNotice,
                  )
                }}
              >
                Desconectar
              </button>
              <button
                className="button danger"
                onClick={async () => {
                  const result = await store.disconnect(true)
                  setConfirmDisconnect(false)
                  setNotice(
                    result.persistenceCleared
                      ? s.dataConnection.disconnectedClearedNotice
                      : s.workspaceGate.disconnectPersistenceNotice,
                  )
                }}
              >
                Desconectar y borrar datos de sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
