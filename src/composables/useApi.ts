const API_BASE = '/api'

function getToken(): string | null {
  return sessionStorage.getItem('admin_token')
}

export function setToken(token: string) {
  sessionStorage.setItem('admin_token', token)
}

export function clearToken() {
  sessionStorage.removeItem('admin_token')
}

export function isLoggedIn(): boolean {
  return !!getToken()
}

async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as any).error || `HTTP ${res.status}`)
  }

  return res.json()
}

export interface Link {
  id: number
  title: string
  url: string
  icon: string
  category: string
  featured: boolean
  sort_order: number
}

export interface SiteData {
  links: Link[]
  banner: {
    enabled: boolean
    type: string
    text: string
    link: string
  }
  profile: {
    description: string
  }
  contactEmail: string
  lastUpdated: string
}

// Public
export function fetchSiteData(): Promise<SiteData> {
  return apiFetch('/site')
}

// Admin - Auth
export async function login(password: string): Promise<string> {
  const data = await apiFetch<{ token: string }>('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  })
  setToken(data.token)
  return data.token
}

// Admin - Links
export function fetchLinks(): Promise<{ links: Link[] }> {
  return apiFetch('/admin/links')
}

export function createLink(link: Omit<Link, 'id' | 'sort_order'>): Promise<{ id: number }> {
  return apiFetch('/admin/links', {
    method: 'POST',
    body: JSON.stringify(link),
  })
}

export function updateLink(id: number, data: Partial<Link>): Promise<{ ok: boolean }> {
  return apiFetch(`/admin/links/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteLink(id: number): Promise<{ ok: boolean }> {
  return apiFetch(`/admin/links/${id}`, {
    method: 'DELETE',
  })
}

// Admin - Config
export function fetchConfig(): Promise<{ config: Record<string, string> }> {
  return apiFetch('/admin/config')
}

export function updateConfig(data: Record<string, string>): Promise<{ ok: boolean }> {
  return apiFetch('/admin/config', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}
