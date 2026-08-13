import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Base relativa: el sitio queda servido bajo /COIPO_INCENDIO_DASHBOARD/ en
  // GitHub Pages (project site), no en la raíz del dominio. Con './' los assets
  // y los archivos de public/ se resuelven contra la URL de la página, así que
  // el mismo build funciona en la raíz, en un subdirectorio y en `vite dev`.
  // No usar rutas absolutas ('/data/...') en el código por esta misma razón.
  base: './',
  plugins: [react(), tailwindcss()],
})
