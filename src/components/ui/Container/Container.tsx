import type { ReactNode } from 'react'
import styles from './Container.module.css'

type ContainerSize = 'narrow' | 'content' | 'wide'

interface ContainerProps {
  size?: ContainerSize
  className?: string
  children: ReactNode
}

export function Container({ size = 'content', className = '', children }: ContainerProps) {
  return (
    <div className={`${styles.container} ${styles[size]} ${className}`.trim()}>
      {children}
    </div>
  )
}
