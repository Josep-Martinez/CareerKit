import './cv-document.css'
import { plainText } from '../plain-text.js'

const sectionHeadings =
  /^(?:perfil(?: profesional)?|resumen(?: profesional)?|sobre mí|experiencia(?: laboral| profesional| académica)?|formación(?: académica)?|educación|proyectos(?: personales| destacados)?|certificaciones|aptitudes|competencias(?: técnicas| clave)?|habilidades(?: técnicas| clave)?|conocimientos técnicos|idiomas|contacto(?: y enlaces)?|datos de contacto|enlaces|profile(?: summary)?|(?:professional )?summary|(?:professional |work )?experience|education|(?:selected |personal )?projects|certifications|skills|languages|contact(?: details)?)$/i

const tableSeparator = /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/

function cellsFromTableRow(line) {
  const source = line.trim().replace(/^\|/, '').replace(/\|$/, '')
  const cells = []
  let cell = ''
  let escaped = false

  for (const character of source) {
    if (character === '|' && !escaped) {
      cells.push(cell.trim())
      cell = ''
    } else {
      cell += character
    }
    escaped = character === '\\' && !escaped
    if (character !== '\\') escaped = false
  }

  cells.push(cell.trim())
  return cells
}

function extractTableColumns(text) {
  const lines = text.split(/\r?\n/)
  const separatorIndex = lines.findIndex((line) => tableSeparator.test(line))
  if (separatorIndex < 1) return extractExplicitColumns(text)

  const headings = cellsFromTableRow(lines[separatorIndex - 1])
  if (headings.length < 2) return null

  const rows = []
  for (const line of lines.slice(separatorIndex + 1)) {
    if (!line.trim()) continue
    if (!line.trim().startsWith('|')) break
    rows.push(cellsFromTableRow(line))
  }
  if (!rows.length) return null

  const cleanHeading = (heading) => plainText(heading).toLocaleLowerCase()
  const sideIndex = headings.findIndex((heading) =>
    /lateral|sidebar|left|izquierda/.test(cleanHeading(heading)),
  )
  const mainIndex = headings.findIndex((heading) =>
    /principal|main|right|derecha/.test(cleanHeading(heading)),
  )
  const leftIndex = sideIndex >= 0 ? sideIndex : 0
  const rightIndex = mainIndex >= 0 ? mainIndex : headings.length - 1
  if (leftIndex === rightIndex) return null

  const columnText = (index) =>
    rows
      .map((row) => row[index] || '')
      .filter(Boolean)
      .join('<br>')

  return {
    sidebar: columnText(leftIndex),
    main: columnText(rightIndex),
    before: lines
      .slice(0, separatorIndex - 1)
      .join('\n')
      .trim(),
    after: lines
      .slice(separatorIndex + rows.length + 1)
      .join('\n')
      .trim(),
  }
}

