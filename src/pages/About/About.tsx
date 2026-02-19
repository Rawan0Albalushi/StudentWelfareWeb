import { useTranslation } from 'react-i18next'
import { PageLayout } from '../../components/layout/PageLayout'
import { Container } from '../../components/ui/Container'
import styles from './About.module.css'

export function About() {
  const { t } = useTranslation('common')
  return (
    <PageLayout>
      <Container size="content">
        <h1 className={styles.title}>{t('nav.about')}</h1>
        <p className={styles.body}>{t('app.tagline')}</p>
      </Container>
    </PageLayout>
  )
}
