// vite.config.js
// Em desenvolvimento, o proxy redireciona /api para o backend local.
// Em produção (Hostinger), o nginx/proxy reverso faz esse roteamento.

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Toda chamada para /api/* em dev vai para o backend na porta 3001
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
