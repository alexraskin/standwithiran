import type { Lang } from './i18n';

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
    heading: 'STAND WITH IRAN',
  },
  fa: {
    title: 'زن، زندگی، آزادی — همبستگی با مردم ایران | Stand With Iran',
    description:
      'منابع، سازمان‌ها و راه‌های حمایت از مردم ایران در مبارزه برای آزادی، حقوق بشر و دموکراسی. زن، زندگی، آزادی.',
    ogTitle: 'زن، زندگی، آزادی — همبستگی با مردم ایران',
    ogDescription:
      'حمایت از مردم ایران در مبارزه برای آزادی، حقوق بشر و دموکراسی. منابع، سازمان‌ها و راه‌های کمک.',
    heading: 'زن، زندگی، آزادی',
  },
};

export function canonicalFor(lang: Lang): string {
  return lang === 'fa' ? `${SITE_URL}/fa/` : `${SITE_URL}/`;
}

/** Normalises the D1 `last_updated` config value to an ISO date for sitemap/schema use. */
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
    '@id': `${canonicalFor(lang)}#resources`,
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
