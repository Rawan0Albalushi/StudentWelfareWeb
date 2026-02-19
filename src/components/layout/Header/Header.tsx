import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Container } from '../../ui/Container'
import { Button } from '../../ui/Button'
import { LanguageSwitcher } from '../../LanguageSwitcher'
import { useAuth } from '../../../context/AuthContext'
import { getDir } from '../../../i18n/config'
import styles from './Header.module.css'

export function Header() {
  const { t, i18n } = useTranslation('common')
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const isActive = (path: string) => (path === '/' ? location.pathname === '/' : location.pathname.startsWith(path))

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
    <header className={styles.header} role="banner">
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
                i18n.changeLanguage(lng)
                document.documentElement.setAttribute('dir', getDir(lng))
                document.documentElement.setAttribute('lang', lng)
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
    </header>
  )
}
