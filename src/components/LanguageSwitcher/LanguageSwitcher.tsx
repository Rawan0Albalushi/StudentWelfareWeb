import { useTranslation } from 'react-i18next'
import type { Locale } from '../../i18n/config'
import styles from './LanguageSwitcher.module.css'

interface LanguageSwitcherProps {
  value: string
  onChange: (lng: Locale) => void
  /** Light controls for use on dark / hero backgrounds */
  tone?: 'default' | 'onDark'
}

export function LanguageSwitcher({ value, onChange, tone = 'default' }: LanguageSwitcherProps) {
  const { t } = useTranslation('common')
  const wrapClass = tone === 'onDark' ? `${styles.wrapper} ${styles.wrapperOnDark}` : styles.wrapper

  return (
    <div className={wrapClass} role="group" aria-label={t('common.language')}>
      <button
        type="button"
        className={value === 'ar' ? `${styles.btn} ${styles.active}` : styles.btn}
        onClick={() => onChange('ar')}
        aria-pressed={value === 'ar'}
      >
        العربية
      </button>
      <button
        type="button"
        className={value === 'en' ? `${styles.btn} ${styles.active}` : styles.btn}
        onClick={() => onChange('en')}
        aria-pressed={value === 'en'}
      >
        English
      </button>
    </div>
  )
}
