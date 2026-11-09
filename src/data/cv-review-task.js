import { useRef, useState } from 'react'

const key = 'careerkit.cv-review-task.v1'
const languages = ['spanish', 'english']

export async function cvReviewRevision(cv) {
  return Promise.all(
    languages.map(async (language) => {
      const version = cv?.versions?.[language]
      const text = version?.masterText?.trim().replace(/\s+/g, ' ')
      if (!text) return null
      const data = new TextEncoder().encode(
        JSON.stringify([text, version.lastReviewed?.trim() || '']),
      )
      const hash = await globalThis.crypto.subtle.digest('SHA-256', data)
      return Array.from(new Uint8Array(hash), (byte) =>
        byte.toString(16).padStart(2, '0'),
      ).join('')
    }),
  )
}

export function isCvReviewComplete(task, revision) {
  return revision.every(
    (value, index) => value && value !== task.baseline[index],
  )
}

function readTask() {
  try {
    const task = JSON.parse(localStorage.getItem(key))
    if (
      Array.isArray(task?.baseline) &&
      task.baseline.length === languages.length &&
      task.baseline.every(
        (hash) => hash === null || /^[a-f0-9]{64}$/.test(hash),
      ) &&
      Array.isArray(task.sources) &&
      task.sources.every((source) => ['profile', 'linkedin'].includes(source))
    )
      return task
  } catch {
    // Storage can be unavailable in private or restricted browser sessions.
  }
  return null
}

export function useCvReviewTask() {
  const [task, setTask] = useState(readTask)
  const current = useRef(task)
  const queue = useRef(Promise.resolve())

  function update(next) {
    current.current = next
    setTask(next)
    try {
      if (next) localStorage.setItem(key, JSON.stringify(next))
      else localStorage.removeItem(key)
    } catch {
      // Keep the current session usable without persistent storage.
    }
  }

  function enqueue(operation) {
    queue.current = queue.current.then(operation).catch((error) => {
      console.error('No se pudo actualizar la tarea de revisión del CV.', error)
    })
  }

  function record(source, cv) {
    enqueue(async () => {
      const baseline = await cvReviewRevision(cv)
      const sources = [
        ...new Set([...(current.current?.sources || []), source]),
      ]
      update({ baseline, sources })
    })
  }

  function check(cv) {
    enqueue(async () => {
      if (
        current.current &&
        isCvReviewComplete(current.current, await cvReviewRevision(cv))
      )
        update(null)
    })
  }

  function clear() {
    enqueue(() => update(null))
  }

  return { task, record, check, clear }
}
