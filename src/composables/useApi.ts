const API_BASE = '/api'
const SITE_CACHE_KEY = 'site_data_cache'
const SITE_CACHE_MAX_AGE = 5 * 60 * 1000 // 5 minutes

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
    ...((options.headers as Record<string, string>) || {}),
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

function getCachedSiteData(): { data: SiteData; fresh: boolean } | null {
  try {
    const raw = localStorage.getItem(SITE_CACHE_KEY)
    if (!raw) return null
    const { data, timestamp } = JSON.parse(raw) as { data: SiteData; timestamp: number }
    const age = Date.now() - timestamp
    return { data, fresh: age < SITE_CACHE_MAX_AGE }
  } catch {
    return null
  }
}

function setCachedSiteData(data: SiteData): void {
  try {
    localStorage.setItem(SITE_CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }))
  } catch { /* quota exceeded — ignore */ }
}

// Public — returns cached data immediately if available, revalidates in background
export async function fetchSiteData(options?: {
  onUpdate?: (data: SiteData) => void
}): Promise<SiteData> {
  const cached = getCachedSiteData()

  if (cached) {
    apiFetch<SiteData>('/site').then((fresh) => {
      setCachedSiteData(fresh)
      options?.onUpdate?.(fresh)
    }).catch(() => {})
    return cached.data
  }

  const data = await apiFetch<SiteData>('/site')
  setCachedSiteData(data)
  return data
}

export function invalidateSiteCache(): void {
  localStorage.removeItem(SITE_CACHE_KEY)
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
