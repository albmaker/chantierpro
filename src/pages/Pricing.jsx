import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Crown, ArrowLeft, Star, Sparkles, CheckCircle2, X, Zap } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import Modal from '../components/Modal'

const PLANS = [
  {
    id: 'starter',
    monthly: 19,
    annual: 182,
    label: 'Starter',
    description: 'Pour démarrer',
    color: 'slate',
    features: [
      'Devis illimités',
      'Factures PDF',
      'Compatible FE 2026',
      'Bibliothèque 40 ouvrages',
      '3 modèles de devis',
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
    color: 'orange',
    features: [
      'Tout du Starter',
      'Modèles de devis illimités',
      'Relances automatiques',
      'Signature électronique',
      'Statistiques avancées',
      'Support prioritaire',
    ],
  },
  {
    id: 'business',
    monthly: 79,
    annual: 758,
    label: 'Business',
    description: 'Pour les équipes',
    color: 'purple',
    features: [
      'Tout du Pro',
      'Multi-utilisateurs (5)',
      'Export comptable FEC',
      'API access',
      'Account manager dédié',
    ],
  },
]

const PLAN_FEATURES_HIGHLIGHT = {
  free: 'Plan actuel : Découverte (gratuit)',
  starter: 'Plan actuel : Starter',
  pro: 'Plan actuel : Pro',
  business: 'Plan actuel : Business',
}

export default function Pricing() {
  const navigate = useNavigate()
  const { upgradePlan, plan } = useData()
  const [billing, setBilling] = useState('monthly')
  const [showModal, setShowModal] = useState(null)
  const [processing, setProcessing] = useState(false)

  const currentPlanLabel = {
    free: 'Découverte',
    starter: 'Starter',
    pro: 'Pro',
    business: 'Business',
  }[plan] || 'Découverte'

  async function handleConfirmPayment() {
    if (!showModal) return
    setProcessing(true)
    await new Promise(r => setTimeout(r, 1000))
    upgradePlan(showModal.id)
    setProcessing(false)
    setShowModal(null)
    alert(`Plan ${showModal.label} activé avec succès ! Tu peux maintenant profiter de toutes les fonctionnalités.`)
    navigate('/dashboard')
  }

  function handleDowngrade() {
    if (confirm('Revenir au plan Découverte (gratuit) ?')) {
      upgradePlan('free')
      alert('Plan Découverte activé')
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen pb-24 bg-slate-50">
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-slate-200 px-5 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 -ml-2 rounded-full hover:bg-slate-100 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h1 className="text-lg font-bold text-slate-900">Tarifs et abonnements</h1>
      </div>

      <div className="px-5 pt-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Passe à la vitesse supérieure</h2>
          <p className="text-slate-600 text-sm">Annulable à tout moment · 14 jours satisfait ou remboursé</p>
        </div>

        {/* Plan actuel en évidence */}
        <div className="card bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 mb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-chantier flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Ton plan actuel</p>
                <p className="text-lg font-extrabold">{currentPlanLabel}</p>
              </div>
            </div>
            {plan !== 'free' && (
              <button onClick={handleDowngrade} className="text-xs text-slate-300 hover:text-white underline">
                Rétrograder
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center mb-6">
          <div className="bg-white rounded-full p-1 flex border border-slate-200 shadow-card">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${billing === 'monthly' ? 'bg-chantier text-white' : 'text-slate-600'}`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBilling('annual')}
              className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1 transition-colors ${billing === 'annual' ? 'bg-chantier text-white' : 'text-slate-600'}`}
            >
              Annuel <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-bold">-20%</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {PLANS.map(p => {
            const price = billing === 'annual' ? Math.round(p.annual / 12) : p.monthly
            const isCurrent = plan === p.id
            const isDowngrade = (plan === 'pro' && p.id === 'starter') || (plan === 'business' && (p.id === 'starter' || p.id === 'pro'))

            return (
              <div
                key={p.id}
                className={`card relative transition-all ${
                  isCurrent ? 'ring-2 ring-emerald-500 shadow-elevated' :
                  p.popular ? 'ring-2 ring-chantier shadow-elevated' : ''
                }`}
              >
                {isCurrent && (
                  <div className="absolute -top-3 left-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-soft">
                    <CheckCircle2 className="w-3 h-3" />
                    PLAN ACTUEL
                  </div>
                )}
                {p.popular && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-chantier text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-soft">
                    <Star className="w-3 h-3 fill-white" />
                    POPULAIRE
                  </div>
                )}
                <div className="flex items-start justify-between mb-3 mt-1">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                      {p.id === 'business' && <Crown className="w-5 h-5 text-yellow-500" />}
                      {p.label}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{p.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-extrabold text-slate-900">{price}€</p>
                    <p className="text-[10px] text-slate-500">/mois{billing === 'annual' && ' · facturé annuel'}</p>
                  </div>
                </div>

                <ul className="space-y-2 mb-4">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <div className="w-full font-semibold py-3 rounded-2xl bg-emerald-50 text-emerald-700 text-center text-sm">
                    ✓ Tu es sur ce plan
                  </div>
                ) : (
                  <button
                    onClick={() => setShowModal(p)}
                    className={`w-full font-semibold py-3 rounded-2xl transition-all active:scale-95 ${
                      p.popular
                        ? 'btn-primary'
                        : 'btn-secondary'
                    }`}
                  >
                    {isDowngrade ? 'Rétrograder vers ' + p.label : 'Passer à ' + p.label}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Plan gratuit */}
        {plan !== 'free' && (
          <div className="mt-3 text-center">
            <button onClick={handleDowngrade} className="text-sm text-slate-500 hover:text-slate-700 underline">
              Rétrograder vers le plan Découverte (gratuit)
            </button>
          </div>
        )}

        <div className="mt-8 space-y-3">
          <h3 className="text-lg font-bold text-slate-900">Questions fréquentes</h3>
          <details className="card">
            <summary className="cursor-pointer font-semibold text-slate-900">💳 Puis-je annuler à tout moment ?</summary>
            <p className="text-sm text-slate-600 mt-2">Oui, annulation 1-clic depuis ton espace. Sans frais.</p>
          </details>
          <details className="card">
            <summary className="cursor-pointer font-semibold text-slate-900">🔄 Y a-t-il une période d'essai ?</summary>
            <p className="text-sm text-slate-600 mt-2">Le plan Découverte te permet de tester sans CB. 14 jours satisfait ou remboursé sur les plans payants.</p>
          </details>
          <details className="card">
            <summary className="cursor-pointer font-semibold text-slate-900">📄 Compatible FE 2026 ?</summary>
            <p className="text-sm text-slate-600 mt-2">Oui, tous nos plans incluent la compatibilité Factur-X 2026.</p>
          </details>
          <details className="card">
            <summary className="cursor-pointer font-semibold text-slate-900">💰 Comment payer ?</summary>
            <p className="text-sm text-slate-600 mt-2">CB, SEPA, Apple Pay, Google Pay via Stripe.</p>
          </details>
          <details className="card">
            <summary className="cursor-pointer font-semibold text-slate-900">📉 Puis-je rétrograder ?</summary>
            <p className="text-sm text-slate-600 mt-2">Oui à tout moment. Tu conserves tes avantages jusqu'à la fin de la période payée.</p>
          </details>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500">
            <Sparkles className="w-3 h-3 inline mr-1" />
            Mode simulation : aucun paiement réel ne sera débité. Active/désactive le plan à volonté pour tester.
          </p>
        </div>
      </div>

      <Modal open={!!showModal} onClose={() => !processing && setShowModal(null)} title="Confirmer l'activation">
        {showModal && (
          <div className="space-y-3">
            <div className="card bg-slate-50 border-slate-200">
              <p className="text-xs text-slate-500 uppercase font-bold">Plan sélectionné</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{showModal.label}</p>
              <p className="text-sm text-chantier font-semibold mt-1">
                {billing === 'annual' ? `${showModal.annual}€/an` : `${showModal.monthly}€/mois`}
              </p>
            </div>
            <div className="card bg-amber-50 border-amber-200">
              <p className="text-xs text-amber-800 flex items-start gap-1.5">
                <Zap className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span><strong>Mode simulation</strong> : aucun paiement réel. Tu pourras activer/désactiver le plan à volonté.</span>
              </p>
            </div>
            {plan !== 'free' && (
              <div className="text-xs text-slate-500 text-center">
                Plan actuel : {currentPlanLabel}
              </div>
            )}
            <button
              onClick={handleConfirmPayment}
              disabled={processing}
              className="btn-primary w-full"
            >
              {processing ? 'Activation...' : `Activer ${showModal.label}`}
            </button>
            <button onClick={() => setShowModal(null)} disabled={processing} className="btn-secondary w-full">
              Annuler
            </button>
          </div>
        )}
      </Modal>
    </div>
  )
}
