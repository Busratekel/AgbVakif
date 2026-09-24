import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { About } from './components/About'
import { SupportAreas } from './components/SupportAreas'
import { ApplicationWizard } from './components/ApplicationWizard'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import { KvkkProvider } from './components/KvkkModal'

export default function App() {
  return (
    <KvkkProvider>
      <Header />
      <main>
        <Hero />
        <About />
        <SupportAreas />
        <ApplicationWizard />
        <Contact />
      </main>
      <Footer />
    </KvkkProvider>
  )
}
