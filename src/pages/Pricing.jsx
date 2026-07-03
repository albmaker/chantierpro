import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Crown, Zap, ArrowLeft, Loader, Star } from 'lucide-react'
import { STRIPE_CONFIG, startCheckout } from '../lib/stripe'

export default function Pricing() {
  const navigate = useNavigate()
  const [billing, setBilling] = useState('monthly') // 'monthly' | 'annual'
  const [loading, setLoading] = useState(null)

  const handleSubscribe = async (plan) => {
    setLoading(plan)
    try {
      const priceId = billing === 'annual' ? plan.annual : plan.monthly
      // En démo, on simule. En prod, on appelle Stripe
      const fakeUserId = localStorage.getItem('demo_user_id') || 'demo-user'
      await startCheckout(priceId, fakeUserId)
    } catch (err) {
      alert('Erreur : ' + err.message)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3 border-b border-navy-700/50">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-navy-700 flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-lg font-bold text-white">Choisis ton plan</h1>
      </div>

      <div className="px-5 pt-6">
        {/* Titre */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Annulable à tout moment
          </h2>
          <p className="text-gray-400 text-sm">
            14 jours satisfait ou remboursé · Sans engagement
          </p>
        </div>

        {/* Toggle monthly/annual */}
        <div className="flex items-center justify-center mb-6">
          <div className="bg-navy-700 rounded-full p-1 flex">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                billing === 'monthly' ? 'bg-chantier text-white' : 'text-gray-300'
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBilling('annual')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                billing === 'annual' ? 'bg-chantier text-white' : 'text-gray-300'
              }`}
            >
              Annuel
              <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-full">-20%</span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="space-y-3">
          {Object.entries(STRIPE_CONFIG.prices).map(([key, plan]) => {
            const price = billing === 'annual' ? plan.amount * 0.8 * 12 : plan.amount
            const isPopular = plan.popular
            return (
              <div
                key={key}
                className={`card relative ${isPopular ? 'border-2 border-chantier' : ''}`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-chantier text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    POPULAIRE
                  </div>
                )}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      {key === 'business' && <Crown className="w-5 h-5 text-yellow-400" />}
                      {plan.label}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {key === 'starter' && 'Pour démarrer'}
                      {key === 'pro' && 'Pour les artisans actifs'}
                      {key === 'business' && 'Pour les équipes'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">
                      {billing === 'annual' ? (plan.amount * 0.8).toFixed(0) : plan.amount}€
                    </p>
                    <p className="text-xs text-gray-400">
                      /mois{billing === 'annual' && ' · facturé annuel'}
                    </p>
                  </div>
                </div>

                <ul className="space-y-2 mb-4">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-200">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={loading === plan}
                  className={`w-full font-semibold py-3 rounded-2xl transition-all active:scale-95 ${
                    isPopular
                      ? 'bg-chantier hover:bg-chantier-dark text-white'
                      : 'bg-navy-700 hover:bg-navy-600 text-white border border-navy-600'
                  }`}
                >
                  {loading === plan ? (
                    <Loader className="w-4 h-4 inline animate-spin mr-2" />
                  ) : (
                    <Zap className="w-4 h-4 inline mr-2" />
                  )}
                  Choisir {plan.label}
                </button>
              </div>
            )
          })}
        </div>

        {/* FAQ */}
        <div className="mt-8 space-y-3">
          <h3 className="text-lg font-bold text-white">Questions fréquentes</h3>

          <details className="card">
            <summary className="cursor-pointer font-medium text-white">💳 Puis-je annuler à tout moment ?</summary>
            <p className="text-sm text-gray-300 mt-2">
              Oui, annulation 1-clic depuis ton espace. Aucun engagement, aucun frais caché.
            </p>
          </details>

          <details className="card">
            <summary className="cursor-pointer font-medium text-white">🔄 Y a-t-il une période d'essai ?</summary>
            <p className="text-sm text-gray-300 mt-2">
              Le plan Free (2 devis/mois) te permet de tester sans carte bancaire. Sur les plans payants, tu as 14 jours satisfait ou remboursé.
            </p>
          </details>

          <details className="card">
            <summary className="cursor-pointer font-medium text-white">💰 Quels moyens de paiement ?</summary>
            <p className="text-sm text-gray-300 mt-2">
              CB, SEPA, Apple Pay, Google Pay. Toutes les transactions sont sécurisées par Stripe.
            </p>
          </details>

          <details className="card">
            <summary className="cursor-pointer font-medium text-white">📄 Compatible facturation électronique 2026 ?</summary>
            <p className="text-sm text-gray-300 mt-2">
              Oui, tous nos plans incluent la compatibilité Factur-X. Tu seras prêt pour septembre 2026.
            </p>
          </details>
        </div>

        {/* Trust */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Paiement sécurisé par Stripe · Données hébergées en France 🇫🇷
          </p>
        </div>
      </div>
    </div>
  )
}
