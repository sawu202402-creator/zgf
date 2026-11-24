import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';

const BOOT_PRECACHE_ASSETS = [
  './assets/app_icon_192.png',
  './assets/app_icon_512.png',
  './assets/bg_title.webp',
  './assets/env_ground_slab.webp',
  './assets/h18_idle_0.webp',
  './assets/wpn_sword_0.webp',
];

function emitPrecacheManifestPlugin() {
  return {
    name: 'emit-precache-manifest',
    closeBundle() {
      const distDir = path.resolve(process.cwd(), 'dist');
      const assetsDir = path.join(distDir, 'assets');
      if (!fs.existsSync(distDir)) return;
      const entries = new Set<string>(BOOT_PRECACHE_ASSETS);
      if (fs.existsSync(assetsDir)) {
        for (const file of fs.readdirSync(assetsDir).sort()) {
          if (file.endsWith('.js') || file.endsWith('.css')) {
            entries.add(`./assets/${file}`);
          }
        }
      }
      fs.writeFileSync(
        path.join(distDir, 'precache-manifest.json'),
        `${JSON.stringify([...entries], null, 2)}\n`,
        'utf8'
      );
    },
  };
}

export default defineConfig({
  base: './',
  server: {
    port: 5175,
    open: false,
  },
  plugins: [emitPrecacheManifestPlugin()],
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('/src/data/worldMap') || id.includes('\\src\\data\\worldMap')) {
            return 'data-world';
          }
          if (
            id.includes('/src/data/itemsAndSkills') ||
            id.includes('/src/data/storyAndNpcs') ||
            id.includes('/src/data/enemies') ||
            id.includes('\\src\\data\\itemsAndSkills') ||
            id.includes('\\src\\data\\storyAndNpcs') ||
            id.includes('\\src\\data\\enemies')
          ) {
            return 'data-lore';
          }
        },
      },
    },
  },
});
