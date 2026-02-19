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

export function Register() {
  const { t } = useTranslation('common')
  const { register, loading } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!name.trim() || !phone.trim() || !password) {
      setError('Name, phone and password are required')
      return
    }
    if (password !== passwordConfirm) {
      setError(t('auth.passwordConfirm') + ' mismatch')
      return
    }
    try {
      await register({
        name: name.trim(),
        phone: phone.trim(),
        password,
        password_confirmation: passwordConfirm,
        email: email.trim() || undefined,
      })
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
        <h1 className={styles.title}>{t('auth.register')}</h1>
        <Card>
          <CardContent>
            {error && <p className={styles.error}>{error}</p>}
            <form className={styles.form} onSubmit={handleSubmit}>
              <label className={styles.label}>
                {t('auth.name')}
                <input
                  type="text"
                  className={styles.input}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </label>
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
                {t('auth.email')}
                <input
                  type="email"
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
              <label className={styles.label}>
                {t('auth.passwordConfirm')}
                <input
                  type="password"
                  className={styles.input}
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  disabled={loading}
                />
              </label>
              <Button type="submit" fullWidth size="lg" disabled={loading}>
                {loading ? t('common.loading') : t('auth.submitRegister')}
              </Button>
            </form>
            <p className={styles.footer}>
              {t('auth.hasAccount')} <Link to="/login">{t('auth.login')}</Link>
            </p>
          </CardContent>
        </Card>
      </Container>
    </PageLayout>
  )
}
