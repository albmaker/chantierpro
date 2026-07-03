import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, CheckCircle, XCircle, FileText, Send, Trash2 } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { computeTotals } from '../components/DevisCard'
import { generatePDF } from '../lib/pdfGenerator'

const statusColors = {
  en_attente: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  accepte: 'bg-green-500/20 text-green-400 border-green-500/30',
  refuse: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export default function DevisDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { devis, updateDevis, deleteDevis, profile, getProfile } = useData()
  const devisItem = devis.find(d => d.id === id)

  if (!devisItem) {
    return (
      <div className="p-5">
        <p className="text-white">Devis introuvable</p>
        <button onClick={() => navigate('/devis')} className="btn-primary mt-4">
          Retour à la liste
        </button>
      </div>
    )
  }

  const { totalHT, totalTVA, totalTTC } = computeTotals(devisItem.lignes)
  const proProfile = profile || getProfile()

  const handleStatus = (newStatus) => {
    updateDevis(devisItem.id, { statut: newStatus })
  }

  const handleDelete = () => {
    if (confirm('Supprimer ce devis définitivement ?')) {
      deleteDevis(devisItem.id)
      navigate('/devis')
    }
  }

  const handlePDF = () => {
    generatePDF(devisItem, proProfile, 'devis')
  }

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-30 bg-navy-800/90 backdrop-blur-lg border-b border-navy-700/50 px-5 py-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-navy-700 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="text-center">
          <p className="text-xs text-gray-400 font-mono">{devisItem.numero}</p>
          <h1 className="text-base font-bold text-white">Détail du devis</h1>
        </div>
        <button onClick={handlePDF} className="w-10 h-10 rounded-full bg-chantier flex items-center justify-center">
          <Download className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="px-5 pt-4 space-y-3">
        <div className={`card border ${statusColors[devisItem.statut] || statusColors.en_attente}`}>
          <p className="text-sm font-medium">
            Statut : <span className="font-bold">{(devisItem.statut || 'en_attente').replace('_', ' ').toUpperCase()}</span>
          </p>
        </div>

        <div className="card">
          <h3 className="text-xs text-gray-400 uppercase tracking-wide mb-2">Client</h3>
          <p className="text-lg font-semibold text-white">{devisItem.client_nom || 'Sans nom'}</p>
          {devisItem.client_email && <p className="text-sm text-gray-300 mt-1">{devisItem.client_email}</p>}
          {devisItem.client_tel && <p className="text-sm text-gray-300">{devisItem.client_tel}</p>}
          {devisItem.client_adresse && <p className="text-sm text-gray-300 mt-1">{devisItem.client_adresse}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="card">
            <p className="text-xs text-gray-400">Émis le</p>
            <p className="text-white font-semibold">{devisItem.date_emission || devisItem.date || '—'}</p>
          </div>
          <div className="card">
            <p className="text-xs text-gray-400">Valable jusqu'au</p>
            <p className="text-white font-semibold">{devisItem.date_validite || devisItem.validite || '—'}</p>
          </div>
        </div>

        <div className="card">
          <h3 className="text-xs text-gray-400 uppercase tracking-wide mb-3">Détail des prestations</h3>
          {(devisItem.lignes || []).length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Aucune ligne dans ce devis</p>
          ) : (
            <div className="space-y-3">
              {devisItem.lignes.map((l, i) => (
                <div key={i} className="flex items-start justify-between gap-3 pb-3 border-b border-navy-600/50 last:border-0 last:pb-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{l.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {l.qty} {l.unit} × {Number(l.priceHT || 0).toFixed(2)}€ HT · TVA {l.tva}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">
                      {(l.qty * l.priceHT * (1 + l.tva / 100)).toFixed(2)}€
                    </p>
                    <p className="text-[10px] text-gray-500">TTC</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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

        {devisItem.notes && (
          <div className="card">
            <h3 className="text-xs text-gray-400 uppercase tracking-wide mb-2">Notes</h3>
            <p className="text-sm text-gray-200 whitespace-pre-line">{devisItem.notes}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2">
          {devisItem.statut === 'en_attente' && (
            <>
              <button onClick={() => handleStatus('accepte')} className="btn-primary bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 inline mr-2" />
                Accepté
              </button>
              <button onClick={() => handleStatus('refuse')} className="btn-secondary">
                <XCircle className="w-4 h-4 inline mr-2" />
                Refusé
              </button>
            </>
          )}
          {devisItem.statut === 'accepte' && (
            <button onClick={handlePDF} className="btn-primary col-span-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Convertir en facture
            </button>
          )}
          <button onClick={handlePDF} className="btn-secondary col-span-2">
            <Download className="w-4 h-4 inline mr-2" />
            Télécharger le PDF
          </button>
          <button
            onClick={handleDelete}
            className="col-span-2 text-red-400 hover:text-red-300 text-sm py-2 hover:bg-red-500/10 rounded-xl"
          >
            <Trash2 className="w-4 h-4 inline mr-2" />
            Supprimer ce devis
          </button>
        </div>
      </div>
    </div>
  )
}
