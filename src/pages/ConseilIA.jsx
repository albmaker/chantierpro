import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Sparkles, TrendingUp, AlertTriangle, Lightbulb, Target, Euro, FileText, CheckCircle2, Calendar } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { computeTotals } from '../components/DevisCard'

// Page "Co-pilote IA" : analyse les donn\u00e9es de l'user et g\u00e9n\u00e8re des conseils personnalis\u00e9s
export default function ConseilIA() {
  const navigate = useNavigate()
  const { devis, factures, clients, profile } = useData()
  const [dismissed, setDismissed] = useState([])

  // Analyse des donn\u00e9es
  const insights = useMemo(() => {
    const result = []

    // 1. Taux de conversion
    const tauxConv = devis.length > 0
      ? Math.round((devis.filter(d => d.statut === 'accepte').length / devis.length) * 100)
      : 0

    if (devis.length >= 3 && tauxConv < 30) {
      result.push({
        type: 'warning',
        icon: TrendingUp,
        title: 'Taux de conversion faible',
        message: `Seulement ${tauxConv}% de tes devis sont accept\u00e9s. La moyenne du secteur BTP est de 40-50%. Essaie de relancer tes devis en attente 1 semaine apr\u00e8s l'envoi.`,
        action: { label: 'Voir mes devis en attente', link: '/devis' },
      })
    } else if (tauxConv >= 50) {
      result.push({
        type: 'success',
        icon: CheckCircle2,
        title: 'Excellent taux de conversion !',
        message: `${tauxConv}% de tes devis sont accept\u00e9s. Tu fais mieux que la majorit\u00e9 des artisans. Continue !`,
      })
    }

    // 2. Factures impay\u00e9es
    const facturesEnRetard = factures.filter(f => f.statut === 'en_retard')
    if (facturesEnRetard.length > 0) {
      const totalRetard = facturesEnRetard.reduce((s, f) => s + computeTotals(f.lignes).totalTTC, 0)
      result.push({
        type: 'critical',
        icon: AlertTriangle,
        title: `${facturesEnRetard.length} facture(s) en retard`,
        message: `Tu as ${totalRetard.toFixed(0)}\u20ac d'impay\u00e9s en retard. Relance ces clients MAINTENANT pour r\u00e9cup\u00e9rer ta tr\u00e9sorerie.`,
        action: { label: 'Voir les factures', link: '/factures' },
      })
    }

    // 3. Pas d'activit\u00e9 r\u00e9cente
    const lastDevis = devis[0]?.date_emission
    const joursInactivite = lastDevis ? Math.floor((Date.now() - new Date(lastDevis).getTime()) / 86400000) : 999

    if (joursInactivite > 14 && devis.length > 0) {
      result.push({
        type: 'tip',
        icon: Calendar,
        title: 'Tu n\u2019as pas cr\u00e9\u00e9 de devis depuis longtemps',
        message: `Cela fait ${joursInactivite} jours. Les artisans qui cr\u00e9ent au moins 2 devis par semaine ont en moyenne 30% de CA en plus.`,
        action: { label: 'Cr\u00e9er un devis maintenant', link: '/nouveau-devis' },
      })
    }

    // 4. Aucun client r\u00e9cent
    if (clients.length === 0 && devis.length > 0) {
      result.push({
        type: 'tip',
        icon: Lightbulb,
        title: 'Construis ta base clients',
        message: 'Astuce : relance tes anciens clients 1 fois par trimestre. 80% de ton CA futur vient de ton portefeuille existant.',
      })
    }

    // 5. Opportunit\u00e9 de croissance
    if (devis.length >= 5 && clients.length >= 3) {
      const clientsSansRecente = clients.filter(c => {
        const lastDate = c.derniere_interaction || c.created_at
        if (!lastDate) return true
        return (Date.now() - new Date(lastDate).getTime()) > 90 * 86400000
      })

      if (clientsSansRecente.length >= 2) {
        result.push({
          type: 'opportunity',
          icon: Target,
          title: 'Relance tes anciens clients',
          message: `Tu as ${clientsSansRecente.length} client(s) sans activit\u00e9 depuis plus de 3 mois. Un simple message peut g\u00e9n\u00e9rer du CA facilement.`,
          action: { label: 'Voir mes clients', link: '/clients' },
        })
      }
    }

    // 6. Bienvenue si nouveau
    if (devis.length === 0) {
      result.push({
        type: 'tip',
        icon: Sparkles,
        title: 'Bienvenue !',
        message: 'Commence par cr\u00e9er ton premier devis. L\u2019app est con\u00e7ue pour te faire gagner 5h par semaine.',
        action: { label: 'Cr\u00e9er mon premier devis', link: '/nouveau-devis' },
      })
    }

    // 7. Stats positives
    const caTotal = factures.filter(f => f.statut === 'payee').reduce((s, f) => s + computeTotals(f.lignes).totalTTC, 0)
    if (caTotal > 0) {
      const heuresEconomisees = Math.round(caTotal / 100)
      result.push({
        type: 'success',
        icon: Euro,
        title: 'Bravo !',
        message: `Tu as g\u00e9n\u00e9r\u00e9 ${caTotal.toFixed(0)}\u20ac de CA. Gr\u00e2ce \u00e0 ChantierPro, tu as probablement \u00e9conomis\u00e9 environ ${heuresEconomisees}h d\u2019administratif. Continue !`,
      })
    }

    // 8. Conseils g\u00e9n\u00e9riques
    if (devis.length >= 1) {
      const conseils = [
        {
          condition: devis.filter(d => d.lignes.length > 5).length === 0,
          title: 'D\u00e9compose tes devis plus finement',
          message: 'Les devis avec 8-10 lignes pr\u00e9cises convertissent 25% mieux que les devis avec 3-4 lignes forfaitaires.',
        },
        {
          condition: devis.filter(d => d.notes).length === 0,
          title: 'Ajoute des notes \u00e0 tes devis',
          message: 'Les devis avec une note personnalis\u00e9e (ex: "J\u2019ai vu l\u2019\u00e9tat du mur, je propose plut\u00f4t X") ont +18% d\u2019acceptation.',
        },
      ].filter(c => c.condition).slice(0, 1)

      conseils.forEach(c => {
        result.push({
          type: 'tip',
          icon: Lightbulb,
          title: c.title,
          message: c.message,
        })
      })
    }

    return result
  }, [devis, factures, clients])

  const insightsFiltered = insights.filter((_, i) => !dismissed.includes(i))

  const typeStyles = {
    success: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-emerald-600', text: 'text-emerald-900' },
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-600', text: 'text-amber-900' },
    critical: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-600', text: 'text-red-900' },
    tip: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600', text: 'text-blue-900' },
    opportunity: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-600', text: 'text-purple-900' },
  }

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-slate-200 px-5 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 -ml-2 rounded-full hover:bg-slate-100 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" /> Co-pilote IA
          </h1>
          <p className="text-xs text-slate-500">Conseils personnalis\u00e9s pour ton activit\u00e9</p>
        </div>
      </div>

      <div className="px-5 pt-4 space-y-4">
        <div className="card bg-gradient-to-br from-purple-50 to-white border-purple-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-soft">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Bonjour {profile?.company_name?.split(' ')[0] || 'Artisan'}</h2>
              <p className="text-xs text-slate-600">J'ai analys\u00e9 ton activit\u00e9. Voici mes conseils.</p>
            </div>
          </div>
        </div>

        {insightsFiltered.length === 0 ? (
          <div className="card text-center py-12">
            <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-700 font-semibold">Aucun conseil pour le moment</p>
            <p className="text-slate-500 text-sm mt-1">Continue \u00e0 utiliser l'app, je t'aiderai quand j'aurai plus de donn\u00e9es \u00e0 analyser !</p>
          </div>
        ) : (
          insightsFiltered.map((insight, i) => {
            const styles = typeStyles[insight.type] || typeStyles.tip
            const Icon = insight.icon
            return (
              <div key={i} className={`card ${styles.bg} ${styles.border} animate-slide-up`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl ${styles.bg} border ${styles.border} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${styles.icon}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`font-bold ${styles.text}`}>{insight.title}</h3>
                      <button
                        onClick={() => setDismissed([...dismissed, insights.indexOf(insight)])}
                        className="text-slate-400 hover:text-slate-700 text-lg leading-none"
                      >
                        \u00d7
                      </button>
                    </div>
                    <p className="text-sm text-slate-700 mt-1 leading-relaxed">{insight.message}</p>
                    {insight.action && (
                      <button
                        onClick={() => navigate(insight.action.link)}
                        className="mt-2 text-sm font-semibold text-chantier hover:underline"
                      >
                        {insight.action.label} \u2192
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}

        <div className="card bg-slate-50 border-slate-200 text-center">
          <p className="text-xs text-slate-500">
            Le Co-pilote analyse tes donn\u00e9es en temps r\u00e9el. Plus tu utilises l'app, plus les conseils sont pr\u00e9cis.
          </p>
        </div>
      </div>
    </div>
  )
}
