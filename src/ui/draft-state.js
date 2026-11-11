export function sameDraft(left, right) {
  return JSON.stringify(left) === JSON.stringify(right)
}

export function reconcileSavedDraft(current, value, savedDraft) {
  if (current.base === value) return current
  if (sameDraft(current.base, value)) return { ...current, base: value }
  if (
    savedDraft &&
    current.base === savedDraft.base &&
    sameDraft(savedDraft.submitted, value)
  ) {
    return {
      base: value,
      draft: sameDraft(current.draft, savedDraft.draft) ? value : current.draft,
    }
  }
  if (sameDraft(current.base, current.draft))
    return { base: value, draft: value }
  return current
}
