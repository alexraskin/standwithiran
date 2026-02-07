/**
 * Translations
 *
 * English and Farsi translations for all UI text.
 */

export const translations = {
  en: {
    resources: 'RESOURCES',
    linksLabel: 'LINKS',
    shareTitle: 'SHARE THIS PAGE',
    copyLink: 'COPY LINK',
    copied: 'COPIED!',
    slogan: '✊ Woman, Life, Freedom',
    lastUpdated: 'Last updated',
    contact: 'Contact',
    terms: 'Terms',
    termsText:
      'This site is provided as-is with no warranties. We curate links to third-party resources and track publicly available protest data — we are not responsible for external content. By using this site, you agree to use it responsibly and solely in support of the Iranian people\u2019s struggle for freedom.',
  },
  fa: {
    resources: 'منابع',
    linksLabel: 'لینک',
    shareTitle: 'اشتراک‌گذاری این صفحه',
    copyLink: 'کپی لینک',
    copied: 'کپی شد!',
    slogan: 'زن، زندگی، آزادی',
    lastUpdated: 'آخرین به‌روزرسانی',
    contact: 'تماس',
    terms: 'شرایط',
    termsText:
      'این سایت بدون هیچ گارانتی ارائه می‌شود. ما لینک‌هایی به منابع شخص ثالث گردآوری می‌کنیم و داده‌های اعتراضات عمومی را پیگیری می‌کنیم.',
  },
} as const

export type Lang = keyof typeof translations
export type TranslationKey = keyof (typeof translations)['en']
