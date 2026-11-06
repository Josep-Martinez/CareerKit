import { copyFile, mkdir, access } from 'node:fs/promises'
import { constants } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const templateDir = path.join(root, 'templates')
const privateDir = path.join(root, 'private-data')
const modules = ['profile', 'linkedin', 'cv', 'vacancies', 'priorities']

await mkdir(privateDir, { recursive: true })
for (const module of modules) {
  const source = path.join(templateDir, `${module}.json`)
  const destination = path.join(privateDir, `${module}.json`)
  try {
    await access(destination)
    console.log(`Conservado (ya existe): private-data/${module}.json`)
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
    await copyFile(source, destination, constants.COPYFILE_EXCL)
    console.log(`Creado desde plantilla vacía: private-data/${module}.json`)
  }
}
console.log(
  'Preparación local completa. private-data/ está ignorado por Git y no se incluye en el build.',
)
