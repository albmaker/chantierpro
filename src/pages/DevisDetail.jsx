import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Edit, FileText, CheckCircle, XCircle, Send } from 'lucide-react'
import { DEMO_DEVIS, DEFAULT_PROFILE } from '../data/ouvrages'
import { generatePDF } from '../lib/pdfGenerator'

export default function DevisDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const devis = DEMO_DEVIS.find(d => d.id === id)

  if (!devis) {
    return (
      <div className="p-5">
        <p className="text-white">Devis introuvable</p>
        <button onClick={() => navigate('/devis')} className="btn-primary mt-4">
          Retour à la liste
        </button>
      </div>
    )
  }

  const totalHT = devis.lignes.reduce((s, l) => s + l.qty * l.priceHT, 0)
  const totalTVA = devis.lignes.reduce((s, l) => s + l.qty * l.priceHT * (l.tva / 100), 0)
  const totalTTC = totalHT + totalTVA

  const statusColors = {
    en_attente: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    accepte: 'bg-green-500/20 text-green-400 border-green-500/30',
    refuse: 'bg-red-500/20 text-red-400 border-red-500/30',
  }

  return (
    <div className="pb-24">
      {/* Header custom */}
      <div className="sticky top-0 z-30 bg-navy-800/80 backdrop-blur-lg border-b border-navy-700/50 px-5 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-navy-700 flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="text-center">
          <p className="text-xs text-gray-400 font-mono">{devis.id}</p>
          <h1 className="text-lg font-bold text-white">Détail du devis</h1>
        </div>
        <button
          onClick={() => generatePDF(devis, DEFAULT_PROFILE, 'devis')}
          className="w-10 h-10 rounded-full bg-chantier flex items-center justify-center"
        >
          <Download className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="px-5 pt-4 space-y-4">
        {/* Statut */}
        <div className={`card border ${statusColors[devis.statut]}`}>
          <p className="text-sm font-medium">Statut : {devis.statut.replace('_', ' ').toUpperCase()}</p>
        </div>

        {/* Client */}
        <div className="card">
          <h3 className="text-sm text-gray-400 uppercase tracking-wide mb-2">Client</h3>
          <p className="text-lg font-semibold text-white">{devis.client}</p>
          <p className="text-sm text-gray-300 mt-1">{devis.clientAdresse}</p>
          <p className="text-sm text-gray-300">{devis.clientEmail}</p>
          <p className="text-sm text-gray-300">{devis.clientTel}</p>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card">
            <p className="text-xs text-gray-400">Émis le</p>
            <p className="text-white font-semibold">{devis.date}</p>
          </div>
          <div className="card">
            <p className="text-xs text-gray-400">Valable jusqu'au</p>
            <p className="text-white font-semibold">{devis.validite}</p>
          </div>
        </div>

        {/* Lignes */}
        <div className="card">
          <h3 className="text-sm text-gray-400 uppercase tracking-wide mb-3">Détail des prestations</h3>
          <div className="space-y-3">
            {devis.lignes.map((l, i) => (
              <div key={i} className="flex items-start justify-between gap-3 pb-3 border-b border-navy-600/50 last:border-0 last:pb-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{l.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {l.qty} {l.unit} × {l.priceHT.toFixed(2)}€ HT · TVA {l.tva}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">
                    {(l.qty * l.priceHT * (1 + l.tva/100)).toFixed(2)}€
                  </p>
                  <p className="text-[10px] text-gray-500">TTC</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totaux */}
        <div className="card bg-navy-700">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-300">
              <span>Total HT</span>
              <span>{totalHT.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>TVA</span>
              <span>{totalTVA.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-2xl font-bold text-white pt-3 border-t border-navy-600">
              <span>Total TTC</span>
              <span className="text-chantier">{totalTTC.toFixed(2)} €</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {devis.notes && (
          <div className="card">
            <h3 className="text-sm text-gray-400 uppercase tracking-wide mb-2">Notes</h3>
            <p className="text-sm text-gray-200">{devis.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {devis.statut === 'en_attente' && (
            <>
              <button className="btn-primary bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 inline mr-2" />
                Marquer accepté
              </button>
              <button className="btn-secondary">
                <XCircle className="w-4 h-4 inline mr-2" />
                Refusé
              </button>
            </>
          )}
          {devis.statut === 'accepte' && (
            <button className="btn-primary col-span-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Convertir en facture
            </button>
          )}
          <button
            onClick={() => generatePDF(devis, DEFAULT_PROFILE, 'devis')}
            className="btn-secondary col-span-2"
          >
            <Download className="w-4 h-4 inline mr-2" />
            Télécharger PDF
          </button>
        </div>
      </div>
    </div>
  )
}
