import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FileText, TrendingUp, AlertCircle, Briefcase, Euro, Sparkles, ArrowRight, Users, MessageSquare, Target, PenLine, TrendingDown, Brain, Wand2, Mic } from 'lucide-react'
import Header from '../components/Header'
import StatCard from '../components/StatCard'
import EmptyState from '../components/EmptyState'
import DevisCard, { computeTotals } from '../components/DevisCard'
import { useData } from '../contexts/DataContext'

export default function Dashboard() {
  const navigate = useNavigate()
  const { devis, factures, profile, clients } = useData()

  const facturesEnAttente = factures.filter(f => f.statut === 'en_attente' || f.statut === 'en_retard')
  const facturesEnRetard = factures.filter(f => f.statut === 'en_retard')
  const caPaye = factures.filter(f => f.statut === 'payee').reduce((s, f) => s + computeTotals(f.lignes).totalTTC, 0)
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
            <div className="card bg-gradient-to-br from-chantier-50 to-white border-chantier-100">
              <div className="flex items-start gap-3 mb-3">
                <Sparkles className="w-5 h-5 text-chantier flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="font-bold text-slate-900">Bienvenue sur ChantierPro</h2>
                  <p className="text-sm text-slate-600 mt-1">En 3 étapes, votre espace est prêt.</p>
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
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="CA encaissé" value={caPaye.toFixed(0)} suffix="€" color="text-emerald-600" icon={<Euro className="w-4 h-4" />} />
              <StatCard label="En attente" value={caEnAttente.toFixed(0)} suffix="€" color={caEnAttente > 0 ? 'text-amber-600' : 'text-slate-400'} icon={<TrendingUp className="w-4 h-4" />} />
              <StatCard label="Devis en cours" value={devisEnAttente.length} color="text-slate-900" icon={<FileText className="w-4 h-4" />} />
              <StatCard
                label={facturesEnRetard.length > 0 ? "En retard" : "Factures"}
                value={facturesEnRetard.length > 0 ? facturesEnRetard.length : factures.length}
                color={facturesEnRetard.length > 0 ? "text-red-600" : "text-slate-900"}
                icon={<AlertCircle className="w-4 h-4" />}
              />
            </div>

            {/* Alerte factures en retard */}
            {facturesEnRetard.length > 0 && (
              <button onClick={() => navigate('/factures')} className="w-full card bg-red-50 border-red-200 text-left active:scale-[0.98]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-red-900">{facturesEnRetard.length} facture(s) en retard</p>
                    <p className="text-xs text-red-700">À relancer rapidement</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-red-600" />
                </div>
              </button>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => navigate('/wizard-devis')} className="card hover:shadow-elevated active:scale-95 transition-all text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-gradient-to-l from-chantier to-chantier-light text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">
                  ✨ GUIDÉ
                </div>
                <div className="w-10 h-10 rounded-xl bg-chantier-50 flex items-center justify-center mb-2">
                  <Wand2 className="w-5 h-5 text-chantier" />
                </div>
                <p className="font-bold text-slate-900 text-sm">Devis guidé</p>
                <p className="text-xs text-slate-500">En 4 étapes</p>
              </button>
              <button onClick={() => navigate('/voice-input')} className="card hover:shadow-elevated active:scale-95 transition-all text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-600 to-blue-400 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">
                  🎙️ VOCAL
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-2">
                  <Mic className="w-5 h-5 text-blue-600" />
                </div>
                <p className="font-bold text-slate-900 text-sm">Saisie vocale</p>
                <p className="text-xs text-slate-500">Dicte ton devis</p>
              </button>
              <button onClick={() => navigate('/clients')} className="card hover:shadow-elevated active:scale-95 transition-all text-left">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <p className="font-bold text-slate-900 text-sm">Mes clients</p>
                <p className="text-xs text-slate-500">{clients.length} contact{clients.length > 1 ? 's' : ''}</p>
              </button>
              <button onClick={() => navigate('/objectifs')} className="card hover:shadow-elevated active:scale-95 transition-all text-left">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mb-2">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <p className="font-bold text-slate-900 text-sm">Objectifs</p>
                <p className="text-xs text-slate-500">Suivre mes KPIs</p>
              </button>
              <button onClick={() => navigate('/messages')} className="card hover:shadow-elevated active:scale-95 transition-all text-left">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-2">
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="font-bold text-slate-900 text-sm">Messages</p>
                <p className="text-xs text-slate-500">Modèles prêts</p>
              </button>
            </div>

            {/* Co-pilote IA - Feature révolutionnaire */}
            <button
              onClick={() => navigate('/conseil')}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-4 text-left active:scale-[0.98] transition-transform shadow-elevated"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white flex items-center gap-1.5">
                    Co-pilote IA
                    <Sparkles className="w-4 h-4" />
                  </h3>
                  <p className="text-white/90 text-xs">Conseils personnalisés pour booster ton activité</p>
                </div>
                <ArrowRight className="w-5 h-5 text-white" />
              </div>
            </button>

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
