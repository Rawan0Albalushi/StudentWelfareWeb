import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageLayout } from '../../components/layout/PageLayout'
import { Container } from '../../components/ui/Container'
import { Card, CardContent } from '../../components/ui/Card'
import { fundPartnerService } from '../../services/fundPartnerService'
import { resolveImageUrl } from '../../config/api'
import type { FundPartner } from '../../types/api'
import styles from './Partners.module.css'

export function Partners() {
  const { t, i18n } = useTranslation('common')
  const [list, setList] = useState<FundPartner[]>([])
  const [loading, setLoading] = useState(true)

  const lang = i18n.language === 'ar' ? 'ar' : 'en'
  const nameKey = lang === 'ar' ? 'name_ar' : 'name_en'
  const descKey = lang === 'ar' ? 'description_ar' : 'description_en'

  useEffect(() => {
    let cancelled = false
    fundPartnerService
      .getList()
      .then((data) => {
        if (!cancelled) setList(data)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  return (
    <PageLayout>
      <Container size="wide">
        <h1 className={styles.title}>{t('nav.partners')}</h1>
        {loading ? (
          <p className={styles.placeholder}>{t('common.loading')}</p>
        ) : list.length === 0 ? (
          <p className={styles.placeholder}>—</p>
        ) : (
          <div className={styles.grid}>
            {list.map((item) => (
              <Card key={item.id}>
                <CardContent>
                  {(item.logo_url || item.logo) && (
                    <img
                      src={resolveImageUrl(item.logo_url || item.logo)}
                      alt={(item[nameKey as keyof FundPartner] as string) || ''}
                      className={styles.logo}
                    />
                  )}
                  <h2 className={styles.name}>
                    {(item[nameKey as keyof FundPartner] as string) || `#${item.id}`}
                  </h2>
                  <p className={styles.desc}>
                    {(item[descKey as keyof FundPartner] as string) || ''}
                  </p>
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className={styles.link}>
                      {item.link}
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </PageLayout>
  )
}
