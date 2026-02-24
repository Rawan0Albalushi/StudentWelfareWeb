import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageLayout } from '../../components/layout/PageLayout'
import { Container } from '../../components/ui/Container'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardFooter } from '../../components/ui/Card'
import { campaignService } from '../../services/campaignService'
import { resolveImageUrl } from '../../config/api'
import type { CampaignOrProgram } from '../../types/api'
import styles from './Campaigns.module.css'

export function Campaigns() {
  const { t, i18n } = useTranslation('common')
  const [campaigns, setCampaigns] = useState<CampaignOrProgram[]>([])
  const [programs, setPrograms] = useState<CampaignOrProgram[]>([])
  const [loading, setLoading] = useState(true)

  const lang = i18n.language === 'ar' ? 'ar' : 'en'
  const titleKey = lang === 'ar' ? 'title_ar' : 'title_en'
  const getTitle = (item: CampaignOrProgram) =>
    (item[titleKey as keyof CampaignOrProgram] as string) || item.title || `#${item.id}`

  useEffect(() => {
    let cancelled = false
    Promise.all([campaignService.getCampaigns(), campaignService.getPrograms()])
      .then(([campList, progList]) => {
        if (!cancelled) {
          setCampaigns(campList)
          setPrograms(progList)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const all = [...campaigns.map((c) => ({ ...c, _type: 'campaign' as const })), ...programs.map((p) => ({ ...p, _type: 'program' as const }))]

  return (
    <PageLayout>
      <div className={styles.pageWrap}>
        <Container size="wide">
          <h1 className={styles.title}>{t('campaigns.title')}</h1>
        {loading ? (
          <p className={styles.placeholder}>{t('common.loading')}</p>
        ) : all.length === 0 ? (
          <p className={styles.placeholder}>{t('campaigns.noCampaigns')}</p>
        ) : (
          <div className={styles.cardGrid}>
            {all.map((item) => (
              <Card key={`${item._type}-${item.id}`} padding="none">
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
                  <Link to={item._type === 'campaign' ? `/donate?campaign_id=${item.id}` : `/donate?program_id=${item.id}`}>
                    <Button variant="outline" size="sm">
                      {t('campaigns.donate')}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        </Container>
      </div>
    </PageLayout>
  )
}
