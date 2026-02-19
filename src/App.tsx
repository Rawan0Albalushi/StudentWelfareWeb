import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getDir } from './i18n/config'
import { AuthProvider } from './context/AuthContext'
import { AuthRedirectEffect } from './components/AuthRedirectEffect'
import { Home } from './pages/Home'
import { Campaigns } from './pages/Campaigns'
import { Donate } from './pages/Donate'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { News } from './pages/News'
import { Partners } from './pages/Partners'
import { About } from './pages/About'
import { Profile } from './pages/Profile'
import { MyDonations } from './pages/MyDonations'
import { PaymentReturn } from './pages/PaymentReturn'

function DirSync() {
  const { i18n } = useTranslation()
  useEffect(() => {
    const dir = getDir(i18n.language)
    const lang = i18n.language
    document.documentElement.setAttribute('dir', dir)
    document.documentElement.setAttribute('lang', lang)
  }, [i18n.language])
  return null
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DirSync />
        <AuthRedirectEffect />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/donate/return" element={<PaymentReturn />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/news" element={<News />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/about" element={<About />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-donations" element={<MyDonations />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
