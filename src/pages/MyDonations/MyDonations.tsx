import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageLayout } from '../../components/layout/PageLayout'
import { Container } from '../../components/ui/Container'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { donationService } from '../../services/donationService'
import { campaignService } from '../../services/campaignService'
import type { CampaignOrProgram, RecentDonation } from '../../types/api'
import styles from './MyDonations.module.css'

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value)
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Number(value)
  return undefined
}

function formatDate(iso?: string, locale: string = 'ar'): string {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    return d.toLocaleDateString(locale.startsWith('ar') ? 'ar-OM' : 'en-GB', {
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

function pickTitle(obj: Record<string, unknown> | undefined, lang: string): string | undefined {
  if (!obj) return undefined
  const ar = typeof obj.title_ar === 'string' ? obj.title_ar : undefined
  const en = typeof obj.title_en === 'string' ? obj.title_en : undefined
  const title = typeof obj.title === 'string' ? obj.title : typeof obj.name === 'string' ? obj.name : undefined
  return ((lang === 'ar' ? ar || title || en : en || title || ar) || '').trim() || undefined
}

function getTargetTitle(
  donation: RecentDonation,
  lang: string,
  campaigns: CampaignOrProgram[],
  programs: CampaignOrProgram[],
): string | undefined {
  const nested =
    pickTitle(isRecord(donation.campaign) ? donation.campaign : undefined, lang) ||
    pickTitle(isRecord(donation.program) ? donation.program : undefined, lang) ||
    pickTitle(isRecord(donation.item) ? donation.item : undefined, lang) ||
    (typeof donation.campaign_title === 'string' ? donation.campaign_title : undefined) ||
    (typeof donation.program_title === 'string' ? donation.program_title : undefined)
  if (nested) return nested

  const campaignId = toNumber(donation.campaign_id)
  const programId = toNumber(donation.program_id)
  const item = campaignId != null
    ? campaigns.find((c) => c.id === campaignId)
    : programId != null
      ? programs.find((p) => p.id === programId)
      : undefined
  if (!item) return undefined
  return (lang === 'ar' ? item.title_ar || item.title || item.title_en : item.title_en || item.title || item.title_ar) || undefined
}

export function MyDonations() {
  const { t, i18n } = useTranslation('common')
  const [list, setList] = useState<RecentDonation[]>([])
  const [campaigns, setCampaigns] = useState<CampaignOrProgram[]>([])
  const [programs, setPrograms] = useState<CampaignOrProgram[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      donationService.getMyDonations({ limit: 100 }),
      campaignService.getCampaigns({ limit: 100, per_page: 100 }).catch(() => [] as CampaignOrProgram[]),
      campaignService.getPrograms().catch(() => [] as CampaignOrProgram[]),
    ])
      .then(([data, campList, progList]) => {
        if (cancelled) return
        setList(data)
        setCampaigns(campList)
        setPrograms(progList)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const total = list.reduce((sum, d) => sum + (Number((d as RecentDonation).amount) || 0), 0)
  const locale = i18n.language || 'ar'
  const lang = locale.startsWith('ar') ? 'ar' : 'en'
  const rows = list.map((d, i) => {
    const donation = d as RecentDonation
    return {
      key: donation.id ?? i,
      title: getTargetTitle(donation, lang, campaigns, programs) || '—',
      date: formatDate(donation.created_at, locale),
      amount: formatAmount(donation.amount),
    }
  })

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
            <div className={styles.skeletonTable} />
          </div>
        ) : list.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon} aria-hidden>
              <span className={styles.emptyHeart}>♥</span>
            </div>
            <h2 className={styles.emptyTitle}>{t('myDonations.emptyTitle')}</h2>
            <p className={styles.emptyDescription}>{t('myDonations.emptyDescription')}</p>
            <Link to="/campaigns" className={styles.emptyCtaLink}>
              <Button size="lg" fullWidth className={styles.emptyCta}>
                {t('myDonations.ctaDonate')}
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <section className={styles.summarySection} aria-labelledby="my-donations-summary">
              <div className={styles.summaryGrid}>
                <Card padding="none" className={styles.summaryCard}>
                  <CardContent className={styles.summaryContent}>
                    <span className={styles.summaryLabel} id="my-donations-summary">
                      {t('myDonations.totalDonated')}
                    </span>
                    <span className={styles.summaryAmount}>
                      {formatAmount(total)} <span className={styles.currency}>{t('donate.currencyShort')}</span>
                    </span>
                  </CardContent>
                </Card>
                <Card padding="none" className={styles.summaryCard}>
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
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th scope="col">{t('myDonations.campaign')}</th>
                      <th scope="col">{t('myDonations.donationDate')}</th>
                      <th scope="col" className={styles.amountCol}>{t('myDonations.amount')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.key}>
                        <td className={styles.campaignCell}>{row.title}</td>
                        <td>{row.date}</td>
                        <td className={styles.amountCell}>
                          {row.amount} {t('donate.currencyShort')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className={styles.cardList}>
                {rows.map((row) => (
                  <li key={row.key} className={styles.donationCard}>
                    <p className={styles.donationCardTitle}>{row.title}</p>
                    <div className={styles.donationCardMeta}>
                      <span className={styles.donationCardDate}>{row.date}</span>
                      <span className={styles.donationCardAmount}>
                        {row.amount} {t('donate.currencyShort')}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </Container>
    </PageLayout>
  )
}
