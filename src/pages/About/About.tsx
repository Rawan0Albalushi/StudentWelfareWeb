import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { PageLayout } from '../../components/layout/PageLayout'
import { Container } from '../../components/ui/Container'
import styles from './About.module.css'

const valueKeys = ['value1', 'value2', 'value3', 'value4'] as const

const icons = {
  mission: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
    </svg>
  ),
  vision: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  ),
  value: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
}

export function About() {
  const { t } = useTranslation('common')

  return (
    <PageLayout>
      <header className={styles.pageHeader}>
        <Container size="wide">
          <h1 className={styles.title}>{t('nav.about')}</h1>
          <p className={styles.subtitle}>{t('about.subtitle')}</p>
        </Container>
      </header>

      <Container size="wide" className={styles.main}>
        <section className={styles.intro} aria-labelledby="about-intro">
          <p id="about-intro" className={styles.introText}>
            {t('about.intro')}
          </p>
        </section>

        <section className={styles.missionVision} aria-label={t('about.missionTitle')}>
          <div className={styles.mvCard}>
            <span className={styles.mvIcon} data-icon="mission">{icons.mission}</span>
            <h2 className={styles.mvTitle}>{t('about.missionTitle')}</h2>
            <p className={styles.mvText}>{t('about.missionText')}</p>
          </div>
          <div className={styles.mvCard}>
            <span className={styles.mvIcon} data-icon="vision">{icons.vision}</span>
            <h2 className={styles.mvTitle}>{t('about.visionTitle')}</h2>
            <p className={styles.mvText}>{t('about.visionText')}</p>
          </div>
        </section>

        <section className={styles.values} aria-labelledby="about-values-title">
          <h2 id="about-values-title" className={styles.valuesTitle}>
            {t('about.valuesTitle')}
          </h2>
          <ul className={styles.valuesGrid} role="list">
            {valueKeys.map((key) => (
              <li key={key} className={styles.valueCard}>
                <span className={styles.valueIcon}>{icons.value}</span>
                <h3 className={styles.valueCardTitle}>{t(`about.${key}Title`)}</h3>
                <p className={styles.valueCardText}>{t(`about.${key}Text`)}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.ctaStrip} aria-labelledby="about-cta-title">
          <div className={styles.ctaContent}>
            <h2 id="about-cta-title" className={styles.ctaTitle}>
              {t('about.ctaTitle')}
            </h2>
            <p className={styles.ctaSubtext}>{t('about.ctaSubtext')}</p>
            <Link to="/campaigns" className={styles.ctaButton}>
              {t('about.ctaButton')}
            </Link>
          </div>
        </section>
      </Container>
    </PageLayout>
  )
}
