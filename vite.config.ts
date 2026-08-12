import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        // Defaults to the local backend. Set API_PROXY to develop against a
        // deployed API, e.g. API_PROXY=https://potatoaihub.com npm run dev
        target: process.env.API_PROXY || 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
