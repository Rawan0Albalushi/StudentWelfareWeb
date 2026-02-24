import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageLayout } from '../../components/layout/PageLayout'
import { Container } from '../../components/ui/Container'
import { Button } from '../../components/ui/Button'
import { paymentService } from '../../services/paymentService'
import styles from './PaymentReturn.module.css'

export function PaymentReturn() {
  const { t } = useTranslation('common')
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'cancelled'>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')

  // Backend redirects to {origin}/payments/success?donation_id=...&session_id=...&result=success|cancel
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
        <div className={styles.box}>
          {status === 'loading' && <p className={styles.message}>{t('common.loading')}</p>}
          {status === 'success' && (
            <>
              <p className={styles.messageSuccess}>{t('donate.success')}</p>
              <Link to="/">
                <Button>{t('nav.home')}</Button>
              </Link>
            </>
          )}
          {status === 'cancelled' && (
            <>
              <p className={styles.messageMuted}>{t('donate.paymentCancelled')}</p>
              <Link to="/donate">
                <Button>{t('donate.title')}</Button>
              </Link>
            </>
          )}
          {status === 'error' && (
            <>
              <p className={styles.messageError}>{errorMessage || t('donate.error')}</p>
              <Link to="/donate">
                <Button variant="outline">{t('common.retry')}</Button>
              </Link>
            </>
          )}
        </div>
      </Container>
    </PageLayout>
  )
}
