import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageLayout } from '../../components/layout/PageLayout'
import { Container } from '../../components/ui/Container'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import { useAuth } from '../../context/AuthContext'
import { ApiError } from '../../services/apiClient'
import styles from '../Auth.module.css'

export function Login() {
  const { t } = useTranslation('common')
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!phone.trim() || !password) {
      setError(t('auth.phone') + ' / ' + t('auth.password') + ' required')
      return
    }
    try {
      await login(phone.trim(), password)
      navigate('/', { replace: true })
    } catch (err) {
      const msg = err instanceof ApiError && err.data && typeof err.data === 'object' && (err.data as { message?: string }).message
        ? (err.data as { message: string }).message
        : err instanceof Error ? err.message : t('common.error')
      setError(msg)
    }
  }

  return (
    <PageLayout>
      <Container size="narrow">
        <h1 className={styles.title}>{t('auth.login')}</h1>
        <Card>
          <CardContent>
            {error && <p className={styles.error}>{error}</p>}
            <form className={styles.form} onSubmit={handleSubmit}>
              <label className={styles.label}>
                {t('auth.phone')}
                <input
                  type="tel"
                  className={styles.input}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="968XXXXXXXX"
                  disabled={loading}
                />
              </label>
              <label className={styles.label}>
                {t('auth.password')}
                <input
                  type="password"
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </label>
              <Button type="submit" fullWidth size="lg" disabled={loading}>
                {loading ? t('common.loading') : t('auth.submitLogin')}
              </Button>
            </form>
            <p className={styles.footer}>
              {t('auth.noAccount')} <Link to="/register">{t('auth.register')}</Link>
            </p>
          </CardContent>
        </Card>
      </Container>
    </PageLayout>
  )
}
