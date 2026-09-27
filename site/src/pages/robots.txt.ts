import type { APIContext } from 'astro';
import { SITE } from '../config/site';

// While SITE.demo is on (temporary domain, placeholder content) search engines are kept out.
export function GET({ site }: APIContext) {
  const body = SITE.demo
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap-index.xml', site)}\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
