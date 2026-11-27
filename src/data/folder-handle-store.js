const DATABASE_NAME = 'careerkit-local-access'
const DATABASE_VERSION = 1
const STORE_NAME = 'directory-handles'
const HANDLE_KEY = 'private-data'
const OPERATION_TIMEOUT_MS = 2500

let databasePromise

function openDatabase() {
  if (databasePromise) return databasePromise
  if (typeof indexedDB === 'undefined')
    return Promise.reject(
      new Error('El navegador no permite recordar la carpeta.'),
    )

  databasePromise = new Promise((resolve, reject) => {
    let settled = false
    const finish = (callback, value) => {
      if (settled) return false
      settled = true
      clearTimeout(timeout)
      callback(value)
      return true
    }
    const timeout = setTimeout(() => {
      finish(reject, new Error('El almacenamiento local no respondió.'))
    }, OPERATION_TIMEOUT_MS)
    let request
    try {
      request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)
    } catch (error) {
      finish(reject, error)
      return
    }
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME))
        request.result.createObjectStore(STORE_NAME)
    }
    request.onsuccess = () => {
      if (!finish(resolve, request.result)) {
        request.result.close()
        return
      }
      request.result.onversionchange = () => {
        request.result.close()
        databasePromise = undefined
      }
    }
    request.onerror = () => finish(reject, request.error)
    request.onblocked = () =>
      finish(reject, new Error('El almacenamiento local está ocupado.'))
  }).catch((error) => {
    databasePromise = undefined
    throw error
  })

  return databasePromise
}

async function runTransaction(mode, operation) {
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode)
    const request = operation(transaction.objectStore(STORE_NAME))
    let settled = false
    let result
    const finish = (callback, value) => {
      if (settled) return
      settled = true
      clearTimeout(timeout)
      callback(value)
    }
    const timeout = setTimeout(() => {
      try {
        transaction.abort()
      } catch {
        // The transaction may already have completed.
      }
      finish(reject, new Error('El almacenamiento local no respondió.'))
    }, OPERATION_TIMEOUT_MS)
    request.onsuccess = () => {
      result = request.result
    }
    request.onerror = () => finish(reject, request.error)
    transaction.oncomplete = () => finish(resolve, result)
    transaction.onerror = () =>
      finish(reject, transaction.error || request.error)
    transaction.onabort = () =>
      finish(reject, transaction.error || request.error)
  })
}

export function loadDirectoryHandle() {
  return runTransaction('readonly', (store) => store.get(HANDLE_KEY))
}

export function rememberDirectoryHandle(handle) {
  return runTransaction('readwrite', (store) => store.put(handle, HANDLE_KEY))
}

export function forgetDirectoryHandle() {
  return runTransaction('readwrite', (store) => store.delete(HANDLE_KEY))
}
