import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// VITE_RELATIVE=true -> base relativa ('./') para probar ./dist en local.
// Si no, la base de GitHub Pages (/portfolio/).
const useRelative = process.env.VITE_RELATIVE === 'true'
const basePath = useRelative ? './' : '/portfolio/'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: basePath,
  publicDir: 'public',
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
})
