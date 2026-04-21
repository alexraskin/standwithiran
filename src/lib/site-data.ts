import type { SiteData } from './types';

export async function getSiteData(db: D1Database): Promise<SiteData> {
  const [linksResult, configResult] = await Promise.all([
    db.prepare('SELECT * FROM links ORDER BY sort_order ASC').all(),
    db.prepare('SELECT key, value FROM config').all(),
  ]);

  const config: Record<string, string> = {};
  for (const row of configResult.results as { key: string; value: string }[]) {
    config[row.key] = row.value;
  }

  const links = (linksResult.results as Array<Record<string, unknown>>).map((row) => ({
    id: row.id as number,
    title: row.title as string,
    url: row.url as string,
    icon: row.icon as string,
    category: row.category as string,
    featured: row.featured === 1,
    sort_order: row.sort_order as number,
  }));

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
    contactEmail: config.contact_email || '',
    lastUpdated: config.last_updated || '',
  };
}
