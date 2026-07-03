import { Calendar, ChevronRight } from 'lucide-react'

const statusStyles = {
  en_attente: { label: 'En attente', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  accepte: { label: 'Accepté', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  refuse: { label: 'Refusé', color: 'bg-red-50 text-red-700 border-red-200' },
  expire: { label: 'Expiré', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  payee: { label: 'Payée', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  en_retard: { label: 'En retard', color: 'bg-red-50 text-red-700 border-red-200' },
}

export function computeTotals(lignes = []) {
  const totalHT = lignes.reduce((s, l) => s + (Number(l.qty) || 0) * (Number(l.priceHT) || 0), 0)
  const totalTVA = lignes.reduce((s, l) => s + (Number(l.qty) || 0) * (Number(l.priceHT) || 0) * ((Number(l.tva) || 0) / 100), 0)
  const totalTTC = totalHT + totalTVA
  return { totalHT, totalTVA, totalTTC }
}

export default function DevisCard({ item, onClick, type = 'devis' }) {
  const status = statusStyles[item.statut] || statusStyles.en_attente
  const { totalTTC } = computeTotals(item.lignes)

  return (
    <button
      onClick={onClick}
      className="w-full card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98] text-left"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[10px] font-mono font-semibold text-chantier bg-chantier-50 px-2 py-0.5 rounded-md">
              {item.numero || item.id?.slice(0, 8) || '—'}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${status.color}`}>
              {status.label}
            </span>
          </div>
          <h3 className="font-semibold text-slate-900 truncate">
            {item.client_nom || item.client || 'Client sans nom'}
          </h3>
          <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-500">
            <Calendar className="w-3 h-3" />
            {type === 'facture' ? (item.date_echeance || '—') : (item.date_validite || '—')}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-lg font-bold text-slate-900">{totalTTC.toFixed(0)}€</div>
          <span className="text-[10px] text-slate-500">TTC</span>
          <ChevronRight className="w-4 h-4 text-slate-400 mt-1" />
        </div>
      </div>
    </button>
  )
}