function extractExplicitColumns(text) {
  const lines = normalizeLines(text)
  const labels = lines.map((line) =>
    plainText(line.replace(/^#{1,6}\s+/, ''))
      .replace(/:$/, '')
      .toLowerCase(),
  )
  const sideIndex = labels.findIndex((label) =>
    /^(?:columna lateral|sidebar|left column)$/.test(label),
  )
  const mainIndex = labels.findIndex((label) =>
    /^(?:columna principal|main column|right column)$/.test(label),
  )
  if (sideIndex < 0 || mainIndex < 0 || sideIndex === mainIndex) return null

  const between = (start, end) => lines.slice(start + 1, end).join('<br>')
  const sidebar =
    sideIndex < mainIndex
      ? between(sideIndex, mainIndex)
      : lines.slice(sideIndex + 1).join('<br>')
  const main =
    mainIndex < sideIndex
      ? between(mainIndex, sideIndex)
      : lines.slice(mainIndex + 1).join('<br>')

  return {
    sidebar,
    main,
    before: lines.slice(0, Math.min(sideIndex, mainIndex)).join('<br>'),
    after: '',
  }
}

function inlineContent(value, keyPrefix) {
  const tokens = value.split(
    /(\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|`[^`]+`)/g,
  )
  return tokens.map((token, index) => {
    const key = `${keyPrefix}-${index}`
    if (token.startsWith('**') && token.endsWith('**'))
      return <strong key={key}>{token.slice(2, -2)}</strong>
    if (token.startsWith('__') && token.endsWith('__'))
      return <strong key={key}>{token.slice(2, -2)}</strong>
    if (token.startsWith('*') && token.endsWith('*'))
      return <em key={key}>{token.slice(1, -1)}</em>
    if (token.startsWith('_') && token.endsWith('_'))
      return <em key={key}>{token.slice(1, -1)}</em>
    if (token.startsWith('`') && token.endsWith('`'))
      return <code key={key}>{token.slice(1, -1)}</code>
    return token.replace(/\\\|/g, '|')
  })
}

function normalizeLines(text) {
  return text
    .replace(/<br\s*\/?>/gi, '\n')
    .split(/\r?\n/)
    .map((line) => line.trim())
}

function isUppercaseHeading(value) {
  const letters = value.match(/[\p{L}]/gu) || []
  return (
    letters.length > 2 &&
    value === value.toLocaleUpperCase() &&
    value !== value.toLocaleLowerCase()
  )
}

function headingFromLine(line) {
  const markdown = /^#{1,3}\s+(.+)$/.exec(line)
  if (markdown) return plainText(markdown[1])

  const bold = /^\*\*(.+?)\*\*:?$/.exec(line) || /^__(.+?)__:?$/.exec(line)
  const heading = plainText(bold ? bold[1] : line.replace(/:$/, ''))
  return sectionHeadings.test(heading) || isUppercaseHeading(heading)
    ? heading
    : null
}

function parseColumn(text, side) {
  const lines = normalizeLines(text)
  const content = { name: '', subtitle: '', intro: [], sections: [] }
  let currentSection = null
  let foundFirstLine = false

  for (const line of lines) {
    if (!line) {
      if (currentSection) currentSection.blocks.push({ type: 'space' })
      else if (content.intro.length) content.intro.push({ type: 'space' })
      continue
    }

    const heading = headingFromLine(line)
    if (heading) {
      currentSection = { heading, blocks: [] }
      content.sections.push(currentSection)
      foundFirstLine = true
      continue
    }

    const boldLine = /^\*\*(.+?)\*\*$/.exec(line) || /^__(.+?)__$/.exec(line)
    const clean = plainText(line.replace(/^#{1,3}\s+/, ''))

    if (!side && boldLine && !content.name) {
      content.name = clean
      foundFirstLine = true
      continue
    }
    if (!side && boldLine && content.name && !content.subtitle) {
      content.subtitle = clean
      foundFirstLine = true
      continue
    }
    if (!side && !foundFirstLine && !/^[-*•▪]\s+/.test(line)) {
      content.name = clean
      foundFirstLine = true
      continue
    }

    const bullet = /^[-*•▪]\s+(.+)$/.exec(line)
    const block = bullet
      ? { type: 'bullet', text: bullet[1] }
      : boldLine
        ? { type: 'entry-title', text: clean }
        : { type: 'paragraph', text: line }

    if (currentSection) currentSection.blocks.push(block)
    else content.intro.push(block)
    foundFirstLine = true
  }

  content.sections = content.sections.filter((section) =>
    section.blocks.some((block) => block.type !== 'space'),
  )
  return content
}

function SkillLine({ text, id }) {
  const skills = text.split(/\s+[·•]\s+/).filter(Boolean)
  if (skills.length < 3) return <>{inlineContent(text, id)}</>

  return (
    <span className="cv-document-skill-line">
      {skills.map((skill, index) => (
        <span key={`${id}-${index}`}>
          {inlineContent(skill, `${id}-${index}`)}
        </span>
      ))}
    </span>
  )
}

function CVBlocks({ blocks, side, prefix }) {
  const content = []
  let bullets = []
  const flushBullets = () => {
    if (bullets.length) {
      content.push(
        <ul
          className="cv-document-list"
          key={`${prefix}-list-${content.length}`}
        >
          {bullets.map((text, index) => (
            <li key={`${prefix}-bullet-${index}`}>
              <SkillLine text={text} id={`${prefix}-bullet-${index}`} />
            </li>
          ))}
        </ul>,
      )
      bullets = []
    }
  }

  blocks.forEach((block, index) => {
    if (block.type === 'bullet') {
      bullets.push(block.text)
      return
    }
    flushBullets()
    if (block.type === 'space') return

    const key = `${prefix}-block-${index}`
    if (block.type === 'entry-title') {
      content.push(
        <p className="cv-document-entry-title" key={key}>
          {inlineContent(block.text, key)}
        </p>,
      )
    } else {
      content.push(
        <p className="cv-document-paragraph" key={key}>
          {side ? (
            <SkillLine text={block.text} id={key} />
          ) : (
            inlineContent(block.text, key)
          )}
        </p>,
      )
    }
  })
  flushBullets()
  return content
}

function CVColumn({ text, side = false, className = '' }) {
  const parsed = parseColumn(text, side)
  return (
    <div className={`cv-document-column ${className}`}>
      {parsed.name && <h1 className="cv-document-name">{parsed.name}</h1>}
      {parsed.subtitle && (
        <p className="cv-document-subtitle">{parsed.subtitle}</p>
      )}
      {parsed.intro.length > 0 && (
        <div className="cv-document-intro">
          <CVBlocks blocks={parsed.intro} side={side} prefix="intro" />
        </div>
      )}
      {parsed.sections.map((section, index) => (
        <section
          className="cv-document-section"
          key={`${section.heading}-${index}`}
        >
          <h2>{section.heading}</h2>
          <CVBlocks
            blocks={section.blocks}
            side={side}
            prefix={`section-${index}`}
          />
        </section>
      ))}
    </div>
  )
}

export function CVDocument({ text, spanish, singleColumn = !spanish }) {
  const tableColumns = extractTableColumns(text)
  const columns = singleColumn ? null : tableColumns
  const singleColumnText = tableColumns
    ? [
        tableColumns.before,
        tableColumns.main,
        tableColumns.sidebar,
        tableColumns.after,
      ]
        .filter(Boolean)
        .join('<br>')
    : text

  return (
    <article
      className={`cv-document${columns ? ' cv-document-columns' : ' cv-document-single'}`}
      lang={spanish ? 'es' : 'en'}
      aria-label={spanish ? 'Currículum en español' : 'English CV'}
    >
      {columns && (
        <CVColumn text={columns.sidebar} side className="cv-document-sidebar" />
      )}
      <CVColumn
        text={
          columns
            ? [columns.before, columns.main, columns.after]
                .filter(Boolean)
                .join('<br>')
            : singleColumnText
        }
        className="cv-document-main"
      />
    </article>
  )
}
