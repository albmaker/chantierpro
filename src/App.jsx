import { useEffect, useState } from 'react'
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
import { supabase, getCurrentUser } from './lib/supabase'

function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCurrentUser().then(u => {
      setUser(u)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription?.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-chantier border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return children
}

function App() {
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

export default App
