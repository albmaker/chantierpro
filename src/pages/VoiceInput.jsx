import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mic, MicOff, Sparkles, Save, Loader, AlertCircle, CheckCircle2, Wand2 } from 'lucide-react'
import Header from '../components/Header'
import { OUVRAGES_BTP } from '../data/empty'
import { recognizeSpeech, structureTranscription, structureLocally } from '../lib/voiceService'
import { useData } from '../contexts/DataContext'

export default function VoiceInput() {
  const navigate = useNavigate()
  const { addDevis, getProfile } = useData()
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interim, setInterim] = useState('')
  const [structuring, setStructuring] = useState(false)
  const [structured, setStructured] = useState(null)
  const [error, setError] = useState(null)
  const [clientNom, setClientNom] = useState('')
  const recognitionRef = useRef(null)
  const intervalRef = useRef(null)

  async function startRecording() {
    setError(null)
    setTranscript('')
    setInterim('')
    setStructured(null)

    try {
      const result = await recognizeSpeech()
      recognitionRef.current = result

      // Polling pour récupérer interim + final
      intervalRef.current = setInterval(() => {
        if (recognitionRef.current) {
          // Note: Web Speech API ne donne pas accès direct au transcript courant
          // On va devoir arrêter périodiquement et redémarrer
        }
      }, 1000)

      setIsRecording(true)
    } catch (err) {
      setError(err.message)
    }
  }

  function stopRecording() {
    setIsRecording(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch (e) {}
    }
  }

  function handleEditTranscript(e) {
    setTranscript(e.target.value)
  }

  async function handleStructure() {
    if (!transcript.trim()) {
      setError('Dicte ou écris quelque chose d\'abord')
      return
    }
    setStructuring(true)
    setError(null)
    try {
      const result = await structureTranscription(transcript, OUVRAGES_BTP)
      setStructured(result)
    } catch (err) {
      console.warn('Mistral failed, using local fallback:', err.message)
      // Fallback local si Mistral ne répond pas
      try {
        const result = structureLocally(transcript)
        setStructured(result)
        setError('Mistral AI non disponible, structuration locale utilisée. Tu peux éditer les lignes ci-dessous.')
      } catch (err2) {
        setError('Erreur : ' + err.message)
        setStructured({
          metier: 'plomberie',
          description: 'Devis à compléter manuellement',
          ouvrages: [],
        })
      }
    } finally {
      setStructuring(false)
    }
  }

  async function handleSave() {
    if (!clientNom.trim()) {
      setError('Renseigne le nom du client')
      return
    }
    if (!structured || structured.ouvrages.length === 0) {
      setError('Aucun ouvrage à enregistrer')
      return
    }

    try {
      const newDevis = await addDevis({
        client_nom: clientNom,
        metier: structured.metier || 'plomberie',
        notes: `Généré par saisie vocale : "${transcript.substring(0, 200)}${transcript.length > 200 ? '...' : ''}"`,
        lignes: structured.ouvrages.map(o => ({
          ref: o.ref || 'CUSTOM',
          label: o.label,
          qty: o.qty || 1,
          unit: o.unit || 'u',
          priceHT: o.priceHT || 0,
          tva: o.tva || 10,
        })),
        statut: 'en_attente',
      })
      alert('Devis créé avec succès !')
      navigate(`/devis/${newDevis.id}`)
    } catch (err) {
      setError('Erreur : ' + err.message)
    }
  }

  function updateLigne(i, field, value) {
    const newLignes = [...structured.ouvrages]
    newLignes[i] = { ...newLignes[i], [field]: value }
    setStructured({ ...structured, ouvrages: newLignes })
  }

  function removeLigne(i) {
    const newLignes = structured.ouvrages.filter((_, idx) => idx !== i)
    setStructured({ ...structured, ouvrages: newLignes })
  }

  const totalHT = structured?.ouvrages?.reduce((s, l) => s + (l.qty || 0) * (l.priceHT || 0), 0) || 0
  const totalTVA = structured?.ouvrages?.reduce((s, l) => s + (l.qty || 0) * (l.priceHT || 0) * ((l.tva || 0) / 100), 0) || 0
  const totalTTC = totalHT + totalTVA

  return (
    <div className="pb-24">
      <Header
        title="🎙️ Saisie vocale"
        subtitle="Dicte ton devis, l'IA le structure"
      />

      <div className="px-5 pt-4 space-y-4">
        {/* Instructions */}
        <div className="card bg-gradient-to-br from-blue-50 to-white dark:from-slate-800 dark:to-slate-800 border-blue-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Mic className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Comment ça marche</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                1. Clique sur le micro et dicte ton chantier<br/>
                2. L'IA transcrit et structure en lignes<br/>
                3. Tu valides et c'est enregistré
              </p>
            </div>
          </div>
        </div>

        {/* Bouton micro */}
        {!structured && (
          <div className="card text-center py-8">
            {isRecording ? (
              <div className="space-y-4">
                <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75" />
                  <div className="relative w-24 h-24 bg-red-500 rounded-full flex items-center justify-center">
                    <Mic className="w-12 h-12 text-white" />
                  </div>
                </div>
                <p className="text-lg font-bold text-red-600">J'écoute...</p>
                <p className="text-sm text-slate-500">Décris ton chantier naturellement</p>
                {interim && (
                  <p className="text-sm text-slate-400 italic mt-2">"{interim}"</p>
                )}
                <button onClick={stopRecording} className="btn-secondary">
                  <MicOff className="w-4 h-4 inline mr-2" />
                  Arrêter
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-24 h-24 mx-auto bg-chantier rounded-full flex items-center justify-center shadow-elevated active:scale-95 transition-transform">
                  <button onClick={startRecording} className="w-full h-full rounded-full flex items-center justify-center">
                    <Mic className="w-12 h-12 text-white" />
                  </button>
                </div>
                <p className="text-lg font-bold text-slate-900 dark:text-white">Appuie pour dicter</p>
                <p className="text-sm text-slate-500 px-4">
                  Exemple : "C'est une salle de bain, 6m², faut refaire la plomberie, changer la baignoire en douche, et repeindre le plafond"
                </p>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="card border-red-200 bg-red-50">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Transcript éditable */}
        {transcript && !structured && (
          <div className="card">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Transcription</h3>
            <textarea
              className="input min-h-[120px] text-sm"
              value={transcript}
              onChange={handleEditTranscript}
              placeholder="Ta dictée apparaîtra ici. Tu peux l'éditer si besoin."
            />
            <button
              onClick={handleStructure}
              disabled={structuring}
              className="btn-primary w-full mt-3"
            >
              {structuring ? (
                <>
                  <Loader className="w-4 h-4 inline mr-2 animate-spin" />
                  L'IA structure ton devis...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 inline mr-2" />
                  Structurer en lignes de devis
                </>
              )}
            </button>
          </div>
        )}

        {/* Résultat structuré */}
        {structured && (
          <>
            <div className="card bg-gradient-to-br from-emerald-50 to-white dark:from-slate-800 dark:to-slate-800 border-emerald-200">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Devis structuré !</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    {structured.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {structured.ouvrages.map((l, i) => (
                <div key={i} className="card space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">{l.label}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {l.matched ? `✓ ${l.ref}` : 'Personnalisé'} · TVA {l.tva}%
                      </p>
                    </div>
                    <button onClick={() => removeLigne(i)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center">
                      ×
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500">Qté</label>
                      <input
                        type="number"
                        className="input text-sm"
                        value={l.qty}
                        onChange={e => updateLigne(i, 'qty', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500">Prix HT</label>
                      <input
                        type="number"
                        className="input text-sm"
                        value={l.priceHT}
                        onChange={e => updateLigne(i, 'priceHT', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500">Total TTC</label>
                      <div className="input text-sm bg-slate-50 dark:bg-slate-700 font-bold text-chantier">
                        {((l.qty || 0) * (l.priceHT || 0) * (1 + (l.tva || 0) / 100)).toFixed(0)}€
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="label">Nom du client *</label>
              <input
                className="input"
                placeholder="M. Dupont Bernard"
                value={clientNom}
                onChange={e => setClientNom(e.target.value)}
              />
            </div>

            <div className="card bg-slate-900 text-white">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-slate-300"><span>Total HT</span><span>{totalHT.toFixed(2)} €</span></div>
                <div className="flex justify-between text-slate-300"><span>TVA</span><span>{totalTVA.toFixed(2)} €</span></div>
                <div className="flex justify-between text-xl font-bold pt-2 border-t border-slate-700">
                  <span>Total TTC</span>
                  <span className="text-chantier-light">{totalTTC.toFixed(0)} €</span>
                </div>
              </div>
            </div>

            <button onClick={handleSave} className="btn-primary w-full">
              <Save className="w-4 h-4 inline mr-2" />
              Enregistrer le devis
            </button>
          </>
        )}
      </div>
    </div>
  )
}
