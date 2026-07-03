import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Crown, ArrowLeft, Star, Sparkles, CheckCircle2, X } from 'lucide-react'
import { useData } from '../contexts/DataContext'

const PLANS = [
  {
    id: 'starter',
    monthly: 19,
    annual: 182, // 182€/an = 15.17€/mois
    label: 'Starter',
    description: 'Pour démarrer',
    features: [
      'Devis illimités',
      'Factures PDF',
      'Compatible FE 2026',
      'Bibliothèque 40 ouvrages',
      'Support email',
    ],
  },
  {
    id: 'pro',
    monthly: 39,
    annual: 374,
    label: 'Pro',
    description: 'Pour les pros du chantier',
    popular: true,
    features: [
      'Tout du Starter',
      'Scan IA illimité (Mistral)',
      'Relances automatiques',
      'Signature électronique',
      'Support prioritaire',
    ],
  },
  {
    id: 'business',
    monthly: 79,
    annual: 758,
    label: 'Business',
    description: 'Pour les équipes',
    features: [
      'Tout du Pro',
      'Multi-utilisateurs (5)',
      'Export comptable FEC',
      'API access',
      'Account manager',
    ],
  },
]

export default function Pricing() {
  const navigate = useNavigate()
  const { upgradePlan, plan } = useData()
  const [billing, setBilling] = useState('monthly')
  const [showModal, setShowModal] = useState(null) // plan selected
  const [processing, setProcessing] = useState(false)

  function handleSelect(planObj) {
    setShowModal(planObj)
  }

  async function handleConfirmPayment() {
    if (!showModal) return
    setProcessing(true)
    // Simulation d'un paiement (2 sec)
    await new Promise(r => setTimeout(r, 1500))
    upgradePlan(showModal.id)
    setProcessing(false)
    setShowModal(null)
    alert(`✅ Paiement simulé réussi ! Tu es maintenant sur le plan ${showModal.label}.`)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="px-5 py-4 flex items-center gap-3 border-b border-navy-700/50">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-navy-700 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-lg font-bold text-white">Choisis ton plan</h1>
      </div>

      <div className="px-5 pt-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Annulable à tout moment</h2>
          <p className="text-gray-400 text-sm">14 jours satisfait ou remboursé · Sans engagement</p>
        </div>

        <div className="flex items-center justify-center mb-6">
          <div className="bg-navy-700 rounded-full p-1 flex">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${billing === 'monthly' ? 'bg-chantier text-white' : 'text-gray-300'}`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBilling('annual')}
              className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1 ${billing === 'annual' ? 'bg-chantier text-white' : 'text-gray-300'}`}
            >
              Annuel
              <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-full">-20%</span>
            </button>
          </div>
        </div>

        {/* Plan actuel */}
        {plan && plan !== 'free' && (
          <div className="card bg-green-500/10 border-green-500/30 mb-4">
            <p className="text-sm text-green-300">
              <CheckCircle2 className="w-4 h-4 inline mr-1" />
              Tu es actuellement sur le plan <strong>{plan.toUpperCase()}</strong>
            </p>
          </div>
        )}

        <div className="space-y-3">
          {PLANS.map(p => {
            const price = billing === 'annual' ? Math.round(p.annual / 12) : p.monthly
            const isCurrent = plan === p.id
            return (
              <div
                key={p.id}
                className={`card relative ${p.popular ? 'border-2 border-chantier' : ''}`}
              >
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-chantier text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    POPULAIRE
                  </div>
                )}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      {p.id === 'business' && <Crown className="w-5 h-5 text-yellow-400" />}
                      {p.label}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">{p.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">{price}€</p>
                    <p className="text-xs text-gray-400">
                      /mois{billing === 'annual' && ' · facturé annuel'}
                    </p>
                  </div>
                </div>

                <ul className="space-y-2 mb-4">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-200">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelect(p)}
                  disabled={isCurrent}
                  className={`w-full font-semibold py-3 rounded-2xl transition-all active:scale-95 ${
                    isCurrent
                      ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                      : p.popular
                      ? 'bg-chantier hover:bg-chantier-dark text-white'
                      : 'bg-navy-700 hover:bg-navy-600 text-white border border-navy-600'
                  }`}
                >
                  {isCurrent ? '✓ Plan actuel' : `Choisir ${p.label}`}
                </button>
              </div>
            )
          })}
        </div>

        <div className="mt-8 space-y-3">
          <h3 className="text-lg font-bold text-white">Questions fréquentes</h3>
          <details className="card">
            <summary className="cursor-pointer font-medium text-white">💳 Puis-je annuler à tout moment ?</summary>
            <p className="text-sm text-gray-300 mt-2">Oui, annulation 1-clic depuis ton espace.</p>
          </details>
          <details className="card">
            <summary className="cursor-pointer font-medium text-white">🔄 Y a-t-il une période d'essai ?</summary>
            <p className="text-sm text-gray-300 mt-2">Le plan Free te permet de tester sans CB. 14 jours satisfait ou remboursé sur les plans payants.</p>
          </details>
          <details className="card">
            <summary className="cursor-pointer font-medium text-white">📄 Compatible FE 2026 ?</summary>
            <p className="text-sm text-gray-300 mt-2">Oui, tous nos plans incluent la compatibilité Factur-X.</p>
          </details>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            💡 Pour l'instant, les paiements sont en mode simulation (0€). Tu actives le plan pour tester les fonctionnalités.
          </p>
        </div>
      </div>

      {/* Modal de paiement simulé */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-navy-800 rounded-2xl p-6 max-w-md w-full border border-navy-700 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Confirmer le paiement</h3>
              <button onClick={() => setShowModal(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="bg-navy-700 rounded-xl p-4">
                <p className="text-sm text-gray-300">Plan sélectionné</p>
                <p className="text-2xl font-bold text-white">{showModal.label}</p>
                <p className="text-sm text-chantier">
                  {billing === 'annual' ? `${showModal.annual}€/an` : `${showModal.monthly}€/mois`}
                </p>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
                <p className="text-xs text-yellow-300">
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  <strong>Mode simulation</strong> : aucun paiement réel ne sera débité. Tu pourras activer/désactiver le plan à volonté.
                </p>
              </div>
              <button
                onClick={handleConfirmPayment}
                disabled={processing}
                className="btn-primary w-full"
              >
                {processing ? 'Traitement...' : `Activer ${showModal.label} (simulation)`}
              </button>
              <button onClick={() => setShowModal(null)} className="btn-secondary w-full">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
