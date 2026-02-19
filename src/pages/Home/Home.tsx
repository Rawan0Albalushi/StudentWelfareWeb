import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageLayout } from '../../components/layout/PageLayout'
import { Container } from '../../components/ui/Container'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardFooter } from '../../components/ui/Card'
import { campaignService } from '../../services/campaignService'
import { donationService } from '../../services/donationService'
import { resolveImageUrl } from '../../config/api'
import type { CampaignOrProgram, RecentDonation } from '../../types/api'
import styles from './Home.module.css'

export function Home() {
  const { t, i18n } = useTranslation('common')
  const [featured, setFeatured] = useState<CampaignOrProgram[]>([])
  const [recentDonations, setRecentDonations] = useState<RecentDonation[]>([])
  const [loadingCampaigns, setLoadingCampaigns] = useState(true)
  const [loadingDonations, setLoadingDonations] = useState(true)

  const lang = i18n.language === 'ar' ? 'ar' : 'en'
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
      .then((list) => {
        if (!cancelled) setFeatured(list)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingCampaigns(false)
      })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    donationService
      .getRecent(5)
      .then((list) => {
        if (!cancelled) setRecentDonations(list)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingDonations(false)
      })
    return () => { cancelled = true }
  }, [])

  return (
    <PageLayout noPadding>
      {/* Hero */}
      <section className={styles.hero} aria-label="Hero">
        <div className={styles.heroBg} />
        <div className={styles.heroShapes} aria-hidden="true" />
        <Container size="content" className={styles.heroInner}>
          <p className={styles.heroBadge}>{t('app.tagline')}</p>
          <h1 className={styles.heroTitle}>{t('home.heroTitle')}</h1>
          <p className={styles.heroSubtitle}>{t('home.heroSubtitle')}</p>
          <div className={styles.heroActions}>
            <Link to="/donate">
              <Button size="lg" className={styles.heroCtaPrimary}>
                {t('home.ctaDonate')}
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="lg" className={styles.heroCtaSecondary}>
                {t('home.ctaRegister')}
              </Button>
            </Link>
          </div>
          <a href="#featured" className={styles.heroScroll} aria-label="Scroll to campaigns">
            <span className={styles.heroScrollDot} />
          </a>
        </Container>
      </section>

      {/* Featured campaigns */}
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
    </PageLayout>
  )
}
