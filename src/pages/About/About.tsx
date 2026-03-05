import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { PageLayout } from '../../components/layout/PageLayout'
import { Container } from '../../components/ui/Container'
import styles from './About.module.css'

const objectiveKeys = ['objective1', 'objective2', 'objective3', 'objective4'] as const
const legalStatusKeys = ['legalStatus1', 'legalStatus2', 'legalStatus3', 'legalStatus4', 'legalStatus5'] as const

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
  target: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  accreditation: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  objective: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="M22 4L12 14.01l-3-3" />
    </svg>
  ),
  legal: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
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

        <section className={styles.missionVision} aria-label={t('about.visionTitle')}>
          <div className={styles.mvCard}>
            <span className={styles.mvIcon} data-icon="vision">{icons.vision}</span>
            <h2 className={styles.mvTitle}>{t('about.visionTitle')}</h2>
            <p className={styles.mvText}>{t('about.visionText')}</p>
          </div>
          <div className={styles.mvCard}>
            <span className={styles.mvIcon} data-icon="mission">{icons.mission}</span>
            <h2 className={styles.mvTitle}>{t('about.missionTitle')}</h2>
            <p className={styles.mvText}>{t('about.missionText')}</p>
          </div>
        </section>

        <section className={styles.targetAudience} aria-label={t('about.targetAudienceTitle')}>
          <div className={styles.mvCard}>
            <span className={styles.mvIcon} data-icon="target">{icons.target}</span>
            <h2 id="about-target-title" className={styles.mvTitle}>{t('about.targetAudienceTitle')}</h2>
            <p className={styles.mvText}>{t('about.targetAudienceText')}</p>
          </div>
          <div className={styles.mvCard}>
            <span className={styles.mvIcon} data-icon="accreditation">{icons.accreditation}</span>
            <h2 className={styles.mvTitle}>{t('about.accreditationTitle')}</h2>
            <p className={styles.mvText}>{t('about.accreditationText')}</p>
          </div>
        </section>

        <section className={styles.objectives} aria-labelledby="about-objectives-title">
          <h2 id="about-objectives-title" className={styles.valuesTitle}>
            {t('about.objectivesTitle')}
          </h2>
          <ul className={styles.valuesGrid} role="list">
            {objectiveKeys.map((key) => (
              <li key={key} className={styles.valueCard}>
                <span className={styles.valueIcon}>{icons.objective}</span>
                <p className={styles.valueCardText}>{t(`about.${key}`)}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.legalStatus} aria-labelledby="about-legal-title">
          <h2 id="about-legal-title" className={styles.valuesTitle}>
            <span className={styles.legalTitleIcon}>{icons.legal}</span>
            {t('about.legalStatusTitle')}
          </h2>
          <div className={styles.legalStatusWrap}>
            <ul className={styles.legalList} role="list">
              {legalStatusKeys.map((key) => (
                <li key={key} className={styles.legalItem}>{t(`about.${key}`)}</li>
              ))}
            </ul>
          </div>
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
