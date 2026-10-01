import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { HeroBelowMessage } from './components/HeroBelowMessage'
import { Footer } from './components/Footer'
import { AnnouncementPopup } from './components/AnnouncementPopup'
import { KvkkProvider } from './components/KvkkModal'
import { ScrollToTop } from './components/ScrollToTop'
import { BasvuruLayout } from './components/BasvuruLayout'
import { KurumsalLayout } from './components/KurumsalLayout'
import { MedyaLayout } from './components/MedyaLayout'
import { BasvuruHub } from './pages/BasvuruHub'
import { BasvuruSss } from './pages/BasvuruSss'
import { BasvuruForm } from './pages/BasvuruForm'
import { YardimHub } from './pages/YardimHub'
import { YardimForm } from './pages/YardimForm'
import { BasvuruBelgeler } from './pages/BasvuruBelgeler'
//import { BasvuruIstatistikler } from './pages/BasvuruIstatistikler'
import { KurumsalHakkinda } from './pages/KurumsalHakkinda'
import { KurumsalTarihce } from './pages/KurumsalTarihce'
import { KurumsalBaskan } from './pages/KurumsalBaskan'
import { KurumsalYonetim } from './pages/KurumsalYonetim'
import { MedyaFaaliyetRaporu } from './pages/MedyaFaaliyetRaporu'
import { MedyaHaber } from './pages/MedyaHaber'
import { MedyaBasinBultenleri } from './pages/MedyaBasinBultenleri'
import { MedyaKurumsalKimlik } from './pages/MedyaKurumsalKimlik'
import { Iletisim } from './pages/Iletisim'
import { KvkkMetni } from './pages/KvkkMetni'
import { GizlilikPolitikasi } from './pages/GizlilikPolitikasi'
import { CerezPolitikasi } from './pages/CerezPolitikasi'

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
      <HeroBelowMessage />
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
          <Route path="/kurumsal" element={<KurumsalLayout />}>
            <Route index element={<Navigate to="hakkinda" replace />} />
            <Route path="hakkinda" element={<KurumsalHakkinda />} />
            <Route path="tarihce" element={<KurumsalTarihce />} />
            <Route path="baskan" element={<KurumsalBaskan />} />
            <Route path="yonetim-kurulu" element={<KurumsalYonetim />} />
          </Route>
          <Route path="/medya" element={<MedyaLayout />}>
            <Route index element={<Navigate to="faaliyet-raporu" replace />} />
            <Route path="faaliyet-raporu" element={<MedyaFaaliyetRaporu />} />
            <Route path="haber" element={<MedyaHaber />} />
            <Route path="basin-bultenleri" element={<MedyaBasinBultenleri />} />
            <Route path="kurumsal-kimlik" element={<MedyaKurumsalKimlik />} />
          </Route>
          <Route path="/basvuru" element={<BasvuruLayout />}>
            <Route index element={<BasvuruHub />} />
            {/*<Route path="istatistikler" element={<BasvuruIstatistikler />} />*/}
            <Route path="sss" element={<BasvuruSss />} />
            <Route path="belgeler" element={<BasvuruBelgeler />} />
          </Route>
          <Route path="/basvuru/form" element={<BasvuruForm />} />
          <Route path="/yardim" element={<BasvuruLayout />}>
            <Route index element={<YardimHub />} />
          </Route>
          <Route path="/yardim/form" element={<YardimForm />} />
          <Route path="/iletisim" element={<Iletisim />} />
          <Route path="/yasal/kvkk" element={<KvkkMetni />} />
          <Route path="/yasal/gizlilik-politikasi" element={<GizlilikPolitikasi />} />
          <Route path="/yasal/cerez-politikasi" element={<CerezPolitikasi />} />
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
