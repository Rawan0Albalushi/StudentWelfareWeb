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
  const [featured, setFeatured] = useState<CampaignOrProgram[]>([])
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
      .getCampaignsFeatured()
      .then((list) => { if (!cancelled) setFeatured(list) })
      .catch((err) => {
        if (!cancelled) console.error('[Home] campaigns/featured failed:', err)
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
      {/* Hero: Section 1 right = glassmorphism card; Section 2 left = creative banner with illustration; Section 3 bottom = donation strip */}
      <section className={`${styles.hero} js-hero`} aria-label="Hero" dir={isRtl ? 'rtl' : 'ltr'} lang={i18n.language || 'ar'}>
        <div className={styles.heroBg} />
        <div className={styles.heroShapes} aria-hidden="true">
          <span className={styles.heroShape} data-shape="1" />
          <span className={styles.heroShape} data-shape="2" />
          <span className={styles.heroShape} data-shape="3" />
          <span className={styles.heroShape} data-shape="4" />
        </div>
        <div className={styles.heroNoise} aria-hidden="true" />
        <Container size="wide" className={`${styles.heroContainer} js-hero-container`}>
          <div className={`${styles.heroGrid} ${isRtl ? styles.heroGridRtl : ''} js-hero-grid`}>
            {/* Content: title + card (right in RTL) */}
            <div className={`${styles.heroBanner} js-hero-banner`} dir={isRtl ? 'rtl' : 'ltr'}>
              <p className={`${styles.heroBadge} js-hero-badge`}>{t('app.tagline')}</p>
              <h1 className={`${styles.heroTitle} js-hero-title`}>{t('home.heroTitle')}</h1>
              <p className={`${styles.heroSubtitle} js-hero-subtitle`}>{t('home.heroSubtitle')}</p>
              {/* بطاقة التسجيل مكان الرسم */}
              <div className={`${styles.heroCardWrap} js-hero-card-wrap`}>
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
                    style={{ background: slide.gradient }}
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

          {/* Section 3 (bottom): Full-width motivational donation strip */}
          <div className={`${styles.donationStrip} js-donation-strip`}>
            <div className={`${styles.donationStripContent} js-donation-strip-content`}>
              <h2 className={`${styles.donationStripHeading} js-donation-heading`}>{t('home.donationStripHeading')}</h2>
              <p className={`${styles.donationStripSubtext} js-donation-subtext`}>{t('home.donationStripSubtext')}</p>
              <div className={styles.donationStripStats}>
                <div className={styles.donationStripStat}>
                  <span className={styles.donationStripStatValue}>500+</span>
                  <span className={styles.donationStripStatLabel}>{t('home.donationStripStat1')}</span>
                </div>
                <div className={styles.donationStripStat}>
                  <span className={styles.donationStripStatValue}>1M+</span>
                  <span className={styles.donationStripStatLabel}>{t('home.donationStripStat2')}</span>
                </div>
                <div className={styles.donationStripStat}>
                  <span className={styles.donationStripStatValue}>2K+</span>
                  <span className={styles.donationStripStatLabel}>{t('home.donationStripStat3')}</span>
                </div>
              </div>
              <Link to="/donate" className={styles.donationStripCta}>
                {t('home.ctaDonate')}
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Featured campaigns + donations: same horizontal padding as other pages */}
      <div className={styles.pageGutter}>
      <section id="featured" className={styles.sectionCampaigns}>
        <Container size="wide">
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>{t('home.featuredCampaigns')}</h2>
          </div>
          {loadingCampaigns ? (
            <div className={styles.loadingState}>
              <div className={styles.loadingDots} aria-hidden="true">
                <span /><span /><span />
              </div>
              <p className={styles.placeholderText}>{t('common.loading')}</p>
            </div>
          ) : featured.length === 0 ? (
            <p className={styles.placeholderText}>{t('campaigns.noCampaigns')}</p>
          ) : (
            <>
              <div className={styles.cardGrid}>
                {featured.slice(0, 6).map((item) => (
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
