import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import pluginCaderno from './servidor/plugin.mjs'

export default defineConfig(({ mode }) => {
  const raiz = process.cwd()
  return {
    // No GitHub Pages o site fica em /<nome-do-repo>/; o workflow passa isso em BASE.
    base: process.env.BASE || '/',
    plugins: [react(), pluginCaderno({ raiz, env: loadEnv(mode, raiz, '') })],
    // dados/ é salvo pelo próprio caderno; o servidor avisa a página quando muda.
    server: { port: 5177, watch: { ignored: ['**/dados/**'] } },
    build: { chunkSizeWarningLimit: 1500 },
  }
})
