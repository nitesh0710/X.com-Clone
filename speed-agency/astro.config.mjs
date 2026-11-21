// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const EXCLUDE = ['/thanks', '/admin', '/dev', '/privacy', '/terms', '/cookies', '/404'];

export default defineConfig({
  site: 'https://speedagency.online',
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'auto' },
  compressHTML: true,
  integrations: [
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname.replace(/\/$/, '');
        return !EXCLUDE.some((p) => path === p || path.startsWith(p + '/'));
      },
    }),
  ],
});
