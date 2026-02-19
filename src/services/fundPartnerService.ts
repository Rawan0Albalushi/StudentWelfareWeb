import { api } from './apiClient'
import type { FundPartner } from '../types/api'

function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[]
  const d = data as { data?: T[] }
  return d.data ?? []
}

export const fundPartnerService = {
  async getList(params?: { featured?: number; limit?: number }): Promise<FundPartner[]> {
    const data = await api.get<unknown>('/fund-partners', params as Record<string, number>)
    return unwrapList<FundPartner>(data)
  },

  async getFeatured(): Promise<FundPartner[]> {
    const data = await api.get<unknown>('/fund-partners/featured')
    return unwrapList<FundPartner>(data)
  },

  async getOne(id: number): Promise<FundPartner | null> {
    try {
      const data = await api.get<unknown>(`/fund-partners/${id}`)
      return (data as { data?: FundPartner }).data ?? (data as FundPartner)
    } catch {
      return null
    }
  },
}
