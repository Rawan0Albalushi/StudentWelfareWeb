import { useTranslation } from 'react-i18next'
import { PageLayout } from '../../components/layout/PageLayout'
import { Container } from '../../components/ui/Container'
import { Card, CardContent } from '../../components/ui/Card'
import { useAuth } from '../../context/AuthContext'
import styles from './Profile.module.css'

export function Profile() {
  const { t } = useTranslation('common')
  const { user } = useAuth()

  return (
    <PageLayout>
      <Container size="narrow">
        <h1 className={styles.title}>{t('nav.profile')}</h1>
        <Card>
          <CardContent>
            <p><strong>{t('auth.name')}:</strong> {user?.name ?? '—'}</p>
            <p><strong>{t('auth.phone')}:</strong> {user?.phone ?? '—'}</p>
            <p><strong>{t('auth.email')}:</strong> {user?.email ?? '—'}</p>
          </CardContent>
        </Card>
      </Container>
    </PageLayout>
  )
}
