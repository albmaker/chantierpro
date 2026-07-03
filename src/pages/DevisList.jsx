import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Filter } from 'lucide-react'
import Header from '../components/Header'
import DevisCard from '../components/DevisCard'
import { DEMO_DEVIS } from '../data/ouvrages'

const filters = [
  { id: 'tous', label: 'Tous' },
  { id: 'en_attente', label: 'En attente' },
  { id: 'accepte', label: 'Acceptés' },
  { id: 'refuse', label: 'Refusés' },
]

export default function DevisList() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('tous')

  const filtered = filter === 'tous'
    ? DEMO_DEVIS
    : DEMO_DEVIS.filter(d => d.statut === filter)

  return (
    <div className="pb-24">
      <Header
        title="Mes devis"
        subtitle={`${DEMO_DEVIS.length} devis au total`}
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
              <p className="text-gray-400">Aucun devis dans cette catégorie</p>
            </div>
          ) : (
            filtered.map(d => (
              <DevisCard
                key={d.id}
                item={d}
                onClick={() => navigate(`/devis/${d.id}`)}
                type="devis"
              />
            ))
          )}
        </div>

        {/* Empty CTA */}
        {filtered.length === 0 && (
          <button
            onClick={() => navigate('/nouveau-devis')}
            className="btn-primary w-full"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Créer mon premier devis
          </button>
        )}
      </div>
    </div>
  )
}
