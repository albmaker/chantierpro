import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FileCheck, AlertCircle, Receipt } from 'lucide-react'
import Header from '../components/Header'
import DevisCard, { computeTotals } from '../components/DevisCard'
import EmptyState from '../components/EmptyState'
import { useData } from '../contexts/DataContext'

const filters = [
  { id: 'tous', label: 'Toutes' },
  { id: 'en_attente', label: 'En attente' },
  { id: 'payee', label: 'Payées' },
  { id: 'en_retard', label: 'En retard' },
]

export default function FacturesList() {
  const navigate = useNavigate()
  const { factures, devis } = useData()
  const [filter, setFilter] = useState('tous')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return factures.filter(f => {
      const matchFilter = filter === 'tous' || f.statut === filter
      const searchLower = (search || '').toLowerCase().trim()
      const matchSearch = !searchLower ||
        (f.client_nom || '').toLowerCase().includes(searchLower) ||
        (f.numero || '').toLowerCase().includes(searchLower)
      return matchFilter && matchSearch
    })
  }, [factures, filter, search])

  const totalImpaye = factures
    .filter(f => f.statut === 'en_attente' || f.statut === 'en_retard')
    .reduce((s, f) => s + computeTotals(f.lignes).totalTTC, 0)

  const hasAcceptedDevis = devis.some(d => d.statut === 'accepte' && !factures.some(f => f.devis_id === d.id))

  return (
    <div className="pb-24">
      <Header
        title="Mes factures"
        subtitle="Compatible Factur-X 2026 ✅"
        search={search}
        onSearchChange={setSearch}
        action={
          <button
            onClick={() => navigate('/devis')}
            className="w-11 h-11 rounded-full bg-chantier flex items-center justify-center shadow-soft active:scale-95"
            aria-label="Créer depuis un devis"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        }
      />

      <div className="px-5 pt-4 space-y-4">
        <div className="card bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
          <div className="flex items-start gap-3">
            <FileCheck className="w-5 h-5 text-emerald-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 text-sm">Prêt pour septembre 2026</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Vos factures sont conformes à la réforme de la facturation électronique.
              </p>
            </div>
          </div>
        </div>

        {hasAcceptedDevis && (
          <div className="card bg-gradient-to-br from-chantier-50 to-white border-chantier-100">
            <div className="flex items-center gap-3">
              <Receipt className="w-5 h-5 text-chantier" />
              <div className="flex-1">
                <p className="text-sm text-slate-700">
                  Vous avez des devis <strong>acceptés</strong> à transformer en factures.
                </p>
              </div>
              <button onClick={() => navigate('/devis')} className="text-chantier text-sm font-semibold">
                Voir →
              </button>
            </div>
          </div>
        )}

        {factures.length > 0 && totalImpaye > 0 && (
          <div className="card border-red-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm text-slate-700 font-medium">Total impayé</span>
              </div>
              <span className="text-xl font-bold text-slate-900">{totalImpaye.toFixed(0)} €</span>
            </div>
          </div>
        )}

        {factures.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {filters.map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${
                  filter === f.id ? 'bg-chantier text-white' : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {factures.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="Aucune facture pour l'instant"
            description="Les factures sont créées à partir d'un devis accepté par votre client."
            actionLabel="Voir mes devis"
            onAction={() => navigate('/devis')}
          />
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">Aucun résultat pour "{search}"</p>
            <button onClick={() => { setSearch(''); setFilter('tous') }} className="text-chantier text-sm mt-2 font-semibold hover:underline">
              Réinitialiser
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map(f => (
              <DevisCard key={f.id} item={f} onClick={() => {}} type="facture" />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
