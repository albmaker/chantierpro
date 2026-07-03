import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Save, Download, Sparkles } from 'lucide-react'
import { OUVRAGES_BTP, DEFAULT_PROFILE } from '../data/ouvrages'
import { generatePDF } from '../lib/pdfGenerator'

export default function NouveauDevis() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const fromAI = searchParams.get('from') === 'ai'

  // Pré-remplir depuis l'IA si on vient du scanner
  const aiData = fromAI ? JSON.parse(sessionStorage.getItem('ai_suggestion') || 'null') : null

  const [client, setClient] = useState(aiData ? 'Client à préciser' : '')
  const [clientEmail, setClientEmail] = useState('')
  const [clientTel, setClientTel] = useState('')
  const [clientAdresse, setClientAdresse] = useState('')
  const [metier, setMetier] = useState(aiData?.metier || 'plomberie')
  const [lignes, setLignes] = useState(
    aiData?.ouvrages?.map(o => ({ ...o })) || [
      { ref: 'PLO-001', label: 'Pose WC suspendu', qty: 1, unit: 'forfait', priceHT: 450, tva: 10 },
    ]
  )
  const [notes, setNotes] = useState('')

  const addLigne = () => {
    setLignes([...lignes, { ref: 'CUSTOM', label: '', qty: 1, unit: 'u', priceHT: 0, tva: 10 }])
  }

  const updateLigne = (i, field, value) => {
    const newLignes = [...lignes]
    newLignes[i][field] = value
    setLignes(newLignes)
  }

  const removeLigne = (i) => {
    setLignes(lignes.filter((_, idx) => idx !== i))
  }

  const selectFromLibrary = (i, ref) => {
    const ouvrage = Object.values(OUVRAGES_BTP).flat().find(o => o.ref === ref)
    if (ouvrage) {
      const newLignes = [...lignes]
      newLignes[i] = { ...ouvrage, qty: 1 }
      setLignes(newLignes)
    }
  }

  const totalHT = lignes.reduce((s, l) => s + l.qty * l.priceHT, 0)
  const totalTVA = lignes.reduce((s, l) => s + l.qty * l.priceHT * (l.tva / 100), 0)
  const totalTTC = totalHT + totalTVA

  const saveDevis = () => {
    if (!client) {
      alert('Veuillez renseigner le nom du client')
      return
    }
    // En V1, on génère juste le PDF. En V2, on sauvegardera en local
    const newDevis = {
      id: `DEV-2026-${String(Math.floor(Math.random() * 999) + 100)}`,
      client, clientEmail, clientTel, clientAdresse,
      date: new Date().toISOString().slice(0, 10),
      validite: new Date(Date.now() + 30*24*60*60*1000).toISOString().slice(0,10),
      metier, lignes, statut: 'en_attente', notes,
    }
    sessionStorage.removeItem('ai_suggestion')
    generatePDF(newDevis, DEFAULT_PROFILE, 'devis')
    setTimeout(() => navigate('/devis'), 500)
  }

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-30 bg-navy-800/80 backdrop-blur-lg border-b border-navy-700/50 px-5 py-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-navy-700 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-lg font-bold text-white">Nouveau devis</h1>
        <button onClick={saveDevis} className="w-10 h-10 rounded-full bg-chantier flex items-center justify-center">
          <Save className="w-5 h-5 text-white" />
        </button>
      </div>

      {fromAI && aiData && (
        <div className="mx-5 mt-4 card border border-chantier/30 bg-gradient-to-br from-chantier/10 to-transparent">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-chantier" />
            <p className="text-xs text-chantier font-medium">Pré-rempli par l'IA · {aiData.confidence}% confiance</p>
          </div>
        </div>
      )}

      <div className="px-5 pt-4 space-y-4">
        {/* Client */}
        <div className="card space-y-3">
          <h3 className="text-sm font-semibold text-white">👤 Client</h3>
          <input
            className="input"
            placeholder="Nom du client *"
            value={client}
            onChange={e => setClient(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              className="input"
              placeholder="Email"
              value={clientEmail}
              onChange={e => setClientEmail(e.target.value)}
            />
            <input
              className="input"
              placeholder="Téléphone"
              value={clientTel}
              onChange={e => setClientTel(e.target.value)}
            />
          </div>
          <input
            className="input"
            placeholder="Adresse"
            value={clientAdresse}
            onChange={e => setClientAdresse(e.target.value)}
          />
        </div>

        {/* Métier */}
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-2">🔧 Corps d'état</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(OUVRAGES_BTP).map(m => (
              <button
                key={m}
                onClick={() => setMetier(m)}
                className={`py-2 px-3 rounded-xl text-sm font-medium capitalize transition-colors ${
                  metier === m
                    ? 'bg-chantier text-white'
                    : 'bg-navy-800 text-gray-300'
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
            <h3 className="text-sm font-semibold text-white">📋 Prestations</h3>
            <button onClick={addLigne} className="text-chantier text-sm font-medium flex items-center gap-1">
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
                  <option value="CUSTOM">— Ouvrage personnalisé —</option>
                  {Object.values(OUVRAGES_BTP).flat().map(o => (
                    <option key={o.ref} value={o.ref}>
                      {o.label} ({o.priceHT}€)
                    </option>
                  ))}
                </select>
                <button onClick={() => removeLigne(i)} className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <input
                className="input"
                placeholder="Description"
                value={l.label}
                onChange={e => updateLigne(i, 'label', e.target.value)}
              />
              <div className="grid grid-cols-4 gap-2">
                <input
                  className="input"
                  type="number"
                  placeholder="Qté"
                  value={l.qty}
                  onChange={e => updateLigne(i, 'qty', parseFloat(e.target.value) || 0)}
                />
                <input
                  className="input"
                  placeholder="Unit"
                  value={l.unit}
                  onChange={e => updateLigne(i, 'unit', e.target.value)}
                />
                <input
                  className="input"
                  type="number"
                  placeholder="Prix HT"
                  value={l.priceHT}
                  onChange={e => updateLigne(i, 'priceHT', parseFloat(e.target.value) || 0)}
                />
                <select
                  className="input"
                  value={l.tva}
                  onChange={e => updateLigne(i, 'tva', parseFloat(e.target.value))}
                >
                  <option value="20">20%</option>
                  <option value="10">10%</option>
                  <option value="5.5">5,5%</option>
                  <option value="0">0%</option>
                </select>
              </div>
              <div className="text-right text-sm text-gray-400">
                Total TTC : <span className="text-white font-bold">{(l.qty * l.priceHT * (1 + l.tva/100)).toFixed(2)} €</span>
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-2">📝 Notes</h3>
          <textarea
            className="input min-h-[80px]"
            placeholder="Notes complémentaires..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        {/* Récap */}
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

        <button onClick={saveDevis} className="btn-primary w-full">
          <Download className="w-4 h-4 inline mr-2" />
          Enregistrer et générer le PDF
        </button>
      </div>
    </div>
  )
}
