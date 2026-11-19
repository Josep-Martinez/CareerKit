export function shouldAutoReloadExternalContent({
  module,
  hasUnsavedChanges,
  isSaving,
}) {
  return module === 'linkedin-content' && !hasUnsavedChanges && !isSaving
}

export function shouldShowExternalContentReloadTask(state) {
  return ['Cambio externo', 'Conflicto externo'].includes(state)
}
