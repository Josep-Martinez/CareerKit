const isObjectRecord = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const collectMissingProperties = (value, template, prefix = '') => {
  if (!isObjectRecord(value) || !isObjectRecord(template)) return []

  return Object.entries(template).flatMap(([key, templateValue]) => {
    const path = prefix ? `${prefix}.${key}` : key
    if (!Object.hasOwn(value, key)) return [path]
    if (isObjectRecord(templateValue) && isObjectRecord(value[key]))
      return collectMissingProperties(value[key], templateValue, path)
    return []
  })
}

const READY_STATES = new Set([
  'Cargado',
  'Guardado',
  'Guardado manual',
  'Migración pendiente',
])

export function getPendingTemplateUpdates(data, templates, states) {
  return Object.entries(templates).flatMap(([module, template]) => {
    if (!READY_STATES.has(states[module])) return []
    const fields = collectMissingProperties(data[module], template)
    return fields.length ? [{ module, fields }] : []
  })
}
