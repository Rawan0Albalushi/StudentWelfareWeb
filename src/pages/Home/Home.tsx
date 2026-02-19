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
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <Container size="content" className={styles.heroContent}>
          <h1 className={styles.heroTitle}>{t('home.heroTitle')}</h1>
          <p className={styles.heroSubtitle}>{t('home.heroSubtitle')}</p>
          <div className={styles.heroActions}>
            <Link to="/donate">
              <Button size="lg">{t('home.ctaDonate')}</Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="lg">
                {t('home.ctaRegister')}
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      <section className={styles.section}>
        <Container size="wide">
          <h2 className={styles.sectionTitle}>{t('home.featuredCampaigns')}</h2>
          {loadingCampaigns ? (
            <p className={styles.placeholderText}>{t('common.loading')}</p>
          ) : featured.length === 0 ? (
            <p className={styles.placeholderText}>{t('campaigns.noCampaigns')}</p>
          ) : (
            <>
              <div className={styles.cardGrid}>
                {featured.slice(0, 6).map((item) => (
                  <Card key={item.id} padding="none">
                    <div
                      className={styles.cardImage}
                      style={{
                        backgroundImage: item.image_url || item.image || item.banner_url || item.banner
                          ? `url(${resolveImageUrl(item.image_url || item.image || item.banner_url || item.banner)})`
                          : undefined,
                        backgroundSize: 'cover',
                      }}
                    />
                    <CardContent className={styles.cardBody}>
                      <h3 className={styles.cardTitle}>{getTitle(item)}</h3>
                      <p>
                        {t('campaigns.raised')}: {item.raised_amount ?? 0} — {t('campaigns.goal')}: {item.goal_amount ?? 0}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Link to={`/donate?campaign_id=${item.id}`}>
                        <Button variant="outline" size="sm">
                          {t('campaigns.donate')}
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              <div className={styles.sectionFooter}>
                <Link to="/campaigns">
                  <Button variant="ghost">{t('home.viewAll')}</Button>
                </Link>
              </div>
            </>
          )}
        </Container>
      </section>

      <section className={styles.sectionAlt}>
        <Container size="content">
          <h2 className={styles.sectionTitle}>{t('home.recentDonations')}</h2>
          {loadingDonations ? (
            <p className={styles.placeholderText}>{t('common.loading')}</p>
          ) : recentDonations.length === 0 ? (
            <p className={styles.placeholderText}>—</p>
          ) : (
            <ul className={styles.donationList}>
              {recentDonations.map((d, i) => (
                <li key={(d as { id?: number }).id ?? i}>
                  {(d as RecentDonation).amount ?? 0} OMR
                  {(d as RecentDonation).donor_name ? ` — ${(d as RecentDonation).donor_name}` : ''}
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>
    </PageLayout>
  )
}
