export async function copyTextToClipboard(
  text,
  {
    clipboard = globalThis.navigator?.clipboard,
    document = globalThis.document,
  } = {},
) {
  if (typeof text !== 'string') return false

  if (typeof clipboard?.writeText === 'function') {
    try {
      await clipboard.writeText(text)
      return true
    } catch {
      // Fall through to the legacy browser copy command.
    }
  }

  if (
    !document?.body ||
    typeof document.createElement !== 'function' ||
    typeof document.execCommand !== 'function'
  ) {
    return false
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.setAttribute('aria-hidden', 'true')
  Object.assign(textarea.style, {
    position: 'fixed',
    top: '0',
    left: '-9999px',
    opacity: '0',
    pointerEvents: 'none',
  })
  document.body.append(textarea)

  try {
    textarea.focus()
    textarea.select()
    return document.execCommand('copy') === true
  } catch {
    return false
  } finally {
    textarea.remove()
  }
}
