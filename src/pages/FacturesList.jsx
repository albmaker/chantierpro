import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FileCheck, AlertCircle } from 'lucide-react'
import Header from '../components/Header'
import DevisCard from '../components/DevisCard'
import { DEMO_FACTURES } from '../data/ouvrages'

const filters = [
  { id: 'tous', label: 'Toutes' },
  { id: 'en_attente', label: 'En attente' },
  { id: 'payee', label: 'Payées' },
  { id: 'en_retard', label: 'En retard' },
]

export default function FacturesList() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('tous')

  const filtered = filter === 'tous'
    ? DEMO_FACTURES
    : DEMO_FACTURES.filter(f => f.statut === filter)

  // Stats
  const totalImpaye = DEMO_FACTURES
    .filter(f => f.statut === 'en_attente' || f.statut === 'en_retard')
    .reduce((s, f) => s + f.lignes.reduce((sum, l) => sum + l.qty * l.priceHT * (1 + l.tva/100), 0), 0)

  return (
    <div className="pb-24">
      <Header
        title="Mes factures"
        subtitle="Compatible Factur-X 2026 ✅"
        action={
          <button
            onClick={() => navigate('/nouveau-devis')}
            className="w-10 h-10 rounded-full bg-chantier flex items-center justify-center shadow-lg shadow-chantier/30 active:scale-95"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        }
      />

      <div className="px-5 pt-4 space-y-4">
        {/* Bandeau FE 2026 */}
        <div className="card bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20">
          <div className="flex items-start gap-3">
            <FileCheck className="w-5 h-5 text-green-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-white text-sm">Prêt pour 2026</h3>
              <p className="text-xs text-gray-300 mt-1">
                Vos factures sont conformes à la réforme de la facturation électronique.
              </p>
            </div>
          </div>
        </div>

        {/* Total impayé */}
        {totalImpaye > 0 && (
          <div className="card border border-red-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-sm text-gray-300">Total impayé</span>
              </div>
              <span className="text-xl font-bold text-white">{totalImpaye.toFixed(0)} €</span>
            </div>
          </div>
        )}

        {/* Filtres */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === f.id
                  ? 'bg-chantier text-white'
                  : 'bg-navy-700 text-gray-300 hover:bg-navy-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Liste */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">Aucune facture dans cette catégorie</p>
            </div>
          ) : (
            filtered.map(f => (
              <DevisCard key={f.id} item={f} onClick={() => {}} type="facture" />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
