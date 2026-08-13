import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useErrorToast } from '../../context/ErrorContext'
import { getApiErrorMessage } from '../../services/apiClient'
import { authService } from '../../services/authService'
import {
  AuthShell,
  AuthField,
  AuthPasswordField,
  AuthError,
  UserIcon,
  PhoneIcon,
  MailIcon,
  ArrowIcon,
} from '../AuthShell'
import styles from '../Auth.module.css'

const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV

export function Register() {
  const { t } = useTranslation('common')
  const { registerWithPhone, verifyOtp, resendOtp, loading } = useAuth()
  const { showError } = useErrorToast()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)

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
      setError(t('auth.requiredFields'))
      return
    }
    if (password !== passwordConfirm) {
      setError(t('auth.passwordMismatch'))
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

  const steps = (
    <div className={styles.steps}>
      <span className={`${styles.step} ${step === 'form' ? styles.stepActive : ''}`}>
        <span className={styles.stepDot}>1</span>
        {t('auth.stepAccount')}
      </span>
      <span className={`${styles.stepLine} ${step === 'otp' ? styles.stepLineActive : ''}`} />
      <span className={`${styles.step} ${step === 'otp' ? styles.stepActive : ''}`}>
        <span className={styles.stepDot}>2</span>
        {t('auth.stepVerify')}
      </span>
    </div>
  )

  if (step === 'otp') {
    return (
      <AuthShell title={t('auth.otpVerify')} subtitle={t('auth.otpSubtitle')}>
        {steps}
        <p className={styles.otpSent}>{t('auth.otpSent', { phone: maskedPhone || phoneForResend })}</p>
        <AuthError message={otpError} />
        <form className={styles.form} onSubmit={handleVerifyOtp}>
          <AuthField
            name="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            label={t('auth.otpVerify')}
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            disabled={loading}
            maxLength={6}
            className={styles.otpInput}
          />
          <Button type="submit" fullWidth size="lg" disabled={loading || !otpCode.trim()} className={styles.submitBtn}>
            {loading ? t('common.loading') : t('auth.verifyCode')}
            {!loading && <ArrowIcon />}
          </Button>
        </form>
        <p className={styles.resendRow}>
          <button
            type="button"
            className={styles.resendBtn}
            onClick={handleResendOtp}
            disabled={loading || resendCooldown > 0}
          >
            {resendCooldown > 0 ? `${t('auth.resendOtp')} (${resendCooldown}s)` : t('auth.resendOtp')}
          </button>
        </p>
        {isDev && (
          <p className={styles.devOtpRow}>
            <button type="button" className={styles.devOtpBtn} onClick={handleGetDevOtp} disabled={loading}>
              {t('auth.devOtp')}
            </button>
            {devOtp !== null && devOtp !== '' && <span className={styles.devOtpCode}>{devOtp}</span>}
          </p>
        )}
        <p className={styles.backRow}>
          <button
            type="button"
            className={styles.backLink}
            onClick={() => {
              setStep('form')
              setVerifyId(null)
              setOtpError(null)
            }}
          >
            {t('common.back')}
          </button>
        </p>
      </AuthShell>
    )
  }

  return (
    <AuthShell title={t('auth.register')} subtitle={t('auth.registerSubtitle')}>
      {steps}
      <AuthError message={error} />
      <form className={styles.form} onSubmit={handleSubmitForm}>
        <AuthField
          name="name"
          type="text"
          autoComplete="name"
          label={t('auth.name')}
          icon={<UserIcon />}
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />
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
        <AuthField
          name="email"
          type="email"
          autoComplete="email"
          label={t('auth.email')}
          hint={`(${t('auth.emailOptional')})`}
          icon={<MailIcon />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <AuthPasswordField
          name="password"
          autoComplete="new-password"
          label={t('auth.password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
        <AuthPasswordField
          name="passwordConfirm"
          autoComplete="new-password"
          label={t('auth.passwordConfirm')}
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          disabled={loading}
        />
        <Button type="submit" fullWidth size="lg" disabled={loading} className={styles.submitBtn}>
          {loading ? t('common.loading') : t('auth.submitRegister')}
          {!loading && <ArrowIcon />}
        </Button>
      </form>
      <p className={styles.footer}>
        {t('auth.hasAccount')} <Link to="/login">{t('auth.login')}</Link>
      </p>
    </AuthShell>
  )
}
