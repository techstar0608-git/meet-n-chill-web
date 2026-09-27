// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Temporary workers.dev URL — switch to the real domain once bought (+ add routes in wrangler.jsonc)
export default defineConfig({
  site: 'https://meet-n-chill.tech-star0608.workers.dev',
  trailingSlash: 'always',
  integrations: [sitemap()],
});
