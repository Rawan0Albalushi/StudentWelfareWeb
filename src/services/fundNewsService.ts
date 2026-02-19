import { api } from './apiClient'
import type { FundNews } from '../types/api'

function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[]
  const d = data as { data?: T[] }
  return d.data ?? []
}

export const fundNewsService = {
  async getList(): Promise<FundNews[]> {
    const data = await api.get<unknown>('/fund-news')
    return unwrapList<FundNews>(data)
  },

  async getFeatured(): Promise<FundNews[]> {
    const data = await api.get<unknown>('/fund-news/featured')
    return unwrapList<FundNews>(data)
  },

  async getOne(id: number): Promise<FundNews | null> {
    try {
      const data = await api.get<unknown>(`/fund-news/${id}`)
      return (data as { data?: FundNews }).data ?? (data as FundNews)
    } catch {
      return null
    }
  },
}
