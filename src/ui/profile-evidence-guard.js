import { normalizeModule, validateModule } from '../data/storage.js'
import {
  collectProfileEvidence,
  findRemovedEvidenceReferences,
} from './profile-evidence.js'
import { invalidModuleStates } from './utils.js'

export async function checkEvidenceRemoval(store, nextProfile) {
  const previousProfile = store.data.profile
  const nextEvidence = collectProfileEvidence(nextProfile)
  if (
    ![...collectProfileEvidence(previousProfile).keys()].some(
      (id) => !nextEvidence.has(id),
    )
  )
    return null

  let vacancies = store.data.vacancies
  if (store.folder) {
    try {
      const handle = await store.folder.getFileHandle('vacancies.json')
      const file = await handle.getFile()
      vacancies = normalizeModule(
        'vacancies',
        JSON.parse(await file.text()),
      ).data
      if (!validateModule('vacancies', vacancies)) return { unavailable: true }
    } catch {
      return { unavailable: true }
    }
  } else if (
    !store.revision.vacancies ||
    [
      ...invalidModuleStates,
      'Pendiente de guardar',
      'Guardado manual',
    ].includes(store.states.vacancies)
  ) {
    return { unavailable: true }
  }

  const references = findRemovedEvidenceReferences(
    previousProfile,
    nextProfile,
    vacancies.items,
  )
  return references.length ? { references } : null
}
