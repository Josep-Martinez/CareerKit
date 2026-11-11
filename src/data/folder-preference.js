const folderPreferenceKey = 'careerkit-folder-preference'
const folderPreferenceModeKey = 'careerkit-folder-preference-mode'
const legacyDisconnectedKey = 'careerkit-disconnected'

function getStorage(name, provided) {
  if (provided) return provided
  try {
    return globalThis[name]
  } catch {
    return null
  }
}

export function getFolderPreference(localProvided, sessionProvided) {
  const local = getStorage('localStorage', localProvided)
  const session = getStorage('sessionStorage', sessionProvided)
  try {
    if (session?.getItem(folderPreferenceModeKey) === 'session') {
      const sessionChoice = session.getItem(folderPreferenceKey)
      if (sessionChoice) return sessionChoice
    }
  } catch {
    // Continue with persistent storage if session storage is unavailable.
  }

  try {
    const persistentChoice = local?.getItem(folderPreferenceKey)
    if (persistentChoice) return persistentChoice
  } catch {
    // A restricted browser may still allow a session-only choice.
  }

  try {
    const sessionChoice = session?.getItem(folderPreferenceKey)
    if (sessionChoice) return sessionChoice
    if (session?.getItem(legacyDisconnectedKey)) return 'disconnected'
  } catch {
    // Folder selection remains available for the current page session.
  }
  return null
}

export function saveFolderPreference(value, localProvided, sessionProvided) {
  const local = getStorage('localStorage', localProvided)
  const session = getStorage('sessionStorage', sessionProvided)
  let persistentModeRecorded = false
  try {
    session?.setItem(folderPreferenceModeKey, 'persistent')
    persistentModeRecorded = true
  } catch {
    // Persistent preference remains authoritative when no session override exists.
  }

  try {
    if (!local) throw new Error('localStorage unavailable')
    local.setItem(folderPreferenceKey, value)
    try {
      session?.removeItem(folderPreferenceKey)
      session?.removeItem(legacyDisconnectedKey)
      if (!persistentModeRecorded) session?.removeItem(folderPreferenceModeKey)
    } catch {
      // The persistent mode marker makes an old session value harmless.
    }
    return true
  } catch {
    try {
      session?.setItem(folderPreferenceKey, value)
      session?.setItem(folderPreferenceModeKey, 'session')
      session?.removeItem(legacyDisconnectedKey)
    } catch {
      // The in-memory preference still applies until this page is closed.
    }
    return false
  }
}
