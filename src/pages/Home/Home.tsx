import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { setDocumentDirection } from '../../i18n/config'
import { PageLayout } from '../../components/layout/PageLayout'
import { Container } from '../../components/ui/Container'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { campaignService } from '../../services/campaignService'
import { donationService } from '../../services/donationService'
import { studentRegistrationService, type StudentRegistrationResponse } from '../../services/studentRegistrationService'
import { studentRegistrationCardService } from '../../services/studentRegistrationCardService'
import { bannerService } from '../../services/bannerService'
import { fundNewsService } from '../../services/fundNewsService'
import { fundPartnerService } from '../../services/fundPartnerService'
import { resolveImageUrl } from '../../config/api'
import type { CampaignOrProgram, RecentDonation, Banner, StudentRegistrationCard, FundNews, FundPartner } from '../../types/api'
import styles from './Home.module.css'

const FALLBACK_CARD_DESC_AR = 'سجّل طلبك للاستفادة من برامج الدعم الدراسي. استكمل بياناتك وارفع المستندات المطلوبة.'
const FALLBACK_CARD_DESC_EN = 'Register your application for student support programs. Complete your details and upload required documents.'

/** إخفاء قسم آخر التبرعات من الصفحة الرئيسية */
const SHOW_RECENT_DONATIONS = false

function formatNewsDate(isoDate: string | undefined, locale: string): string {
  if (!isoDate) return ''
  try {
    const d = new Date(isoDate)
    if (Number.isNaN(d.getTime())) return ''
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-OM' : 'en-GB', { dateStyle: 'medium' }).format(d)
  } catch {
    return ''
  }
}

function stripHtml(html: string): string {
  if (typeof document === 'undefined') return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  const div = document.createElement('div')
  div.innerHTML = html
  return (div.textContent || div.innerText || '').replace(/\s+/g, ' ').trim()
}

