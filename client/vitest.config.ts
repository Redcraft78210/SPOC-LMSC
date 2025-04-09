// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, // Pour utiliser des globals comme 'describe' et 'it'
    environment: 'jsdom', // Pour tester des composants React
    // Ajoutez d'autres options si nécessaire
  },
});
