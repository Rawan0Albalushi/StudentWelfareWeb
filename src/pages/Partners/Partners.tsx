import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageLayout } from '../../components/layout/PageLayout'
import { Container } from '../../components/ui/Container'
import { Card, CardContent } from '../../components/ui/Card'
import { fundPartnerService } from '../../services/fundPartnerService'
import { resolveImageUrl } from '../../config/api'
import type { FundPartner } from '../../types/api'
import styles from './Partners.module.css'

function getDisplayUrl(link: string | undefined): string {
  if (!link) return ''
  try {
    const url = new URL(link)
    return url.hostname.replace(/^www\./, '')
  } catch {
    return link
  }
}

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
        if (!cancelled) {
          const sorted = [...data].sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0))
          setList(sorted)
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  return (
    <PageLayout>
      <header className={styles.pageHeader}>
        <Container size="wide">
          <h1 className={styles.title}>{t('nav.partners')}</h1>
          <p className={styles.subtitle}>{t('partners.subtitle')}</p>
        </Container>
      </header>

      <Container size="wide" className={styles.main}>
        {loading ? (
          <div className={styles.grid} aria-busy="true" aria-label={t('common.loading')}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className={styles.skeletonLogo} />
                <div className={styles.skeletonMeta}>
                  <div className={styles.skeletonLine} />
                  <div className={styles.skeletonLine} style={{ width: '70%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className={styles.empty} role="status">
            <div className={styles.emptyIcon} aria-hidden>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h2 className={styles.emptyTitle}>{t('partners.noPartners')}</h2>
            <p className={styles.emptyDescription}>{t('partners.noPartnersDescription')}</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {list.map((item) => {
              const name = (item[nameKey as keyof FundPartner] as string) || `#${item.id}`
              const desc = (item[descKey as keyof FundPartner] as string) || ''
              const logoUrl = item.logo_url || item.logo
              const link = item.link
              const displayUrl = getDisplayUrl(link)

              const content = (
                <>
                  <div className={styles.logoWrap}>
                    {logoUrl ? (
                      <img
                        src={resolveImageUrl(logoUrl)}
                        alt=""
                        className={styles.logo}
                        loading="lazy"
                      />
                    ) : (
                      <div className={styles.logoPlaceholder} aria-hidden>
                        <span className={styles.logoPlaceholderText}>
                          {name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    {item.is_featured && (
                      <span className={styles.featuredBadge}>{t('partners.featured')}</span>
                    )}
                  </div>
                  <div className={styles.cardMeta}>
                    <h2 className={styles.name}>{name}</h2>
                    {desc && (
                      <p className={styles.desc}>{desc}</p>
                    )}
                    {link && (
                      <span className={styles.visitHint}>
                        <span className={styles.visitHintText}>{t('partners.visitWebsite')}</span>
                        {displayUrl && (
                          <span className={styles.visitHintUrl} aria-hidden>{displayUrl}</span>
                        )}
                      </span>
                    )}
                  </div>
                </>
              )

              if (link) {
                return (
                  <a
                    key={item.id}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.cardLink}
                  >
                    <Card className={styles.card} padding="none">
                      <CardContent className={styles.cardContent}>
                        {content}
                      </CardContent>
                    </Card>
                  </a>
                )
              }

              return (
                <Card key={item.id} className={styles.card} padding="none">
                  <CardContent className={styles.cardContent}>
                    {content}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </Container>
    </PageLayout>
  )
}
