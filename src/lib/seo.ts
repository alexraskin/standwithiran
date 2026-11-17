import { pageHref, type Lang, type Page } from './i18n';

export const SITE_URL = 'https://standwithiran.org';
export const SITE_NAME = 'Stand With Iran';

/** 1200x630 JPEG. Regenerate if the hero art or wordmark changes. */
export const OG_IMAGE = {
  url: `${SITE_URL}/images/og-image.jpg`,
  width: 1200,
  height: 630,
  type: 'image/jpeg',
  alt: 'Stand With Iran — Woman, Life, Freedom · زن، زندگی، آزادی',
} as const;

interface SeoCopy {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  heading: string;
}

export const seo: Record<Lang, SeoCopy> = {
  en: {
    title: 'Stand With Iran — Woman, Life, Freedom | زن، زندگی، آزادی',
    description:
      'Resources, organizations, and ways to support the people of Iran in their fight for freedom, human rights, and democracy. Woman, Life, Freedom.',
    ogTitle: 'Stand With Iran — Woman, Life, Freedom',
    ogDescription:
      'Supporting the people of Iran in their fight for freedom, human rights, and democracy. Find resources, organizations, and ways to help.',
    heading: 'Woman. Life. Freedom.',
  },
  fa: {
    title: 'زن، زندگی، آزادی — همبستگی با مردم ایران | Stand With Iran',
    description:
      'منابع، سازمان‌ها و راه‌های حمایت از مردم ایران در مبارزه برای آزادی، حقوق بشر و دموکراسی. زن، زندگی، آزادی.',
    ogTitle: 'زن، زندگی، آزادی — همبستگی با مردم ایران',
    ogDescription:
      'حمایت از مردم ایران در مبارزه برای آزادی، حقوق بشر و دموکراسی. منابع، سازمان‌ها و راه‌های کمک.',
    heading: 'زن، زندگی، آزادی.',
  },
};

type Section = Exclude<Page, ''>;

/** Title (also the page's <h1>) and meta description for each section page. */
export const pageSeo: Record<Lang, Record<Section, { title: string; description: string }>> = {
  en: {
    terms: { title: 'Terms of use', description: 'Terms for using Stand With Iran, its information, and links to independent resources.' },
    privacy: { title: 'Privacy policy', description: 'How Stand With Iran handles technical information, email, and links to external services.' },
    timeline: {
      title: 'Timeline',
      description: 'Key moments in the decades-long struggle for freedom in Iran, from 1979 to today.',
    },
    victims: {
      title: 'Remember the victims',
      description:
        'Independent organizations documenting the people killed, executed and detained in Iran.',
    },
    evidence: {
      title: 'Evidence',
      description: 'Reports from independent human rights organizations on violations in Iran.',
    },
    'take-action': {
      title: 'Take action',
      description: 'Practical ways to support the people of Iran and raise awareness.',
    },
  },
  fa: {
    terms: { title: 'شرایط استفاده', description: 'شرایط استفاده از همبستگی با مردم ایران، اطلاعات و پیوندهای آن به منابع مستقل.' },
    privacy: { title: 'سیاست حریم خصوصی', description: 'نحوه برخورد همبستگی با مردم ایران با اطلاعات فنی، ایمیل و پیوند به خدمات دیگر.' },
    timeline: {
      title: 'گاه‌شمار',
      description: 'لحظه‌های کلیدی در مبارزه‌ی چنددهه‌ای برای آزادی در ایران، از ۱۳۵۷ تا امروز.',
    },
    victims: {
      title: 'یاد قربانیان',
      description:
        'سازمان‌های مستقلی که کشته‌شدگان، اعدام‌شدگان و بازداشت‌شدگان در ایران را مستند می‌کنند.',
    },
    evidence: {
      title: 'مستندات',
      description: 'گزارش‌های سازمان‌های مستقل حقوق بشری درباره‌ی نقض حقوق بشر در ایران.',
    },
    'take-action': {
      title: 'اقدام کنید',
      description: 'راه‌های عملی برای حمایت از مردم ایران و آگاه‌سازی.',
    },
  },
};

export function canonicalFor(lang: Lang, page: Page = ''): string {
  return SITE_URL + pageHref(lang, page);
}

/** Normalises the `last_updated` value to an ISO date for sitemap/schema use. */
export function isoDate(value: string): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

/**
 * ItemList describing the curated resource links, so search engines can read the
 * page's substance instead of inferring it from a wall of outbound anchors.
 */
export function resourcesItemList(
  links: { title: string; url: string; category: string }[],
  lang: Lang,
): Record<string, unknown> {
  return {
    '@type': 'ItemList',
    '@id': `${canonicalFor(lang, 'take-action')}#resources`,
    name: lang === 'fa' ? 'منابع و سازمان‌ها' : 'Resources and organizations',
    numberOfItems: links.length,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    itemListElement: links.map((link, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: link.title,
      url: link.url,
    })),
  };
}
