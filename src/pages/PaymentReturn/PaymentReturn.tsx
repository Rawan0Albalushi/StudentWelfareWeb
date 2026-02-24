import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageLayout } from '../../components/layout/PageLayout'
import { Container } from '../../components/ui/Container'
import { Button } from '../../components/ui/Button'
import { paymentService } from '../../services/paymentService'
import styles from './PaymentReturn.module.css'

const IconSuccess = () => (
  <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const IconCancelled = () => (
  <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
)

const IconError = () => (
  <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

export function PaymentReturn() {
  const { t } = useTranslation('common')
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'cancelled'>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const sessionId = searchParams.get('session_id') ?? searchParams.get('sessionId')
  const donationIdParam = searchParams.get('donation_id')
  const donationId = donationIdParam ? (donationIdParam as string) : undefined
  const result = searchParams.get('result') ?? searchParams.get('status')
  const cancelled =
    result === 'cancelled' || result === 'cancel' || searchParams.get('cancel') !== null

  useEffect(() => {
    if (cancelled) {
      setStatus('cancelled')
      return
    }
    const isSuccess = result === 'success'
    const confirmPayload = { session_id: sessionId, donation_id: donationId }
    if ((isSuccess || sessionId) && (sessionId || donationId)) {
      paymentService
        .confirm(confirmPayload)
        .then(() => setStatus('success'))
        .catch((err) => {
          setStatus('error')
          setErrorMessage(err instanceof Error ? err.message : 'Payment confirm failed')
        })
      return
    }
    if (sessionId) {
      paymentService
        .confirm(confirmPayload)
        .then(() => setStatus('success'))
        .catch(() => setStatus('error'))
      return
    }
    setStatus('error')
  }, [sessionId, donationId, result, cancelled])

  return (
    <PageLayout>
      <Container size="narrow">
        {status === 'success' && <div className={styles.successStrip} aria-hidden />}
        <section
          className={styles.card}
          data-status={status}
          aria-live="polite"
          aria-busy={status === 'loading'}
        >
          {status === 'loading' && (
            <>
              <div className={styles.spinner} aria-hidden />
              <p className={styles.message}>{t('common.loading')}</p>
            </>
          )}
          {status === 'success' && (
            <>
              <div className={styles.iconWrap}>
                <IconSuccess />
              </div>
              <h2 className={styles.title}>{t('donate.success')}</h2>
              <p className={styles.subtext}>{t('donate.successSubtext')}</p>
              <div className={styles.actions}>
                <Link to="/" className={styles.primaryLink}>
                  <Button size="lg">{t('nav.home')}</Button>
                </Link>
              </div>
            </>
          )}
          {status === 'cancelled' && (
            <>
              <div className={styles.iconWrap}>
                <IconCancelled />
              </div>
              <h2 className={styles.title}>{t('donate.paymentCancelled')}</h2>
              <div className={styles.actions}>
                <Link to="/donate">
                  <Button size="lg">{t('donate.title')}</Button>
                </Link>
              </div>
            </>
          )}
          {status === 'error' && (
            <>
              <div className={styles.iconWrap}>
                <IconError />
              </div>
              <h2 className={styles.title}>{errorMessage || t('donate.error')}</h2>
              <div className={styles.actions}>
                <Link to="/donate">
                  <Button variant="outline" size="lg">{t('common.retry')}</Button>
                </Link>
              </div>
            </>
          )}
        </section>
      </Container>
    </PageLayout>
  )
}
