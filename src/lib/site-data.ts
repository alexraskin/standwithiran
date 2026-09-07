import type { LinkRow, SiteData } from './types';

/** Columns are named rather than selected with `*` so a schema change surfaces
 *  as a type error instead of an undefined field at render time. */
const LINK_COLUMNS = 'id, title, url, icon, category, featured, sort_order';

/** Fallbacks for stat dates, used when the config row is missing or unparseable.
 *  `war` has no entry on purpose: there is no defensible default start date, so
 *  the counter stays hidden until an admin sets one. */
export const DEFAULT_STAT_DATES = {
  amini: '2022-09-16',
  protest: '2025-12-28',
  blackout: '2026-01-08',
} as const;

export async function getSiteData(db: D1Database): Promise<SiteData> {
  const [linksResult, configResult] = await Promise.all([
    db.prepare(`SELECT ${LINK_COLUMNS} FROM links ORDER BY sort_order ASC`).all<LinkRow>(),
    db.prepare('SELECT key, value FROM config').all<{ key: string; value: string }>(),
  ]);

  const config: Record<string, string> = {};
  for (const row of configResult.results) {
    config[row.key] = row.value;
  }

  const links = linksResult.results.map((row) => ({ ...row, featured: row.featured === 1 }));

  return {
    links,
    banner: {
      enabled: config.banner_enabled === '1',
      type: config.banner_type || 'info',
      text: config.banner_text || '',
      link: config.banner_link || '',
    },
    profile: {
      description: config.profile_description || '',
      description_fa: config.profile_description_fa || '',
    },
    stats: {
      amini: config.stat_amini_date || DEFAULT_STAT_DATES.amini,
      protest: config.stat_protest_date || DEFAULT_STAT_DATES.protest,
      blackout: config.stat_blackout_date || DEFAULT_STAT_DATES.blackout,
      war: config.stat_war_date || '',
    },
    contactEmail: config.contact_email || '',
    lastUpdated: config.last_updated || '',
  };
}
