import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Dashboard from './pages/Dashboard'
import DevisList from './pages/DevisList'
import DevisDetail from './pages/DevisDetail'
import FacturesList from './pages/FacturesList'
import Parametres from './pages/Parametres'
import NouveauDevis from './pages/NouveauDevis'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Pricing from './pages/Pricing'
import Clients from './pages/Clients'
import Stats from './pages/Stats'
import Messages from './pages/Messages'
import Signature from './pages/Signature'
import Objectifs from './pages/Objectifs'
import Profil from './pages/Profil'
import ConseilIA from './pages/ConseilIA'
import ExportData from './pages/ExportData'
import WizardDevis from './pages/WizardDevis'
import VoiceInput from './pages/VoiceInput'
import { BlogList, BlogPost } from './pages/Blog'
import { DataProvider, useData } from './contexts/DataContext'
import { ThemeProvider } from './contexts/ThemeContext'

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="animate-spin w-10 h-10 border-4 border-chantier border-t-transparent rounded-full" />
    </div>
  )
}

function AppContent() {
  const location = useLocation()
  const { loading } = useData()
  const hideNavRoutes = ['/', '/auth', '/pricing']
  const blogRoutes = location.pathname.startsWith('/blog')
  const showNav = !hideNavRoutes.includes(location.pathname) && !blogRoutes

  if (loading) return <LoadingScreen />

  return (
    <div className="min-h-screen max-w-2xl mx-auto bg-slate-50 dark:bg-slate-900">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blog/:slug" element={<BlogPost />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/devis" element={<DevisList />} />
        <Route path="/devis/:id" element={<DevisDetail />} />
        <Route path="/nouveau-devis" element={<NouveauDevis />} />
        <Route path="/wizard-devis" element={<WizardDevis />} />
        <Route path="/voice-input" element={<VoiceInput />} />
        <Route path="/factures" element={<FacturesList />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/parametres" element={<Parametres />} />
        <Route path="/profil" element={<Parametres />} />

        <Route path="/signature" element={<Signature />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/objectifs" element={<Objectifs />} />

        <Route path="/compte" element={<Profil />} />

        <Route path="/conseil" element={<ConseilIA />} />
        <Route path="/export" element={<ExportData />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showNav && <BottomNav />}
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </ThemeProvider>
  )
}

export default App
