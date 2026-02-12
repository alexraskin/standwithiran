interface Env {
  DB: D1Database
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const id = context.params.id
  const body = await context.request.json<{
    title?: string
    url?: string
    icon?: string
    category?: string
    featured?: boolean
    sort_order?: number
  }>()

  const fields: string[] = []
  const values: any[] = []

  if (body.title !== undefined) { fields.push('title = ?'); values.push(body.title) }
  if (body.url !== undefined) { fields.push('url = ?'); values.push(body.url) }
  if (body.icon !== undefined) { fields.push('icon = ?'); values.push(body.icon) }
  if (body.category !== undefined) { fields.push('category = ?'); values.push(body.category) }
  if (body.featured !== undefined) { fields.push('featured = ?'); values.push(body.featured ? 1 : 0) }
  if (body.sort_order !== undefined) { fields.push('sort_order = ?'); values.push(body.sort_order) }

  if (fields.length === 0) {
    return Response.json({ error: 'No fields to update' }, { status: 400 })
  }

  values.push(id)
  await context.env.DB
    .prepare(`UPDATE links SET ${fields.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run()

  return Response.json({ ok: true })
}

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const id = context.params.id

  await context.env.DB
    .prepare('DELETE FROM links WHERE id = ?')
    .bind(id)
    .run()

  return Response.json({ ok: true })
}
