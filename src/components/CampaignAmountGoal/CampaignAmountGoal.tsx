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

function IconWallet() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
    </svg>
  )
}

function IconFlag() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M14.4 6 14 4H5v17h2v-7h5.6l.4 2h7V6h-5.6z" />
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
              <IconWallet />
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
              <IconFlag />
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
