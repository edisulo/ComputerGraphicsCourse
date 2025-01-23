import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        open: true, // Automatically open the app in your browser
        port: 3000, // Set your development server port
    },
    build: {
                assetsDir: 'assets', // Directory for assets
      }
});
