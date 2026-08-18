import { useTranslation } from 'react-i18next'
import styles from './CampaignAmountGoal.module.css'

export function getCampaignProgressPercent(raised: number, goal: number): number {
  if (goal <= 0) return 0
  return Math.min(100, Math.round((raised / goal) * 100))
}

function formatAmount(amount?: number): string {
  return (amount != null ? Number(amount) : 0).toLocaleString('en', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

function IconCoins() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="8" cy="8" r="6" />
      <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
      <path d="M7 6h1v4" />
      <path d="m16.71 13.88.7.71-2.82 2.82" />
    </svg>
  )
}

function IconTarget() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}

export interface CampaignAmountGoalProps {
  raisedAmount?: number
  goalAmount?: number
  progressPercent?: number
  className?: string
  progressSize?: 'sm' | 'md'
}

export function CampaignAmountGoal({
  raisedAmount,
  goalAmount,
  progressPercent,
  className = '',
  progressSize = 'sm',
}: CampaignAmountGoalProps) {
  const { t } = useTranslation('common')
  const raised = Number(raisedAmount) || 0
  const goal = Number(goalAmount) || 0
  const percent =
    progressPercent ?? getCampaignProgressPercent(raised, goal > 0 ? goal : 1)
  const currency = t('donate.currencyShort')

  return (
    <div className={`${styles.wrap} ${className}`.trim()}>
      <div className={styles.row}>
        <div className={styles.col}>
          <div className={styles.colHeader}>
            <span className={`${styles.icon} ${styles.iconRaised}`}>
              <IconCoins />
            </span>
            <span className={`${styles.label} ${styles.labelRaised}`}>{t('campaigns.raised')}</span>
          </div>
          <span className={`${styles.amount} ${styles.amountRaised}`}>
            {formatAmount(raised)} {currency}
          </span>
        </div>
        <div className={styles.col}>
          <div className={styles.colHeader}>
            <span className={`${styles.icon} ${styles.iconGoal}`}>
              <IconTarget />
            </span>
            <span className={`${styles.label} ${styles.labelGoal}`}>{t('campaigns.goal')}</span>
          </div>
          <span className={`${styles.amount} ${styles.amountGoal}`}>
            {formatAmount(goal)} {currency}
          </span>
        </div>
      </div>
      <div
        className={`${styles.progress} ${progressSize === 'md' ? styles.progressMd : ''}`}
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t('campaigns.raised')}
      >
        <div className={styles.progressFill} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
