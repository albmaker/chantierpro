import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Dashboard from './pages/Dashboard'
import DevisList from './pages/DevisList'
import DevisDetail from './pages/DevisDetail'
import FacturesList from './pages/FacturesList'
import ScannerIA from './pages/ScannerIA'
import Parametres from './pages/Parametres'
import NouveauDevis from './pages/NouveauDevis'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Pricing from './pages/Pricing'
import { BlogList, BlogPost } from './pages/Blog'
import { DataProvider, useData } from './contexts/DataContext'

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-900">
      <div className="animate-spin w-8 h-8 border-2 border-chantier border-t-transparent rounded-full" />
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { user, loading } = useData()
  if (loading) return <LoadingScreen />
  // On autorise l'accès même sans user (mode démo local)
  return children
}

function AppContent() {
  const location = useLocation()
  const hideNavRoutes = ['/', '/auth', '/pricing']
  const blogRoutes = location.pathname.startsWith('/blog')
  const showNav = !hideNavRoutes.includes(location.pathname) && !blogRoutes

  return (
    <div className="min-h-screen max-w-2xl mx-auto bg-navy-900">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blog/:slug" element={<BlogPost />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/devis" element={<ProtectedRoute><DevisList /></ProtectedRoute>} />
        <Route path="/devis/:id" element={<ProtectedRoute><DevisDetail /></ProtectedRoute>} />
        <Route path="/nouveau-devis" element={<ProtectedRoute><NouveauDevis /></ProtectedRoute>} />
        <Route path="/factures" element={<ProtectedRoute><FacturesList /></ProtectedRoute>} />
        <Route path="/scanner" element={<ProtectedRoute><ScannerIA /></ProtectedRoute>} />
        <Route path="/parametres" element={<ProtectedRoute><Parametres /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showNav && <BottomNav />}
    </div>
  )
}

function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  )
}

export default App
