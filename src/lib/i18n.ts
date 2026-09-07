export const translations = {
  en: {
    takeAction: 'TAKE ACTION',
    resources: 'RESOURCES',
    linksLabel: 'LINKS',
    shareTitle: 'SHARE THIS PAGE',
    copyLink: 'COPY LINK',
    copied: 'COPIED!',
    slogan: '✊ Woman, Life, Freedom',
    lastUpdated: 'Last updated',
    contact: 'Contact',
    terms: 'Terms',
    statDays: 'DAYS SINCE MAHSA JINA AMINI',
    statProtest: 'DAYS SINCE LATEST PROTEST',
    statBlackout: 'DAYS SINCE INTERNET BLACKOUT',
    newsTitle: 'LATEST NEWS',
    newsLoading: 'Loading news...',
    newsError: 'Unable to load news at this time.',
    newsJustNow: 'Just now',
    newsHoursAgo: 'h ago',
    newsDaysAgo: 'd ago',
    termsText:
      'This site is provided as-is with no warranties. We curate links to third-party resources and track publicly available protest data — we are not responsible for external content. By using this site, you agree to use it responsibly and solely in support of the Iranian people\u2019s struggle for freedom.',
  },
  fa: {
    takeAction: 'اقدام کنید',
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
    statDays: 'روز از مهسا ژینا امینی',
    statProtest: 'روز از آخرین اعتراضات',
    statBlackout: 'روز از قطع اینترنت',
    newsTitle: 'آخرین اخبار',
    newsLoading: 'در حال بارگذاری اخبار...',
    newsError: 'در حال حاضر امکان بارگذاری اخبار نیست.',
    newsJustNow: 'همین الان',
    newsHoursAgo: ' ساعت پیش',
    newsDaysAgo: ' روز پیش',
  },
} as const;

export type Lang = keyof typeof translations;
export type TranslationKey = keyof (typeof translations)['en'];

export function t(lang: Lang, key: TranslationKey): string {
  return translations[lang]?.[key] ?? translations.en[key] ?? key;
}

export function getDir(lang: Lang): 'rtl' | 'ltr' {
  return lang === 'fa' ? 'rtl' : 'ltr';
}

export function otherLocale(lang: Lang): Lang {
  return lang === 'en' ? 'fa' : 'en';
}

export function localePath(lang: Lang): string {
  return lang === 'en' ? '/' : '/fa/';
}

/**
 * Formats an ISO `YYYY-MM-DD` config date for display.
 *
 * `last_updated` is stored as ISO now that the admin field is a date picker,
 * but the footer used to print whatever free text was typed in ("Feb 7, 2026").
 * Formatting here keeps that reading while making the stored value machine
 * readable for the sitemap's `<lastmod>` and schema.org `dateModified`.
 *
 * Anything that is not an ISO date is passed through untouched, so a legacy
 * row written before the migration still renders as whatever it says.
 *
 * Farsi is formatted on the Gregorian calendar (`-u-ca-gregory`), matching what
 * the page showed before. Dropping that subtag would switch it to the Persian
 * calendar, which is a content decision, not a formatting one.
 */
export function formatDate(value: string, lang: Lang): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return value;

  // UTC throughout: formatting a UTC midnight in a behind-UTC zone rolls the
  // date back a day.
  return new Intl.DateTimeFormat(lang === 'fa' ? 'fa-IR-u-ca-gregory' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(parsed);
}
