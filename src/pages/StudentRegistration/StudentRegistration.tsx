import { useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageLayout } from '../../components/layout/PageLayout'
import { Container } from '../../components/ui/Container'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import styles from './StudentRegistration.module.css'

export function StudentRegistration() {
  const { i18n } = useTranslation('common')
  const { isAuthenticated, checked } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnUrl = searchParams.get('returnUrl') || '/student-registration'
  const lang = i18n.language === 'ar' ? 'ar' : 'en'

  useEffect(() => {
    if (!checked) return
    if (!isAuthenticated) {
      navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}`, { replace: true })
    }
  }, [checked, isAuthenticated, navigate, returnUrl])

  if (!checked || !isAuthenticated) {
    return null
  }

  const title = lang === 'ar' ? 'تسجيل طالب' : 'Student Registration'
  const intro =
    lang === 'ar'
      ? 'هذه الصفحة مخصصة لتقديم طلب الاستفادة من برامج الدعم. النموذج الكامل سيُفعّل قريباً عبر واجهة واحدة مع رفع المستندات.'
      : 'This page is for submitting your application for student support programs. The full form will be available soon with document upload.'
  const backHome = lang === 'ar' ? 'العودة للرئيسية' : 'Back to home'

  return (
    <PageLayout>
      <Container size="narrow">
        <div className={styles.wrapper}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.intro}>{intro}</p>
          <Link to="/">
            <Button variant="outline" size="lg">
              {backHome}
            </Button>
          </Link>
        </div>
      </Container>
    </PageLayout>
  )
}
