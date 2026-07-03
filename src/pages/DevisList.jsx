import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Filter } from 'lucide-react'
import Header from '../components/Header'
import DevisCard from '../components/DevisCard'
import EmptyState from '../components/EmptyState'
import { useData } from '../contexts/DataContext'

const filters = [
  { id: 'tous', label: 'Tous' },
  { id: 'en_attente', label: 'En attente' },
  { id: 'accepte', label: 'Acceptés' },
  { id: 'refuse', label: 'Refusés' },
]

export default function DevisList() {
  const navigate = useNavigate()
  const { devis } = useData()
  const [filter, setFilter] = useState('tous')
  const [search, setSearch] = useState('')

  // Filtrage + recherche combinés
  const filtered = useMemo(() => {
    return devis.filter(d => {
      const matchFilter = filter === 'tous' || d.statut === filter
      const searchLower = search.toLowerCase().trim()
      const matchSearch = !searchLower ||
        (d.client_nom || '').toLowerCase().includes(searchLower) ||
        (d.numero || '').toLowerCase().includes(searchLower) ||
        (d.client_email || '').toLowerCase().includes(searchLower)
      return matchFilter && matchSearch
    })
  }, [devis, filter, search])

  return (
    <div className="pb-24">
      <Header
        title="Mes devis"
        subtitle={`${devis.length} devis au total`}
        search={search}
        onSearchChange={setSearch}
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
        {devis.length === 0 ? (
          <EmptyState
            icon={Filter}
            title="Aucun devis pour l'instant"
            description="Vos devis apparaîtront ici. Commencez par en créer un ou utilisez le scanner IA."
            actionLabel="Créer mon premier devis"
            onAction={() => navigate('/nouveau-devis')}
            secondaryLabel="Scanner une photo de chantier"
            onSecondary={() => navigate('/scanner')}
          />
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Aucun résultat pour "{search}"</p>
            <button onClick={() => { setSearch(''); setFilter('tous') }} className="text-chantier text-sm mt-2 hover:underline">
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(d => (
              <DevisCard
                key={d.id}
                item={d}
                onClick={() => navigate(`/devis/${d.id}`)}
                type="devis"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
