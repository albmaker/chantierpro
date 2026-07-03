import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Filter, FileText } from 'lucide-react'
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

  const filtered = useMemo(() => {
    return devis.filter(d => {
      const matchFilter = filter === 'tous' || d.statut === filter
      const searchLower = (search || '').toLowerCase().trim()
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
            className="w-11 h-11 rounded-full bg-chantier flex items-center justify-center shadow-soft active:scale-95"
            aria-label="Nouveau devis"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        }
      />

      <div className="px-5 pt-4 space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                filter === f.id
                  ? 'bg-chantier text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {devis.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Aucun devis pour l'instant"
            description="Vos devis apparaîtront ici. Créez-en un pour démarrer."
            actionLabel="Créer mon premier devis"
            onAction={() => navigate('/nouveau-devis')}
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
