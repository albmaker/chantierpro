import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FileCheck, AlertCircle, Receipt, Calendar, Mail, Download, Euro, Building2, Hash } from 'lucide-react'
import Header from '../components/Header'
import DevisCard, { computeTotals } from '../components/DevisCard'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import { useData } from '../contexts/DataContext'
import { generatePDF } from '../lib/pdfGenerator'

const filters = [
  { id: 'tous', label: 'Toutes' },
  { id: 'en_attente', label: 'En attente' },
  { id: 'payee', label: 'Payées' },
  { id: 'en_retard', label: 'En retard' },
]

export default function FacturesList() {
  const navigate = useNavigate()
  const { factures, devis, updateFacture, getProfile } = useData()
  const [filter, setFilter] = useState('tous')
  const [search, setSearch] = useState('')
  const [selectedFacture, setSelectedFacture] = useState(null)

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

  // Auto-d\u00e9tection des factures en retard (\u00e9ch\u00e9ance pass\u00e9e)
  useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    factures.forEach(f => {
      if (f.statut === 'en_attente' && f.date_echeance && f.date_echeance < today) {
        updateFacture(f.id, { statut: 'en_retard' })
      }
    })
  }, [factures])

  const totalImpaye = factures
    .filter(f => f.statut === 'en_attente' || f.statut === 'en_retard')
    .reduce((s, f) => s + computeTotals(f.lignes).totalTTC, 0)

  const totalPaye = factures
    .filter(f => f.statut === 'payee')
    .reduce((s, f) => s + computeTotals(f.lignes).totalTTC, 0)

  const hasAcceptedDevis = devis.some(d => d.statut === 'accepte' && !factures.some(f => f.devis_id === d.id))

  function markPaid(facture) {
    updateFacture(facture.id, {
      statut: 'payee',
      date_paiement: new Date().toISOString().slice(0, 10),
    })
    setSelectedFacture(null)
  }

  function relance(facture) {
    alert(`Relance envoy\u00e9e \u00e0 ${facture.client_nom || 'client'} (simulation)`)
  }

  function downloadPdf(facture) {
    const result = generatePDF(facture, getProfile(), 'facture')
    if (!result.success) {
      alert('Erreur PDF : ' + (result.error || ''))
    }
  }

  return (
    <div className="pb-24">
      <Header
        title="Mes factures"
        subtitle="Compatible Factur-X 2026"
        search={search}
        onSearchChange={setSearch}
        action={
          <button
            onClick={() => navigate('/devis')}
            className="w-11 h-11 rounded-full bg-chantier flex items-center justify-center shadow-soft active:scale-95"
            aria-label="Cr\u00e9er depuis un devis"
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

        {factures.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="card">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Encaissé</p>
              <p className="text-xl font-bold text-emerald-600 mt-1">{totalPaye.toFixed(0)} €</p>
            </div>
            <div className="card">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Impayé</p>
              <p className={`text-xl font-bold mt-1 ${totalImpaye > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                {totalImpaye.toFixed(0)} €
              </p>
            </div>
          </div>
        )}

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
              <DevisCard
                key={f.id}
                item={f}
                onClick={() => setSelectedFacture(f)}
                type="facture"
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        open={!!selectedFacture}
        onClose={() => setSelectedFacture(null)}
        title={selectedFacture?.numero || 'Facture'}
      >
        {selectedFacture && (
          <div className="space-y-3">
            <div className={`card border ${
              selectedFacture.statut === 'payee' ? 'bg-emerald-50 border-emerald-200' :
              selectedFacture.statut === 'en_retard' ? 'bg-red-50 border-red-200' :
              'bg-amber-50 border-amber-200'
            }`}>
              <p className="text-xs font-semibold uppercase">Statut</p>
              <p className="text-base font-bold mt-1">
                {selectedFacture.statut === 'payee' && 'Payée'}
                {selectedFacture.statut === 'en_attente' && 'En attente'}
                {selectedFacture.statut === 'en_retard' && 'En retard'}
              </p>
            </div>

            <div className="card">
              <p className="text-xs text-slate-500 uppercase font-semibold flex items-center gap-1">
                <Building2 className="w-3 h-3" /> Client
              </p>
              <p className="font-bold text-slate-900 mt-1">{selectedFacture.client_nom}</p>
              {selectedFacture.client_email && <p className="text-sm text-slate-600">{selectedFacture.client_email}</p>}
              {selectedFacture.client_adresse && <p className="text-sm text-slate-600">{selectedFacture.client_adresse}</p>}
            </div>

            <div className="card">
              <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Détails</p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> Émise le</span>
                  <span className="font-semibold text-slate-900">{selectedFacture.date_emission}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> Échéance</span>
                  <span className="font-semibold text-slate-900">{selectedFacture.date_echeance}</span>
                </div>
                {selectedFacture.date_paiement && (
                  <div className="flex justify-between">
                    <span className="text-emerald-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Payée le</span>
                    <span className="font-semibold text-emerald-700">{selectedFacture.date_paiement}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="card bg-slate-900 text-white">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-slate-300">
                  <span>Total HT</span>
                  <span>{computeTotals(selectedFacture.lignes).totalHT.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>TVA</span>
                  <span>{computeTotals(selectedFacture.lignes).totalTVA.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-2 border-t border-slate-700">
                  <span>Total TTC</span>
                  <span className="text-chantier-light">{computeTotals(selectedFacture.lignes).totalTTC.toFixed(2)} €</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {selectedFacture.statut !== 'payee' && (
                <button onClick={() => markPaid(selectedFacture)} className="btn-primary w-full bg-emerald-600 hover:bg-emerald-700">
                  <CheckCircle className="w-4 h-4 inline mr-2" />
                  Marquer comme payée
                </button>
              )}
              <button onClick={() => downloadPdf(selectedFacture)} className="btn-secondary w-full">
                <Download className="w-4 h-4 inline mr-2" />
                Télécharger le PDF
              </button>
              {selectedFacture.statut !== 'payee' && selectedFacture.client_email && (
                <button onClick={() => relance(selectedFacture)} className="btn-secondary w-full">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Envoyer une relance
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function CheckCircle(props) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
}
