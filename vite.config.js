import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
  base: '/Golde_Gem2.0/',
  server: {
    port: 3000,
  },
});
