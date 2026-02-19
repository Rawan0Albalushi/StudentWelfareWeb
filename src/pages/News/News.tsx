import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageLayout } from '../../components/layout/PageLayout'
import { Container } from '../../components/ui/Container'
import { Card, CardContent } from '../../components/ui/Card'
import { fundNewsService } from '../../services/fundNewsService'
import { resolveImageUrl } from '../../config/api'
import type { FundNews } from '../../types/api'
import styles from './News.module.css'

export function News() {
  const { t, i18n } = useTranslation('common')
  const [list, setList] = useState<FundNews[]>([])
  const [loading, setLoading] = useState(true)

  const lang = i18n.language === 'ar' ? 'ar' : 'en'
  const titleKey = lang === 'ar' ? 'title_ar' : 'title_en'
  const contentKey = lang === 'ar' ? 'content_ar' : 'content_en'

  useEffect(() => {
    let cancelled = false
    fundNewsService
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
        <h1 className={styles.title}>{t('nav.news')}</h1>
        {loading ? (
          <p className={styles.placeholder}>{t('common.loading')}</p>
        ) : list.length === 0 ? (
          <p className={styles.placeholder}>—</p>
        ) : (
          <div className={styles.grid}>
            {list.map((item) => (
              <Card key={item.id} padding="none">
                {(item.image_url || item.image) && (
                  <div
                    className={styles.image}
                    style={{
                      backgroundImage: `url(${resolveImageUrl(item.image_url || item.image)})`,
                      backgroundSize: 'cover',
                    }}
                  />
                )}
                <CardContent>
                  <h2 className={styles.itemTitle}>
                    {(item[titleKey as keyof FundNews] as string) || `#${item.id}`}
                  </h2>
                  <div
                    className={styles.content}
                    dangerouslySetInnerHTML={{
                      __html: (item[contentKey as keyof FundNews] as string) || '',
                    }}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </PageLayout>
  )
}
