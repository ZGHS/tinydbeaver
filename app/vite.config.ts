import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import electronRenderer from 'vite-plugin-electron-renderer'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: path.join(__dirname, 'electron/main.ts'),
        onstart(options) {
          options.startup()
        },
      },
      {
        entry: path.join(__dirname, 'electron/preload.ts'),
        onstart(options) {
          options.reload()
        },
      },
    ]),
    electronRenderer(),
  ],
  server: {
    host: true
  }
})
