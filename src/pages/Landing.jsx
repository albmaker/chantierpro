import { useNavigate } from 'react-router-dom'
import { Sparkles, Camera, FileText, Smartphone, Check, ArrowRight, Shield, BarChart3, Mail, Users, Star } from 'lucide-react'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-chantier-50 via-transparent to-orange-50/30" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-chantier/5 rounded-full blur-3xl" />
        <div className="relative max-w-2xl mx-auto px-6 py-12">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-chantier to-chantier-dark flex items-center justify-center shadow-soft">
              <span className="text-white font-bold text-xl">CP</span>
            </div>
            <span className="text-2xl font-extrabold text-slate-900">ChantierPro</span>
          </div>

          <div className="inline-flex items-center gap-1.5 bg-chantier-50 text-chantier-dark text-xs font-bold px-3 py-1.5 rounded-full mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            NOUVEAU \u00b7 Compatible r\u00e9forme FE 2026
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight">
            Devis BTP en<br />
            <span className="bg-gradient-to-r from-chantier to-chantier-dark bg-clip-text text-transparent">2 minutes</span> chrono
          </h1>
          <p className="text-lg text-slate-600 mt-4 leading-relaxed">
            L'app qui g\u00e9n\u00e8re tes devis \u00e0 partir d'une simple photo du chantier. Con\u00e7ue pour les artisans qui veulent arr\u00eater de perdre du temps.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button onClick={() => navigate('/auth', { state: { mode: 'signup' } })} className="btn-primary flex items-center justify-center gap-2 flex-1 shadow-elevated">
              Essai gratuit
              <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigate('/auth')} className="btn-secondary flex items-center justify-center gap-2">
              Se connecter
            </button>
          </div>

          <div className="flex items-center gap-4 mt-6 text-sm text-slate-600 flex-wrap">
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> Sans engagement</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> 2 devis offerts</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> Sans CB</span>
          </div>
        </div>
      </div>

      {/* T\u00e9moignage */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="card bg-gradient-to-br from-slate-50 to-white text-center">
          <div className="flex items-center justify-center gap-0.5 mb-2">
            {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
          </div>
          <p className="text-slate-700 italic text-lg leading-relaxed">"J'\u00e9conomise 5h par semaine sur mes devis. C'est devenu indispensable."</p>
          <p className="text-sm text-slate-500 mt-2">\u2014 Jean-Marc, plombier \u00e0 Lyon</p>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-extrabold text-slate-900 text-center mb-2">Con\u00e7u pour les artisans</h2>
        <p className="text-center text-slate-500 mb-8">Tout ce qu'il vous faut, rien de superflu</p>

        <div className="grid sm:grid-cols-2 gap-3">
          <FeatureCard
            icon={Camera}
            title="Scan IA Mistral"
            description="Photo du chantier \u2192 devis auto-g\u00e9n\u00e9r\u00e9 en 30s"
            color="purple"
          />
          <FeatureCard
            icon={FileText}
            title="PDF pro FE 2026"
            description="Factur-X conforme, multi-TVA, mentions l\u00e9gales auto"
            color="emerald"
          />
          <FeatureCard
            icon={BarChart3}
            title="Stats en temps r\u00e9el"
            description="CA, taux de conversion, top clients, graphiques"
            color="blue"
          />
          <FeatureCard
            icon={Users}
            title="Gestion clients"
            description="Base de contacts auto, historique, relances"
            color="amber"
          />
          <FeatureCard
            icon={Smartphone}
            title="100% mobile"
            description="Utilisable sur chantier, d'une seule main"
            color="pink"
          />
          <FeatureCard
            icon={Shield}
            title="Donn\u00e9es s\u00e9curis\u00e9es"
            description="Sauvegarde cloud automatique, RGPD"
            color="slate"
          />
        </div>
      </div>

      {/* Pricing teaser */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-extrabold text-slate-900 text-center mb-2">Tarifs simples</h2>
        <p className="text-center text-slate-500 mb-6">Commencez gratuitement, upgrade quand vous voulez</p>

        <div className="card border-2 border-chantier shadow-elevated bg-gradient-to-br from-chantier-50 to-white">
          <div className="text-center">
            <p className="text-xs text-chantier font-bold uppercase tracking-wider">Le plus populaire</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">Pro</h3>
            <p className="text-4xl font-extrabold text-slate-900 mt-2">39\u20ac<span className="text-base font-normal text-slate-500">/mois</span></p>
            <p className="text-sm text-slate-600 mt-2">Scan IA \u00b7 Stats avanc\u00e9es \u00b7 Mod\u00e8les illimit\u00e9s</p>
            <button onClick={() => navigate('/pricing')} className="btn-primary w-full mt-4">
              Voir tous les plans
            </button>
          </div>
        </div>
      </div>

      {/* CTA final */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="card bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 text-center">
          <h2 className="text-2xl font-extrabold mb-2">Pr\u00eat \u00e0 gagner 5h par semaine ?</h2>
          <p className="text-slate-300 mb-4">Rejoignez les artisans qui utilisent ChantierPro au quotidien</p>
          <button onClick={() => navigate('/auth', { state: { mode: 'signup' } })} className="bg-chantier hover:bg-chantier-dark text-white font-semibold py-3 px-6 rounded-2xl transition-all active:scale-95 inline-flex items-center gap-2">
            Cr\u00e9er mon compte gratuit
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="border-t border-slate-200 py-8 text-center text-xs text-slate-500">
        \u00a9 2026 ChantierPro \u00b7 Compatible r\u00e9forme facturation \u00e9lectronique 2026 \u00b7 Made in France \ud83c\uddeb\ud83c\uddf7
      </div>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description, color = 'chantier' }) {
  const colorClasses = {
    purple: 'bg-purple-50 text-purple-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    pink: 'bg-pink-50 text-pink-600',
    slate: 'bg-slate-100 text-slate-600',
    chantier: 'bg-chantier-50 text-chantier',
  }
  return (
    <div className="card hover:shadow-elevated transition-shadow">
      <div className={`w-10 h-10 rounded-xl ${colorClasses[color]} flex items-center justify-center mb-2.5`}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
    </div>
  )
}
