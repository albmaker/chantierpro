import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Crown, ArrowLeft, Star, Sparkles, CheckCircle2, X } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import Modal from '../components/Modal'

const PLANS = [
  {
    id: 'starter',
    monthly: 19,
    annual: 182,
    label: 'Starter',
    description: 'Pour d\u00e9marrer',
    features: [
      'Devis illimit\u00e9s',
      'Factures PDF',
      'Compatible FE 2026',
      'Biblioth\u00e8que 40 ouvrages',
      '3 mod\u00e8les de devis',
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
      'Mod\u00e8les de devis illimit\u00e9s',
      'Relances automatiques',
      'Signature \u00e9lectronique',
      'Statistiques avanc\u00e9es',
      'Support prioritaire',
    ],
  },
  {
    id: 'business',
    monthly: 79,
    annual: 758,
    label: 'Business',
    description: 'Pour les \u00e9quipes',
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
  const [showModal, setShowModal] = useState(null)
  const [processing, setProcessing] = useState(false)

  async function handleConfirmPayment() {
    if (!showModal) return
    setProcessing(true)
    await new Promise(r => setTimeout(r, 1200))
    upgradePlan(showModal.id)
    setProcessing(false)
    setShowModal(null)
    alert(`Plan ${showModal.label} activ\u00e9 avec succ\u00e8s ! Tu peux maintenant profiter de toutes les fonctionnalit\u00e9s.`)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen pb-24 bg-slate-50">
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-slate-200 px-5 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 -ml-2 rounded-full hover:bg-slate-100 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h1 className="text-lg font-bold text-slate-900">Choisis ton plan</h1>
      </div>

      <div className="px-5 pt-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Annulable \u00e0 tout moment</h2>
          <p className="text-slate-600 text-sm">14 jours satisfait ou rembours\u00e9 \u00b7 Sans engagement</p>
        </div>

        <div className="flex items-center justify-center mb-6">
          <div className="bg-white rounded-full p-1 flex border border-slate-200 shadow-card">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-4 py-2 rounded-full text-sm font-semibold ${billing === 'monthly' ? 'bg-chantier text-white' : 'text-slate-600'}`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBilling('annual')}
              className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1 ${billing === 'annual' ? 'bg-chantier text-white' : 'text-slate-600'}`}
            >
              Annuel <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-bold">-20%</span>
            </button>
          </div>
        </div>

        {plan && plan !== 'free' && (
          <div className="card bg-emerald-50 border-emerald-200 mb-4">
            <p className="text-sm text-emerald-700 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Tu es sur le plan <strong>{plan.toUpperCase()}</strong>
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
                className={`card relative ${p.popular ? 'ring-2 ring-chantier shadow-elevated' : ''}`}
              >
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-chantier text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-soft">
                    <Star className="w-3 h-3 fill-white" />
                    POPULAIRE
                  </div>
                )}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      {p.id === 'business' && <Crown className="w-5 h-5 text-yellow-500" />}
                      {p.label}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">{p.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-slate-900">{price}\u20ac</p>
                    <p className="text-xs text-slate-500">/mois{billing === 'annual' && ' HT'}</p>
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

                <button
                  onClick={() => setShowModal(p)}
                  disabled={isCurrent}
                  className={`w-full font-semibold py-3 rounded-2xl transition-all active:scale-95 ${
                    isCurrent
                      ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed'
                      : p.popular
                      ? 'btn-primary'
                      : 'btn-secondary'
                  }`}
                >
                  {isCurrent ? '\u2713 Plan actuel' : `Choisir ${p.label}`}
                </button>
              </div>
            )
          })}
        </div>

        <div className="mt-8 space-y-3">
          <h3 className="text-lg font-bold text-slate-900">Questions fr\u00e9quentes</h3>
          <details className="card">
            <summary className="cursor-pointer font-semibold text-slate-900">\ud83d\udcb3 Puis-je annuler \u00e0 tout moment ?</summary>
            <p className="text-sm text-slate-600 mt-2">Oui, annulation 1-clic depuis ton espace.</p>
          </details>
          <details className="card">
            <summary className="cursor-pointer font-semibold text-slate-900">\ud83d\udd04 Y a-t-il une p\u00e9riode d'essai ?</summary>
            <p className="text-sm text-slate-600 mt-2">Le plan Free te permet de tester sans CB. 14 jours satisfait ou rembours\u00e9 sur les plans payants.</p>
          </details>
          <details className="card">
            <summary className="cursor-pointer font-semibold text-slate-900">\ud83d\udcc4 Compatible FE 2026 ?</summary>
            <p className="text-sm text-slate-600 mt-2">Oui, tous nos plans incluent la compatibilit\u00e9 Factur-X 2026.</p>
          </details>
          <details className="card">
            <summary className="cursor-pointer font-semibold text-slate-900">\ud83d\udcb0 Comment payer ?</summary>
            <p className="text-sm text-slate-600 mt-2">CB, SEPA, Apple Pay, Google Pay via Stripe.</p>
          </details>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500">
            <Sparkles className="w-3 h-3 inline mr-1" />
            Mode simulation : aucun paiement r\u00e9el ne sera d\u00e9bit\u00e9. Tu peux activer/d\u00e9sactiver le plan \u00e0 volont\u00e9.
          </p>
        </div>
      </div>

      <Modal open={!!showModal} onClose={() => !processing && setShowModal(null)} title="Confirmer le paiement">
        {showModal && (
          <div className="space-y-3">
            <div className="card bg-slate-50 border-slate-200">
              <p className="text-xs text-slate-500 uppercase font-bold">Plan s\u00e9lectionn\u00e9</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{showModal.label}</p>
              <p className="text-sm text-chantier font-semibold mt-1">
                {billing === 'annual' ? `${showModal.annual}\u20ac/an` : `${showModal.monthly}\u20ac/mois`}
              </p>
            </div>
            <div className="card bg-amber-50 border-amber-200">
              <p className="text-xs text-amber-800">
                <Sparkles className="w-3 h-3 inline mr-1" />
                <strong>Mode simulation</strong> : aucun paiement r\u00e9el ne sera d\u00e9bit\u00e9. Tu pourras activer/d\u00e9sactiver le plan \u00e0 volont\u00e9.
              </p>
            </div>
            <button
              onClick={handleConfirmPayment}
              disabled={processing}
              className="btn-primary w-full"
            >
              {processing ? 'Traitement...' : `Activer ${showModal.label}`}
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
