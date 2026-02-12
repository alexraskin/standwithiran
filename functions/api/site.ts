interface Env {
  DB: D1Database
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const db = context.env.DB

  const [linksResult, configResult] = await Promise.all([
    db.prepare('SELECT * FROM links ORDER BY sort_order ASC').all(),
    db.prepare('SELECT key, value FROM config').all(),
  ])

  const config: Record<string, string> = {}
  for (const row of configResult.results as { key: string; value: string }[]) {
    config[row.key] = row.value
  }

  const links = (linksResult.results as any[]).map((row) => ({
    id: row.id,
    title: row.title,
    url: row.url,
    icon: row.icon,
    category: row.category,
    featured: row.featured === 1,
    sort_order: row.sort_order,
  }))

  return Response.json({
    links,
    banner: {
      enabled: config.banner_enabled === '1',
      type: config.banner_type || 'info',
      text: config.banner_text || '',
      link: config.banner_link || '',
    },
    profile: {
      description: config.profile_description || '',
    },
    contactEmail: config.contact_email || '',
    lastUpdated: config.last_updated || '',
  }, {
    headers: { 'Cache-Control': 'public, max-age=60' },
  })
}
