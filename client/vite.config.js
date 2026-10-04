import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'monaco-editor/esm/vs/editor/editor.api.js': path.resolve(__dirname, 'node_modules/monaco-editor/esm/vs/editor/editor.api.js'),
      'monaco-editor': path.resolve(__dirname, 'node_modules/monaco-editor'),
      'y-protocols/awareness': path.resolve(__dirname, 'node_modules/y-protocols/awareness.js'),
    }
  }
})

