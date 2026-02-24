/**
 * Backend base URL. Set in .env as VITE_API_URL (e.g. https://welfare-student.maksab.om).
 * API v1 base = ${API_BASE_URL}/api/v1  (catalog, donations, payments, me, etc.)
 * Auth base = ${API_BASE_URL}/api       (auth/register, auth/login, auth/logout)
 * @see API_DOCUMENTATION.md for full endpoint list.
 */
export const API_BASE_URL =
  typeof import.meta.env !== 'undefined' && import.meta.env.VITE_API_URL
    ? (import.meta.env.VITE_API_URL as string).replace(/\/$/, '')
    : ''

export const API_V1_URL = API_BASE_URL ? `${API_BASE_URL}/api/v1` : ''
export const API_AUTH_URL = API_BASE_URL ? `${API_BASE_URL}/api` : ''

export function resolveImageUrl(path: string | null | undefined): string {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const base = API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '')
  return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`
}
