import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import jsconfigPaths from 'vite-jsconfig-paths';

export default defineConfig({
  plugins: [
    react(),
    jsconfigPaths(),
  ],
  base: '/demo/localseo/', // Adjusted to match the deployment path
  resolve: {
    alias: [
      {
        find: /^~(.+)/,
        replacement: path.join(process.cwd(), 'node_modules/$1')
      },
      {
        find: /^src(.+)/,
        replacement: path.join(process.cwd(), 'src/$1')
      }
    ]
  },
  server: {
    open: false, // Optional: set to false if you prefer not to open the browser automatically
    port: 3000
  },
  preview: {
    open: false, // Optional: set to false if you prefer not to open the preview automatically
    port: 3000
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  }
});
