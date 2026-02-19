import { api } from './apiClient'
import type { Banner } from '../types/api'

function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[]
  const d = data as { data?: T[] }
  return d.data ?? []
}

export const bannerService = {
  async getList(): Promise<Banner[]> {
    const data = await api.get<unknown>('/banners')
    return unwrapList<Banner>(data)
  },

  async getFeatured(): Promise<Banner[]> {
    const data = await api.get<unknown>('/banners/featured')
    return unwrapList<Banner>(data)
  },

  async getOne(id: number): Promise<Banner | null> {
    try {
      const data = await api.get<unknown>(`/banners/${id}`)
      return (data as { data?: Banner }).data ?? (data as Banner)
    } catch {
      return null
    }
  },
}
