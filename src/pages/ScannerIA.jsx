import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Upload, Sparkles, CheckCircle, X, Loader, AlertCircle, Cpu } from 'lucide-react'
import Header from '../components/Header'
import { analyzeChantierImage, compressImage } from '../lib/mistralAI'

export default function ScannerIA() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [image, setImage] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [apiMode, setApiMode] = useState(null) // 'real' | 'simulated' | null

  const handleFile = async (file) => {
    if (!file) return
    setError(null)
    setResult(null)

    // Compression auto avant envoi
    try {
      const compressed = await compressImage(file, 1280, 0.85)
      setImage(compressed)
      setImageFile(file)
    } catch (err) {
      // Fallback si compression échoue
      const reader = new FileReader()
      reader.onload = (e) => setImage(e.target.result)
      reader.readAsDataURL(file)
      setImageFile(file)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  const analyzeImage = async () => {
    if (!image) return
    setAnalyzing(true)
    setError(null)

    try {
      // Tentative d'appel à la Vercel Function (vraie API Mistral)
      const response = await fetch('/api/mistral-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setResult(data.data)
          setApiMode('real')
          setAnalyzing(false)
          return
        }
      }

      // Si la fonction n'est pas dispo (dev local sans Vercel), fallback simulation
      throw new Error('API non disponible')
    } catch (err) {
      console.warn('Fallback simulation:', err.message)
      // Mode simulation réaliste (en attendant le déploiement)
      const simulated = await simulateAIAnalysis()
      setResult(simulated)
      setApiMode('simulated')
      setAnalyzing(false)
    }
  }

  const simulateAIAnalysis = async () => {
    await new Promise(r => setTimeout(r, 2500))

    const suggestions = [
      {
        metier: 'plomberie',
        confidence: 92,
        description: "L'IA a détecté une installation sanitaire à rénover : WC, robinetterie et tuyauterie.",
        ouvrages: [
          { ref: 'PLO-001', label: 'Pose WC suspendu', qty: 1, unit: 'forfait', priceHT: 450, tva: 10 },
          { ref: 'PLO-003', label: 'Pose robinetterie mitigeur', qty: 2, unit: 'u', priceHT: 85, tva: 10 },
          { ref: 'PLO-008', label: 'Tuyauterie PER (au ml)', qty: 5, unit: 'ml', priceHT: 35, tva: 10 },
        ],
      },
      {
        metier: 'electricite',
        confidence: 88,
        description: "L'IA a identifié un tableau électrique à mettre aux normes avec ajout de prises et points lumineux.",
        ouvrages: [
          { ref: 'ELE-001', label: 'Prise électrique 16A', qty: 6, unit: 'u', priceHT: 65, tva: 10 },
          { ref: 'ELE-002', label: 'Point lumineux complet', qty: 4, unit: 'u', priceHT: 85, tva: 10 },
          { ref: 'ELE-003', label: 'Tableau électrique 2 rangées', qty: 1, unit: 'u', priceHT: 420, tva: 10 },
        ],
      },
      {
        metier: 'peinture',
        confidence: 95,
        description: "L'IA a détecté des murs et plafonds à peindre sur environ 45m² (rénovation intérieure).",
        ouvrages: [
          { ref: 'PEI-001', label: 'Peinture mur intérieur (au m²)', qty: 45, unit: 'm²', priceHT: 22, tva: 10 },
          { ref: 'PEI-002', label: 'Peinture plafond (au m²)', qty: 18, unit: 'm²', priceHT: 26, tva: 10 },
          { ref: 'PEI-003', label: 'Préparation support (enduit)', qty: 45, unit: 'm²', priceHT: 14, tva: 10 },
        ],
      },
      {
        metier: 'maconnerie',
        confidence: 90,
        description: "L'IA a identifié des travaux de cloison et carrelage sol sur ~30m².",
        ouvrages: [
          { ref: 'MAC-001', label: 'Cloison placoplatre (au m²)', qty: 20, unit: 'm²', priceHT: 45, tva: 10 },
          { ref: 'MAC-003', label: 'Carrelage sol (au m²)', qty: 30, unit: 'm²', priceHT: 55, tva: 10 },
        ],
      },
    ]
    return suggestions[Math.floor(Math.random() * suggestions.length)]
  }

  const createDevisFromAI = () => {
    sessionStorage.setItem('ai_suggestion', JSON.stringify(result))
    navigate('/nouveau-devis?from=ai')
  }

  const reset = () => {
    setImage(null)
    setImageFile(null)
    setResult(null)
    setError(null)
    setAnalyzing(false)
    setApiMode(null)
  }

  return (
    <div className="pb-24">
      <Header
        title="📸 Scanner Chantier IA"
        subtitle="Mistral Pixtral · Photo → Devis auto"
      />

      <div className="px-5 pt-4 space-y-4">
        {!image && (
          <>
            {/* Badge IA */}
            <div className="card bg-gradient-to-r from-purple-500/10 to-chantier/10 border border-purple-500/20">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-sm font-semibold text-white">Propulsé par Mistral Pixtral</p>
                  <p className="text-xs text-gray-300">IA française · 0,0002€ par analyse</p>
                </div>
              </div>
            </div>

            {/* Zone de drop */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="card border-2 border-dashed border-chantier/40 bg-chantier/5 text-center py-12 cursor-pointer hover:bg-chantier/10 transition-colors"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-chantier/20 flex items-center justify-center mb-4">
                <Camera className="w-8 h-8 text-chantier" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Prenez une photo du chantier</h3>
              <p className="text-sm text-gray-300 mb-4 px-4">
                Notre IA Mistral analyse et génère un devis estimatif
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button className="btn-primary inline-flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Prendre une photo
                </button>
                <button className="btn-secondary inline-flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Galerie
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

            {/* Exemples */}
            <div className="card">
              <h3 className="text-sm font-semibold text-white mb-3">✨ L'IA détecte automatiquement :</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Type d'ouvrage (plomberie, électricité, peinture, maçonnerie)</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Quantités estimées (m², ml, unités)</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Prix moyens du marché 2026</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Taux de TVA adapté (5,5 / 10 / 20%)</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Niveau de confiance de l'analyse</li>
              </ul>
            </div>
          </>
        )}

        {image && (
          <>
            {/* Aperçu image */}
            <div className="card p-0 overflow-hidden">
              <img src={image} alt="Chantier" className="w-full h-64 object-cover" />
              <div className="p-3 flex justify-between items-center">
                <div>
                  <span className="text-sm text-gray-300 block">Photo du chantier</span>
                  {imageFile && (
                    <span className="text-xs text-gray-500">
                      {(imageFile.size / 1024).toFixed(0)} Ko
                    </span>
                  )}
                </div>
                <button onClick={reset} className="text-gray-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Bouton analyse */}
            {!analyzing && !result && (
              <button onClick={analyzeImage} className="btn-primary w-full">
                <Sparkles className="w-5 h-5 inline mr-2" />
                Analyser avec Mistral AI
              </button>
            )}

            {/* Loading */}
            {analyzing && (
              <div className="card text-center py-8">
                <Loader className="w-10 h-10 text-chantier mx-auto animate-spin mb-3" />
                <h3 className="text-lg font-semibold text-white mb-1">Mistral Pixtral analyse...</h3>
                <p className="text-sm text-gray-400">Identification des ouvrages et estimation (~3s)</p>
              </div>
            )}

            {/* Erreur */}
            {error && !analyzing && (
              <div className="card border-red-500/30 bg-red-500/10">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-white">Erreur d'analyse</h3>
                    <p className="text-sm text-gray-300 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Résultats */}
            {result && (
              <div className="space-y-3 animate-slide-up">
                <div className="card border border-chantier/30 bg-gradient-to-br from-chantier/10 to-transparent">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-chantier" />
                    <h3 className="text-lg font-semibold text-white">Analyse terminée</h3>
                    {apiMode === 'real' && (
                      <span className="badge bg-purple-500/20 text-purple-300 text-[10px]">
                        <Cpu className="w-3 h-3 inline mr-1" />
                        Mistral AI
                      </span>
                    )}
                    {apiMode === 'simulated' && (
                      <span className="badge bg-yellow-500/20 text-yellow-400 text-[10px]">
                        Démo
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-300 mb-3">{result.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="badge bg-chantier/20 text-chantier">
                      Confiance : {result.confidence}%
                    </span>
                    <span className="badge bg-navy-600 text-gray-300 capitalize">
                      {result.metier}
                    </span>
                  </div>
                </div>

                <div className="card">
                  <h3 className="text-sm font-semibold text-white mb-3">📋 Ouvrages suggérés :</h3>
                  <div className="space-y-2">
                    {result.ouvrages.map((o, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-navy-800/50 rounded-lg">
                        <div>
                          <p className="text-sm text-white">{o.label}</p>
                          <p className="text-xs text-gray-400">
                            {o.qty} {o.unit} × {o.priceHT}€ HT · TVA {o.tva}%
                          </p>
                        </div>
                        <p className="text-sm font-bold text-chantier">
                          {(o.qty * o.priceHT).toFixed(0)}€
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-navy-600 flex justify-between">
                    <span className="text-sm text-gray-400">Total estimé HT</span>
                    <span className="text-lg font-bold text-white">
                      {result.ouvrages.reduce((s, o) => s + o.qty * o.priceHT, 0).toFixed(0)}€
                    </span>
                  </div>
                </div>

                <button onClick={createDevisFromAI} className="btn-primary w-full">
                  ✨ Créer le devis avec ces lignes
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
