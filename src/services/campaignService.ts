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
