import { useNavigate } from 'react-router-dom'
import { Sparkles, Camera, FileText, Smartphone, Check, ArrowRight, Zap, Shield, Clock } from 'lucide-react'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-navy-900">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-chantier/20 via-transparent to-transparent" />
        <div className="relative max-w-2xl mx-auto px-6 py-12">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 rounded-xl bg-chantier flex items-center justify-center">
              <span className="text-white font-bold text-lg">CP</span>
            </div>
            <span className="text-xl font-bold text-white">ChantierPro</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
            Devis BTP en<br />
            <span className="text-chantier">2 minutes</span> chrono
          </h1>
          <p className="text-lg text-gray-300 mt-4">
            L'app qui génère tes devis à partir d'une simple photo du chantier. Compatible facturation électronique 2026.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary flex items-center justify-center gap-2 flex-1"
            >
              Essai gratuit
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              Voir la démo
            </button>
          </div>

          <div className="flex items-center gap-4 mt-6 text-sm text-gray-400">
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-400" /> Sans engagement</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-400" /> 2 devis offerts</span>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          Conçu pour les artisans
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="card">
            <div className="w-12 h-12 rounded-xl bg-chantier/20 flex items-center justify-center mb-3">
              <Camera className="w-6 h-6 text-chantier" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Scan IA</h3>
            <p className="text-sm text-gray-300">
              Prends une photo du chantier, l'IA détecte les ouvrages et pré-remplit ton devis.
            </p>
          </div>

          <div className="card">
            <div className="w-12 h-12 rounded-xl bg-chantier/20 flex items-center justify-center mb-3">
              <FileText className="w-6 h-6 text-chantier" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">PDF Pro</h3>
            <p className="text-sm text-gray-300">
              Devis et factures PDF avec mentions légales auto, multi-TVA 5,5/10/20%.
            </p>
          </div>

          <div className="card">
            <div className="w-12 h-12 rounded-xl bg-chantier/20 flex items-center justify-center mb-3">
              <Smartphone className="w-6 h-6 text-chantier" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">100% mobile</h3>
            <p className="text-sm text-gray-300">
              Utilisable sur chantier, même sans connexion. Synchronisation auto.
            </p>
          </div>

          <div className="card">
            <div className="w-12 h-12 rounded-xl bg-chantier/20 flex items-center justify-center mb-3">
              <Shield className="w-6 h-6 text-chantier" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">FE 2026 ready</h3>
            <p className="text-sm text-gray-300">
              Compatible avec la réforme de la facturation électronique 2026.
            </p>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-white text-center mb-2">
          Tarifs simples
        </h2>
        <p className="text-center text-gray-400 mb-8">
          Annulable à tout moment
        </p>

        <div className="space-y-3">
          {/* Starter */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Starter</h3>
                <p className="text-sm text-gray-300">Pour les artisans solo</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">19€</p>
                <p className="text-xs text-gray-400">/mois</p>
              </div>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Devis illimités</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Factures PDF</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Compatible FE 2026</li>
            </ul>
          </div>

          {/* Pro */}
          <div className="card border-2 border-chantier bg-gradient-to-br from-chantier/10 to-transparent relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-chantier text-white text-xs font-bold px-3 py-1 rounded-full">
              POPULAIRE
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Pro</h3>
                <p className="text-sm text-gray-300">Pour les pros du chantier</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">39€</p>
                <p className="text-xs text-gray-400">/mois</p>
              </div>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-chantier" /> Tout du Starter</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-chantier" /> <strong>Scan IA illimité</strong></li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-chantier" /> Bibliothèque 50+ ouvrages</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-chantier" /> Relances automatiques</li>
            </ul>
          </div>

          {/* Business */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Business</h3>
                <p className="text-sm text-gray-300">Pour les équipes</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">79€</p>
                <p className="text-xs text-gray-400">/mois</p>
              </div>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Tout du Pro</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Multi-utilisateurs</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Signature électronique</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Support prioritaire</li>
            </ul>
          </div>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="btn-primary w-full mt-6"
        >
          <Zap className="w-4 h-4 inline mr-2" />
          Démarrer maintenant
        </button>
      </div>

      {/* Social proof */}
      <div className="max-w-2xl mx-auto px-6 py-12 text-center">
        <div className="flex items-center justify-center gap-1 mb-2">
          {[1,2,3,4,5].map(i => (
            <span key={i} className="text-yellow-400 text-2xl">★</span>
          ))}
        </div>
        <p className="text-gray-300">"J'économise 5h par semaine sur mes devis"</p>
        <p className="text-sm text-gray-500 mt-2">— Jean-Marc, plombier à Lyon</p>
      </div>

      {/* Footer */}
      <div className="border-t border-navy-700/50 py-8 text-center text-xs text-gray-500">
        © 2026 ChantierPro · Compatible réforme facturation électronique 2026
      </div>
    </div>
  )
}
