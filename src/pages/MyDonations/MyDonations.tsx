import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageLayout } from '../../components/layout/PageLayout'
import { Container } from '../../components/ui/Container'
import { donationService } from '../../services/donationService'
import { useAuth } from '../../context/AuthContext'
import type { RecentDonation } from '../../types/api'
import styles from './MyDonations.module.css'

export function MyDonations() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const { isAuthenticated, checked } = useAuth()
  const [list, setList] = useState<RecentDonation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (checked && !isAuthenticated) navigate('/login', { replace: true })
  }, [checked, isAuthenticated, navigate])

  useEffect(() => {
    let cancelled = false
    donationService
      .getMyDonations()
      .then((data) => {
        if (!cancelled) setList(data)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  if (!checked || !isAuthenticated) return null

  return (
    <PageLayout>
      <Container size="content">
        <h1 className={styles.title}>{t('nav.myDonations')}</h1>
        {loading ? (
          <p className={styles.placeholder}>{t('common.loading')}</p>
        ) : list.length === 0 ? (
          <p className={styles.placeholder}>—</p>
        ) : (
          <ul className={styles.list}>
            {list.map((d, i) => (
              <li key={(d as { id?: number }).id ?? i}>
                {(d as RecentDonation).amount ?? 0} OMR
                {(d as RecentDonation).created_at ? ` — ${(d as RecentDonation).created_at}` : ''}
              </li>
            ))}
          </ul>
        )}
      </Container>
    </PageLayout>
  )
}
