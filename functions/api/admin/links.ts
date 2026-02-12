interface Env {
  DB: D1Database
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const result = await context.env.DB
    .prepare('SELECT * FROM links ORDER BY sort_order ASC')
    .all()

  return Response.json({ links: result.results })
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const body = await context.request.json<{
    title: string
    url: string
    icon?: string
    category?: string
    featured?: boolean
  }>()

  if (!body.title || !body.url) {
    return Response.json({ error: 'title and url are required' }, { status: 400 })
  }

  // Get next sort_order
  const maxResult = await context.env.DB
    .prepare('SELECT COALESCE(MAX(sort_order), 0) as max_order FROM links')
    .first<{ max_order: number }>()

  const nextOrder = (maxResult?.max_order || 0) + 1

  const result = await context.env.DB
    .prepare(
      'INSERT INTO links (title, url, icon, category, featured, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
    )
    .bind(
      body.title,
      body.url,
      body.icon || 'globe',
      body.category || 'information',
      body.featured ? 1 : 0,
      nextOrder
    )
    .run()

  return Response.json({ id: result.meta.last_row_id }, { status: 201 })
}
