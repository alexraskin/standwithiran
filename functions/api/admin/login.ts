interface Env {
  ADMIN_PASSWORD: string
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const body = await context.request.json<{ password: string }>()
  const password = context.env.ADMIN_PASSWORD

  if (!password) {
    return Response.json({ error: 'Admin not configured' }, { status: 500 })
  }

  if (body.password !== password) {
    return Response.json({ error: 'Invalid password' }, { status: 401 })
  }

  // Generate token: SHA-256 hash of the password
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const token = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

  return Response.json({ token })
}
