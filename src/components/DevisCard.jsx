import { Calendar, ChevronRight } from 'lucide-react'

const statusLabels = {
  en_attente: { label: 'En attente', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  accepte: { label: 'Accepté', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  refuse: { label: 'Refusé', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  expire: { label: 'Expiré', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  payee: { label: 'Payée', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  en_retard: { label: 'En retard', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
}

export function computeTotals(lignes = []) {
  const totalHT = lignes.reduce((s, l) => s + (Number(l.qty) || 0) * (Number(l.priceHT) || 0), 0)
  const totalTVA = lignes.reduce((s, l) => s + (Number(l.qty) || 0) * (Number(l.priceHT) || 0) * ((Number(l.tva) || 0) / 100), 0)
  const totalTTC = totalHT + totalTVA
  return { totalHT, totalTVA, totalTTC }
}

export default function DevisCard({ item, onClick, type = 'devis' }) {
  const status = statusLabels[item.statut] || statusLabels.en_attente
  const { totalTTC } = computeTotals(item.lignes)

  return (
    <button
      onClick={onClick}
      className="w-full card hover:bg-navy-600/80 transition-all active:scale-[0.98] text-left"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-mono text-chantier">{item.numero || item.id}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${status.color}`}>
              {status.label}
            </span>
          </div>
          <h3 className="font-semibold text-white truncate">
            {item.client_nom || item.client || 'Client sans nom'}
          </h3>
          <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-400">
            <Calendar className="w-3 h-3" />
            {type === 'facture' ? (item.date_echeance || item.echeance) : (item.date_validite || item.validite)}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-lg font-bold text-white">{totalTTC.toFixed(0)}€</div>
          <span className="text-[10px] text-gray-500">TTC</span>
          <ChevronRight className="w-4 h-4 text-gray-500 mt-1" />
        </div>
      </div>
    </button>
  )
}