export function Home() {
  const { t, i18n } = useTranslation('common')
  const { isAuthenticated } = useAuth()
  const [campaigns, setCampaigns] = useState<CampaignOrProgram[]>([])
  const [recentDonations, setRecentDonations] = useState<RecentDonation[]>([])
  const [myRegistration, setMyRegistration] = useState<StudentRegistrationResponse | null | undefined>(undefined)
  const [registrationCard, setRegistrationCard] = useState<StudentRegistrationCard | null | undefined>(undefined)
  const [banners, setBanners] = useState<Banner[]>([])
  const [newsList, setNewsList] = useState<FundNews[]>([])
  const [partnersList, setPartnersList] = useState<FundPartner[]>([])
  const [loadingCampaigns, setLoadingCampaigns] = useState(true)
  const [loadingDonations, setLoadingDonations] = useState(true)
  const [loadingNews, setLoadingNews] = useState(true)
  const [loadingPartners, setLoadingPartners] = useState(true)
  const [bannerIndex, setBannerIndex] = useState(0)

  const lang = i18n.language === 'ar' ? 'ar' : 'en'
  const isRtl = (i18n.language || '').startsWith('ar')
  const titleKey = lang === 'ar' ? 'title_ar' : 'title_en'
  const getTitle = (item: CampaignOrProgram) =>
    (item[titleKey as keyof CampaignOrProgram] as string) || item.title || `#${item.id}`

  const getProgress = (item: CampaignOrProgram) => {
    const goal = Number(item.goal_amount) || 1
    const raised = Number(item.raised_amount) || 0
    return Math.min(100, Math.round((raised / goal) * 100))
  }

  const getTimeAgoKey = (iso?: string): { key: string; count?: number } => {
    if (!iso) return { key: 'home.timeAgoJustNow' }
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return { key: 'home.timeAgoJustNow' }
    const diffMs = Date.now() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    const diffWeeks = Math.floor(diffDays / 7)
    const diffMonths = Math.floor(diffDays / 30)
    if (diffMins < 1) return { key: 'home.timeAgoJustNow' }
    if (diffMins < 60) return { key: 'home.timeAgoMinutes', count: diffMins }
    if (diffHours < 24) return { key: 'home.timeAgoHours', count: diffHours }
    if (diffDays < 7) return { key: 'home.timeAgoDays', count: diffDays }
    if (diffWeeks < 4) return { key: 'home.timeAgoWeeks', count: diffWeeks }
    return { key: 'home.timeAgoMonths', count: diffMonths }
  }

  const formatDonationAmount = (amount?: number) =>
    (amount != null ? Number(amount) : 0).toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: 2 })

  useEffect(() => {
    let cancelled = false
    campaignService
      .getAllCampaigns()
      .then((list) => { if (!cancelled) setCampaigns(list) })
      .catch((err) => {
        if (!cancelled) console.error('[Home] campaigns failed:', err)
      })
      .finally(() => { if (!cancelled) setLoadingCampaigns(false) })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!SHOW_RECENT_DONATIONS) return
    let cancelled = false
    donationService
      .getRecent(10)
      .then((list) => { if (!cancelled) setRecentDonations(list) })
      .catch((err) => {
        if (!cancelled) console.error('[Home] donations/recent failed:', err)
      })
      .finally(() => { if (!cancelled) setLoadingDonations(false) })
    return () => { cancelled = true }
  }, [])

  // Keep document RTL/LTR in sync when this page is shown (e.g. after language switch)
  useEffect(() => {
    setDocumentDirection(i18n.language || 'ar')
  }, [i18n.language])

  // بطاقة تسجيل الطالب للصندوق — GET /api/v1/student-registration-card
  useEffect(() => {
    let cancelled = false
    studentRegistrationCardService
      .getCard()
      .then((card) => { if (!cancelled) setRegistrationCard(card ?? null) })
      .catch(() => { if (!cancelled) setRegistrationCard(null) })
      .finally(() => {})
    return () => { cancelled = true }
  }, [])

  // البانرات المميزة — GET /api/v1/banners/featured
  useEffect(() => {
    let cancelled = false
    bannerService
      .getFeatured()
      .then((list) => { if (!cancelled) setBanners(list || []) })
      .catch((err) => {
        if (!cancelled) console.error('[Home] banners/featured failed:', err)
        if (!cancelled) setBanners([])
      })
      .finally(() => {})
    return () => { cancelled = true }
  }, [])

  // الأخبار المميزة — GET /api/v1/fund-news (أو featured)
  useEffect(() => {
    let cancelled = false
    fundNewsService
      .getList()
      .then((list) => { if (!cancelled) setNewsList(list || []) })
      .catch((err) => {
        if (!cancelled) console.error('[Home] fund-news failed:', err)
        if (!cancelled) setNewsList([])
      })
      .finally(() => { if (!cancelled) setLoadingNews(false) })
    return () => { cancelled = true }
  }, [])

  // الشركاء — GET /api/v1/fund-partners
  useEffect(() => {
    let cancelled = false
    fundPartnerService
      .getList()
      .then((list) => { if (!cancelled) setPartnersList(list || []) })
      .catch((err) => {
        if (!cancelled) console.error('[Home] fund-partners failed:', err)
        if (!cancelled) setPartnersList([])
      })
      .finally(() => { if (!cancelled) setLoadingPartners(false) })
    return () => { cancelled = true }
  }, [])

  // Rotate hero banners every 5s
  useEffect(() => {
    if (banners.length <= 1) return
    const id = setInterval(() => {
      setBannerIndex((i) => (i + 1) % banners.length)
    }, 5000)
    return () => clearInterval(id)
  }, [banners.length])

  // جلب حالة طلب المستخدم المسجّل
  useEffect(() => {
    if (!isAuthenticated) {
      setMyRegistration(undefined)
      return
    }
    let cancelled = false
    studentRegistrationService
      .getMyRegistration()
      .then((reg) => { if (!cancelled) setMyRegistration(reg ?? null) })
      .catch(() => { if (!cancelled) setMyRegistration(null) })
    return () => { cancelled = true }
  }, [isAuthenticated])

  const regStatus = myRegistration && typeof myRegistration.status === 'string' ? String(myRegistration.status).toLowerCase() : ''
  const isRegisteredInFund = Boolean(isAuthenticated && myRegistration)
  const statusLabel =
    isRegisteredInFund && regStatus
      ? (t(`studentRegistration.status_${regStatus}`) !== `studentRegistration.status_${regStatus}` ? t(`studentRegistration.status_${regStatus}`) : t('studentRegistration.status_pending'))
      : isRegisteredInFund
        ? t('home.ctaRequestStatus')
        : t('home.ctaStartRegistration')
  const statusClass =
    regStatus === 'approved' ? styles.regCardButtonStatusApproved
      : regStatus === 'rejected' ? styles.regCardButtonStatusRejected
        : (regStatus === 'pending' || regStatus) ? styles.regCardButtonStatusPending
          : ''

  const hasBanners = banners.length > 0
  const cardHeadline =
    registrationCard && (i18n.language === 'ar' ? registrationCard.headline_ar : registrationCard.headline_en)
      ? (i18n.language === 'ar' ? registrationCard.headline_ar : registrationCard.headline_en)!
      : t('home.ctaRegister')
  const cardSubtitle =
    registrationCard && (i18n.language === 'ar' ? registrationCard.subtitle_ar : registrationCard.subtitle_en)
      ? (i18n.language === 'ar' ? registrationCard.subtitle_ar : registrationCard.subtitle_en)!
      : (lang === 'ar' ? FALLBACK_CARD_DESC_AR : FALLBACK_CARD_DESC_EN)
  const cardBgImage =
    registrationCard?.background_image_url ?? registrationCard?.background_image
      ? resolveImageUrl(registrationCard.background_image_url || registrationCard.background_image)
      : undefined

  return (
    <PageLayout noPadding>
      {/* Hero: بطاقة التسجيل دائماً أولاً؛ البانرات خلفها مع إمكانية التمرير */}
      <section className={`${styles.hero} js-hero`} aria-label="Hero" dir={isRtl ? 'rtl' : 'ltr'} lang={i18n.language || 'ar'}>
        <div className={styles.heroBg} />
        <div className={styles.heroShine} aria-hidden="true" />
        <div className={styles.heroBgIcons} aria-hidden="true">
          <span className={styles.heroBgIcon} data-icon="heart">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
          </span>
          <span className={styles.heroBgIcon} data-icon="graduation">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" /></svg>
          </span>
        </div>
        <div className={styles.heroShapes} aria-hidden="true">
          <span className={styles.heroShape} data-shape="1" />
          <span className={styles.heroShape} data-shape="2" />
        </div>
        <div className={styles.heroNoise} aria-hidden="true" />
        <div className={styles.heroCurve} aria-hidden="true" />
        <Container size="wide" className={`${styles.heroContainer} js-hero-container`}>
          <div className={`${styles.heroGrid} ${isRtl ? styles.heroGridRtl : ''} ${!hasBanners ? styles.heroGridNoBanners : ''} js-hero-grid`}>
            {/* النص: شارة، عنوان، وصف */}
            <div className={`${styles.heroBanner} js-hero-banner`} dir={isRtl ? 'rtl' : 'ltr'}>
              <p className={`${styles.heroBadge} ${styles.heroReveal1} js-hero-badge`}>{t('app.tagline')}</p>
              <h1 className={`${styles.heroTitle} ${styles.heroReveal2} js-hero-title`}>
                <span className={styles.heroTitleLine}>{t('home.heroTitle')}</span>
                <span className={styles.heroTitleAccent} aria-hidden="true" />
              </h1>
              <p className={`${styles.heroSubtitle} ${styles.heroReveal3} js-hero-subtitle`}>{t('home.heroSubtitle')}</p>
            </div>

            {/* منطقة موحّدة: بطاقة التسجيل أماماً، البانرات خلفها */}
            <div className={`${styles.heroUnified} ${!hasBanners ? styles.heroUnifiedNoBanners : ''}`}>
              {/* طبقة البانرات (خلفية) — تظهر فقط عند وجود بانرات */}
              {hasBanners && (
                <div className={styles.heroBannersBack} aria-label={t('home.bannersLabel')} dir={isRtl ? 'rtl' : 'ltr'}>
                  <div className={styles.heroBannersTrack}>
                    {banners.map((banner, i) => (
                      <div
                        key={banner.id}
                        className={`${styles.heroBannerSlide} ${i === bannerIndex ? styles.heroBannerSlideActive : ''}`}
                        style={{
                          backgroundImage: banner.image_url || banner.image
                            ? `url(${resolveImageUrl(banner.image_url || banner.image)})`
                            : undefined,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundColor: 'var(--color-primary-dark, #1a5f7a)',
                        }}
                        aria-hidden={i !== bannerIndex}
                      />
                    ))}
                  </div>
                  <div className={styles.heroBannersDots} role="tablist" aria-label={t('home.bannersLabel')}>
                    {banners.map((b, i) => (
                      <button
                        key={b.id}
                        type="button"
                        role="tab"
                        aria-selected={i === bannerIndex}
                        aria-label={t('home.bannerSlide', { number: i + 1 })}
                        className={`${styles.heroBannersDot} ${i === bannerIndex ? styles.heroBannersDotActive : ''}`}
                        onClick={() => setBannerIndex(i)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* بطاقة التسجيل — دائماً في المقدمة (محتواها من API أو افتراضي) */}
              <div className={`${styles.heroCardForeground} ${styles.heroCardWrap} ${styles.heroReveal4} js-hero-card-wrap`}>
                  <div
                    className={`${styles.regCard} js-reg-card`}
                    dir={isRtl ? 'rtl' : 'ltr'}
                    style={
                      cardBgImage
                        ? {
                            backgroundImage: `url(${cardBgImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }
                        : undefined
                    }
                  >
                    {cardBgImage && <span className={styles.regCardOverlay} aria-hidden="true" />}
                    <span className={styles.regCardIcon} aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </span>
                    <h3 className={`${styles.regCardTitle} js-reg-card-title`}>{cardHeadline}</h3>
                    <p className={`${styles.regCardDesc} js-reg-card-desc`}>{cardSubtitle}</p>
                    <Link
                      to="/student-registration"
                      className={`${styles.regCardButton} ${statusClass} js-reg-card-button`}
                    >
                      {statusLabel}
                      <span className={`${styles.regCardArrow} js-reg-card-arrow`} aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Featured campaigns + donations: same horizontal padding as other pages */}
      <div className={styles.pageGutter}>
      <section id="campaigns" className={styles.sectionCampaigns}>
        <Container size="wide">
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>{t('home.campaignsSectionTitle')}</h2>
            <p className={styles.sectionSubtitle}>{t('campaigns.subtitle')}</p>
          </div>
          {loadingCampaigns ? (
            <div className={styles.loadingState}>
              <div className={styles.loadingDots} aria-hidden="true">
                <span /><span /><span />
              </div>
              <p className={styles.placeholderText}>{t('common.loading')}</p>
            </div>
          ) : campaigns.length === 0 ? (
            <p className={styles.placeholderText}>{t('campaigns.noCampaigns')}</p>
          ) : (
            <>
              <div className={styles.cardGrid}>
                {campaigns.map((item) => (
                  <article key={item.id} className={styles.campaignCard}>
                    <Link to={`/donate?campaign_id=${item.id}`} className={styles.campaignCardLink}>
                      <div
                        className={styles.campaignCardImage}
                        style={{
                          backgroundImage: item.image_url || item.image || item.banner_url || item.banner
                            ? `url(${resolveImageUrl(item.image_url || item.image || item.banner_url || item.banner)})`
                            : undefined,
                        }}
                      >
                        <div className={styles.campaignCardOverlay} />
                      </div>
                      <div className={styles.campaignCardBody}>
                        <h3 className={styles.campaignCardTitle}>{getTitle(item)}</h3>
                        <div className={styles.campaignProgress}>
                          <div
                            className={styles.campaignProgressBar}
                            style={{ width: `${getProgress(item)}%` }}
                            role="progressbar"
                            aria-valuenow={getProgress(item)}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                        <p className={styles.campaignMeta}>
                          {t('campaigns.raised')}: {item.raised_amount ?? 0} OMR — {t('campaigns.goal')}: {item.goal_amount ?? 0} OMR
                        </p>
                      </div>
                      <div className={styles.campaignCardFooter}>
                        <span className={styles.campaignCardCta}>{t('campaigns.donate')}</span>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
              <div className={styles.sectionFooter}>
                <Link to="/campaigns">
                  <Button variant="outline" size="lg">{t('home.viewAll')}</Button>
                </Link>
              </div>
            </>
          )}
        </Container>
      </section>

      {/* News section — من الباكند /fund-news */}
      <section id="news" className={styles.sectionNews} aria-labelledby="news-heading" dir={isRtl ? 'rtl' : 'ltr'}>
        <Container size="wide">
          <div className={styles.sectionHead}>
            <span className={styles.sectionBadge}>{t('news.featured')}</span>
            <h2 id="news-heading" className={styles.sectionTitle}>{t('nav.news')}</h2>
            <p className={styles.sectionSubtitle}>{t('news.subtitle')}</p>
          </div>
          {loadingNews ? (
            <div className={styles.newsGrid} aria-busy="true">
              {[1, 2, 3, 4].map((i) => (
                <article key={i} className={styles.newsCardFeatured}>
                  <div className={styles.newsCardImage} style={{ background: 'var(--gradient-dominant)' }} />
                  <div className={styles.newsCardContent}>
                    <span className={styles.newsDate} />
                    <span className={styles.newsCardTitle} style={{ width: '80%', height: '1.5em', background: 'var(--color-muted)', borderRadius: 4 }} />
                    <span className={styles.newsExcerpt} style={{ display: 'block', width: '100%', height: '3em', background: 'var(--color-muted)', borderRadius: 4, marginTop: 8 }} />
                  </div>
                </article>
              ))}
            </div>
          ) : newsList.length === 0 ? (
            <p className={styles.sectionSubtitle} style={{ marginTop: '1rem' }}>{t('news.noNews')}</p>
          ) : (
            <div className={styles.newsGrid}>
              {newsList.map((item) => {
                const titleKey = lang === 'ar' ? 'title_ar' : 'title_en'
                const contentKey = lang === 'ar' ? 'content_ar' : 'content_en'
                const title = (item[titleKey as keyof FundNews] as string) || `#${item.id}`
                const content = (item[contentKey as keyof FundNews] as string) || ''
                const excerpt = stripHtml(content).slice(0, 120) + (stripHtml(content).length > 120 ? '…' : '')
                const imgUrl = resolveImageUrl(item.image_url ?? item.image)
                return (
                  <article key={item.id} className={styles.newsCardFeatured}>
                    <div className={styles.newsCardImage} style={imgUrl ? { backgroundImage: `url(${imgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: 'var(--gradient-dominant)' }}>
                      {item.is_featured && (
                        <span className={styles.newsCardBadgeFeatured}>{t('news.featured')}</span>
                      )}
                      {!imgUrl && (
                        <span className={styles.newsCardIcon} aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" /><path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8V6Z" /></svg>
                        </span>
                      )}
                    </div>
                    <div className={styles.newsCardContent}>
                      <time className={styles.newsDate} dateTime={item.published_at ?? ''}>{formatNewsDate(item.published_at, lang)}</time>
                      <h3 className={styles.newsCardTitle}>{title}</h3>
                      <p className={styles.newsExcerpt}>{excerpt}</p>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </Container>
      </section>

      {SHOW_RECENT_DONATIONS && (
      <>
      {/* Recent donations — شريط بعرض الصفحة مع تمرير مستمر، قبل الشركاء */}
      <section className={styles.sectionDonations} aria-labelledby="recent-donations-heading" dir={isRtl ? 'rtl' : 'ltr'}>
        <Container size="wide">
          <div className={styles.sectionHead}>
            <h2 id="recent-donations-heading" className={styles.sectionTitle}>{t('home.recentDonations')}</h2>
            <p className={styles.sectionSubtitle}>{t('home.recentDonationsSubtitle')}</p>
          </div>
          {loadingDonations ? (
            <div className={styles.donationStripLoading}>
              <div className={styles.loadingDots} aria-hidden="true">
                <span /><span /><span />
              </div>
            </div>
          ) : recentDonations.length === 0 ? (
            <p className={styles.donationStripEmpty}>{t('home.recentDonationsSubtitle')}</p>
          ) : null}
        </Container>
        {!loadingDonations && recentDonations.length > 0 && (
          <div className={styles.donationStripTrack} aria-hidden="true">
            <ul className={styles.donationStripRow} role="list">
              {[...recentDonations, ...recentDonations].map((d, i) => {
                const donation = d as RecentDonation
                const timeAgo = getTimeAgoKey(donation.created_at)
                return (
                  <li key={`${donation.id ?? i}-${i}`} className={styles.donationStripItem}>
                    <span className={styles.donationStripAvatar} aria-hidden="true">♥</span>
                    <div className={styles.donationStripContent}>
                      <span className={styles.donationStripAmount}>
                        {formatDonationAmount(donation.amount)} {t('donate.currencyShort', 'OMR')}
                      </span>
                      <span className={styles.donationStripName}>{t('home.benefactorLabel')}</span>
                      {timeAgo.key !== 'home.timeAgoJustNow' && (
                        <span className={styles.donationStripTime}>
                          {t(timeAgo.key, { count: timeAgo.count ?? 0 })}
                        </span>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </section>
      </>
      )}

      {/* Partners section — من الباكند /fund-partners */}
      <section id="partners" className={styles.sectionPartners} aria-labelledby="partners-heading" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className={styles.partnersBg} aria-hidden="true" />
        <Container size="wide">
          <div className={styles.sectionHead}>
            <span className={`${styles.sectionBadge} ${styles.sectionBadgeLight}`}>{t('partners.featured')}</span>
            <h2 id="partners-heading" className={styles.sectionTitlePartners}>{t('nav.partners')}</h2>
            <p className={styles.sectionSubtitlePartners}>{t('partners.subtitle')}</p>
          </div>
          {loadingPartners ? (
            <div className={styles.partnersTrack}>
              <div className={styles.partnersRow}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={`skeleton-${i}`} className={styles.partnerLogoWrap}>
                    <div className={styles.partnerLogo} style={{ background: 'var(--color-muted)' }} />
                  </div>
                ))}
              </div>
            </div>
          ) : partnersList.length === 0 ? (
            <p className={styles.sectionSubtitlePartners} style={{ marginTop: '1rem' }}>{t('partners.noPartners')}</p>
          ) : (
            <div className={styles.partnersTrack}>
              {/* صفان مكرران لحركة تمرير دائرية متصلة (بدون قفز) — الصف الثاني عكس الاتجاه */}
              <div className={styles.partnersRow}>
                {[...partnersList, ...partnersList].map((p, i) => {
                  const nameKey = lang === 'ar' ? 'name_ar' : 'name_en'
                  const name = (p[nameKey as keyof FundPartner] as string) || p.name_ar || p.name_en || `Partner ${p.id}`
                  const logoUrl = resolveImageUrl(p.logo_url ?? p.logo)
                  return (
                    <div key={`row1-${p.id}-${i}`} className={styles.partnerLogoWrap}>
                      {p.link ? (
                        <a href={p.link} target="_blank" rel="noopener noreferrer" className={styles.partnerLogo} title={name}>
                          {logoUrl ? <img src={logoUrl} alt={name} className={styles.partnerLogoImg} /> : <span className={styles.partnerLogoText}>{name}</span>}
                        </a>
                      ) : (
                        <div className={styles.partnerLogo}>
                          {logoUrl ? <img src={logoUrl} alt={name} className={styles.partnerLogoImg} /> : <span className={styles.partnerLogoText}>{name}</span>}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              <div className={styles.partnersRow} aria-hidden="true">
                {[...partnersList, ...partnersList].map((p, i) => {
                  const nameKey = lang === 'ar' ? 'name_ar' : 'name_en'
                  const name = (p[nameKey as keyof FundPartner] as string) || p.name_ar || p.name_en || `Partner ${p.id}`
                  const logoUrl = resolveImageUrl(p.logo_url ?? p.logo)
                  return (
                    <div key={`row2-${p.id}-${i}`} className={styles.partnerLogoWrap}>
                      {p.link ? (
                        <a href={p.link} target="_blank" rel="noopener noreferrer" className={styles.partnerLogo} title={name}>
                          {logoUrl ? <img src={logoUrl} alt={name} className={styles.partnerLogoImg} /> : <span className={styles.partnerLogoText}>{name}</span>}
                        </a>
                      ) : (
                        <div className={styles.partnerLogo}>
                          {logoUrl ? <img src={logoUrl} alt={name} className={styles.partnerLogoImg} /> : <span className={styles.partnerLogoText}>{name}</span>}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </Container>
      </section>
      </div>
    </PageLayout>
  )
}
