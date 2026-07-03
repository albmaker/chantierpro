import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, CheckCircle, XCircle, FileText, Trash2, Send, Copy, Mail, Edit3, Save, X, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { useData } from '../contexts/DataContext'
import { computeTotals } from '../components/DevisCard'
import { generatePDF, generateFactureFromDevis } from '../lib/pdfGenerator'
import Modal from '../components/Modal'
import RiskDetector from '../components/RiskDetector'

const statusStyles = {
  en_attente: 'bg-amber-50 text-amber-700 border-amber-200',
  accepte: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  refuse: 'bg-red-50 text-red-700 border-red-200',
}

export default function DevisDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { devis, factures, updateDevis, deleteDevis, addFacture, getProfile, addDevis } = useData()
  const [pdfLoading, setPdfLoading] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  const [sendResult, setSendResult] = useState(null)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState(null)
  const [converting, setConverting] = useState(false)

  const devisItem = devis.find(d => d.id === id)

  if (!devisItem) {
    return (
      <div className="p-5">
        <p className="text-slate-900">Devis introuvable</p>
        <button onClick={() => navigate('/devis')} className="btn-primary mt-4">
          Retour à la liste
        </button>
      </div>
    )
  }

  const { totalHT, totalTVA, totalTTC } = computeTotals(devisItem.lignes)
  const proProfile = getProfile()

  function startEdit() {
    setEditForm({
      client_nom: devisItem.client_nom || '',
      client_email: devisItem.client_email || '',
      client_tel: devisItem.client_tel || '',
      client_adresse: devisItem.client_adresse || '',
      date_validite: devisItem.date_validite || '',
      notes: devisItem.notes || '',
    })
    setEditing(true)
  }

  function saveEdit() {
    updateDevis(devisItem.id, editForm)
    setEditing(false)
  }

  function handlePDF() {
    setPdfLoading(true)
    try {
      const result = generatePDF(devisItem, proProfile, 'devis')
      if (!result.success) {
        alert('Erreur PDF : ' + (result.error || 'inconnue'))
      }
    } catch (err) {
      alert('Erreur : ' + err.message)
    } finally {
      setPdfLoading(false)
    }
  }

  function handleStatus(newStatus) {
    updateDevis(devisItem.id, { statut: newStatus })
  }

  function handleDelete() {
    if (confirm('Supprimer ce devis définitivement ?')) {
      deleteDevis(devisItem.id)
      navigate('/devis')
    }
  }

  // === FIX BUG FACTURES : cr\u00e9ation synchrone puis navigation ===
  function handleConvertToFacture() {
    if (converting) return // Anti double-clic

    setConverting(true)
    try {
      // 1) G\u00e9n\u00e9re l'objet facture
      const facture = generateFactureFromDevis(devisItem, proProfile)

      // 2) Ajoute imm\u00e9diatement au state (synchrone)
      addFacture(facture)

      // 3) Marque le devis comme accept\u00e9
      updateDevis(devisItem.id, { statut: 'accepte' })

      // 4) Force un re-render avant de naviguer
      setTimeout(() => {
        setConverting(false)
        // 5) Navigue vers la liste
        navigate('/factures', { state: { newFactureId: facture.id } })
      }, 200)
    } catch (err) {
      setConverting(false)
      alert('Erreur : ' + err.message)
    }
  }

  function handleDuplicate() {
    try {
      const newDevis = {
        ...devisItem,
        id: crypto.randomUUID(),
        statut: 'en_attente',
        numero: `DEV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
        date_emission: new Date().toISOString().slice(0, 10),
        date_validite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      }
      addDevis(newDevis)
      alert('Devis dupliqué')
      navigate(`/devis/${newDevis.id}`)
    } catch (err) {
      alert('Erreur : ' + err.message)
    }
  }

  function handleSendByEmail() {
    setShowSendModal(false)
    setSendResult({ success: true, email: devisItem.client_email })
    setTimeout(() => setSendResult(null), 4000)
  }

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-slate-200 px-5 py-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="w-10 h-10 -ml-2 rounded-full hover:bg-slate-100 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <div className="text-center flex-1 min-w-0 px-2">
          <p className="text-[10px] text-slate-500 font-mono truncate">{devisItem.numero}</p>
          <h1 className="text-base font-bold text-slate-900 truncate">
            {editing ? 'Édition' : 'Détail du devis'}
          </h1>
        </div>
        <div className="flex items-center gap-1">
          {editing ? (
            <>
              <button onClick={saveEdit} className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center">
                <Save className="w-5 h-5 text-white" />
              </button>
              <button onClick={() => setEditing(false)} className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                <X className="w-5 h-5 text-slate-700" />
              </button>
            </>
          ) : (
            <>
              <button onClick={startEdit} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <Edit3 className="w-4 h-4 text-slate-700" />
              </button>
              <button onClick={handlePDF} disabled={pdfLoading} className="w-10 h-10 rounded-full bg-chantier flex items-center justify-center shadow-soft active:scale-95 disabled:opacity-50">
                <Download className="w-5 h-5 text-white" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="px-5 pt-4 space-y-3">
        <div className={`card border ${statusStyles[devisItem.statut] || statusStyles.en_attente}`}>
          <p className="text-sm font-semibold">
            Statut : <span className="font-bold">{(devisItem.statut || 'en_attente').replace('_', ' ').toUpperCase()}</span>
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs text-slate-500 uppercase tracking-wider font-bold">Client</h3>
            {!editing && (
              <button onClick={handleDuplicate} className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1">
                <Copy className="w-3 h-3" /> Dupliquer
              </button>
            )}
          </div>
          {editing ? (
            <div className="space-y-2">
              <input className="input" placeholder="Nom *" value={editForm.client_nom} onChange={e => setEditForm({...editForm, client_nom: e.target.value})} />
              <div className="grid grid-cols-2 gap-2">
                <input className="input" placeholder="Email" value={editForm.client_email} onChange={e => setEditForm({...editForm, client_email: e.target.value})} />
                <input className="input" placeholder="Téléphone" value={editForm.client_tel} onChange={e => setEditForm({...editForm, client_tel: e.target.value})} />
              </div>
              <input className="input" placeholder="Adresse" value={editForm.client_adresse} onChange={e => setEditForm({...editForm, client_adresse: e.target.value})} />
            </div>
          ) : (
            <>
              <p className="text-lg font-bold text-slate-900">{devisItem.client_nom || 'Sans nom'}</p>
              {devisItem.client_email && <p className="text-sm text-slate-600 mt-1">{devisItem.client_email}</p>}
              {devisItem.client_tel && <p className="text-sm text-slate-600">{devisItem.client_tel}</p>}
              {devisItem.client_adresse && <p className="text-sm text-slate-600 mt-1">{devisItem.client_adresse}</p>}
              {devisItem.client_email && (
                <button onClick={() => setShowSendModal(true)} className="mt-3 text-sm text-chantier font-semibold flex items-center gap-1.5">
                  <Mail className="w-4 h-4" /> Envoyer par email
                </button>
              )}
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="card">
            <p className="text-xs text-slate-500 mb-1">Émis le</p>
            <p className="text-slate-900 font-semibold text-sm">{devisItem.date_emission || '—'}</p>
          </div>
          <div className="card">
            <p className="text-xs text-slate-500 mb-1">Valable jusqu'au</p>
            {editing ? (
              <input type="date" className="input text-sm" value={editForm.date_validite} onChange={e => setEditForm({...editForm, date_validite: e.target.value})} />
            ) : (
              <p className="text-slate-900 font-semibold text-sm">{devisItem.date_validite || '—'}</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-3">Prestations</h3>
          {(devisItem.lignes || []).length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">Aucune ligne dans ce devis</p>
          ) : (
            <div className="space-y-3">
              {devisItem.lignes.map((l, i) => (
                <div key={i} className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{l.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {l.qty} {l.unit} × {Number(l.priceHT || 0).toFixed(2)}€ HT · TVA {l.tva}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">
                      {(l.qty * l.priceHT * (1 + l.tva / 100)).toFixed(2)}€
                    </p>
                    <p className="text-[10px] text-slate-500">TTC</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card bg-slate-900 text-white">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-300"><span>Total HT</span><span>{totalHT.toFixed(2)} €</span></div>
            <div className="flex justify-between text-slate-300"><span>TVA</span><span>{totalTVA.toFixed(2)} €</span></div>
            <div className="flex justify-between text-2xl font-bold pt-3 border-t border-slate-700">
              <span>Total TTC</span>
              <span className="text-chantier-light">{totalTTC.toFixed(2)} €</span>
            </div>
          </div>
        </div>

        {/* Analyse de risques */}
        {!editing && (
          <RiskDetector
            devis={devisItem}
            allDevis={devis}
            allFactures={factures}
          />
        )}

        <div className="card">
          <h3 className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-2">Notes</h3>
          {editing ? (
            <textarea className="input min-h-[80px]" value={editForm.notes} onChange={e => setEditForm({...editForm, notes: e.target.value})} />
          ) : (
            <p className="text-sm text-slate-700 whitespace-pre-line">{devisItem.notes || <span className="text-slate-400">Aucune note</span>}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          {devisItem.statut === 'en_attente' && !editing && (
            <>
              <button onClick={() => handleStatus('accepte')} className="btn-primary bg-emerald-600 hover:bg-emerald-700">
                <CheckCircle className="w-4 h-4 inline mr-2" />
                Accepté
              </button>
              <button onClick={() => handleStatus('refuse')} className="btn-secondary">
                <XCircle className="w-4 h-4 inline mr-2" />
                Refusé
              </button>
            </>
          )}
          {devisItem.statut === 'accepte' && !editing && (
            <button onClick={handleConvertToFacture} disabled={converting} className="btn-primary col-span-2 disabled:opacity-50">
              {converting ? (
                <>
                  <div className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Création en cours...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 inline mr-2" />
                  Convertir en facture
                </>
              )}
            </button>
          )}
          {!editing && (
            <>
              <button onClick={handlePDF} disabled={pdfLoading} className="btn-secondary col-span-2">
                <Download className="w-4 h-4 inline mr-2" />
                {pdfLoading ? 'Génération...' : 'Télécharger le PDF'}
              </button>
              <button onClick={handleDelete} className="col-span-2 text-red-600 hover:text-red-700 text-sm py-2.5 hover:bg-red-50 rounded-xl font-medium">
                <Trash2 className="w-4 h-4 inline mr-2" />
                Supprimer ce devis
              </button>
            </>
          )}
        </div>
      </div>

      <Modal open={showSendModal} onClose={() => setShowSendModal(false)} title="Envoyer par email">
        <div className="space-y-3">
          <div className="card bg-slate-50 border-slate-200">
            <p className="text-xs text-slate-500 font-semibold uppercase">Destinataire</p>
            <p className="font-bold text-slate-900">{devisItem.client_email}</p>
          </div>
          <div className="card bg-slate-50 border-slate-200">
            <p className="text-xs text-slate-500 font-semibold uppercase">Pièce jointe</p>
            <p className="font-bold text-slate-900">{devisItem.numero}.pdf</p>
          </div>
          <button onClick={handleSendByEmail} className="btn-primary w-full">
            <Send className="w-4 h-4 inline mr-2" />
            Envoyer (simulation)
          </button>
        </div>
      </Modal>

      {sendResult && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-elevated flex items-center gap-2 animate-slide-up">
          <CheckCircle className="w-5 h-5" />
          <span className="font-semibold">Email envoyé à {sendResult.email}</span>
        </div>
      )}
    </div>
  )
}
