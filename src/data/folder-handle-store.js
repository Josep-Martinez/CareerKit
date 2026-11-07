const DATABASE_NAME = 'careerkit-local-access'
const DATABASE_VERSION = 1
const STORE_NAME = 'directory-handles'
const HANDLE_KEY = 'private-data'

let databasePromise

function openDatabase() {
  if (databasePromise) return databasePromise
  if (typeof indexedDB === 'undefined')
    return Promise.reject(
      new Error('El navegador no permite recordar la carpeta.'),
    )

  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME))
        request.result.createObjectStore(STORE_NAME)
    }
    request.onsuccess = () => {
      request.result.onversionchange = () => {
        request.result.close()
        databasePromise = undefined
      }
      resolve(request.result)
    }
    request.onerror = () => reject(request.error)
    request.onblocked = () =>
      reject(new Error('El almacenamiento local está ocupado.'))
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
    let result
    request.onsuccess = () => {
      result = request.result
    }
    request.onerror = () => reject(request.error)
    transaction.oncomplete = () => resolve(result)
    transaction.onerror = () => reject(transaction.error || request.error)
    transaction.onabort = () => reject(transaction.error || request.error)
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
