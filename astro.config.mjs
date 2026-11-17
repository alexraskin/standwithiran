// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://standwithiran.org',
  // Static output, served from S3 behind CloudFront (infrastructure/terraform).
  security: {
    // Astro hashes every inline script and style it emits and renders the
    // policy as a <meta> tag in static builds. Browsers ignore frame-ancestors
    // in a meta CSP, so CloudFront's response headers policy sends it (plus
    // X-Frame-Options) as a real header.
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
      weights: [500, 600],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['Georgia', 'Times New Roman', 'serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Inter',
      cssVariable: '--font-inter',
      display: 'swap',
      weights: [400, 500, 600],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Vazirmatn',
      cssVariable: '--font-vazirmatn',
      display: 'swap',
      weights: [400, 500, 700],
      styles: ['normal'],
      subsets: ['arabic'],
      fallbacks: ['Tahoma', 'sans-serif'],
    },
  ],
});
