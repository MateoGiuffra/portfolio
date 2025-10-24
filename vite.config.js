import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// Allow switching base path via env var VITE_RELATIVE
// If VITE_RELATIVE === 'true' we use a relative base ('./') so built assets
// are referenced relatively (useful for testing ./dist locally). Otherwise,
// fall back to the GitHub Pages base used previously (/portfolio).
const useRelative = process.env.VITE_RELATIVE === 'true'
const basePath = useRelative ? './' : '/portfolio/'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: basePath,
  publicDir: 'public',
})
