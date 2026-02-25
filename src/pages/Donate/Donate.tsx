import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageLayout } from '../../components/layout/PageLayout'
import { Container } from '../../components/ui/Container'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import { useAuth } from '../../context/AuthContext'
import { resolveImageUrl } from '../../config/api'
import { campaignService } from '../../services/campaignService'
import { donationService } from '../../services/donationService'
import { paymentService } from '../../services/paymentService'
import { ApiError, clearToken } from '../../services/apiClient'
import type { CampaignOrProgram } from '../../types/api'
import styles from './Donate.module.css'

const FALLBACK_QUICK_AMOUNTS = [10, 25, 50, 100, 200, 500]

export function Donate() {
  const { t, i18n } = useTranslation('common')
  const { isAuthenticated, user, refreshProfile } = useAuth()
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
  const [donorPhone, setDonorPhone] = useState('')
  const [campaignDetails, setCampaignDetails] = useState<CampaignOrProgram | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)

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

  useEffect(() => {
    if (!selectedId) {
      setCampaignDetails(null)
      return
    }
    const id = parseInt(selectedId, 10)
    if (!Number.isFinite(id)) {
      setCampaignDetails(null)
      return
    }
    let cancelled = false
    setDetailsLoading(true)
    const fetchDetails = selectedType === 'campaign' ? campaignService.getCampaign(id) : campaignService.getProgram(id)
    fetchDetails
      .then((item) => {
        if (!cancelled && item) setCampaignDetails(item)
        if (!cancelled && !item) setCampaignDetails(null)
      })
      .catch(() => {
        if (!cancelled) setCampaignDetails(null)
      })
      .finally(() => {
        if (!cancelled) setDetailsLoading(false)
      })
    return () => { cancelled = true }
  }, [selectedId, selectedType])

  const options = selectedType === 'campaign' ? campaigns : programs
  const lang = i18n.language === 'ar' ? 'ar' : 'en'
  const titleKey = lang === 'ar' ? 'title_ar' : 'title_en'
  const descKey = lang === 'ar' ? 'description_ar' : 'description_en'
  const impactKey = lang === 'ar' ? 'impact_description_ar' : 'impact_description_en'
  const getTitle = (item: CampaignOrProgram) =>
    (item[titleKey as keyof CampaignOrProgram] as string) || item.title || `#${item.id}`
  const getDescription = (item: CampaignOrProgram) => {
    const text = (item[descKey as keyof CampaignOrProgram] as string) || item.description || ''
    return text
  }
  const getImpact = (item: CampaignOrProgram) =>
    (item[impactKey as keyof CampaignOrProgram] as string) || item.impact_description || ''
  const getProgress = (item: CampaignOrProgram) => {
    const goal = item.goal_amount ?? 0
    const raised = item.raised_amount ?? 0
    if (goal <= 0) return 0
    return Math.min(100, Math.round((raised / goal) * 100))
  }

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
    setSubmitting(true)
    try {
      const returnOrigin = typeof window !== 'undefined' ? window.location.origin : ''
      const phoneForDonation = isAuthenticated && user?.phone
        ? user.phone.trim()
        : donorPhone.trim()
      const body = {
        amount: numAmount,
        return_origin: returnOrigin,
        ...(phoneForDonation ? { donor_phone: phoneForDonation } : {}),
        ...(selectedType === 'campaign' && id ? { campaign_id: id } : {}),
        ...(selectedType === 'program' && id ? { program_id: id } : {}),
      }
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
        <header className={styles.pageHeader}>
          <Container size="wide">
            <h1 className={styles.title}>{t('donate.title')}</h1>
            <p className={styles.subtitle}>{t('donate.subtitle')}</p>
          </Container>
        </header>
        <Container size="wide" className={styles.main}>
          <p className={styles.placeholder}>{t('common.loading')}</p>
        </Container>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <header className={styles.pageHeader}>
        <Container size="wide">
          <h1 className={styles.title}>{t('donate.title')}</h1>
          <p className={styles.subtitle}>{t('donate.subtitle')}</p>
        </Container>
      </header>

      <Container size="wide" className={styles.main}>
        <div className={styles.contentLayout}>
          {selectedId && (detailsLoading || campaignDetails) && (
            <div className={styles.campaignColumn}>
              <Card className={styles.campaignDetailCard} aria-busy={detailsLoading}>
            <CardContent>
              {detailsLoading ? (
                <div className={styles.campaignDetailSkeleton}>
                  <div className={styles.campaignDetailSkeletonImage} />
                  <div className={styles.campaignDetailSkeletonBody}>
                    <div className={styles.campaignDetailSkeletonLine} />
                    <div className={styles.campaignDetailSkeletonLine} style={{ width: '80%' }} />
                    <div className={styles.campaignDetailSkeletonLine} style={{ width: '60%' }} />
                  </div>
                </div>
              ) : campaignDetails ? (
                <article className={styles.campaignDetail} aria-labelledby="donate-campaign-title">
                  {(campaignDetails.image_url || campaignDetails.image || campaignDetails.banner_url || campaignDetails.banner) && (
                    <div
                      className={styles.campaignDetailImage}
                      style={{
                        backgroundImage: `url(${resolveImageUrl(campaignDetails.image_url || campaignDetails.image || campaignDetails.banner_url || campaignDetails.banner)})`,
                      }}
                      role="img"
                      aria-label={getTitle(campaignDetails)}
                    />
                  )}
                  <div className={styles.campaignDetailBody}>
                    <h2 id="donate-campaign-title" className={styles.campaignDetailTitle}>
                      {getTitle(campaignDetails)}
                    </h2>
                    {getDescription(campaignDetails) && (
                      <p className={styles.campaignDetailDescription}>{getDescription(campaignDetails)}</p>
                    )}
                    {getImpact(campaignDetails) && (
                      <p className={styles.campaignDetailImpact}>{getImpact(campaignDetails)}</p>
                    )}
                    {(campaignDetails.goal_amount != null && campaignDetails.goal_amount > 0) && (
                      <div className={styles.campaignDetailProgressWrap}>
                        <div
                          className={styles.campaignDetailProgress}
                          role="progressbar"
                          aria-valuenow={getProgress(campaignDetails)}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={t('campaigns.raised')}
                        >
                          <div
                            className={styles.campaignDetailProgressBar}
                            style={{ width: `${getProgress(campaignDetails)}%` }}
                          />
                        </div>
                        <p className={styles.campaignDetailMeta}>
                          {t('campaigns.raised')}: {campaignDetails.raised_amount ?? 0} {t('donate.currencyShort')} — {t('campaigns.goal')}: {campaignDetails.goal_amount} {t('donate.currencyShort')}
                        </p>
                      </div>
                    )}
                  </div>
                </article>
              ) : null}
            </CardContent>
              </Card>
            </div>
          )}

          <div className={styles.formColumn}>
            <Card className={styles.formCard}>
          <CardContent>
            <form onSubmit={handleSubmit} className={styles.form}>
              <section className={styles.formSection} aria-labelledby="donate-amounts-heading">
                <p id="donate-amounts-heading" className={styles.sectionLabel}>{t('donate.quickAmounts')}</p>
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
              </section>

              <section className={styles.formSection} aria-labelledby="donate-amount-input-heading">
                <label id="donate-amount-input-heading" className={styles.label}>
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
              </section>

              {!isAuthenticated && (
                <section className={styles.formSection}>
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
                </section>
              )}

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
          </div>
        </div>
      </Container>
    </PageLayout>
  )
}
