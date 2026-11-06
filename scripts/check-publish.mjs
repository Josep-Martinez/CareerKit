import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

const tracked = execFileSync(
  'git',
  ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
  { encoding: 'utf8' },
)
  .split('\0')
  .filter(Boolean)
const leaked = tracked.filter(
  (file) => file === 'private-data' || file.startsWith('private-data/'),
)
if (leaked.length) {
  console.error(`ERROR: private-data está versionado: ${leaked.join(', ')}`)
  process.exit(1)
}

if (!existsSync('dist')) {
  console.error(
    'ERROR: falta dist/. Ejecuta npm run build antes de comprobar la publicación.',
  )
  process.exit(1)
}
function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}
const outputFiles = walk('dist').map((file) =>
  path.relative('dist', file).replaceAll('\\', '/'),
)
const privateOutput = outputFiles.filter((file) =>
  file.startsWith('private-data/'),
)
if (privateOutput.length) {
  console.error(
    `ERROR: datos privados aparecen en dist/: ${privateOutput.join(', ')}`,
  )
  process.exit(1)
}
const content = outputFiles
  .filter((file) => /\.(html|js|css|json|svg|txt)$/i.test(file))
  .map((file) => readFileSync(path.join('dist', file), 'utf8'))
  .join('\n')
const personalPatterns = [
  /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/,
  /linkedin\.com\/in\/[\w-]+/i,
]
function looksPersonal(text) {
  const phoneMatches = [
    ...text.matchAll(
      /(?:\+\d{1,3}[ -]?)?(?:\(\d{2,4}\)|\d{2,4})[ -](?:\d{2,4}[ -]){1,3}\d{2,4}/g,
    ),
  ]
  return (
    personalPatterns.some((pattern) => pattern.test(text)) ||
    phoneMatches.length > 0
  )
}
const versionedTextFiles = tracked.filter(
  (file) =>
    /\.(html|js|jsx|css|json|md|txt|svg|yml|yaml)$/i.test(file) &&
    existsSync(file),
)
const versionedContent = versionedTextFiles
  .map((file) => readFileSync(file, 'utf8'))
  .join('\n')
if (looksPersonal(content)) {
  console.error(
    'ERROR: se detectó contenido con forma de dato personal en el resultado publicado. Revisa dist/.',
  )
  process.exit(1)
}
if (looksPersonal(versionedContent)) {
  console.error(
    'ERROR: se detectó contenido con forma de dato personal en archivos versionados. Revisa el repositorio antes de publicar.',
  )
  process.exit(1)
}
console.log(
  'Publicación comprobada: private-data no está versionado ni aparece en dist/; no se detectaron patrones habituales de datos personales.',
)
