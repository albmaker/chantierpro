import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FileText, TrendingUp, AlertCircle, Briefcase, Euro, Sparkles, ArrowRight, Users } from 'lucide-react'
import Header from '../components/Header'
import StatCard from '../components/StatCard'
import EmptyState from '../components/EmptyState'
import DevisCard, { computeTotals } from '../components/DevisCard'
import { useData } from '../contexts/DataContext'

export default function Dashboard() {
  const navigate = useNavigate()
  const { devis, factures, profile, clients } = useData()

  // Stats calculées
  const facturesEnAttente = factures.filter(f => f.statut === 'en_attente' || f.statut === 'en_retard')
  const facturesEnRetard = factures.filter(f => f.statut === 'en_retard')
  const caPaye = factures
    .filter(f => f.statut === 'payee')
    .reduce((s, f) => s + computeTotals(f.lignes).totalTTC, 0)
  const caEnAttente = facturesEnAttente.reduce((s, f) => s + computeTotals(f.lignes).totalTTC, 0)
  const devisEnAttente = devis.filter(d => d.statut === 'en_attente')

  const firstName = profile?.company_name?.split(' ')[0] || 'Artisan'
  const isNewUser = devis.length === 0 && factures.length === 0

  return (
    <div className="pb-24">
      <Header
        title={`Bonjour ${firstName} 👋`}
        subtitle={isNewUser ? "Bienvenue, configurons votre espace" : `${devis.length} devis · ${factures.length} factures`}
        action={
          <button
            onClick={() => navigate('/nouveau-devis')}
            className="w-11 h-11 rounded-full bg-chantier flex items-center justify-center shadow-soft active:scale-95"
            aria-label="Nouveau devis"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        }
      />

      <div className="px-5 pt-4 space-y-4">
        {isNewUser ? (
          <>
            {/* Onboarding pour nouvel utilisateur */}
            <div className="card bg-gradient-to-br from-chantier-50 to-white border-chantier-100">
              <div className="flex items-start gap-3 mb-3">
                <Sparkles className="w-5 h-5 text-chantier flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="font-bold text-slate-900">Bienvenue sur ChantierPro</h2>
                  <p className="text-sm text-slate-600 mt-1">
                    En 3 étapes, votre espace est prêt.
                  </p>
                </div>
              </div>
              <div className="space-y-2 mt-4">
                {[
                  { num: 1, label: 'Complétez votre profil', done: !!profile?.company_name, link: '/parametres' },
                  { num: 2, label: 'Créez votre 1er devis', done: devis.length > 0, link: '/nouveau-devis' },
                  { num: 3, label: 'Activez un plan', done: false, link: '/pricing' },
                ].map((step) => (
                  <button
                    key={step.num}
                    onClick={() => navigate(step.link)}
                    className="w-full flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 hover:border-chantier transition-colors text-left"
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step.done ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      {step.done ? '✓' : step.num}
                    </div>
                    <span className={`text-sm flex-1 ${step.done ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'}`}>
                      {step.label}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <StatCard label="CA" value="0" suffix="€" icon={<Euro className="w-4 h-4" />} />
              <StatCard label="Devis" value="0" icon={<FileText className="w-4 h-4" />} />
              <StatCard label="Factures" value="0" icon={<Briefcase className="w-4 h-4" />} />
              <StatCard label="Clients" value="0" icon={<Users className="w-4 h-4" />} />
            </div>
          </>
        ) : (
          <>
            {/* Stats avec VRAIES données */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="CA encaissé"
                value={caPaye.toFixed(0)}
                suffix="€"
                color="text-emerald-600"
                icon={<Euro className="w-4 h-4" />}
              />
              <StatCard
                label="En attente"
                value={caEnAttente.toFixed(0)}
                suffix="€"
                color={caEnAttente > 0 ? 'text-amber-600' : 'text-slate-500'}
                icon={<TrendingUp className="w-4 h-4" />}
              />
              <StatCard
                label="Devis en cours"
                value={devisEnAttente.length}
                color="text-slate-900"
                icon={<FileText className="w-4 h-4" />}
              />
              <StatCard
                label={facturesEnRetard.length > 0 ? "En retard" : "Factures"}
                value={facturesEnRetard.length > 0 ? facturesEnRetard.length : factures.length}
                color={facturesEnRetard.length > 0 ? "text-red-600" : "text-slate-900"}
                icon={<AlertCircle className="w-4 h-4" />}
              />
            </div>

            {/* Actions rapides */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/nouveau-devis')}
                className="card hover:shadow-elevated active:scale-95 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-chantier-50 flex items-center justify-center mb-2">
                  <FileText className="w-5 h-5 text-chantier" />
                </div>
                <p className="font-semibold text-slate-900 text-sm">Nouveau devis</p>
                <p className="text-xs text-slate-500">Créer en 2 min</p>
              </button>
              <button
                onClick={() => navigate('/clients')}
                className="card hover:shadow-elevated active:scale-95 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <p className="font-semibold text-slate-900 text-sm">Mes clients</p>
                <p className="text-xs text-slate-500">{clients.length} contact{clients.length > 1 ? 's' : ''}</p>
              </button>
            </div>

            {/* Derniers devis */}
            {devis.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-slate-900">Derniers devis</h2>
                  <button onClick={() => navigate('/devis')} className="text-sm text-chantier font-semibold hover:underline">
                    Voir tout →
                  </button>
                </div>
                <div className="space-y-2">
                  {devis.slice(0, 3).map(d => (
                    <DevisCard key={d.id} item={d} onClick={() => navigate(`/devis/${d.id}`)} type="devis" />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
