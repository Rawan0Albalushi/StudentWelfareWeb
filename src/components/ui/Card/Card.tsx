import type { ReactNode } from 'react'
import styles from './Card.module.css'

interface CardProps {
  className?: string
  children: ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({ className = '', children, padding = 'md' }: CardProps) {
  return (
    <div className={`${styles.card} ${styles[`padding-${padding}`]} ${className}`.trim()}>
      {children}
    </div>
  )
}

export function CardHeader({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={`${styles.header} ${className}`.trim()}>{children}</div>
}

export function CardContent({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={`${styles.content} ${className}`.trim()}>{children}</div>
}

export function CardFooter({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={`${styles.footer} ${className}`.trim()}>{children}</div>
}
