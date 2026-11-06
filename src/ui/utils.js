import { STRINGS as s } from '../i18n/es.js'
import { hasModuleContent } from '../data/storage.js'

export const id = () => crypto.randomUUID()
export const pretty = (value) => value || s.noData
export const invalidModuleStates = [
  'Falta plantilla',
  'Revisar plantilla',
  'Cambio externo',
  'Conflicto externo',
]
export const isKnownEmpty = (name, value, state) =>
  Boolean(
    state &&
    !invalidModuleStates.includes(state) &&
    !hasModuleContent(name, value),
  )
export const isKnownPopulated = (name, value, state) =>
  Boolean(
    state &&
    !invalidModuleStates.includes(state) &&
    hasModuleContent(name, value),
  )
