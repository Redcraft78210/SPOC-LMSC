import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import eslint from 'vite-plugin-eslint';
import tailwindcss from '@tailwindcss/vite'

import fs from 'fs';

// https://vite.dev/config/
export default defineConfig({
  plugins: [eslint({
    cache: false, // always lint fresh
    include: ['src/**/*.jsx', 'src/**/*.js'], // only these files
    exclude: ['node_modules'],
  })
    , react(),
  tailwindcss()],
  server: {
    https: {
      key: fs.readFileSync('../server/certs2/selfsigned.key'),
      cert: fs.readFileSync('../server/certs2/selfsigned.crt')
    },
    port: 443,
    host: '0.0.0.0'
  }
})
