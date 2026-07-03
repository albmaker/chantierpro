import { useNavigate } from 'react-router-dom'
import { TrendingUp, FileText, AlertCircle, Euro, Plus, Briefcase, MapPin } from 'lucide-react'
import Header from '../components/Header'
import StatCard from '../components/StatCard'
import { DEMO_DEVIS, DEMO_FACTURES } from '../data/ouvrages'

export default function Dashboard() {
  const navigate = useNavigate()

  // Calculs des stats
  const devisEnAttente = DEMO_DEVIS.filter(d => d.statut === 'en_attente')
  const facturesEnAttente = DEMO_FACTURES.filter(f => f.statut === 'en_attente' || f.statut === 'en_retard')
  const caMois = DEMO_FACTURES.filter(f => f.statut === 'payee').reduce((s, f) => {
    const ttc = f.lignes.reduce((sum, l) => sum + l.qty * l.priceHT * (1 + l.tva/100), 0)
    return s + ttc
  }, 0)
  const tauxConversion = Math.round(
    (DEMO_DEVIS.filter(d => d.statut === 'accepte').length / DEMO_DEVIS.length) * 100
  )

  return (
    <div className="pb-24">
      <Header
        title="Bonjour 👋"
        subtitle="Voici votre activité du jour"
        action={
          <button
            onClick={() => navigate('/nouveau-devis')}
            className="w-10 h-10 rounded-full bg-chantier flex items-center justify-center shadow-lg shadow-chantier/30 active:scale-95"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        }
      />

      <div className="px-5 pt-4 space-y-5">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="CA du mois"
            value={caMois.toFixed(0)}
            suffix="€"
            color="text-white"
            icon={<Euro className="w-4 h-4" />}
            trend="+12% vs juin"
          />
          <StatCard
            label="Devis en attente"
            value={devisEnAttente.length}
            color="text-yellow-400"
            icon={<FileText className="w-4 h-4" />}
          />
          <StatCard
            label="Factures impayées"
            value={facturesEnAttente.length}
            color="text-red-400"
            icon={<AlertCircle className="w-4 h-4" />}
          />
          <StatCard
            label="Taux conversion"
            value={tauxConversion}
            suffix="%"
            color="text-green-400"
            icon={<TrendingUp className="w-4 h-4" />}
          />
        </div>

        {/* CTA Chantier IA */}
        <button
          onClick={() => navigate('/scanner')}
          className="w-full bg-gradient-to-r from-chantier to-chantier-dark rounded-2xl p-5 text-left active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <span className="text-2xl">📸</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white text-lg">Devis en 1 photo</h3>
              <p className="text-white/80 text-sm">L'IA analyse votre chantier et génère le devis</p>
            </div>
          </div>
        </button>

        {/* Derniers chantiers */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">Derniers devis</h2>
            <button
              onClick={() => navigate('/devis')}
              className="text-sm text-chantier font-medium"
            >
              Voir tout →
            </button>
          </div>
          <div className="space-y-2">
            {DEMO_DEVIS.slice(0, 3).map(d => (
              <div
                key={d.id}
                onClick={() => navigate(`/devis/${d.id}`)}
                className="card flex items-center gap-3 active:scale-[0.98] cursor-pointer hover:bg-navy-600/80 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-navy-800 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-chantier" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{d.client}</p>
                  <p className="text-xs text-gray-400">{d.id} · {d.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">
                    {d.lignes.reduce((s, l) => s + l.qty * l.priceHT * (1 + l.tva/100), 0).toFixed(0)}€
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alertes */}
        {facturesEnAttente.length > 0 && (
          <div className="card border-red-500/30 bg-red-500/5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-white">{facturesEnAttente.length} facture(s) à relancer</h3>
                <p className="text-sm text-gray-300 mt-1">
                  Pensez à relancer vos clients en retard pour améliorer votre trésorerie.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
