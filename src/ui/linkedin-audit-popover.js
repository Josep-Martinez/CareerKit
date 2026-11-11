const priorityOrder = ['alta', 'media', 'baja']

export function summarizeAuditNotes(notes) {
  return {
    count: notes.length,
    priority:
      priorityOrder.find((priority) =>
        notes.some((note) => note.priority === priority),
      ) || 'baja',
  }
}
