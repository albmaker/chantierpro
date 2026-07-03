import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Upload, Sparkles, CheckCircle, X, Loader, AlertCircle, Cpu, Sparkle } from 'lucide-react'
import Header from '../components/Header'
import { analyzeChantierImage, compressImage } from '../lib/mistralAI'

// Simulation fallback si l'API ne r\u00e9pond pas (pour la d\u00e9mo)
async function simulateAIAnalysis() {
  await new Promise(r => setTimeout(r, 2500))
  const suggestions = [
    {
      metier: 'plomberie',
      confidence: 92,
      description: "Installation sanitaire d\u00e9tect\u00e9e : WC, robinetterie et tuyauterie \u00e0 poser.",
      ouvrages: [
        { ref: 'PLO-001', label: 'Pose WC suspendu', qty: 1, unit: 'forfait', priceHT: 450, tva: 10 },
        { ref: 'PLO-003', label: 'Pose robinetterie mitigeur', qty: 2, unit: 'u', priceHT: 85, tva: 10 },
      ],
    },
    {
      metier: 'peinture',
      confidence: 88,
      description: "Murs et plafonds \u00e0 peindre d\u00e9tect\u00e9s sur ~45m\u00b2.",
      ouvrages: [
        { ref: 'PEI-001', label: 'Peinture mur int\u00e9rieur (au m\u00b2)', qty: 45, unit: 'm\u00b2', priceHT: 22, tva: 10 },
        { ref: 'PEI-002', label: 'Peinture plafond (au m\u00b2)', qty: 18, unit: 'm\u00b2', priceHT: 26, tva: 10 },
      ],
    },
  ]
  return suggestions[Math.floor(Math.random() * suggestions.length)]
}

