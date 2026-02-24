import { api } from './apiClient'
import type { CampaignOrProgram, Category } from '../types/api'

function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[]
  const d = data as { data?: T[] }
  return d.data ?? []
}

export const campaignService = {
  async getPrograms(): Promise<CampaignOrProgram[]> {
    const data = await api.get<unknown>('/programs')
    return unwrapList<CampaignOrProgram>(data)
  },

  async getProgram(id: number): Promise<CampaignOrProgram | null> {
    try {
      const data = await api.get<unknown>(`/programs/${id}`)
      return (data as { data?: CampaignOrProgram }).data ?? (data as CampaignOrProgram)
    } catch {
      return null
    }
  },

  async getCampaigns(params?: { page?: number; limit?: number; per_page?: number }): Promise<CampaignOrProgram[]> {
    const data = await api.get<unknown>('/campaigns', params as Record<string, number>)
    return unwrapList<CampaignOrProgram>(data)
  },

  /**
   * Charity campaigns for home screen (matches mobile app).
   * Tries GET /campaigns first, then GET /charity-campaigns on failure.
   * Query params: page (from 1), limit, per_page.
   */
  async getCharityCampaigns(params?: { page?: number; limit?: number; per_page?: number }): Promise<CampaignOrProgram[]> {
    const q = (params ?? {}) as Record<string, number>
    try {
      const data = await api.get<unknown>('/campaigns', q)
      return unwrapList<CampaignOrProgram>(data)
    } catch {
      const data = await api.get<unknown>('/charity-campaigns', q)
      return unwrapList<CampaignOrProgram>(data)
    }
  },

  /** Fetches all campaigns by requesting all pages (tries /campaigns first, then /charity-campaigns like mobile). */
  async getAllCampaigns(): Promise<CampaignOrProgram[]> {
    const perPage = 100
    const params = { page: 1, per_page: perPage, limit: perPage }
    let list: CampaignOrProgram[]
    let raw: { data?: CampaignOrProgram[]; meta?: { last_page?: number; total?: number } }
    let path: '/campaigns' | '/charity-campaigns'
    try {
      const first = await api.get<unknown>('/campaigns', params)
      raw = first as { data?: CampaignOrProgram[]; meta?: { last_page?: number; total?: number } }
      list = unwrapList<CampaignOrProgram>(first)
      path = '/campaigns'
    } catch {
      const first = await api.get<unknown>('/charity-campaigns', params)
      raw = first as { data?: CampaignOrProgram[]; meta?: { last_page?: number; total?: number } }
      list = unwrapList<CampaignOrProgram>(first)
      path = '/charity-campaigns'
    }
    const lastPage = raw?.meta?.last_page
    if (lastPage != null && lastPage > 1) {
      for (let page = 2; page <= lastPage; page++) {
        const data = await api.get<unknown>(path, { page, per_page: perPage, limit: perPage })
        list.push(...unwrapList<CampaignOrProgram>(data))
      }
      return list
    }
    let page = 2
    while (true) {
      const data = await api.get<unknown>(path, { page, per_page: perPage, limit: perPage })
      const chunk = unwrapList<CampaignOrProgram>(data)
      if (chunk.length === 0) break
      list.push(...chunk)
      if (chunk.length < perPage) break
      page++
    }
    return list
  },

  async getCampaignsFeatured(): Promise<CampaignOrProgram[]> {
    const data = await api.get<unknown>('/campaigns/featured')
    return unwrapList<CampaignOrProgram>(data)
  },

  async getCampaignsUrgent(): Promise<CampaignOrProgram[]> {
    const data = await api.get<unknown>('/campaigns/urgent')
    return unwrapList<CampaignOrProgram>(data)
  },

  async getCampaign(id: number): Promise<CampaignOrProgram | null> {
    try {
      const data = await api.get<unknown>(`/campaigns/${id}`)
      return (data as { data?: CampaignOrProgram }).data ?? (data as CampaignOrProgram)
    } catch {
      return null
    }
  },

  async getCategories(): Promise<Category[]> {
    const data = await api.get<unknown>('/categories')
    return unwrapList<Category>(data)
  },

  async getQuickAmounts(): Promise<number[]> {
    try {
      const data = await api.get<unknown>('/donations/quick-amounts')
      const arr = Array.isArray(data) ? data : (data as { data?: number[] }).data
      return Array.isArray(arr) ? arr : [10, 25, 50, 100, 200, 500]
    } catch {
      return [10, 25, 50, 100, 200, 500]
    }
  },
}
