async function request(name = '', options) {
  const response = await fetch(`/__careerkit_data/${name}`, options)
  if (!response.ok) {
    const error = new Error(
      response.status === 409
        ? 'El archivo cambió fuera de la aplicación. Recárgalo antes de guardar.'
        : 'No se pudo acceder al archivo local.',
    )
    error.name = response.status === 404 ? 'NotFoundError' : 'Error'
    throw error
  }
  return response.json()
}
export async function detectLocalFolder() {
  if (!import.meta.env.DEV) return null
  const status = await request().catch(() => null)
  if (!status?.exists) return null
  return {
    name: 'private-data',
    local: true,
    async getFileHandle(name, options = {}) {
      let snapshot
      try {
        snapshot = (await request(name)).raw
      } catch (error) {
        if (!options.create || error.name !== 'NotFoundError') throw error
        snapshot = null
      }
      return {
        async getFile() {
          if (snapshot === null) return { size: 0, text: async () => '' }
          snapshot = (await request(name)).raw
          return { size: new Blob([snapshot]).size, text: async () => snapshot }
        },
        async createWritable() {
          const expected = snapshot
          let raw
          return {
            async write(value) {
              raw = value
            },
            async close() {
              await request(name, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ raw, expected }),
              })
              snapshot = raw
            },
          }
        },
      }
    },
  }
}
