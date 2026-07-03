import { Calendar, Euro, ChevronRight } from 'lucide-react'

const statusLabels = {
  en_attente: { label: 'En attente', color: 'bg-yellow-500/20 text-yellow-400' },
  accepte: { label: 'Accepté', color: 'bg-green-500/20 text-green-400' },
  refuse: { label: 'Refusé', color: 'bg-red-500/20 text-red-400' },
  expire: { label: 'Expiré', color: 'bg-gray-500/20 text-gray-400' },
  payee: { label: 'Payée', color: 'bg-green-500/20 text-green-400' },
  en_retard: { label: 'En retard', color: 'bg-red-500/20 text-red-400' },
}

export default function DevisCard({ item, onClick, type = 'devis' }) {
  const status = statusLabels[item.statut] || statusLabels.en_attente
  const totalHT = item.lignes.reduce((sum, l) => sum + l.qty * l.priceHT, 0)
  const totalTVA = item.lignes.reduce((sum, l) => sum + l.qty * l.priceHT * (l.tva / 100), 0)
  const totalTTC = totalHT + totalTVA

  return (
    <button
      onClick={onClick}
      className="w-full card hover:bg-navy-600/80 transition-all duration-200 active:scale-[0.98] text-left"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-chantier">{item.id}</span>
            <span className={`badge ${status.color}`}>{status.label}</span>
          </div>
          <h3 className="font-semibold text-white truncate">{item.client}</h3>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {type === 'facture' ? item.echeance : item.validite}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1 text-lg font-bold text-white">
            <Euro className="w-4 h-4 text-chantier" />
            {totalTTC.toFixed(0)}
          </div>
          <span className="text-[10px] text-gray-500">TTC</span>
          <ChevronRight className="w-4 h-4 text-gray-500 mt-1" />
        </div>
      </div>
    </button>
  )
}
