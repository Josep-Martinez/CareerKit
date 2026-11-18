export function shouldAutoReloadExternalContent({
  module,
  hasUnsavedChanges,
  isSaving,
}) {
  return module === 'linkedin-content' && !hasUnsavedChanges && !isSaving
}
