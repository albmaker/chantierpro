import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mic, MicOff, Sparkles, Save, Loader, AlertCircle, CheckCircle2, Wand2 } from 'lucide-react'
import Header from '../components/Header'
import { OUVRAGES_BTP } from '../data/empty'
import { createSpeechRecognizer, isSpeechRecognitionSupported, structureTranscription, structureLocally } from '../lib/voiceService'
import { useData } from '../contexts/DataContext'

export default function VoiceInput() {
  const navigate = useNavigate()
  const { addDevis } = useData()
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [structuring, setStructuring] = useState(false)
  const [structured, setStructured] = useState(null)
  const [error, setError] = useState(null)
  const [clientNom, setClientNom] = useState('')
  const [recognizer, setRecognizer] = useState(null)
  const [supported, setSupported] = useState(true)

  // V\u00e9rifier le support au mount
  useEffect(() => {
    setSupported(isSpeechRecognitionSupported())
    return () => {
      if (recognizer) {
        try { recognizer.abort() } catch (e) {}
      }
    }
  }, [])

  async function startRecording() {
    setError(null)
    setTranscript('')
    setStructured(null)

    if (!isSpeechRecognitionSupported()) {
      setError('Reconnaissance vocale non supportée. Utilisez Chrome, Edge ou Safari récent. Vous pouvez aussi taper le texte manuellement ci-dessous.')
      return
    }

    const rec = createSpeechRecognizer({
      onResult: (text, isFinal) => {
        setTranscript(text)
      },
      onError: (err) => {
        setError(`Erreur micro : ${err}. Astuce : autorise l'accès au micro dans les paramètres du navigateur.`)
        setIsRecording(false)
      },
      onEnd: () => {
        setIsRecording(false)
      },
    })

    if (!rec) {
      setError('Impossible de créer le recognizer. Utilise Chrome ou Edge.')
      return
    }

    setRecognizer(rec)
    rec.start()
    setIsRecording(true)
  }

  function stopRecording() {
    if (recognizer) {
      recognizer.stop()
    }
    setIsRecording(false)
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
      try {
        const result = structureLocally(transcript)
        setStructured(result)
        setError('Mistral AI non disponible, structuration locale utilisée. Édite les lignes si besoin.')
      } catch (err2) {
        setError('Erreur : ' + err.message)
        setStructured({ metier: 'plomberie', description: 'Devis vide', ouvrages: [] })
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
      alert('Devis créé !')
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
      <Header title="🎙️ Saisie vocale" subtitle="Dicte ton devis, l'IA le structure" />

      <div className="px-5 pt-4 space-y-4">
        {/* Info sur le navigateur requis */}
        <div className="card bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Mic className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Comment ça marche</h3>
              <p className="text-xs text-slate-600 mt-1">
                1. Autorise l'accès au micro dans ton navigateur<br/>
                2. Clique sur le micro et dicte ton chantier<br/>
                3. L'IA Mistral structure en lignes de devis<br/>
                4. Tu valides et c'est enregistré
              </p>
            </div>
          </div>
        </div>

        {!supported && (
          <div className="card border-amber-200 bg-amber-50">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-900">Navigateur non compatible</p>
                <p className="text-xs text-amber-700 mt-1">
                  Le micro nécessite Chrome, Edge ou Safari. Tu peux quand même taper ta dictée dans la zone de texte.
                </p>
              </div>
            </div>
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

        {/* Bouton micro + zone de texte */}
        {!structured && (
          <>
            <div className="card text-center py-6">
              {isRecording ? (
                <div className="space-y-3">
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75" />
                    <div className="relative w-20 h-20 bg-red-500 rounded-full flex items-center justify-center">
                      <Mic className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <p className="text-base font-bold text-red-600">J'écoute... parle maintenant</p>
                  <button onClick={stopRecording} className="btn-secondary">
                    <MicOff className="w-4 h-4 inline mr-2" /> Arrêter
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={startRecording}
                    className="w-20 h-20 mx-auto bg-chantier rounded-full flex items-center justify-center shadow-elevated active:scale-95 transition-transform"
                  >
                    <Mic className="w-10 h-10 text-white" />
                  </button>
                  <p className="text-base font-bold text-slate-900">Appuie pour dicter</p>
                  <p className="text-xs text-slate-500 px-4">
                    Exemple : "C'est une salle de bain, 6m², faut refaire la plomberie et poser une douche italienne"
                  </p>
                </div>
              )}
            </div>

            {/* Zone de texte éditable (toujours dispo en fallback) */}
            <div className="card">
              <label className="label">Ou tape ta dictée ici</label>
              <textarea
                className="input min-h-[100px] text-sm"
                value={transcript}
                onChange={e => setTranscript(e.target.value)}
                placeholder="Décris ton chantier ici, ou utilise le micro..."
              />
              <button
                onClick={handleStructure}
                disabled={structuring || !transcript.trim()}
                className="btn-primary w-full mt-3"
              >
                {structuring ? (
                  <>
                    <Loader className="w-4 h-4 inline mr-2 animate-spin" />
                    L'IA Mistral structure ton devis...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 inline mr-2" />
                    Structurer en lignes de devis
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {/* Résultat structuré */}
        {structured && (
          <>
            <div className="card bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-slate-900">Devis structuré !</p>
                  <p className="text-xs text-slate-600 mt-1">{structured.description}</p>
                </div>
              </div>
            </div>

            {structured.ouvrages.length === 0 ? (
              <div className="card text-center py-4">
                <p className="text-slate-500 text-sm">Aucun ouvrage détecté. Essaie d'être plus précis dans ta dictée.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {structured.ouvrages.map((l, i) => (
                  <div key={i} className="card space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 text-sm">{l.label}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {l.matched ? `✓ ${l.ref}` : 'Personnalisé'} · TVA {l.tva}%
                        </p>
                      </div>
                      <button onClick={() => removeLigne(i)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center">
                        <span className="text-lg leading-none">×</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-500">Qté</label>
                        <input type="number" className="input text-sm" value={l.qty} onChange={e => updateLigne(i, 'qty', parseFloat(e.target.value) || 0)} />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500">Prix HT</label>
                        <input type="number" className="input text-sm" value={l.priceHT} onChange={e => updateLigne(i, 'priceHT', parseFloat(e.target.value) || 0)} />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500">Total TTC</label>
                        <div className="input text-sm bg-slate-50 font-bold text-chantier">
                          {((l.qty || 0) * (l.priceHT || 0) * (1 + (l.tva || 0) / 100)).toFixed(0)}€
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

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
