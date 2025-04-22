import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

import fs from 'fs';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), basicSsl()],
  server: {
    https: {
      key: fs.readFileSync('../server/certs/selfsigned.key'),
      cert: fs.readFileSync('../server/certs/selfsigned.crt')
    },
    port: 5173,
    host: '0.0.0.0'
  }
})
