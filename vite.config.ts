import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

function isPkg(id: string, name: string) {
  return id.includes(`/node_modules/${name}/`) || id.includes(`/node_modules/${name}\\`)
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        /**
         * Vendor-only splits. Do not force src/ai or curriculum into a manual
         * chunk (that re-attaches heavy shared modules to the entry via Auth).
         * Avoid matching `lucide-react` when detecting the `react` package.
         */
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (isPkg(id, '@supabase/supabase-js') || id.includes('/node_modules/@supabase/')) {
            return 'supabase'
          }
          if (isPkg(id, 'react-dom') || isPkg(id, 'react-router') || isPkg(id, 'react-router-dom') || isPkg(id, 'scheduler')) {
            return 'react-vendor'
          }
          if (isPkg(id, 'react')) {
            return 'react-vendor'
          }
          // Keep lucide with AppShell (lazy) — do not hoist a shared icons chunk onto entry
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
})
