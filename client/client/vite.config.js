import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',   // Your Express backend port
        changeOrigin: true,                // Important for virtual hosted sites
        secure: false,                     // If using https in future
        // rewrite: (path) => path.replace(/^\/api/, ''),  // Uncomment only if you want to remove /api prefix
      },
    },
  },
});