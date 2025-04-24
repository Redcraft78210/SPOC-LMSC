import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import fs from 'fs';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    https: {
      key: fs.readFileSync('../server/certs2/selfsigned.key'),
      cert: fs.readFileSync('../server/certs2/selfsigned.crt')
    },
    port: 5173,
    host: '0.0.0.0'
  }
})
