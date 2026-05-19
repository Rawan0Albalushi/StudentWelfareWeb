import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
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
import { CampaignAmountGoal } from '../../components/CampaignAmountGoal'
import styles from './Donate.module.css'

const FALLBACK_QUICK_AMOUNTS = [10, 25, 50, 100, 200, 500]

function getShareUrl(): string {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}${window.location.pathname}${window.location.search}`
}

export function Donate() {
  const { t, i18n } = useTranslation('common')
  const { isAuthenticated, user, refreshProfile } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const campaignIdParam = searchParams.get('campaign_id')
  const programIdParam = searchParams.get('program_id')
  const [copySuccess, setCopySuccess] = useState(false)
  const [shareMenuOpen, setShareMenuOpen] = useState(false)
  const shareMenuRef = useRef<HTMLDivElement>(null)

  // التبرع يكون فقط من خلال اختيار حملة أو برنامج — إعادة توجيه الصفحة العامة إلى الحملات
  useEffect(() => {
    if (!campaignIdParam && !programIdParam) {
      navigate('/campaigns', { replace: true })
    }
  }, [campaignIdParam, programIdParam, navigate])

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
    function handleClickOutside(e: MouseEvent) {
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target as Node)) {
        setShareMenuOpen(false)
      }
    }
    if (shareMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [shareMenuOpen])

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
  const shareUrl = getShareUrl()
  const shareTitle = campaignDetails ? getTitle(campaignDetails) : t('donate.title')

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopySuccess(true)
      window.setTimeout(() => setCopySuccess(false), 2000)
    } catch {
      setCopySuccess(false)
    }
  }

  function openShare(channel: 'whatsapp' | 'twitter' | 'facebook') {
    const encodedUrl = encodeURIComponent(shareUrl)
    const encodedTitle = encodeURIComponent(shareTitle)
    const urls: Record<typeof channel, string> = {
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    }
    window.open(urls[channel], '_blank', 'noopener,noreferrer,width=600,height=400')
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
    if (!isAuthenticated && !donorPhone.trim()) {
      setError(`${t('donate.phone')} ${t('common.required')}`)
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
        is_anonymous: false,
        ...(phoneForDonation ? { donor_phone: phoneForDonation } : {}),
        ...(selectedType === 'campaign' && id ? { campaign_id: id } : {}),
        ...(selectedType === 'program' && id ? { program_id: id } : {}),
      }
      const anonymousBody = !isAuthenticated ? { ...body, is_anonymous: true, donor_name: 'متبرع' } : body
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

  if (!campaignIdParam && !programIdParam) {
    return null
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
                    <div className={styles.campaignDetailImageWrap} ref={shareMenuRef}>
                      <div
                        className={styles.campaignDetailImage}
                        style={{
                          backgroundImage: `url(${resolveImageUrl(campaignDetails.image_url || campaignDetails.image || campaignDetails.banner_url || campaignDetails.banner)})`,
                        }}
                        role="img"
                        aria-label={getTitle(campaignDetails)}
                      />
                      <div className={styles.shareOverlay}>
                        <button
                          type="button"
                          className={styles.shareIconBtn}
                          onClick={() => setShareMenuOpen((o) => !o)}
                          aria-label={t('donate.shareCampaign')}
                          aria-expanded={shareMenuOpen}
                          aria-haspopup="true"
                        >
                          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                          </svg>
                        </button>
                        {shareMenuOpen && (
                          <div className={styles.shareDropdown} role="menu">
                            <button type="button" className={styles.shareDropdownItem} role="menuitem" onClick={() => { handleCopyLink(); setShareMenuOpen(false); }}>
                              {copySuccess ? (
                                <span className={styles.shareDropdownIcon}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg></span>
                              ) : (
                                <span className={styles.shareDropdownIcon}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></span>
                              )}
                              <span>{copySuccess ? t('donate.copied') : t('donate.copyLink')}</span>
                            </button>
                            <button type="button" className={styles.shareDropdownItem} role="menuitem" onClick={() => { openShare('whatsapp'); setShareMenuOpen(false); }}>
                              <span className={styles.shareDropdownIcon}><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></span>
                              <span>WhatsApp</span>
                            </button>
                            <button type="button" className={styles.shareDropdownItem} role="menuitem" onClick={() => { openShare('twitter'); setShareMenuOpen(false); }}>
                              <span className={styles.shareDropdownIcon}><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></span>
                              <span>X (Twitter)</span>
                            </button>
                            <button type="button" className={styles.shareDropdownItem} role="menuitem" onClick={() => { openShare('facebook'); setShareMenuOpen(false); }}>
                              <span className={styles.shareDropdownIcon}><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></span>
                              <span>Facebook</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
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
                        <CampaignAmountGoal
                          raisedAmount={campaignDetails.raised_amount}
                          goalAmount={campaignDetails.goal_amount}
                          progressSize="md"
                        />
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
                      required
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
