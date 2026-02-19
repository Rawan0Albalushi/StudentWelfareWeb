import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Container } from '../../ui/Container'
import styles from './Footer.module.css'

export function Footer() {
  const { t } = useTranslation('common')

  return (
    <footer className={styles.footer} role="contentinfo">
      <Container size="wide">
        <div className={styles.grid}>
          <div className={styles.brand}>
            <strong className={styles.logo}>{t('app.name')}</strong>
            <p className={styles.tagline}>{t('app.tagline')}</p>
          </div>
          <nav className={styles.links} aria-label="Footer navigation">
            <Link to="/about">{t('footer.about')}</Link>
            <Link to="/contact">{t('footer.contact')}</Link>
            <Link to="/terms">{t('footer.terms')}</Link>
            <Link to="/privacy">{t('footer.privacy')}</Link>
          </nav>
        </div>
        <div className={styles.bottom}>
          <p className={styles.copyright}>© {new Date().getFullYear()} {t('footer.rights')}</p>
        </div>
      </Container>
    </footer>
  )
}
