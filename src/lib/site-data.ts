import { getCollection, getEntry } from 'astro:content';
import type { Report, SiteData } from './types';

/** Fallbacks for stat dates, used when the YAML value is empty or unparsable.
 *  `war` has no entry on purpose: there is no defensible default start date, so
 *  the counter stays hidden until one is set. */
export const DEFAULT_STAT_DATES = {
  amini: '2022-09-16',
  protest: '2025-12-28',
  blackout: '2026-01-08',
} as const;

/** Reads src/data/*.yaml at build time. Shared by both locales and the sitemap. */
export async function getSiteData(): Promise<SiteData> {
  const [links, timeline, site] = await Promise.all([
    getCollection('links'),
    getCollection('timeline'),
    getEntry('site', 'main'),
  ]);
  if (!site) throw new Error("src/data/site.yaml has no 'main' entry");
  const s = site.data;

  return {
    links: links.map(({ id, data }) => ({ id, ...data })),
    timeline: timeline.map(({ id, data }) => ({ id, ...data })),
    banner: s.banner,
    profile: s.profile,
    stats: s.stats,
    contactEmail: s.contact_email,
    lastUpdated: s.last_updated,
  };
}

/** src/data/reports.yaml, newest first. Separate from getSiteData because only
 *  /evidence/ needs it, and Astro warns on every read while the file is empty. */
export async function getReports(): Promise<Report[]> {
  const reports = await getCollection('reports');
  return reports
    .map(({ id, data }) => ({ id, ...data }))
    .sort((a, b) => b.date.localeCompare(a.date));
}
