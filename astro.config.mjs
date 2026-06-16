// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  adapter: cloudflare(),
  site: 'https://standwithiran.org',
  i18n: {
    locales: ['en', 'fa'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: false,
    },
  },
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Anton',
      cssVariable: '--font-anton',
      display: 'block',
      fallbacks: ['Impact', 'Arial Black', 'sans-serif'],
      options: {
        variants: [
          {
            weight: 400,
            style: 'normal',
            src: ['./src/assets/fonts/anton/anton-latin.woff2'],
          },
        ],
      },
    },
    {
      provider: fontProviders.google(),
      name: 'Newsreader',
      cssVariable: '--font-newsreader',
      display: 'swap',
      weights: [400, 500, 600],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      fallbacks: ['Georgia', 'Times New Roman', 'serif'],
    },
  ],
});
