import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageLayout } from '../../components/layout/PageLayout'
import { Container } from '../../components/ui/Container'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import { useAuth } from '../../context/AuthContext'
import { useErrorToast } from '../../context/ErrorContext'
import { getApiErrorMessage } from '../../services/apiClient'
import { authService } from '../../services/authService'
import styles from '../Auth.module.css'

const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV

export function Register() {
  const { t } = useTranslation('common')
  const { registerWithPhone, verifyOtp, resendOtp, loading } = useAuth()
  const { showError } = useErrorToast()
  const navigate = useNavigate()

  // Step 1: registration form
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Step 2: OTP (after register/phone)
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [verifyId, setVerifyId] = useState<string | null>(null)
  const [phoneForResend, setPhoneForResend] = useState<string>('')
  const [maskedPhone, setMaskedPhone] = useState<string>('')
  const [otpCode, setOtpCode] = useState('')
  const [otpError, setOtpError] = useState<string | null>(null)
  const [devOtp, setDevOtp] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)

  async function handleSubmitForm(e: React.FormEvent) {
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
      const { verifyId: id, phone: masked } = await registerWithPhone({
        name: name.trim(),
        phone: phone.trim(),
        password,
        password_confirmation: passwordConfirm,
        email: email.trim() || undefined,
      })
      setVerifyId(id)
      setPhoneForResend(phone.trim())
      setMaskedPhone(masked || phone.trim())
      setOtpCode('')
      setOtpError(null)
      setDevOtp(null)
      setStep('otp')
      if (isDev) setResendCooldown(60)
    } catch (err) {
      const msg = getApiErrorMessage(err, t('common.error'))
      setError(msg)
      showError(msg, 'error')
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    if (!verifyId || !otpCode.trim()) {
      setOtpError(t('auth.otpVerify'))
      return
    }
    setOtpError(null)
    try {
      await verifyOtp(verifyId, otpCode.trim())
      navigate('/', { replace: true })
    } catch (err) {
      const msg = getApiErrorMessage(err, t('common.error'))
      setOtpError(msg)
      showError(msg, 'error')
    }
  }

  async function handleResendOtp() {
    if (resendCooldown > 0 || !phoneForResend) return
    setOtpError(null)
    try {
      const { verifyId: newId } = await resendOtp(phoneForResend)
      setVerifyId(newId)
      setOtpCode('')
      setDevOtp(null)
      setResendCooldown(60)
      const interval = setInterval(() => {
        setResendCooldown((c) => {
          if (c <= 1) clearInterval(interval)
          return c - 1
        })
      }, 1000)
    } catch (err) {
      const msg = getApiErrorMessage(err, t('common.error'))
      setOtpError(msg)
      showError(msg, 'error')
    }
  }

  async function handleGetDevOtp() {
    if (!verifyId) return
    try {
      const code = await authService.getDevOtp(verifyId)
      setDevOtp(code ?? '')
    } catch {
      setDevOtp('')
    }
  }

  if (step === 'otp') {
    return (
      <PageLayout>
        <Container size="narrow">
          <div className={styles.wrapper}>
            <h1 className={styles.title}>{t('auth.register')}</h1>
            <Card>
              <CardContent>
                <p className={styles.otpSent}>
                  {t('auth.otpSent', { phone: maskedPhone || phoneForResend })}
                </p>
                {otpError && <p className={styles.error}>{otpError}</p>}
                <form className={styles.form} onSubmit={handleVerifyOtp}>
                  <label className={styles.label}>
                    {t('auth.otpVerify')}
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      className={styles.input}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      disabled={loading}
                      maxLength={6}
                    />
                  </label>
                  <Button type="submit" fullWidth size="lg" disabled={loading || !otpCode.trim()}>
                    {loading ? t('common.loading') : t('auth.verifyCode')}
                  </Button>
                </form>
                <p className={styles.resendRow}>
                  <button
                    type="button"
                    className={styles.resendBtn}
                    onClick={handleResendOtp}
                    disabled={loading || resendCooldown > 0}
                  >
                    {resendCooldown > 0
                      ? `${t('auth.resendOtp')} (${resendCooldown}s)`
                      : t('auth.resendOtp')}
                  </button>
                </p>
                {isDev && (
                  <p className={styles.devOtpRow}>
                    <button
                      type="button"
                      className={styles.devOtpBtn}
                      onClick={handleGetDevOtp}
                      disabled={loading}
                    >
                      {t('auth.devOtp')}
                    </button>
                    {devOtp !== null && devOtp !== '' && (
                      <span className={styles.devOtpCode}> {devOtp}</span>
                    )}
                  </p>
                )}
                <p className={styles.footer}>
                  <button
                    type="button"
                    className={styles.backLink}
                    onClick={() => {
                      setStep('form')
                      setVerifyId(null)
                      setOtpError(null)
                    }}
                  >
                    ← {t('common.back')}
                  </button>
                </p>
              </CardContent>
            </Card>
          </div>
        </Container>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <Container size="narrow">
        <div className={styles.wrapper}>
          <h1 className={styles.title}>{t('auth.register')}</h1>
          <Card>
            <CardContent>
              {error && <p className={styles.error}>{error}</p>}
              <form className={styles.form} onSubmit={handleSubmitForm}>
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
        </div>
      </Container>
    </PageLayout>
  )
}
