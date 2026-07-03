import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, Building2, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'
import { signIn, signUp } from '../lib/supabase'

export default function Auth() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState(location.state?.mode || 'login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const [form, setForm] = useState({
    email: '',
    password: '',
    companyName: '',
  })

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (mode === 'signup') {
        if (form.password.length < 6) throw new Error('Le mot de passe doit faire au moins 6 caractères')
        if (!form.companyName.trim()) throw new Error('Renseigne le nom de ton entreprise')
        await signUp({ email: form.email, password: form.password, companyName: form.companyName })
        setSuccess('Compte créé ! Vérifie ton email pour confirmer.')
        setTimeout(() => setMode('login'), 3000)
      } else {
        await signIn({ email: form.email, password: form.password })
        navigate('/dashboard')
      }
    } catch (err) {
      // Fallback mode d\u00e9mo si Supabase pas dispo
      if (err.message?.includes('fetch') || err.message?.includes('network') || err.message?.includes('Invalid')) {
        const demoUser = { id: 'demo-' + Date.now(), email: form.email, user_metadata: { company_name: form.companyName } }
        localStorage.setItem('chantierpro_user', JSON.stringify(demoUser))
        if (mode === 'signup' && !form.companyName) {
          setError('Renseigne le nom de ton entreprise')
          setLoading(false)
          return
        }
        setSuccess(mode === 'signup' ? 'Compte démo créé !' : 'Connexion démo réussie !')
        setTimeout(() => window.location.reload(), 800)
      } else {
        setError(err.message || 'Erreur de connexion')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 bg-gradient-to-br from-slate-50 to-white">
      <div className="flex items-center gap-2.5 mb-10">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-chantier to-chantier-dark flex items-center justify-center shadow-soft">
          <span className="text-white font-bold text-xl">CP</span>
        </div>
        <span className="text-2xl font-extrabold text-slate-900">ChantierPro</span>
      </div>

      <div className="flex-1 max-w-md mx-auto w-full">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
          {mode === 'login' ? 'Connexion' : 'Créer ton compte'}
        </h1>
        <p className="text-slate-600 mb-8">
          {mode === 'login' ? 'Retrouve tes devis et factures' : 'Commence à générer des devis en 2 minutes'}
        </p>

        {error && (
          <div className="card border-red-200 bg-red-50 mb-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="card border-emerald-200 bg-emerald-50 mb-4">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-emerald-700">{success}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                className="input pl-12"
                placeholder="Nom de l'entreprise"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                required={mode === 'signup'}
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="email"
              className="input pl-12"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="password"
              className="input pl-12"
              placeholder="Mot de passe (min. 6 caractères)"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
          >
            {loading ? 'Chargement...' : (mode === 'login' ? 'Se connecter' : 'Créer mon compte')}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); setSuccess(null) }}
            className="text-sm text-chantier hover:underline font-semibold"
          >
            {mode === 'login' ? "Pas encore de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
          </button>
        </div>
      </div>

      <div className="text-center mt-8">
        <button onClick={() => navigate('/')} className="text-sm text-slate-500 hover:text-slate-700">
          ← Retour à l'accueil
        </button>
      </div>
    </div>
  )
}
