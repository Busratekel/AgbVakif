import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { SupportAreas } from './components/SupportAreas'
import { Footer } from './components/Footer'
import { AnnouncementPopup } from './components/AnnouncementPopup'
import { KvkkProvider } from './components/KvkkModal'
import { ScrollToTop } from './components/ScrollToTop'
import { BasvuruLayout } from './components/BasvuruLayout'
import { BasvuruHub } from './pages/BasvuruHub'
import { BasvuruSss } from './pages/BasvuruSss'
import { BasvuruForm } from './pages/BasvuruForm'
import { BasvuruBelgeler } from './pages/BasvuruBelgeler'
import { KurumsalHakkinda } from './pages/KurumsalHakkinda'
import { KurumsalTarihce } from './pages/KurumsalTarihce'
import { KurumsalCeo } from './pages/KurumsalCeo'
import { KurumsalBaskan } from './pages/KurumsalBaskan'
import { KurumsalYonetim } from './pages/KurumsalYonetim'

import {
  AdminBasvuruDetail,
  AdminBasvuruList,
  AdminConfig,
  AdminHero,
  AdminLogin,
  AdminShell,
  AdminUsers,
} from './admin/AdminPages'

function PublicLayout() {
  return (
    <KvkkProvider>
      <AnnouncementPopup />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </KvkkProvider>
  )
}

function HomePage() {
  return (
    <>
      <Hero />
      <SupportAreas />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/kurumsal" element={<Navigate to="/kurumsal/hakkinda" replace />} />
          <Route path="/kurumsal/hakkinda" element={<KurumsalHakkinda />} />
          <Route path="/kurumsal/tarihce" element={<KurumsalTarihce />} />
          <Route path="/kurumsal/ceo" element={<KurumsalCeo />} />
          <Route path="/kurumsal/baskan" element={<KurumsalBaskan />} />
          <Route path="/kurumsal/yonetim-kurulu" element={<KurumsalYonetim />} />
          <Route path="/basvuru" element={<BasvuruLayout />}>
            <Route index element={<BasvuruHub />} />
            <Route path="sss" element={<BasvuruSss />} />
            <Route path="belgeler" element={<BasvuruBelgeler />} />
          </Route>
          <Route path="/basvuru/form" element={<BasvuruForm />} />
        </Route>
        <Route path="/admin/giris" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminShell />}>
          <Route index element={<AdminBasvuruList />} />
          <Route path="basvuru/:id" element={<AdminBasvuruDetail />} />
          <Route path="ayarlar" element={<AdminConfig />} />
          <Route path="hero" element={<AdminHero />} />
          <Route path="kullanicilar" element={<AdminUsers />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
