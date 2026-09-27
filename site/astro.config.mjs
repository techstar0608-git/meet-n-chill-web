// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// TODO: set to the real domain once it is connected in Cloudflare (also update src/config/site.ts)
export default defineConfig({
  site: 'https://example.com',
  trailingSlash: 'always',
  integrations: [sitemap()],
});
