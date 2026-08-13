import { useState } from 'react'
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useErrorToast } from '../../context/ErrorContext'
import { getApiErrorMessage } from '../../services/apiClient'
import {
  AuthShell,
  AuthField,
  AuthPasswordField,
  AuthError,
  PhoneIcon,
  ArrowIcon,
} from '../AuthShell'
import styles from '../Auth.module.css'

export function Login() {
  const { t } = useTranslation('common')
  const { login, loading } = useAuth()
  const { showError } = useErrorToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const from = (location.state as { from?: { pathname: string; search?: string } })?.from
  const returnUrl = searchParams.get('returnUrl') || (from ? from.pathname + (from.search ?? '') : '') || '/'
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!phone.trim() || !password) {
      setError(t('auth.requiredFields'))
      return
    }
    try {
      await login(phone.trim(), password)
      navigate(returnUrl, { replace: true })
    } catch (err) {
      const msg = getApiErrorMessage(err, t('common.error'))
      setError(msg)
      showError(msg, 'error')
    }
  }

  return (
    <AuthShell title={t('auth.login')} subtitle={t('auth.loginSubtitle')}>
      <AuthError message={error} />
      <form className={styles.form} onSubmit={handleSubmit}>
        <AuthField
          name="phone"
          type="tel"
          autoComplete="tel"
          inputMode="numeric"
          label={t('auth.phone')}
          icon={<PhoneIcon />}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t('auth.phonePlaceholder')}
          disabled={loading}
        />
        <AuthPasswordField
          name="password"
          autoComplete="current-password"
          label={t('auth.password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
        <Button type="submit" fullWidth size="lg" disabled={loading} className={styles.submitBtn}>
          {loading ? t('common.loading') : t('auth.submitLogin')}
          {!loading && <ArrowIcon />}
        </Button>
      </form>
      <p className={styles.footer}>
        {t('auth.noAccount')} <Link to="/register">{t('auth.register')}</Link>
      </p>
    </AuthShell>
  )
}
