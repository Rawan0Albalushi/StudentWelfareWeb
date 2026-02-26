import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageLayout } from '../../components/layout/PageLayout'
import { Container } from '../../components/ui/Container'
import { campaignService } from '../../services/campaignService'
import { resolveImageUrl } from '../../config/api'
import type { CampaignOrProgram } from '../../types/api'
import styles from './Campaigns.module.css'

export function Campaigns() {
  const { t, i18n } = useTranslation('common')
  const [campaigns, setCampaigns] = useState<CampaignOrProgram[]>([])
  const [loading, setLoading] = useState(true)

  const lang = i18n.language === 'ar' ? 'ar' : 'en'
  const titleKey = lang === 'ar' ? 'title_ar' : 'title_en'
  const getTitle = (item: CampaignOrProgram) =>
    (item[titleKey as keyof CampaignOrProgram] as string) || item.title || `#${item.id}`

  const getProgress = (item: CampaignOrProgram) => {
    const goal = item.goal_amount ?? 0
    const raised = item.raised_amount ?? 0
    if (goal <= 0) return 0
    return Math.min(100, Math.round((raised / goal) * 100))
  }

  useEffect(() => {
    let cancelled = false
    campaignService
      .getCampaigns()
      .then((list) => {
        if (!cancelled) setCampaigns(list)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  return (
    <PageLayout>
      <header className={styles.pageHeader}>
        <Container size="wide">
          <h1 className={styles.title}>{t('campaigns.title')}</h1>
          <p className={styles.subtitle}>{t('campaigns.subtitle')}</p>
        </Container>
      </header>

      <Container size="wide" className={styles.main}>
        {loading ? (
          <div className={styles.grid} aria-busy="true" aria-label={t('common.loading')}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className={styles.skeletonImage} />
                <div className={styles.skeletonContent}>
                  <div className={styles.skeletonLine} />
                  <div className={styles.skeletonLine} style={{ width: '80%' }} />
                  <div className={styles.skeletonLine} style={{ width: '60%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className={styles.empty} role="status">
            <div className={styles.emptyIcon} aria-hidden>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <path d="M22 6l-10 7L2 6" />
              </svg>
            </div>
            <h2 className={styles.emptyTitle}>{t('campaigns.noCampaigns')}</h2>
            <p className={styles.emptyDescription}>{t('campaigns.noCampaignsDescription')}</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {campaigns.map((item) => (
              <article key={item.id} className={styles.card}>
                <Link
                  to={`/donate?campaign_id=${item.id}`}
                  className={styles.cardLink}
                >
                  <div
                    className={styles.cardImage}
                    style={{
                      backgroundImage: item.image_url || item.image || item.banner_url || item.banner
                        ? `url(${resolveImageUrl(item.image_url || item.image || item.banner_url || item.banner)})`
                        : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    <div className={styles.cardOverlay} />
                  </div>
                  <div className={styles.cardBody}>
                    <h3 className={styles.cardTitle}>{getTitle(item)}</h3>
                    <div className={styles.progress}>
                      <div
                        className={styles.progressBar}
                        style={{ width: `${getProgress(item)}%` }}
                        role="progressbar"
                        aria-valuenow={getProgress(item)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={t('campaigns.raised')}
                      />
                    </div>
                    <p className={styles.meta}>
                      {t('campaigns.raised')}: {item.raised_amount ?? 0} {t('donate.currencyShort')} — {t('campaigns.goal')}: {item.goal_amount ?? 0} {t('donate.currencyShort')}
                    </p>
                  </div>
                  <div className={styles.cardFooter}>
                    <span className={styles.cta}>{t('campaigns.donate')}</span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </Container>
    </PageLayout>
  )
}
