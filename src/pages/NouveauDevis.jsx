import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Save, Download, FileText, Sparkles, Wand2 } from 'lucide-react'
import { OUVRAGES_BTP } from '../data/empty'
import { generatePDF } from '../lib/pdfGenerator'
import { useData } from '../contexts/DataContext'
import Modal from '../components/Modal'

export default function NouveauDevis() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const fromTemplate = searchParams.get('template')
  const { addDevis, getProfile, templates, clients } = useData()

  const tpl = fromTemplate ? templates.find(t => t.id === fromTemplate) : null
  const initialMetier = tpl?.metier || 'plomberie'
  const initialLignes = tpl?.lignes?.map(l => ({ ...l })) || [
    { ref: 'PLO-001', label: 'Pose WC suspendu', qty: 1, unit: 'forfait', priceHT: 450, tva: 10 },
  ]

  const [clientNom, setClientNom] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientTel, setClientTel] = useState('')
  const [clientAdresse, setClientAdresse] = useState('')
  const [metier, setMetier] = useState(initialMetier)
  const [lignes, setLignes] = useState(initialLignes)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [showClientsModal, setShowClientsModal] = useState(false)
  const [showTemplatesModal, setShowTemplatesModal] = useState(false)

  function addLigne() {
    setLignes([...lignes, { ref: 'CUSTOM', label: '', qty: 1, unit: 'u', priceHT: 0, tva: 10 }])
  }

  function updateLigne(i, field, value) {
    const newLignes = [...lignes]
    newLignes[i] = { ...newLignes[i], [field]: value }
    setLignes(newLignes)
  }

  function removeLigne(i) {
    if (lignes.length === 1) return
    setLignes(lignes.filter((_, idx) => idx !== i))
  }

  function selectFromLibrary(i, ref) {
    if (ref === 'CUSTOM') return
    const ouvrage = Object.values(OUVRAGES_BTP).flat().find(o => o.ref === ref)
    if (ouvrage) {
      const newLignes = [...lignes]
      newLignes[i] = { ...ouvrage, qty: 1 }
      setLignes(newLignes)
    }
  }

  function selectClient(c) {
    setClientNom(c.nom)
    setClientEmail(c.email || '')
    setClientTel(c.telephone || '')
    setClientAdresse(c.adresse || '')
    setShowClientsModal(false)
  }

  function applyTemplate(t) {
    setMetier(t.metier)
    setLignes(t.lignes.map(l => ({ ...l })))
    setShowTemplatesModal(false)
  }

  const totalHT = lignes.reduce((s, l) => s + (Number(l.qty) || 0) * (Number(l.priceHT) || 0), 0)
  const totalTVA = lignes.reduce((s, l) => s + (Number(l.qty) || 0) * (Number(l.priceHT) || 0) * ((Number(l.tva) || 0) / 100), 0)
  const totalTTC = totalHT + totalTVA

  async function handleSave(generatePdfAfter = false) {
    if (!clientNom.trim()) {
      alert('Renseigne le nom du client')
      return
    }
    setSaving(true)
    try {
      const newDevis = await addDevis({
        client_nom: clientNom,
        client_email: clientEmail,
        client_tel: clientTel,
        client_adresse: clientAdresse,
        metier,
        lignes,
        notes,
        statut: 'en_attente',
      })
      if (generatePdfAfter) {
        setTimeout(() => {
          generatePDF(newDevis, getProfile(), 'devis')
        }, 100)
      }
      setTimeout(() => navigate('/devis'), generatePdfAfter ? 500 : 100)
    } catch (err) {
      alert('Erreur lors de la sauvegarde : ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-slate-200 px-5 py-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="w-10 h-10 -ml-2 rounded-full hover:bg-slate-100 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h1 className="text-lg font-bold text-slate-900">Nouveau devis</h1>
        <button onClick={() => handleSave(false)} disabled={saving} className="w-10 h-10 rounded-full bg-chantier flex items-center justify-center shadow-soft active:scale-95">
          <Save className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="px-5 pt-4 space-y-3">
        {/* Actions rapides */}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setShowClientsModal(true)} className="btn-secondary text-sm flex items-center justify-center gap-1.5">
            <Wand2 className="w-4 h-4" /> Choisir client
          </button>
          <button onClick={() => setShowTemplatesModal(true)} className="btn-secondary text-sm flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Templates
          </button>
        </div>

        {/* Client */}
        <div className="card space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-bold">1</span>
            Client
          </h3>
          <input className="input" placeholder="Nom du client *" value={clientNom} onChange={e => setClientNom(e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <input className="input" placeholder="Email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
            <input className="input" placeholder="Téléphone" value={clientTel} onChange={e => setClientTel(e.target.value)} />
          </div>
          <input className="input" placeholder="Adresse" value={clientAdresse} onChange={e => setClientAdresse(e.target.value)} />
        </div>

        {/* M\u00e9tier */}
        <div className="card">
          <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-bold">2</span>
            Corps d'\u00e9tat
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(OUVRAGES_BTP).map(m => (
              <button
                key={m}
                onClick={() => setMetier(m)}
                className={`py-2 px-3 rounded-xl text-sm font-semibold capitalize transition-colors ${
                  metier === m ? 'bg-chantier text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Lignes */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-bold">3</span>
              Prestations ({lignes.length})
            </h3>
            <button onClick={addLigne} className="text-chantier text-sm font-semibold flex items-center gap-1 hover:underline">
              <Plus className="w-4 h-4" /> Ajouter
            </button>
          </div>

          {lignes.map((l, i) => (
            <div key={i} className="card space-y-2">
              <div className="flex items-center gap-2">
                <select
                  className="input flex-1"
                  value={l.ref}
                  onChange={e => selectFromLibrary(i, e.target.value)}
                >
                  <option value="CUSTOM">— Personnalis\u00e9 —</option>
                  {Object.values(OUVRAGES_BTP).flat().map(o => (
                    <option key={o.ref} value={o.ref}>{o.label} ({o.priceHT}\u20ac)</option>
                  ))}
                </select>
                <button
                  onClick={() => removeLigne(i)}
                  disabled={lignes.length === 1}
                  className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center disabled:opacity-30 hover:bg-red-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <input className="input" placeholder="Description" value={l.label} onChange={e => updateLigne(i, 'label', e.target.value)} />
              <div className="grid grid-cols-4 gap-2">
                <input className="input text-sm" type="number" min="0" step="0.5" placeholder="Qt\u00e9" value={l.qty} onChange={e => updateLigne(i, 'qty', parseFloat(e.target.value) || 0)} />
                <input className="input text-sm" placeholder="Unit" value={l.unit} onChange={e => updateLigne(i, 'unit', e.target.value)} />
                <input className="input text-sm" type="number" min="0" step="0.01" placeholder="Prix HT" value={l.priceHT} onChange={e => updateLigne(i, 'priceHT', parseFloat(e.target.value) || 0)} />
                <select className="input text-sm" value={l.tva} onChange={e => updateLigne(i, 'tva', parseFloat(e.target.value))}>
                  <option value="20">20%</option>
                  <option value="10">10%</option>
                  <option value="5.5">5,5%</option>
                  <option value="0">0%</option>
                </select>
              </div>
              <div className="text-right text-xs text-slate-500 pt-1 border-t border-slate-100">
                Total TTC : <span className="text-slate-900 font-bold">{(l.qty * l.priceHT * (1 + l.tva / 100)).toFixed(2)} €</span>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <h3 className="text-sm font-bold text-slate-900 mb-2">📝 Notes (optionnel)</h3>
          <textarea className="input min-h-[80px]" placeholder="Notes complémentaires..." value={notes} onChange={e => setNotes(e.target.value)} />
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

        <button onClick={() => handleSave(false)} disabled={saving} className="btn-primary w-full">
          <Save className="w-4 h-4 inline mr-2" />
          {saving ? 'Enregistrement...' : 'Enregistrer le devis'}
        </button>
        <button onClick={() => handleSave(true)} disabled={saving} className="btn-secondary w-full">
          <Download className="w-4 h-4 inline mr-2" />
          Enregistrer et t\u00e9l\u00e9charger le PDF
        </button>
      </div>

      <Modal open={showClientsModal} onClose={() => setShowClientsModal(false)} title="Choisir un client">
        {clients.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500 text-sm">Aucun client enregistré pour l'instant.</p>
            <p className="text-slate-400 text-xs mt-2">Les clients sont créés automatiquement à partir de vos devis.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {clients.map(c => (
              <button
                key={c.id}
                onClick={() => selectClient(c)}
                className="w-full text-left p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <p className="font-semibold text-slate-900">{c.nom}</p>
                {c.email && <p className="text-xs text-slate-500">{c.email}</p>}
                {c.telephone && <p className="text-xs text-slate-500">{c.telephone}</p>}
              </button>
            ))}
          </div>
        )}
      </Modal>

      <Modal open={showTemplatesModal} onClose={() => setShowTemplatesModal(false)} title="Modèles de devis">
        <div className="space-y-2">
          {templates.map(t => (
            <button
              key={t.id}
              onClick={() => applyTemplate(t)}
              className="w-full text-left p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">{t.name}</p>
                <span className="text-[10px] uppercase font-bold text-chantier bg-chantier-50 px-2 py-0.5 rounded">{t.metier}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{t.lignes.length} prestation{t.lignes.length > 1 ? 's' : ''} pr\u00e9-remplies</p>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  )
}
