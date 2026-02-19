import { API_AUTH_URL, API_V1_URL } from '../config/api'

const TOKEN_KEY = 'student_care_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export type OnUnauthorized = () => void
let onUnauthorized: OnUnauthorized = () => {}
export function setOnUnauthorized(fn: OnUnauthorized): void {
  onUnauthorized = fn
}

async function request(
  baseUrl: string,
  path: string,
  options: RequestInit & { params?: Record<string, string | number> } = {}
): Promise<Response> {
  const { params, ...init } = options
  const url = new URL(path.startsWith('http') ? path : baseUrl + path)
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)))
  }
  const token = getToken()
  const headers: HeadersInit = {
    Accept: 'application/json',
    ...(init.headers as Record<string, string>),
  }
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }
  if (init.body && typeof init.body === 'string' && !headers['Content-Type']) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json'
  }
  let res: Response
  try {
    res = await fetch(url.toString(), { ...init, headers })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    throw new ApiError(0, { message: `اتصال الشبكة فشل: ${msg}` })
  }
  if (res.status === 401) {
    clearToken()
    onUnauthorized()
  }
  return res
}

function parseJson<T>(res: Response): Promise<T> {
  const ct = res.headers.get('content-type')
  if (ct?.includes('application/json')) {
    return res.json() as Promise<T>
  }
  return Promise.resolve({} as T)
}

export const authApi = {
  async post<T = unknown>(path: string, body: unknown): Promise<T> {
    if (!API_AUTH_URL) throw new Error('VITE_API_URL is not set')
    const res = await request(API_AUTH_URL, path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
    const data = await parseJson<T>(res)
    if (!res.ok) throw new ApiError(res.status, data)
    return data
  },
}

export const api = {
  async get<T = unknown>(path: string, params?: Record<string, string | number>): Promise<T> {
    if (!API_V1_URL) throw new Error('VITE_API_URL is not set')
    const res = await request(API_V1_URL, path, { method: 'GET', params })
    const data = await parseJson<T>(res)
    if (!res.ok) throw new ApiError(res.status, data)
    return data
  },

  async post<T = unknown>(path: string, body?: unknown): Promise<T> {
    if (!API_V1_URL) throw new Error('VITE_API_URL is not set')
    const res = await request(API_V1_URL, path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
    const data = await parseJson<T>(res)
    if (!res.ok) throw new ApiError(res.status, data)
    return data
  },

  async patch<T = unknown>(path: string, body: unknown): Promise<T> {
    if (!API_V1_URL) throw new Error('VITE_API_URL is not set')
    const res = await request(API_V1_URL, path, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
    const data = await parseJson<T>(res)
    if (!res.ok) throw new ApiError(res.status, data)
    return data
  },
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public data: unknown
  ) {
    super(`API error ${status}`)
    this.name = 'ApiError'
  }
}
