import { api } from './apiClient'
import { CLIENT_SOURCE } from './apiClient'

/** @see THAWANI_PAYMENT_INTEGRATION.md */

export const paymentService = {
  async confirm(body: { session_id?: string; sessionId?: string; donation_id?: string | number }): Promise<unknown> {
    const session_id = body.session_id ?? body.sessionId
    const payload: { session_id?: string; donation_id?: string | number } = {}
    if (session_id) payload.session_id = session_id
    if (body.donation_id != null) payload.donation_id = body.donation_id
    return api.post<unknown>('/payments/confirm', Object.keys(payload).length ? payload : body)
  },

  async getStatus(sessionId: string): Promise<unknown> {
    return api.get<unknown>(`/payments/status/${encodeURIComponent(sessionId)}`)
  },

  /** Retry payment for an existing donation (e.g. when session creation failed). */
  async createWithDonation(donationId: number | string, amountOmr: number, returnOrigin?: string): Promise<{ payment_url?: string; session_id?: string }> {
    const data = await api.post<unknown>('/payments/create-with-donation', {
      donation_id: donationId,
      amount_omr: amountOmr,
      source: CLIENT_SOURCE,
      ...(returnOrigin ? { return_origin: returnOrigin } : {}),
    })
    const d = data as Record<string, unknown>
    return {
      payment_url: (d.payment_url ?? d.checkout_url ?? d.redirect_url) as string | undefined,
      session_id: d.session_id as string | undefined,
    }
  },
}
