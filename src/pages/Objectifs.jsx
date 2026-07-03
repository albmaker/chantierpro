import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Target, TrendingUp, CheckCircle2, Circle, Calendar, Euro, FileText, Award, Flame, Trophy } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { computeTotals } from '../components/DevisCard'

const PRESET_OBJECTIVES = [
  { id: 'ca-month', label: 'CA mensuel', icon: '💰', type: 'ca', target: 5000, period: 'month' },
  { id: 'devis-month', label: 'Devis créés', icon: '📄', type: 'devis', target: 10, period: 'month' },
  { id: 'factures-payees', label: 'Factures payées', icon: '✅', type: 'factures', target: 5, period: 'month' },
  { id: 'conversion', label: 'Taux de conversion', icon: '🎯', type: 'taux', target: 60, period: 'month' },
  { id: 'nouveaux-clients', label: 'Nouveaux clients', icon: '👥', type: 'clients', target: 3, period: 'month' },
  { id: 'ca-year', label: 'CA annuel', icon: '🏆', type: 'ca', target: 50000, period: 'year' },
]

export default function Objectifs() {
  const navigate = useNavigate()
  const { devis, factures, clients } = useData()
  const [selectedObjectives, setSelectedObjectives] = useState(['ca-month', 'devis-month', 'conversion'])

  // Calcul des progr\u00e8s
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfYear = new Date(now.getFullYear(), 0, 1)

  const stats = useMemo(() => {
    const caMonth = factures
      .filter(f => f.statut === 'payee' && new Date(f.date_paiement || f.date_emission) >= startOfMonth)
      .reduce((s, f) => s + computeTotals(f.lignes).totalTTC, 0)
    const devisMonth = devis.filter(d => new Date(d.date_emission || d.created_at) >= startOfMonth).length
    const facturesPayees = factures
      .filter(f => f.statut === 'payee' && new Date(f.date_paiement || f.date_emission) >= startOfMonth).length
    const taux = devis.length > 0
      ? Math.round((devis.filter(d => d.statut === 'accepte').length / devis.length) * 100)
      : 0
    const nouveauxClients = clients.filter(c => new Date(c.created_at) >= startOfMonth).length
    const caYear = factures
      .filter(f => f.statut === 'payee' && new Date(f.date_paiement || f.date_emission) >= startOfYear)
      .reduce((s, f) => s + computeTotals(f.lignes).totalTTC, 0)

    return { caMonth, devisMonth, facturesPayees, taux, nouveauxClients, caYear }
  }, [devis, factures, clients])

  function getProgress(objId) {
    const obj = PRESET_OBJECTIVES.find(o => o.id === objId)
    if (!obj) return { current: 0, target: 0, percent: 0 }
    let current = 0
    switch (obj.type) {
      case 'ca': current = obj.period === 'month' ? stats.caMonth : stats.caYear; break
      case 'devis': current = stats.devisMonth; break
      case 'factures': current = stats.facturesPayees; break
      case 'taux': current = stats.taux; break
      case 'clients': current = stats.nouveauxClients; break
    }
    const percent = Math.min(100, Math.round((current / obj.target) * 100))
    return { current, target: obj.target, percent }
  }

  function toggleObjective(id) {
    setSelectedObjectives(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const totalProgress = selectedObjectives.length > 0
    ? Math.round(selectedObjectives.reduce((s, id) => s + getProgress(id).percent, 0) / selectedObjectives.length)
    : 0

  const streak = useMemo(() => {
    // Jours cons\u00e9cutifs avec au moins 1 action
    const dates = new Set()
    devis.forEach(d => dates.add(d.date_emission || d.created_at?.slice(0, 10)))
    factures.forEach(f => dates.add(f.date_emission || f.created_at?.slice(0, 10)))
    let s = 0
    for (let i = 0; i < 30; i++) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
      if (dates.has(d)) s++
      else if (i > 0) break
    }
    return s
  }, [devis, factures])

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-slate-200 px-5 py-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="w-10 h-10 -ml-2 rounded-full hover:bg-slate-100 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h1 className="text-lg font-bold text-slate-900">Mes objectifs</h1>
        <div className="w-10" />
      </div>

      <div className="px-5 pt-4 space-y-4">
        {/* Streak */}
        {streak > 0 && (
          <div className="card bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🔥</div>
              <div>
                <p className="text-2xl font-extrabold text-slate-900">{streak} jour{streak > 1 ? 's' : ''}</p>
                <p className="text-xs text-slate-600">de série active</p>
              </div>
            </div>
          </div>
        )}

        {/* Progression globale */}
        <div className="card bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Progression globale</p>
            <Trophy className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="text-4xl font-extrabold">{totalProgress}%</p>
          <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-chantier to-yellow-400 transition-all duration-1000"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {selectedObjectives.length} objectif{selectedObjectives.length > 1 ? 's' : ''} suivi{selectedObjectives.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Objectifs actifs */}
        {selectedObjectives.length > 0 && (
          <div className="space-y-2.5">
            <h2 className="text-sm font-bold text-slate-900">En cours</h2>
            {selectedObjectives.map(id => {
              const obj = PRESET_OBJECTIVES.find(o => o.id === id)
              const prog = getProgress(id)
              const done = prog.percent >= 100
              return (
                <div key={id} className={`card ${done ? 'bg-emerald-50 border-emerald-200' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{obj.icon}</span>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{obj.label}</p>
                        <p className="text-xs text-slate-500">
                          {prog.current.toLocaleString('fr-FR')} / {prog.target.toLocaleString('fr-FR')} {obj.type === 'taux' ? '%' : ''}
                        </p>
                      </div>
                    </div>
                    {done ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5 text-slate-300" />}
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${done ? 'bg-emerald-500' : 'bg-gradient-to-r from-chantier to-chantier-light'}`}
                      style={{ width: `${prog.percent}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-[10px] text-slate-500 font-semibold">{prog.percent}%</span>
                    <button onClick={() => toggleObjective(id)} className="text-[10px] text-slate-400 hover:text-slate-700">
                      Retirer
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Objectifs disponibles */}
        <div className="space-y-2.5">
          <h2 className="text-sm font-bold text-slate-900">Ajouter un objectif</h2>
          {PRESET_OBJECTIVES
            .filter(o => !selectedObjectives.includes(o.id))
            .map(obj => (
              <button
                key={obj.id}
                onClick={() => toggleObjective(obj.id)}
                className="w-full card hover:shadow-elevated active:scale-[0.98] text-left transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{obj.icon}</span>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 text-sm">{obj.label}</p>
                    <p className="text-xs text-slate-500">Objectif : {obj.target} {obj.type === 'taux' ? '%' : obj.type === 'ca' ? '€' : ''}</p>
                  </div>
                  <span className="text-chantier text-2xl">+</span>
                </div>
              </button>
            ))}
        </div>
      </div>
    </div>
  )
}
