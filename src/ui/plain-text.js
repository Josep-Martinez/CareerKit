export function plainText(value) {
  const withoutBreaks = value.replace(/<br\s*\/?>/gi, ' ')
  let clean = ''
  let insideTag = false

  for (const character of withoutBreaks) {
    if (character === '<') {
      insideTag = true
      continue
    }
    if (insideTag) {
      if (character === '>') insideTag = false
      continue
    }
    clean += character
  }

  return clean
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\\\|/g, '|')
    .trim()
}
