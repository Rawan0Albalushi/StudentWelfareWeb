import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageLayout } from '../../components/layout/PageLayout'
import { Container } from '../../components/ui/Container'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import { useAuth } from '../../context/AuthContext'
import { campaignService } from '../../services/campaignService'
import { donationService } from '../../services/donationService'
import { paymentService } from '../../services/paymentService'
import { ApiError, clearToken } from '../../services/apiClient'
import type { CampaignOrProgram } from '../../types/api'
import styles from './Donate.module.css'

const FALLBACK_QUICK_AMOUNTS = [10, 25, 50, 100, 200, 500]

export function Donate() {
  const { t, i18n } = useTranslation('common')
  const { isAuthenticated, refreshProfile } = useAuth()
  const [searchParams] = useSearchParams()
  const campaignIdParam = searchParams.get('campaign_id')
  const programIdParam = searchParams.get('program_id')

  const [campaigns, setCampaigns] = useState<CampaignOrProgram[]>([])
  const [programs, setPrograms] = useState<CampaignOrProgram[]>([])
  const [quickAmounts, setQuickAmounts] = useState<number[]>(FALLBACK_QUICK_AMOUNTS)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryDonationId, setRetryDonationId] = useState<number | null>(null)

  const [selectedType, setSelectedType] = useState<'campaign' | 'program'>('campaign')
  const [selectedId, setSelectedId] = useState<string>(campaignIdParam ?? programIdParam ?? '')
  const [amount, setAmount] = useState<string>(programIdParam || campaignIdParam ? '' : '')
  const [anonymous, setAnonymous] = useState(false)
  const [donorPhone, setDonorPhone] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (campaignIdParam) {
      setSelectedType('campaign')
      setSelectedId(campaignIdParam)
    }
    if (programIdParam) {
      setSelectedType('program')
      setSelectedId(programIdParam)
    }
  }, [campaignIdParam, programIdParam])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [campList, progList, amounts] = await Promise.all([
          campaignService.getCampaigns().catch(() => []),
          campaignService.getPrograms().catch(() => []),
          campaignService.getQuickAmounts().catch(() => FALLBACK_QUICK_AMOUNTS),
        ])
        if (!cancelled) {
          setCampaigns(campList)
          setPrograms(progList)
          setQuickAmounts(amounts.length ? amounts : FALLBACK_QUICK_AMOUNTS)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const options = selectedType === 'campaign' ? campaigns : programs
  const selectedOption = options.find((o) => String(o.id) === selectedId)
  const lang = i18n.language === 'ar' ? 'ar' : 'en'
  const titleKey = lang === 'ar' ? 'title_ar' : 'title_en'
  const getTitle = (item: CampaignOrProgram) =>
    (item[titleKey as keyof CampaignOrProgram] as string) || item.title || `#${item.id}`

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setRetryDonationId(null)
    const numAmount = parseFloat(amount)
    if (!Number.isFinite(numAmount) || numAmount < 0.001) {
      setError(t('donate.amount') + ' required')
      return
    }
    const id = selectedId ? parseInt(selectedId, 10) : undefined
    if (!id && (campaigns.length > 0 || programs.length > 0)) {
      setError(selectedType === 'campaign' ? 'Select a campaign' : 'Select a program')
      return
    }
    setSubmitting(true)
    try {
      const returnOrigin = typeof window !== 'undefined' ? window.location.origin : ''
      const body = {
        amount: numAmount,
        is_anonymous: anonymous,
        note: note.trim() || undefined,
        message: note.trim() || undefined,
        return_origin: returnOrigin,
        ...(donorPhone.trim() ? { donor_phone: donorPhone.trim() } : {}),
        ...(selectedType === 'campaign' && id ? { campaign_id: id } : {}),
        ...(selectedType === 'program' && id ? { program_id: id } : {}),
      }
      // Anonymous: backend may require donor_name; send default per THAWANI_PAYMENT_INTEGRATION.md
      const anonymousBody = !isAuthenticated ? { ...body, donor_name: 'متبرع' } : body
      let res: Awaited<ReturnType<typeof donationService.createWithPayment>>
      try {
        res = isAuthenticated
          ? await donationService.createWithPayment(body)
          : await donationService.createAnonymousWithPayment(anonymousBody)
      } catch (firstErr) {
        // If 401 (e.g. expired token), clear token and retry as anonymous so donation without login works
        if (firstErr instanceof ApiError && firstErr.status === 401) {
          clearToken()
          refreshProfile()
          res = await donationService.createAnonymousWithPayment(anonymousBody)
        } else {
          throw firstErr
        }
      }
      if (res.payment_error && !res.payment_url) {
        setError(res.payment_error || t('donate.error'))
        if (res.donation_id) setRetryDonationId(res.donation_id)
        return
      }
      if (res.payment_url) {
        window.location.href = res.payment_url
        return
      }
      setError(t('donate.error'))
    } catch (err) {
      let msg = err instanceof Error ? err.message : t('donate.error')
      if (err instanceof ApiError && err.status === 422 && err.data && typeof err.data === 'object') {
        const d = err.data as { message?: string; errors?: Record<string, string[]> }
        if (d.errors && typeof d.errors === 'object') {
          const first = Object.values(d.errors).flat().find(Boolean)
          if (first) msg = first
        } else if (typeof d.message === 'string' && d.message) {
          msg = d.message
        }
      }
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && options.length === 0) {
    return (
      <PageLayout>
        <Container size="narrow">
          <h1 className={styles.title}>{t('donate.title')}</h1>
          <p className={styles.placeholder}>{t('common.loading')}</p>
        </Container>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <Container size="narrow">
        <h1 className={styles.title}>{t('donate.title')}</h1>
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit}>
            {(campaigns.length > 0 || programs.length > 0) && (
              <>
                <label className={styles.label}>
                  Type
                  <select
                    className={styles.select}
                    value={selectedType}
                    onChange={(e) => {
                      setSelectedType(e.target.value as 'campaign' | 'program')
                      setSelectedId('')
                    }}
                  >
                    <option value="campaign">{t('nav.campaigns')}</option>
                    <option value="program">{t('nav.programs')}</option>
                  </select>
                </label>
                <label className={styles.label}>
                  {selectedType === 'campaign' ? t('nav.campaigns') : t('nav.programs')}
                  <select
                    className={styles.select}
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                  >
                    <option value="">—</option>
                    {(selectedType === 'campaign' ? campaigns : programs).map((item) => (
                      <option key={item.id} value={String(item.id)}>
                        {getTitle(item)}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            )}
            <p className={styles.label}>{t('donate.quickAmounts')}</p>
            <div className={styles.quickAmounts}>
              {quickAmounts.map((n) => (
                <button
                  key={n}
                  type="button"
                  className={amount === String(n) ? `${styles.quickBtn} ${styles.active}` : styles.quickBtn}
                  onClick={() => setAmount(String(n))}
                >
                  {n} {t('donate.currencyShort')}
                </button>
              ))}
            </div>
            <label className={styles.label}>
              {t('donate.amount')}
              <input
                type="number"
                min={0.001}
                step="any"
                className={styles.input}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                disabled={submitting}
              />
            </label>
            <label className={styles.label}>
              {t('donate.phone')}
              <input
                type="tel"
                className={styles.input}
                value={donorPhone}
                onChange={(e) => setDonorPhone(e.target.value)}
                placeholder={t('donate.phonePlaceholder')}
                disabled={submitting}
              />
            </label>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                disabled={submitting}
              />
              <span>{t('donate.anonymous')}</span>
            </label>
            <label className={styles.label}>
              {t('donate.note')}
              <textarea
                className={styles.textarea}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                disabled={submitting}
              />
            </label>
            {error && (
              <div className={styles.formErrorWrap}>
                <p className={styles.formError}>{error}</p>
                {retryDonationId != null && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={submitting}
                    onClick={async () => {
                      setError(null)
                      setSubmitting(true)
                      try {
                        const numAmount = parseFloat(amount)
                        if (!Number.isFinite(numAmount)) return
                        const origin = typeof window !== 'undefined' ? window.location.origin : ''
                        const res = await paymentService.createWithDonation(retryDonationId, numAmount, origin)
                        if (res.payment_url) window.location.href = res.payment_url
                        else setError(t('donate.error'))
                      } catch {
                        setError(t('donate.error'))
                      } finally {
                        setSubmitting(false)
                      }
                    }}
                  >
                    {t('common.retry')}
                  </Button>
                )}
              </div>
            )}
            <Button
              type="submit"
              fullWidth
              size="lg"
              className={styles.submit}
              disabled={submitting}
            >
              {submitting ? t('common.loading') : t('donate.submit')}
            </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </PageLayout>
  )
}
