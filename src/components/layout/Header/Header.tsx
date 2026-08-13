import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Container } from '../../ui/Container'
import { Button } from '../../ui/Button'
import { LanguageSwitcher } from '../../LanguageSwitcher'
import { useAuth } from '../../../context/AuthContext'
import { setDocumentDirection } from '../../../i18n/config'
import styles from './Header.module.css'

export function Header() {
  const { t, i18n } = useTranslation('common')
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const userButtonRef = useRef<HTMLButtonElement>(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0, left: 0 })

  const isActive = (path: string) => (path === '/' ? location.pathname === '/' : location.pathname.startsWith(path))
  const isHome = location.pathname === '/'

  const navItems = [
    { to: '/', label: t('nav.home') },
    { to: '/campaigns', label: t('nav.campaigns') },
    ...(isAuthenticated ? [{ to: '/my-donations', label: t('nav.myDonations') }] : []),
    { to: '/news', label: t('nav.news') },
    { to: '/partners', label: t('nav.partners') },
    { to: '/about', label: t('nav.about') },
  ]

  async function handleLogout() {
    await logout()
    setUserMenuOpen(false)
    setMenuOpen(false)
    navigate('/')
  }

  useLayoutEffect(() => {
    if (!userMenuOpen || !userButtonRef.current) return
    const rect = userButtonRef.current.getBoundingClientRect()
    setMenuPosition({
      top: rect.bottom + 4,
      right: window.innerWidth - rect.right,
      left: rect.left,
    })
  }, [userMenuOpen])

  useEffect(() => {
    if (!userMenuOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setUserMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [userMenuOpen])

  useEffect(() => {
    if (!isHome) {
      setScrolled(false)
      return
    }
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isHome])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  const isRtl = (i18n.language || '').startsWith('ar')
  const headerClass = [
    styles.header,
    isHome ? styles.headerOnHero : '',
    isHome && scrolled ? styles.headerScrolled : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <header className={headerClass} role="banner">
      <div className={styles.headerInner}>
      <Container size="wide" className={styles.container}>
        <Link to="/" className={styles.logo} aria-label={t('app.name')}>
          <span className={styles.logoMark} aria-hidden="true" />
          <span className={styles.logoText}>{t('app.name')}</span>
        </Link>

        <button
          type="button"
          className={`${styles.menuToggle} ${menuOpen ? styles.menuToggleOpen : ''}`}
          aria-expanded={menuOpen}
          aria-controls="main-nav"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className={styles.hamburger} />
          <span className={styles.hamburger} />
          <span className={styles.hamburger} />
        </button>

        <nav
          id="main-nav"
          className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}
          aria-label="Main navigation"
        >
          <ul className={styles.navList}>
            {navItems.map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className={isActive(to) ? `${styles.navLink} ${styles.active}` : styles.navLink}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className={styles.actions}>
            <LanguageSwitcher
              tone={isHome && !menuOpen ? 'onDark' : 'default'}
              value={i18n.language}
              onChange={(lng) => {
                setDocumentDirection(lng)
                i18n.changeLanguage(lng)
              }}
            />
            {isAuthenticated && user ? (
              <div className={styles.userWrap}>
                <button
                  ref={userButtonRef}
                  type="button"
                  className={styles.userButton}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setUserMenuOpen((o) => !o)
                  }}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="menu"
                  aria-controls="user-menu"
                  id="user-menu-button"
                >
                  {user.name || user.phone || t('nav.myDonations')}
                </button>
                {userMenuOpen &&
                  createPortal(
                    <>
                      <div
                        className={styles.userMenuBackdrop}
                        role="presentation"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div
                        id="user-menu"
                        className={styles.userMenu}
                        role="menu"
                        aria-labelledby="user-menu-button"
                        dir={isRtl ? 'rtl' : 'ltr'}
                        style={{
                          position: 'fixed',
                          top: menuPosition.top,
                          ...(isRtl ? { left: menuPosition.left, right: 'auto' } : { right: menuPosition.right, left: 'auto' }),
                          marginTop: 0,
                        }}
                      >
                        <Link to="/my-donations" role="menuitem" onClick={() => { setMenuOpen(false); setUserMenuOpen(false); }}>
                          {t('nav.myDonations')}
                        </Link>
                        <button type="button" role="menuitem" onClick={handleLogout} disabled={authLoading}>
                          {t('nav.logout')}
                        </button>
                      </div>
                    </>,
                    document.body
                  )}
              </div>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className={styles.authLink}>
                  <Button variant="outline" size="sm">
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className={styles.authLinkPrimary}>
                  <Button size="sm">{t('nav.register')}</Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </Container>
      {!isHome && (
        <div className={styles.waveWrap} aria-hidden>
          <svg className={styles.wave} viewBox="0 0 320 24" preserveAspectRatio="none">
            <defs>
              <linearGradient id="headerWaveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A0207E" />
                <stop offset="100%" stopColor="#2DAAE2" />
              </linearGradient>
            </defs>
            <path d="M0 12C40 0 120 24 160 12C200 0 280 24 320 12V24H0V12Z" fill="url(#headerWaveGradient)" />
          </svg>
        </div>
      )}
      </div>
    </header>
  )
}
