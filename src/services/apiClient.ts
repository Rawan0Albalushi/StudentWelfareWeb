import { API_AUTH_URL, API_V1_URL } from '../config/api'

/**
 * API client: auth uses /api (Bearer + Sanctum), v1 uses /api/v1.
 * Accept: application/json and 401 → clear token + onUnauthorized per API_DOCUMENTATION.md.
 * Web client sends X-Client-Source: web so backend can distinguish from app.
 */
const TOKEN_KEY = 'student_care_token'

/** Sent on all v1 requests so backend treats donations/payments as from web (default). */
export const CLIENT_SOURCE = 'web' as const

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

export type RequestOptions = { noAuth?: boolean }

async function request(
  baseUrl: string,
  path: string,
  options: RequestInit & { params?: Record<string, string | number>; noAuth?: boolean } = {}
): Promise<Response> {
  const { params, noAuth, ...init } = options
  const url = new URL(path.startsWith('http') ? path : baseUrl + path)
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)))
  }
  const token = noAuth ? null : getToken()
  const headers: HeadersInit = {
    Accept: 'application/json',
    ...(init.headers as Record<string, string>),
  }
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }
  if (baseUrl === API_V1_URL) {
    (headers as Record<string, string>)['X-Client-Source'] = CLIENT_SOURCE
  }
  if (init.body && typeof init.body === 'string' && !headers['Content-Type']) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json'
  }
  let res: Response
  try {
    res = await fetch(url.toString(), { ...init, headers })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[API] Network error:', url.toString(), msg)
    throw new ApiError(0, { message: `اتصال الشبكة فشل: ${msg}` })
  }
  if (!res.ok) {
    const clone = res.clone()
    parseJson<unknown>(clone).then((body) => {
      console.error('[API] Error response:', res.status, url.toString(), body)
    }).catch(() => console.error('[API] Error response:', res.status, url.toString(), '(non-JSON body)'))
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
  async get<T = unknown>(path: string, options?: { params?: Record<string, string | number> }): Promise<T> {
    if (!API_AUTH_URL) throw new Error('VITE_API_URL is not set')
    const res = await request(API_AUTH_URL, path, {
      method: 'GET',
      params: options?.params,
    })
    const data = await parseJson<T>(res)
    if (!res.ok) throw new ApiError(res.status, data)
    return data
  },

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

  async post<T = unknown>(path: string, body?: unknown, options?: { noAuth?: boolean }): Promise<T> {
    if (!API_V1_URL) throw new Error('VITE_API_URL is not set')
    const res = await request(API_V1_URL, path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      noAuth: options?.noAuth,
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

  /** POST multipart/form-data (e.g. student registration). Do not set Content-Type; browser sets boundary. */
  async postForm<T = unknown>(path: string, body: FormData): Promise<T> {
    if (!API_V1_URL) throw new Error('VITE_API_URL is not set')
    const headers: HeadersInit = {}
    const token = getToken()
    if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
    ;(headers as Record<string, string>)['X-Client-Source'] = CLIENT_SOURCE
    ;(headers as Record<string, string>)['Accept'] = 'application/json'
    const res = await fetch(API_V1_URL + path, {
      method: 'POST',
      headers,
      body,
    })
    if (res.status === 401) {
      clearToken()
      onUnauthorized()
    }
    const data = await parseJson<T>(res)
    if (!res.ok) throw new ApiError(res.status, data)
    return data
  },

  /** PUT multipart/form-data (e.g. update student registration). */
  async putForm<T = unknown>(path: string, body: FormData): Promise<T> {
    if (!API_V1_URL) throw new Error('VITE_API_URL is not set')
    const headers: HeadersInit = {}
    const token = getToken()
    if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
    ;(headers as Record<string, string>)['X-Client-Source'] = CLIENT_SOURCE
    ;(headers as Record<string, string>)['Accept'] = 'application/json'
    const res = await fetch(API_V1_URL + path, {
      method: 'PUT',
      headers,
      body,
    })
    if (res.status === 401) {
      clearToken()
      onUnauthorized()
    }
    const data = await parseJson<T>(res)
    if (!res.ok) throw new ApiError(res.status, data)
    return data
  },
}

export class ApiError extends Error {
  status: number
  data: unknown
  constructor(status: number, data: unknown) {
    super(`API error ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

/** Extract user-facing message from ApiError or Error. Use with useErrorToast().showError(). */
export function getApiErrorMessage(err: unknown, fallback?: string): string {
  const msg = fallback ?? 'حدث خطأ'
  if (err instanceof ApiError && err.data && typeof err.data === 'object' && (err.data as { message?: string }).message) {
    return (err.data as { message: string }).message
  }
  if (err instanceof Error && err.message) return err.message
  return msg
}
