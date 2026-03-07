import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/scichart') || id.includes('node_modules/scichart-react')) {
            return 'scichart'
          }
          if (id.includes('node_modules/@mui') || id.includes('node_modules/@emotion')) {
            return 'mui'
          }
        },
      },
    },
    chunkSizeWarningLimit: 2600,
  },
})
