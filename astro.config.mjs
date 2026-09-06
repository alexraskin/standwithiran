// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  adapter: cloudflare(),
  site: 'https://standwithiran.org',
  // Every route reads D1 at request time. With the default 'static' output a
  // route that forgets `export const prerender = false` is prerendered at build
  // time and fails on env.DB.
  output: 'server',
  security: {
    // Astro hashes every inline script and style it emits and renders the
    // matching script-src/style-src. In SSR it sends this as a response header,
    // so frame-ancestors is honoured here. Hand-written inline scripts add
    // their own hash through src/middleware.ts.
    csp: {
      algorithm: 'SHA-256',
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "form-action 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "frame-ancestors 'none'",
      ],
    },
  },
  i18n: {
    locales: ['en', 'fa'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: false,
    },
  },
  fonts: [
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