export default function ScannerIA() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [image, setImage] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [apiMode, setApiMode] = useState(null)

  async function handleFile(file) {
    if (!file) return
    setError(null)
    setResult(null)
    try {
      const compressed = await compressImage(file, 1280, 0.85)
      setImage(compressed)
    } catch (err) {
      const reader = new FileReader()
      reader.onload = (e) => setImage(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    handleFile(e.dataTransfer.files[0])
  }

  async function analyzeImage() {
    if (!image) return
    setAnalyzing(true)
    setError(null)

    try {
      const result = await analyzeChantierImage(image)
      setResult(result)
      setApiMode('real')
    } catch (err) {
      console.warn('Mistral API non dispo, fallback simulation:', err.message)
      try {
        const simulated = await simulateAIAnalysis()
        setResult(simulated)
        setApiMode('simulated')
      } catch (err2) {
        setError('Impossible d\'analyser l\'image. R\u00e9essaie.')
      }
    } finally {
      setAnalyzing(false)
    }
  }

  function createDevisFromAI() {
    if (!result) return
    sessionStorage.setItem('ai_suggestion', JSON.stringify(result))
    navigate('/nouveau-devis?from=ai')
  }

  function reset() {
    setImage(null)
    setResult(null)
    setError(null)
    setAnalyzing(false)
    setApiMode(null)
  }

  return (
    <div className="pb-24">
      <Header title="Scanner IA Mistral" subtitle="Photo \u2192 Devis automatique" />

      <div className="px-5 pt-4 space-y-4">
        {!image && (
          <>
            <div className="card bg-gradient-to-br from-purple-50 to-white border-purple-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">Propuls\u00e9 par Mistral AI</p>
                  <p className="text-xs text-slate-600">IA fran\u00e7aise \u00b7 Vision par ordinateur</p>
                </div>
              </div>
            </div>

            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="card border-2 border-dashed border-chantier/40 bg-chantier-50 text-center py-12 cursor-pointer hover:bg-chantier-100/50 transition-colors"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-chantier flex items-center justify-center mb-4 shadow-soft">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Prenez une photo du chantier</h3>
              <p className="text-sm text-slate-600 mb-4 px-4">Notre IA Mistral analyse et g\u00e9n\u00e8re un devis estimatif en 3-5 secondes</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button type="button" className="btn-primary inline-flex items-center gap-2">
                  <Camera className="w-4 h-4" /> Prendre une photo
                </button>
                <button type="button" className="btn-secondary inline-flex items-center gap-2">
                  <Upload className="w-4 h-4" /> Galerie
                </button>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />

            <div className="card">
              <h3 className="text-sm font-bold text-slate-900 mb-3">L'IA d\u00e9tecte automatiquement :</h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Type d'ouvrage (plomberie, \u00e9lectricit\u00e9, peinture, ma\u00e7onnerie)</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Quantit\u00e9s estim\u00e9es (m\u00b2, ml, unit\u00e9s)</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Prix moyens du march\u00e9 2026</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Taux de TVA adapt\u00e9 (5,5 / 10 / 20%)</li>
              </ul>
            </div>
          </>
        )}

        {image && (
          <>
            <div className="card p-0 overflow-hidden">
              <img src={image} alt="Chantier" className="w-full h-64 object-cover" />
              <div className="p-3 flex justify-between items-center">
                <span className="text-sm text-slate-600">Photo du chantier</span>
                <button onClick={reset} className="text-slate-400 hover:text-slate-700 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {!analyzing && !result && (
              <button onClick={analyzeImage} className="btn-primary w-full">
                <Sparkles className="w-5 h-5 inline mr-2" />
                Analyser avec l'IA
              </button>
            )}

            {analyzing && (
              <div className="card text-center py-8">
                <Loader className="w-10 h-10 text-chantier mx-auto animate-spin mb-3" />
                <h3 className="text-lg font-bold text-slate-900 mb-1">L'IA analyse votre chantier...</h3>
                <p className="text-sm text-slate-500">Identification des ouvrages (~3-5s)</p>
              </div>
            )}

            {error && !analyzing && (
              <div className="card border-red-200 bg-red-50">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-slate-900">Erreur</h3>
                    <p className="text-sm text-slate-600 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-3 animate-slide-up">
                <div className="card border border-chantier-100 bg-gradient-to-br from-chantier-50 to-white">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Sparkles className="w-5 h-5 text-chantier" />
                    <h3 className="text-lg font-bold text-slate-900">Analyse termin\u00e9e</h3>
                    {apiMode === 'real' && (
                      <span className="badge bg-purple-100 text-purple-700 text-[10px]">
                        <Cpu className="w-3 h-3 inline mr-1" />Mistral AI
                      </span>
                    )}
                    {apiMode === 'simulated' && (
                      <span className="badge bg-amber-100 text-amber-700 text-[10px]">D\u00e9mo</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-700 mb-3">{result.description}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="badge bg-chantier text-white text-[10px]">Confiance {result.confidence}%</span>
                    <span className="badge bg-slate-200 text-slate-700 text-[10px] capitalize">{result.metier}</span>
                  </div>
                </div>

                <div className="card">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">Ouvrages sugg\u00e9r\u00e9s :</h3>
                  <div className="space-y-2">
                    {result.ouvrages.map((o, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{o.label}</p>
                          <p className="text-xs text-slate-500">{o.qty} {o.unit} × {o.priceHT}\u20ac HT \u00b7 TVA {o.tva}%</p>
                        </div>
                        <p className="text-sm font-bold text-chantier">{(o.qty * o.priceHT).toFixed(0)}\u20ac</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between">
                    <span className="text-sm text-slate-500">Total estim\u00e9 HT</span>
                    <span className="text-lg font-bold text-slate-900">
                      {result.ouvrages.reduce((s, o) => s + o.qty * o.priceHT, 0).toFixed(0)}\u20ac
                    </span>
                  </div>
                </div>

                <button onClick={createDevisFromAI} className="btn-primary w-full">
                  <Sparkle className="w-4 h-4 inline mr-2" />
                  Cr\u00e9er le devis avec ces lignes
                </button>
                <button onClick={reset} className="btn-secondary w-full">
                  Scanner une autre photo
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
