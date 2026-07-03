import { useState, useMemo } from 'react'
import { TrendingUp, TrendingDown, Euro, FileText, Users, Calendar, Target, AlertCircle, Award } from 'lucide-react'
import Header from '../components/Header'
import StatCard from '../components/StatCard'
import { useData } from '../contexts/DataContext'
import { computeTotals } from '../components/DevisCard'

export default function Stats() {
  const { devis, factures, clients, activity } = useData()

  // Stats globales
  const caEncaisse = factures.filter(f => f.statut === 'payee').reduce((s, f) => s + computeTotals(f.lignes).totalTTC, 0)
  const caEnAttente = factures.filter(f => f.statut === 'en_attente' || f.statut === 'en_retard').reduce((s, f) => s + computeTotals(f.lignes).totalTTC, 0)
  const caDevisEnCours = devis.filter(d => d.statut === 'en_attente').reduce((s, d) => s + computeTotals(d.lignes).totalTTC, 0)
  const totalDevis = devis.length
  const totalFactures = factures.length
  const totalClients = clients.length

  // Taux de conversion
  const tauxConversion = totalDevis > 0
    ? Math.round((devis.filter(d => d.statut === 'accepte').length / totalDevis) * 100)
    : 0

  // Panier moyen
  const panierMoyen = totalDevis > 0
    ? devis.reduce((s, d) => s + computeTotals(d.lignes).totalTTC, 0) / totalDevis
    : 0

  // CA par mois (6 derniers mois)
  const caParMois = useMemo(() => {
    const mois = {}
    const maintenant = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(maintenant.getFullYear(), maintenant.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      mois[key] = { label: d.toLocaleDateString('fr-FR', { month: 'short' }), valeur: 0 }
    }
    factures.filter(f => f.statut === 'payee').forEach(f => {
      const d = new Date(f.date_paiement || f.date_emission)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (mois[key]) {
        mois[key].valeur += computeTotals(f.lignes).totalTTC
      }
    })
    return Object.values(mois)
  }, [factures])

  const maxCA = Math.max(...caParMois.map(m => m.valeur), 1)

  // Top clients
  const topClients = useMemo(() => {
    const caParClient = {}
    factures.filter(f => f.statut === 'payee').forEach(f => {
      const nom = f.client_nom || 'Sans nom'
      caParClient[nom] = (caParClient[nom] || 0) + computeTotals(f.lignes).totalTTC
    })
    return Object.entries(caParClient)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
  }, [factures])

  return (
    <div className="pb-24">
      <Header title="Statistiques" subtitle="Vue d'ensemble de votre activité" />

      <div className="px-5 pt-4 space-y-4">
        {/* KPIs principaux */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="CA encaissé"
            value={caEncaisse.toFixed(0)}
            suffix="€"
            color="text-emerald-600"
            icon={<Euro className="w-4 h-4" />}
            trend={caEncaisse > 0 ? 'Activité' : undefined}
          />
          <StatCard
            label="En attente"
            value={caEnAttente.toFixed(0)}
            suffix="€"
            color={caEnAttente > 0 ? "text-amber-600" : "text-slate-400"}
            icon={<TrendingUp className="w-4 h-4" />}
          />
          <StatCard
            label="Taux conversion"
            value={`${tauxConversion}%`}
            color={tauxConversion >= 50 ? "text-emerald-600" : tauxConversion > 0 ? "text-amber-600" : "text-slate-400"}
            icon={<Target className="w-4 h-4" />}
          />
          <StatCard
            label="Panier moyen"
            value={panierMoyen.toFixed(0)}
            suffix="€"
            color="text-slate-900"
            icon={<Award className="w-4 h-4" />}
          />
        </div>

        {/* Graphique CA 6 mois */}
        {caParMois.some(m => m.valeur > 0) && (
          <div className="card">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Chiffre d'affaires (6 derniers mois)</h3>
            <div className="flex items-end justify-between gap-2 h-40">
              {caParMois.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-[10px] text-slate-500 font-semibold">{m.valeur > 0 ? `${m.valeur.toFixed(0)}€` : ''}</div>
                  <div
                    className="w-full bg-gradient-to-t from-chantier to-chantier-light rounded-t-lg transition-all duration-500"
                    style={{ height: `${(m.valeur / maxCA) * 100}%`, minHeight: m.valeur > 0 ? '8px' : '2px' }}
                  />
                  <div className="text-[10px] text-slate-500 font-medium capitalize">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top clients */}
        {topClients.length > 0 && (
          <div className="card">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Top clients (CA)</h3>
            <div className="space-y-2">
              {topClients.map(([nom, ca], i) => (
                <div key={nom} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-slate-200 text-slate-700' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{nom}</p>
                  </div>
                  <p className="text-sm font-bold text-emerald-600">{ca.toFixed(0)} €</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activité récente */}
        {activity.length > 0 && (
          <div className="card">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Activité récente</h3>
            <div className="space-y-2.5">
              {activity.slice(0, 5).map(a => (
                <div key={a.id} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-chantier mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-700">{a.label}</p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(a.created_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compteurs rapides */}
        <div className="grid grid-cols-3 gap-2">
          <div className="card text-center">
            <FileText className="w-5 h-5 text-slate-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-slate-900">{totalDevis}</p>
            <p className="text-[10px] text-slate-500 uppercase">Devis</p>
          </div>
          <div className="card text-center">
            <Euro className="w-5 h-5 text-slate-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-slate-900">{totalFactures}</p>
            <p className="text-[10px] text-slate-500 uppercase">Factures</p>
          </div>
          <div className="card text-center">
            <Users className="w-5 h-5 text-slate-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-slate-900">{totalClients}</p>
            <p className="text-[10px] text-slate-500 uppercase">Clients</p>
          </div>
        </div>

        {/* Empty state si pas de data */}
        {totalDevis === 0 && totalFactures === 0 && (
          <div className="card text-center py-8 bg-slate-50">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600 text-sm">Pas encore d'activité</p>
            <p className="text-slate-400 text-xs mt-1">Créez votre 1er devis pour voir vos stats</p>
          </div>
        )}
      </div>
    </div>
  )
}
