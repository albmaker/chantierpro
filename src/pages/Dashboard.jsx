import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FileText, TrendingUp, AlertCircle, Sparkles, Briefcase } from 'lucide-react'
import Header from '../components/Header'
import StatCard from '../components/StatCard'
import EmptyState from '../components/EmptyState'
import { useData } from '../contexts/DataContext'
import { computeTotals } from '../components/DevisCard'

export default function Dashboard() {
  const navigate = useNavigate()
  const { devis, factures, profile } = useData()

  // Stats calculées sur les VRAIES données
  const facturesEnAttente = factures.filter(f => f.statut === 'en_attente' || f.statut === 'en_retard')
  const caPaye = factures
    .filter(f => f.statut === 'payee')
    .reduce((s, f) => s + computeTotals(f.lignes).totalTTC, 0)

  const firstName = profile?.company_name?.split(' ')[0] || 'Artisan'

  return (
    <div className="pb-24">
      <Header
        title={`Bonjour ${firstName} 👋`}
        subtitle={devis.length === 0 ? "Commençons par créer votre 1er devis" : `${devis.length} devis au total`}
        action={
          <button
            onClick={() => navigate('/nouveau-devis')}
            className="w-10 h-10 rounded-full bg-chantier flex items-center justify-center shadow-lg shadow-chantier/30 active:scale-95"
            aria-label="Nouveau devis"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        }
      />

      <div className="px-5 pt-4 space-y-4">
        {/* Empty state complet pour nouvel utilisateur */}
        {devis.length === 0 && factures.length === 0 ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="CA encaissé" value="0" suffix="€" icon={<TrendingUp className="w-4 h-4" />} />
              <StatCard label="Devis créés" value="0" icon={<FileText className="w-4 h-4" />} />
              <StatCard label="Factures" value="0" icon={<Briefcase className="w-4 h-4" />} />
              <StatCard label="En attente" value="0" suffix="€" color="text-gray-500" icon={<AlertCircle className="w-4 h-4" />} />
            </div>

            <button
              onClick={() => navigate('/scanner')}
              className="w-full bg-gradient-to-r from-chantier to-chantier-dark rounded-2xl p-5 text-left active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <span className="text-2xl">📸</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white text-lg">Créez votre 1er devis en 30 sec</h3>
                  <p className="text-white/90 text-sm">Photo du chantier → devis auto-généré par l'IA</p>
                </div>
              </div>
            </button>

            <EmptyState
              icon={FileText}
              title="Aucun devis pour l'instant"
              description="Commencez par créer un devis manuellement ou utilisez le scanner IA pour gagner du temps."
              actionLabel="Créer un devis"
              onAction={() => navigate('/nouveau-devis')}
              secondaryLabel="Ou scanner une photo de chantier"
              onSecondary={() => navigate('/scanner')}
            />
          </>
        ) : (
          <>
            {/* Stats avec VRAIES données */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="CA encaissé"
                value={caPaye.toFixed(0)}
                suffix="€"
                color="text-white"
                icon={<TrendingUp className="w-4 h-4" />}
              />
              <StatCard
                label="Devis"
                value={devis.length}
                color="text-white"
                icon={<FileText className="w-4 h-4" />}
              />
              <StatCard
                label="Factures"
                value={factures.length}
                color="text-white"
                icon={<Briefcase className="w-4 h-4" />}
              />
              <StatCard
                label="En attente"
                value={facturesEnAttente.length}
                suffix=" facture(s)"
                color={facturesEnAttente.length > 0 ? "text-red-400" : "text-gray-500"}
                icon={<AlertCircle className="w-4 h-4" />}
              />
            </div>

            {/* CTA Scanner IA toujours visible */}
            <button
              onClick={() => navigate('/scanner')}
              className="w-full bg-gradient-to-r from-chantier to-chantier-dark rounded-2xl p-4 text-left active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white">Devis en 1 photo</h3>
                  <p className="text-white/90 text-xs">L'IA analyse votre chantier et génère le devis</p>
                </div>
              </div>
            </button>

            {/* Derniers devis */}
            {devis.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-white">Derniers devis</h2>
                  <button onClick={() => navigate('/devis')} className="text-sm text-chantier font-medium">
                    Voir tout →
                  </button>
                </div>
                <div className="space-y-2">
                  {devis.slice(0, 3).map(d => (
                    <div
                      key={d.id}
                      onClick={() => navigate(`/devis/${d.id}`)}
                      className="card flex items-center gap-3 active:scale-[0.98] cursor-pointer hover:bg-navy-600/80"
                    >
                      <div className="w-10 h-10 rounded-xl bg-navy-800 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-chantier" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{d.client_nom || 'Client'}</p>
                        <p className="text-xs text-gray-400">{d.numero}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">{computeTotals(d.lignes).totalTTC.toFixed(0)}€</p>
                      </div>
                    </div>
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
