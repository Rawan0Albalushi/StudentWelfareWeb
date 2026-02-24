import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { setDocumentDirection } from '../../i18n/config'
import { PageLayout } from '../../components/layout/PageLayout'
import { Container } from '../../components/ui/Container'
import { Button } from '../../components/ui/Button'
import { campaignService } from '../../services/campaignService'
import { donationService } from '../../services/donationService'
import { resolveImageUrl } from '../../config/api'
import type { CampaignOrProgram, RecentDonation } from '../../types/api'
import styles from './Home.module.css'

const HERO_BANNERS = [
  { id: 1, gradient: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)' },
  { id: 2, gradient: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 100%)' },
  { id: 3, gradient: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.04) 100%)' },
]

export function Home() {
  const { t, i18n } = useTranslation('common')
  const [campaigns, setCampaigns] = useState<CampaignOrProgram[]>([])
  const [recentDonations, setRecentDonations] = useState<RecentDonation[]>([])
  const [loadingCampaigns, setLoadingCampaigns] = useState(true)
  const [loadingDonations, setLoadingDonations] = useState(true)
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
    let cancelled = false
    donationService
      .getRecent(5)
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

  // Rotate hero banners every 5s
  useEffect(() => {
    const id = setInterval(() => {
      setBannerIndex((i) => (i + 1) % HERO_BANNERS.length)
    }, 5000)
    return () => clearInterval(id)
  }, [])

  return (
    <PageLayout noPadding>
      {/* Hero: Section 1 = glassmorphism card; Section 2 = creative banner with illustration */}
      <section className={`${styles.hero} js-hero`} aria-label="Hero" dir={isRtl ? 'rtl' : 'ltr'} lang={i18n.language || 'ar'}>
        <div className={styles.heroBg} />
        {/* لمعة متحركة */}
        <div className={styles.heroShine} aria-hidden="true" />
        {/* أيقونات زينة في الخلفية */}
        <div className={styles.heroBgIcons} aria-hidden="true">
          <span className={styles.heroBgIcon} data-icon="heart">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
          </span>
          <span className={styles.heroBgIcon} data-icon="graduation">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" /></svg>
          </span>
          <span className={styles.heroBgIcon} data-icon="book">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /><path d="M8 7h8" /><path d="M8 11h8" /></svg>
          </span>
          <span className={styles.heroBgIcon} data-icon="hand">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v0" /><path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2" /><path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8" /><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" /></svg>
          </span>
          <span className={styles.heroBgIcon} data-icon="sparkle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
          </span>
        </div>
        <div className={styles.heroShapes} aria-hidden="true">
          <span className={styles.heroShape} data-shape="1" />
          <span className={styles.heroShape} data-shape="2" />
          <span className={styles.heroShape} data-shape="3" />
          <span className={styles.heroShape} data-shape="4" />
        </div>
        <div className={styles.heroNoise} aria-hidden="true" />
        {/* منحنى سفلي للهيرو */}
        <div className={styles.heroCurve} aria-hidden="true" />
        <Container size="wide" className={`${styles.heroContainer} js-hero-container`}>
          <div className={`${styles.heroGrid} ${isRtl ? styles.heroGridRtl : ''} js-hero-grid`}>
            {/* Content: title + card (right in RTL) */}
            <div className={`${styles.heroBanner} js-hero-banner`} dir={isRtl ? 'rtl' : 'ltr'}>
              <p className={`${styles.heroBadge} ${styles.heroReveal1} js-hero-badge`}>{t('app.tagline')}</p>
              <h1 className={`${styles.heroTitle} ${styles.heroReveal2} js-hero-title`}>
                <span className={styles.heroTitleLine}>{t('home.heroTitle')}</span>
              </h1>
              <p className={`${styles.heroSubtitle} ${styles.heroReveal3} js-hero-subtitle`}>{t('home.heroSubtitle')}</p>
              {/* بطاقة التسجيل مكان الرسم */}
              <div className={`${styles.heroCardWrap} ${styles.heroReveal4} js-hero-card-wrap`}>
                <div className={`${styles.regCard} js-reg-card`} dir={isRtl ? 'rtl' : 'ltr'}>
                  <span className={styles.regCardIcon} aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </span>
                  <h3 className={`${styles.regCardTitle} js-reg-card-title`}>{t('home.ctaRegister')}</h3>
                  <p className={`${styles.regCardDesc} js-reg-card-desc`}>
                    {lang === 'ar'
                      ? 'سجّل طلبك للاستفادة من برامج الدعم الدراسي. استكمل بياناتك وارفع المستندات المطلوبة.'
                      : 'Register your application for student support programs. Complete your details and upload required documents.'}
                  </p>
<Link to="/student-registration" className={`${styles.regCardButton} js-reg-card-button`}>
                    {t('home.ctaStartRegistration')}
                    <span className={`${styles.regCardArrow} js-reg-card-arrow`} aria-hidden="true">→</span>
                  </Link>
                <Link to="/register" className={`${styles.regCardSecondaryLink} js-reg-card-link`}>
                    {t('home.donorRegistration')}
                  </Link>
                </div>
              </div>
            </div>

            {/* Banners area (left in RTL – fills the empty space) */}
            <div className={styles.heroBanners} aria-label={t('home.bannersLabel')} dir={isRtl ? 'rtl' : 'ltr'}>
              <div className={styles.heroBannersTrack}>
                {HERO_BANNERS.map((slide, i) => (
                  <div
                    key={slide.id}
                    className={`${styles.heroBannerSlide} ${i === bannerIndex ? styles.heroBannerSlideActive : ''}`}
                    style={{ background: 'transparent' }}
                    aria-hidden={i !== bannerIndex}
                  />
                ))}
              </div>
              <div className={styles.heroBannersDots} role="tablist" aria-label={t('home.bannersLabel')}>
                {HERO_BANNERS.map((_, i) => (
                  <button
                    key={i}
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
          </div>
        </Container>
      </section>

      {/* Featured campaigns + donations: same horizontal padding as other pages */}
      <div className={styles.pageGutter}>
      <section id="campaigns" className={styles.sectionCampaigns}>
        <Container size="wide">
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>{t('nav.campaigns')}</h2>
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

      {/* Recent donations */}
      <section className={styles.sectionDonations}>
        <Container size="content">
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>{t('home.recentDonations')}</h2>
          </div>
          {loadingDonations ? (
            <div className={styles.loadingState}>
              <div className={styles.loadingDots} aria-hidden="true">
                <span /><span /><span />
              </div>
              <p className={styles.placeholderText}>{t('common.loading')}</p>
            </div>
          ) : recentDonations.length === 0 ? (
            <p className={styles.placeholderText}>—</p>
          ) : (
            <ul className={styles.donationList} role="list">
              {recentDonations.map((d, i) => (
                <li key={(d as { id?: number }).id ?? i} className={styles.donationItem}>
                  <span className={styles.donationAvatar} aria-hidden="true">
                    {(d as RecentDonation).donor_name
                      ? String((d as RecentDonation).donor_name).charAt(0).toUpperCase()
                      : '?'}
                  </span>
                  <div className={styles.donationContent}>
                    <span className={styles.donationAmount}>
                      {(d as RecentDonation).amount ?? 0} OMR
                    </span>
                    {(d as RecentDonation).donor_name && (
                      <span className={styles.donationName}>{(d as RecentDonation).donor_name}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>
      </div>
    </PageLayout>
  )
}
