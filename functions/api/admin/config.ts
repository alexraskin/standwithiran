interface Env {
  DB: D1Database
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const result = await context.env.DB
    .prepare('SELECT key, value FROM config')
    .all()

  const config: Record<string, string> = {}
  for (const row of result.results as { key: string; value: string }[]) {
    config[row.key] = row.value
  }

  return Response.json({ config })
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const body = await context.request.json<Record<string, string>>()

  const allowedKeys = [
    'banner_enabled',
    'banner_type',
    'banner_text',
    'banner_link',
    'profile_description',
    'contact_email',
    'last_updated',
  ]

  const statements = []
  for (const [key, value] of Object.entries(body)) {
    if (!allowedKeys.includes(key)) continue
    statements.push(
      context.env.DB
        .prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)')
        .bind(key, value)
    )
  }

  if (statements.length > 0) {
    await context.env.DB.batch(statements)
  }

  return Response.json({ ok: true })
}
