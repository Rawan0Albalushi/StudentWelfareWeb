import { useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { PageLayout } from '../components/layout/PageLayout'
import styles from './Auth.module.css'

interface AuthShellProps {
  title: string
  subtitle: string
  children: ReactNode
}

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  const { t } = useTranslation('common')

  return (
    <PageLayout noPadding>
      <section className={styles.page} aria-labelledby="auth-title">
        <div className={styles.brandPanel}>
          <div className={styles.brandGlow} />
          <div className={styles.brandShapes} />
          <div className={styles.brandInner}>
            <p className={styles.brandEyebrow}>{t('app.name')}</p>
            <h2 className={styles.brandTitle}>{t('auth.welcomeTitle')}</h2>
            <p className={styles.brandBody}>{t('auth.welcomeBody')}</p>
            <ul className={styles.brandFeatures}>
              <li>
                <span className={styles.brandFeatureIcon} aria-hidden>
                  <ShieldIcon />
                </span>
                {t('auth.feature1')}
              </li>
              <li>
                <span className={styles.brandFeatureIcon} aria-hidden>
                  <HeartIcon />
                </span>
                {t('auth.feature2')}
              </li>
              <li>
                <span className={styles.brandFeatureIcon} aria-hidden>
                  <UsersIcon />
                </span>
                {t('auth.feature3')}
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.formPanel}>
          <div className={styles.formCard}>
            <header className={styles.formHeader}>
              <h1 id="auth-title" className={styles.title}>
                {title}
              </h1>
              <p className={styles.subtitle}>{subtitle}</p>
            </header>
            {children}
          </div>
        </div>
      </section>
    </PageLayout>
  )
}

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon?: ReactNode
  hint?: string
}

export function AuthField({ label, icon, hint, className = '', id, ...inputProps }: AuthFieldProps) {
  const inputId = id ?? inputProps.name

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
        {hint ? <span className={styles.optional}> {hint}</span> : null}
      </label>
      <div className={styles.control}>
        {icon ? (
          <span className={styles.controlIcon} aria-hidden>
            {icon}
          </span>
        ) : null}
        <input
          id={inputId}
          className={`${styles.input} ${icon ? styles.inputWithIcon : ''} ${className}`.trim()}
          {...inputProps}
        />
      </div>
    </div>
  )
}

interface AuthPasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
}

export function AuthPasswordField({ label, id, ...inputProps }: AuthPasswordFieldProps) {
  const { t } = useTranslation('common')
  const [visible, setVisible] = useState(false)
  const inputId = id ?? inputProps.name

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
      </label>
      <div className={styles.control}>
        <span className={styles.controlIcon} aria-hidden>
          <LockIcon />
        </span>
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          className={`${styles.input} ${styles.inputWithIcon} ${styles.inputWithToggle}`}
          {...inputProps}
        />
        <button
          type="button"
          className={styles.eyeBtn}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? t('auth.hidePassword') : t('auth.showPassword')}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  )
}

export function AuthError({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p className={styles.error} role="alert">
      <span className={styles.errorIcon} aria-hidden>
        <AlertIcon />
      </span>
      {message}
    </p>
  )
}

export function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

export function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

export function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="11" width="16" height="11" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-6.5 0-10-7-10-7a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c6.5 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="m1 1 22 22" />
      <path d="M14.12 14.12A3 3 0 0 1 9.88 9.88" />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 4 7v6c0 5 3.4 8.4 8 9 4.6-.6 8-4 8-9V7l-8-4Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.8 8.6a5.5 5.5 0 0 0-7.8 0L12 9.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

export function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  )
}
