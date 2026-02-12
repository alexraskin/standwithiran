interface Env {
  ADMIN_PASSWORD: string
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url)

  // Allow login endpoint without auth
  if (url.pathname === '/api/admin/login' && context.request.method === 'POST') {
    return context.next()
  }

  const authHeader = context.request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = authHeader.slice(7)
  const password = context.env.ADMIN_PASSWORD

  if (!password) {
    return Response.json({ error: 'Admin not configured' }, { status: 500 })
  }

  // Verify token: it's a hex-encoded SHA-256 of the password
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const expectedToken = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

  if (token !== expectedToken) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return context.next()
}
