import './cv-document.css'

const mainHeadings =
  /^(?:perfil(?: profesional)?|resumen(?: profesional)?|sobre mí|experiencia(?: laboral| profesional| académica)?|formación(?: académica)?|educación|proyectos(?: personales| destacados)?|certificaciones|profile(?: summary)?|(?:professional )?summary|(?:professional |work )?experience|education|(?:selected |personal )?projects|certifications)$/i
const sideHeadings =
  /^(?:contacto(?: y enlaces)?|datos de contacto|enlaces|competencias(?: técnicas| clave)?|habilidades(?: técnicas| clave)?|conocimientos técnicos|(?:hard |technical )?skills|idiomas|languages|contact(?: details)?)$/i
const layoutHeadings =
  /^(?:columna lateral|columna principal|sidebar|main column)$/i

function splitDocument(text) {
  const sections = []
  let section = { heading: '', lines: [], side: false }
  let explicitColumn = null
  const addSection = () => {
    if (section.heading || section.lines.some((line) => line.trim()))
      sections.push(section)
  }
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    const markdown = /^#{1,6}\s+(.+)$/.exec(trimmed)
    const heading = (markdown?.[1] || trimmed)
      .replace(/^\*\*(.*?)\*\*:?$/, '$1')
      .replace(/:$/, '')
    const isSide = sideHeadings.test(heading)
    const isMain = mainHeadings.test(heading)

    if (layoutHeadings.test(heading)) {
      addSection()
      explicitColumn = /lateral|sidebar/i.test(heading)
      section = { heading: '', lines: [], side: explicitColumn }
    } else if (isSide || isMain || markdown) {
      addSection()
      section = {
        heading,
        lines: [],
        side: explicitColumn ?? (isSide || (!isMain && section.side)),
      }
    } else {
      section.lines.push(line)
    }
  }
  addSection()
  return sections
}

function CVSections({ sections }) {
  return sections.map(({ heading, lines }, index) => (
    <section className="cv-document-section" key={index}>
      {heading && <h2>{heading}</h2>}
      {lines.some((line) => line.trim()) && <p>{lines.join('\n').trim()}</p>}
    </section>
  ))
}

export function CVDocument({ text, spanish }) {
  const sections = splitDocument(text)
  const side = spanish ? sections.filter((section) => section.side) : []
  const main = side.length
    ? sections.filter((section) => !section.side)
    : sections
  return (
    <article
      className={`cv-document${side.length ? ' cv-document-columns' : ''}`}
      lang={spanish ? 'es' : 'en'}
      aria-label={spanish ? 'Currículum en español' : 'English CV'}
    >
      {side.length > 0 && (
        <div className="cv-document-sidebar">
          <CVSections sections={side} />
        </div>
      )}
      <div className="cv-document-main">
        <CVSections sections={main} />
      </div>
    </article>
  )
}
