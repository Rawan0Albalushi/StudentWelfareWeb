import { api, ApiError } from './apiClient'
import type { StudentRegistrationCard } from '../types/api'

function unwrap<T>(data: unknown): T {
  const d = data as { data?: T }
  return (d?.data !== undefined ? d.data : data) as T
}

/**
 * بطاقة تسجيل الطالب للصندوق (الهيرو).
 * GET /api/v1/student-registration-card — لا يتطلب مصادقة.
 * عند 404: لا توجد بطاقة مُعدّة — يُرجَع null.
 */
export const studentRegistrationCardService = {
  async getCard(): Promise<StudentRegistrationCard | null> {
    try {
      const data = await api.get<unknown>('/student-registration-card')
      return unwrap<StudentRegistrationCard>(data)
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null
      console.error('[studentRegistrationCardService] getCard failed:', err)
      throw err
    }
  },
}
