import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://mboiman.github.io',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
    server: {
      proxy: {
        // Local preview only: the live A2A agent allows CORS for mboiman.github.io,
        // not for 127.0.0.1. Proxying keeps the branch preview usable without
        // relaxing the public agent's CORS policy.
        '/agent-proxy': {
          target: 'https://mboiman.bks-lab.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/agent-proxy/, ''),
        },
      },
    },
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'de',
        locales: { de: 'de-DE', en: 'en-US' },
      },
      filter: (page) => page !== 'https://mboiman.github.io/',
    }),
  ],
  i18n: {
    defaultLocale: 'de',
    locales: ['de', 'en'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
});
