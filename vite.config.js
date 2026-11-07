import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { localDataPlugin } from './server/local-data.js'

export default defineConfig({
  plugins: [react(), localDataPlugin()],
  base: process.env.GITHUB_PAGES === 'true' ? '/CareerKit/' : '/',
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    fs: { deny: ['**/private-data/**', '**/.env*', '**/.git/**'] },
  },
})
