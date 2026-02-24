import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageLayout } from '../../components/layout/PageLayout'
import { Container } from '../../components/ui/Container'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { donationService } from '../../services/donationService'
import { useAuth } from '../../context/AuthContext'
import type { RecentDonation } from '../../types/api'
import styles from './MyDonations.module.css'

function formatDate(iso?: string, locale: string = 'ar'): string {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    return d.toLocaleDateString(locale === 'ar' ? 'ar-OM' : 'en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return iso
  }
}

function formatAmount(amount?: number): string {
  if (amount == null) return '0'
  return Number(amount).toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

export function MyDonations() {
  const { t, i18n } = useTranslation('common')
  const navigate = useNavigate()
  const { isAuthenticated, checked } = useAuth()
  const [list, setList] = useState<RecentDonation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (checked && !isAuthenticated) navigate('/login', { replace: true })
  }, [checked, isAuthenticated, navigate])

  useEffect(() => {
    let cancelled = false
    donationService
      .getMyDonations()
      .then((data) => {
        if (!cancelled) setList(data)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const total = list.reduce((sum, d) => sum + (Number((d as RecentDonation).amount) || 0), 0)
  const locale = i18n.language || 'ar'

  if (!checked || !isAuthenticated) return null

  return (
    <PageLayout>
      <header className={styles.pageHeader}>
        <Container size="content">
          <h1 className={styles.title}>{t('myDonations.title')}</h1>
          <p className={styles.subtitle}>{t('myDonations.subtitle')}</p>
        </Container>
      </header>

      <Container size="content" className={styles.container}>
        {loading ? (
          <div className={styles.loadingWrap}>
            <div className={styles.skeletonSummary} />
            <div className={styles.skeletonList}>
              {[1, 2, 3].map((i) => (
                <div key={i} className={styles.skeletonCard} />
              ))}
            </div>
          </div>
        ) : list.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon} aria-hidden>
              <span className={styles.emptyHeart}>♥</span>
            </div>
            <h2 className={styles.emptyTitle}>{t('myDonations.emptyTitle')}</h2>
            <p className={styles.emptyDescription}>{t('myDonations.emptyDescription')}</p>
            <Link to="/donate">
              <Button size="lg" className={styles.emptyCta}>
                {t('myDonations.ctaDonate')}
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <section className={styles.summarySection} aria-labelledby="my-donations-summary">
              <div className={styles.summaryGrid}>
                <Card className={styles.summaryCard}>
                  <CardContent className={styles.summaryContent}>
                    <span className={styles.summaryLabel} id="my-donations-summary">
                      {t('myDonations.totalDonated')}
                    </span>
                    <span className={styles.summaryAmount}>
                      {formatAmount(total)} <span className={styles.currency}>{t('donate.currencyShort')}</span>
                    </span>
                  </CardContent>
                </Card>
                <Card className={styles.summaryCard}>
                  <CardContent className={styles.summaryContent}>
                    <span className={styles.summaryLabel}>{t('myDonations.donationCount')}</span>
                    <span className={styles.summaryCount}>{list.length}</span>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className={styles.listSection} aria-labelledby="donations-list-title">
              <h2 id="donations-list-title" className={styles.listSectionTitle}>
                {t('myDonations.donationsListTitle')}
              </h2>
              <ul className={styles.list} role="list">
                {list.map((d, i) => {
                  const donation = d as RecentDonation
                  const sourceKey = donation.source === 'app' ? 'sourceApp' : 'sourceWeb'
                  return (
                    <li key={donation.id ?? i} className={styles.listItem}>
                      <Card className={styles.donationCard}>
                        <CardContent className={styles.donationCardContent}>
                          <div className={styles.donationIcon} aria-hidden>
                            ♥
                          </div>
                          <div className={styles.donationBody}>
                            <div className={styles.donationRow}>
                              <span className={styles.donationAmount}>
                                {formatAmount(donation.amount)} {t('donate.currencyShort')}
                              </span>
                              {donation.source != null && (
                                <span className={styles.donationSource}>{t(`myDonations.${sourceKey}`)}</span>
                              )}
                            </div>
                            <div className={styles.donationMeta}>
                              {t('myDonations.donationDate')}: {formatDate(donation.created_at, locale)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </li>
                  )
                })}
              </ul>
            </section>
          </>
        )}
      </Container>
    </PageLayout>
  )
}
