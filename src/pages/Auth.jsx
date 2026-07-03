import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, Building2, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'
import { signIn, signUp } from '../lib/supabase'

export default function Auth() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState(location.state?.mode || 'login') // 'login' | 'signup'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const [form, setForm] = useState({
    email: '',
    password: '',
    companyName: '',
    siret: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (mode === 'signup') {
        if (form.password.length < 8) {
          throw new Error('Le mot de passe doit faire au moins 8 caractères')
        }
        await signUp({
          email: form.email,
          password: form.password,
          companyName: form.companyName,
          siret: form.siret,
        })
        setSuccess('Compte créé ! Vérifie ton email pour confirmer.')
        setTimeout(() => setMode('login'), 2000)
      } else {
        await signIn({ email: form.email, password: form.password })
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-12">
        <div className="w-10 h-10 rounded-xl bg-chantier flex items-center justify-center">
          <span className="text-white font-bold text-lg">CP</span>
        </div>
        <span className="text-xl font-bold text-white">ChantierPro</span>
      </div>

      <div className="flex-1 max-w-md mx-auto w-full">
        <h1 className="text-3xl font-bold text-white mb-2">
          {mode === 'login' ? 'Connexion' : 'Créer ton compte'}
        </h1>
        <p className="text-gray-400 mb-8">
          {mode === 'login'
            ? 'Retrouve tes devis et factures'
            : 'Commence à générer des devis en 2 minutes'}
        </p>

        {error && (
          <div className="card border-red-500/30 bg-red-500/10 mb-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="card border-green-500/30 bg-green-500/10 mb-4">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
              <p className="text-sm text-green-200">{success}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  className="input pl-12"
                  placeholder="Nom de l'entreprise"
                  value={form.companyName}
                  onChange={(e) => setForm({...form, companyName: e.target.value})}
                  required
                />
              </div>
              <input
                className="input"
                placeholder="SIRET (14 chiffres)"
                value={form.siret}
                onChange={(e) => setForm({...form, siret: e.target.value})}
                pattern="[0-9]{14}"
                required
              />
            </>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              className="input pl-12"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({...form, email: e.target.value})}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              className="input pl-12"
              placeholder="Mot de passe (min. 8 caractères)"
              value={form.password}
              onChange={(e) => setForm({...form, password: e.target.value})}
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? 'Chargement...' : (mode === 'login' ? 'Se connecter' : 'Créer mon compte')}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); setSuccess(null) }}
            className="text-sm text-chantier hover:underline"
          >
            {mode === 'login' ? "Pas encore de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
          </button>
        </div>

        {mode === 'login' && (
          <div className="text-center mt-2">
            <button className="text-xs text-gray-400 hover:text-gray-200">
              Mot de passe oublié ?
            </button>
          </div>
        )}
      </div>

      <div className="text-center mt-8">
        <button
          onClick={() => navigate('/')}
          className="text-sm text-gray-400 hover:text-white"
        >
          ← Retour à l'accueil
        </button>
      </div>
    </div>
  )
}
