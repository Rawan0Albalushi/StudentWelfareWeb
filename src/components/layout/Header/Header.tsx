import { useState } from 'react'
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

  const isActive = (path: string) => (path === '/' ? location.pathname === '/' : location.pathname.startsWith(path))
  const isHome = location.pathname === '/'

  const navItems = [
    { to: '/', label: t('nav.home') },
    { to: '/campaigns', label: t('nav.campaigns') },
    { to: '/donate', label: t('nav.donate') },
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

  return (
    <header className={`${styles.header} ${isHome ? styles.headerStraight : ''}`.trim()} role="banner">
      <div className={styles.headerInner}>
      <Container size="wide" className={styles.container}>
        <Link to="/" className={styles.logo} aria-label={t('app.name')}>
          {t('app.name')}
        </Link>

        <button
          type="button"
          className={styles.menuToggle}
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
              value={i18n.language}
              onChange={(lng) => {
                setDocumentDirection(lng)
                i18n.changeLanguage(lng)
              }}
            />
            {isAuthenticated && user ? (
              <div className={styles.userWrap}>
                <button
                  type="button"
                  className={styles.userButton}
                  onClick={() => setUserMenuOpen((o) => !o)}
                  aria-expanded={userMenuOpen}
                >
                  {user.name || user.phone || t('nav.profile')}
                </button>
                {userMenuOpen && (
                  <>
                    <div
                      className={styles.userMenuBackdrop}
                      role="presentation"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className={styles.userMenu}>
                      <Link to="/profile" onClick={() => { setMenuOpen(false); setUserMenuOpen(false); }}>
                        {t('nav.profile')}
                      </Link>
                      <Link to="/my-donations" onClick={() => { setMenuOpen(false); setUserMenuOpen(false); }}>
                        {t('nav.myDonations')}
                      </Link>
                      <button type="button" onClick={handleLogout} disabled={authLoading}>
                        {t('nav.logout')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)}>
                  <Button variant="outline" size="sm">
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)}>
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
