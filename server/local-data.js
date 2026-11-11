import { promises as fs } from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

export function localDataPlugin() {
  const names = new Set([
    'profile.json',
    'linkedin.json',
    'cv.json',
    'vacancies.json',
    'priorities.json',
    'linkedin-content.json',
  ])
  let root
  let queue = Promise.resolve()
  return {
    name: 'careerkit-local-data',
    configResolved(config) {
      root = path.join(config.root, 'private-data')
    },
    configureServer(server) {
      server.middlewares.use('/__careerkit_data', async (req, res) => {
        const send = (status, value) => {
          res.statusCode = status
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Cache-Control', 'no-store')
          res.end(JSON.stringify(value))
        }
        const host = req.headers.host
        if (
          !host ||
          !/^127\.0\.0\.1:\d+$/.test(host) ||
          (req.headers.origin && req.headers.origin !== `http://${host}`) ||
          req.headers['sec-fetch-site'] === 'cross-site'
        )
          return send(403, { error: 'Acceso local requerido' })
        const name = req.url?.split('?')[0].slice(1)
        try {
          if (!name && req.method === 'GET') {
            const stat = await fs.lstat(root).catch(() => null)
            return send(200, {
              exists: Boolean(stat?.isDirectory() && !stat.isSymbolicLink()),
            })
          }
          if (!names.has(name))
            return send(404, { error: 'Archivo no permitido' })
          const rootStat = await fs.lstat(root)
          if (!rootStat.isDirectory() || rootStat.isSymbolicLink())
            return send(403, { error: 'Carpeta no válida' })
          const file = path.join(root, name)
          const stat = await fs.lstat(file).catch(() => null)
          if (stat?.isSymbolicLink())
            return send(403, { error: 'Enlace no permitido' })
          if (req.method === 'GET')
            return send(200, { raw: await fs.readFile(file, 'utf8') })
          if (
            req.method !== 'PUT' ||
            req.headers['content-type'] !== 'application/json'
          )
            return send(405, { error: 'Operación no permitida' })
          let body = ''
          for await (const chunk of req) {
            body += chunk
            if (body.length > 5000000)
              return send(413, { error: 'Archivo demasiado grande' })
          }
          const { raw, expected } = JSON.parse(body)
          if (
            typeof raw !== 'string' ||
            !(expected === null || typeof expected === 'string')
          )
            return send(400, { error: 'Formato no válido' })
          JSON.parse(raw)
          const operation = queue.then(async () => {
            const current = await fs.readFile(file, 'utf8').catch((e) => {
              if (e.code === 'ENOENT') return null
              throw e
            })
            if (current !== expected)
              return send(409, {
                error: 'El archivo cambió fuera de la aplicación',
              })
            const temporary = path.join(root, `.${name}.${randomUUID()}.tmp`)
            try {
              await fs.writeFile(temporary, raw, { flag: 'wx', mode: 0o600 })
              await fs.rename(temporary, file)
            } finally {
              await fs.unlink(temporary).catch(() => {})
            }
            send(200, { saved: true })
          })
          queue = operation.catch(() => {})
          await operation
        } catch (error) {
          send(error.code === 'ENOENT' ? 404 : 400, {
            error: 'No se pudo acceder al archivo local',
          })
        }
      })
    },
  }
}
