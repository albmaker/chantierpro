import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Target, Plus, Trash2, Edit2, Check, X, Flame, Trophy, Sparkles, Calendar, Euro, FileText, Award, TrendingUp, Users, CheckCircle2 } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { computeTotals } from '../components/DevisCard'
import Modal from '../components/Modal'

// Objectifs pr\u00e9d\u00e9finis (que l'user peut ajouter en 1 clic)
const PRESET_OBJECTIVES = [
  { id: 'preset-ca-month', label: 'CA mensuel', icon: '💰', type: 'ca', target: 5000, period: 'month', color: 'orange' },
  { id: 'preset-devis-month', label: 'Devis créés', icon: '📄', type: 'devis', target: 10, period: 'month', color: 'blue' },
  { id: 'preset-factures', label: 'Factures payées', icon: '✅', type: 'factures', target: 5, period: 'month', color: 'emerald' },
  { id: 'preset-conversion', label: 'Taux de conversion', icon: '🎯', type: 'taux', target: 60, period: 'month', color: 'purple' },
  { id: 'preset-clients', label: 'Nouveaux clients', icon: '👥', type: 'clients', target: 3, period: 'month', color: 'pink' },
  { id: 'preset-ca-year', label: 'CA annuel', icon: '🏆', type: 'ca', target: 50000, period: 'year', color: 'amber' },
]

const COLOR_CLASSES = {
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', bar: 'from-orange-500 to-orange-300' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', bar: 'from-blue-500 to-blue-300' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', bar: 'from-emerald-500 to-emerald-300' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', bar: 'from-purple-500 to-purple-300' },
  pink: { bg: 'bg-pink-50', text: 'text-pink-600', bar: 'from-pink-500 to-pink-300' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', bar: 'from-amber-500 to-amber-300' },
}

export default function Objectifs() {
  const navigate = useNavigate()
  const { devis, factures, clients, customObjectives, addCustomObjective, removeCustomObjective } = useData()
  const [showCreate, setShowCreate] = useState(false)
  const [editingObj, setEditingObj] = useState(null)

  // Calcul des stats r\u00e9elles
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

  function getCurrentValue(type, period) {
    if (period === 'year' && type === 'ca') return stats.caYear
    switch (type) {
      case 'ca': return stats.caMonth
      case 'devis': return stats.devisMonth
      case 'factures': return stats.facturesPayees
      case 'taux': return stats.taux
      case 'clients': return stats.nouveauxClients
      default: return 0
    }
  }

  // Objectifs actifs = ceux que l'user a choisi
  const activeObjectives = customObjectives || []

  function getProgress(obj) {
    const current = getCurrentValue(obj.type, obj.period)
    const percent = Math.min(100, Math.round((current / obj.target) * 100))
    return { current, target: obj.target, percent }
  }

  // Streak
  const streak = useMemo(() => {
    const dates = new Set()
    devis.forEach(d => dates.add(d.date_emission || d.created_at?.slice(0, 10)))
    factures.forEach(f => dates.add(f.date_emission || f.created_at?.slice(0, 10)))
    clients.forEach(c => dates.add(c.created_at?.slice(0, 10)))
    let s = 0
    for (let i = 0; i < 30; i++) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
      if (dates.has(d)) s++
      else if (i > 0) break
    }
    return s
  }, [devis, factures, clients])

  const totalProgress = activeObjectives.length > 0
    ? Math.round(activeObjectives.reduce((s, obj) => s + getProgress(obj).percent, 0) / activeObjectives.length)
    : 0

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-slate-200 px-5 py-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="w-10 h-10 -ml-2 rounded-full hover:bg-slate-100 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h1 className="text-lg font-bold text-slate-900">Mes objectifs</h1>
        <button onClick={() => setShowCreate(true)} className="w-10 h-10 rounded-full bg-chantier flex items-center justify-center shadow-soft active:scale-95">
          <Plus className="w-5 h-5 text-white" />
        </button>
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
        {activeObjectives.length > 0 && (
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
              {activeObjectives.length} objectif{activeObjectives.length > 1 ? 's' : ''} personnalisé{activeObjectives.length > 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Objectifs actifs */}
        {activeObjectives.length > 0 ? (
          <div className="space-y-2.5">
            <h2 className="text-sm font-bold text-slate-900">Mes objectifs en cours</h2>
            {activeObjectives.map(obj => {
              const prog = getProgress(obj)
              const done = prog.percent >= 100
              const colors = COLOR_CLASSES[obj.color] || COLOR_CLASSES.orange
              return (
                <div key={obj.id} className={`card ${done ? 'bg-emerald-50 border-emerald-200' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center text-xl`}>
                        {obj.icon}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{obj.label}</p>
                        <p className="text-xs text-slate-500">
                          {prog.current.toLocaleString('fr-FR')} / {prog.target.toLocaleString('fr-FR')} {obj.type === 'taux' ? '%' : obj.type === 'ca' ? '€' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {done ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : null}
                      <button onClick={() => setEditingObj(obj)} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
                        <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                      </button>
                      <button onClick={() => { if (confirm('Supprimer cet objectif ?')) removeCustomObjective(obj.id) }} className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center">
                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      </button>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 bg-gradient-to-r ${done ? 'from-emerald-500 to-emerald-300' : colors.bar}`}
                      style={{ width: `${prog.percent}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[10px] text-slate-500 font-semibold">{prog.percent}%</span>
                    <span className="text-[10px] text-slate-400">{obj.period === 'year' ? 'Annuel' : 'Mensuel'}</span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="card text-center py-8 bg-slate-50">
            <Target className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-700 font-semibold">Aucun objectif personnalisé</p>
            <p className="text-slate-500 text-sm mt-1">Crée ton premier objectif pour suivre ta progression</p>
            <button onClick={() => setShowCreate(true)} className="btn-primary mt-4">
              <Plus className="w-4 h-4 inline mr-2" /> Créer un objectif
            </button>
          </div>
        )}

        {/* Objectifs pr\u00e9d\u00e9finis \u00e0 ajouter */}
        <div className="space-y-2.5">
          <h2 className="text-sm font-bold text-slate-900">Suggestions</h2>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_OBJECTIVES
              .filter(p => !activeObjectives.some(a => a.label === p.label && a.type === p.type))
              .slice(0, 6)
              .map(p => {
                const colors = COLOR_CLASSES[p.color] || COLOR_CLASSES.orange
                return (
                  <button
                    key={p.id}
                    onClick={() => addCustomObjective(p)}
                    className={`card hover:shadow-elevated active:scale-95 text-left transition-all`}
                  >
                    <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center text-xl mb-2`}>
                      {p.icon}
                    </div>
                    <p className="font-bold text-slate-900 text-xs">{p.label}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">+ Ajouter</p>
                  </button>
                )
              })}
          </div>
        </div>
      </div>

      <ObjectiveForm
        open={showCreate || !!editingObj}
        onClose={() => { setShowCreate(false); setEditingObj(null) }}
        objective={editingObj}
        onSave={(obj) => {
          if (editingObj) {
            removeCustomObjective(editingObj.id)
            addCustomObjective({ ...obj, id: crypto.randomUUID() })
          } else {
            addCustomObjective({ ...obj, id: crypto.randomUUID() })
          }
          setShowCreate(false)
          setEditingObj(null)
        }}
      />
    </div>
  )
}

function ObjectiveForm({ open, onClose, objective, onSave }) {
  const [form, setForm] = useState({
    label: '',
    type: 'ca',
    target: 1000,
    period: 'month',
    icon: '🎯',
    color: 'orange',
  })

  useMemo(() => {
    if (objective) setForm(objective)
  }, [objective])

  // Reset form quand on ouvre
  if (open && !objective && form.label === '') {
    // initial
  }

  function handleSubmit() {
    if (!form.label.trim()) {
      alert('Donne un nom à ton objectif')
      return
    }
    if (form.target <= 0) {
      alert('La cible doit être positive')
      return
    }
    onSave(form)
    setForm({ label: '', type: 'ca', target: 1000, period: 'month', icon: '🎯', color: 'orange' })
  }

  return (
    <Modal open={open} onClose={onClose} title={objective ? 'Modifier l\'objectif' : 'Nouvel objectif'}>
      <div className="space-y-3">
        <div>
          <label className="label">Nom de l'objectif</label>
          <input className="input" placeholder="Ex: Atteindre 10K ce mois" value={form.label} onChange={e => setForm({...form, label: e.target.value})} />
        </div>

        <div>
          <label className="label">Icône</label>
          <div className="grid grid-cols-6 gap-2">
            {['🎯', '💰', '📄', '✅', '👥', '🏆', '🚀', '⭐', '🔥', '💪', '📈', '⏰'].map(emoji => (
              <button
                key={emoji}
                onClick={() => setForm({...form, icon: emoji})}
                className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${form.icon === emoji ? 'bg-chantier ring-2 ring-chantier' : 'bg-slate-100 hover:bg-slate-200'}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Type de mesure</label>
          <select className="input" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
            <option value="ca">💰 Chiffre d'affaires (€)</option>
            <option value="devis">📄 Nombre de devis créés</option>
            <option value="factures">✅ Nombre de factures payées</option>
            <option value="taux">🎯 Taux de conversion (%)</option>
            <option value="clients">👥 Nouveaux clients</option>
          </select>
        </div>

        <div>
          <label className="label">Période</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setForm({...form, period: 'month'})}
              className={`py-2.5 rounded-xl text-sm font-semibold ${form.period === 'month' ? 'bg-chantier text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setForm({...form, period: 'year'})}
              className={`py-2.5 rounded-xl text-sm font-semibold ${form.period === 'year' ? 'bg-chantier text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              Annuel
            </button>
          </div>
        </div>

        <div>
          <label className="label">Objectif à atteindre</label>
          <input className="input" type="number" min="1" value={form.target} onChange={e => setForm({...form, target: parseFloat(e.target.value) || 0})} />
          <p className="text-[10px] text-slate-500 mt-1">En {form.type === 'taux' ? '%' : form.type === 'ca' ? '€' : 'unités'}</p>
        </div>

        <div>
          <label className="label">Couleur</label>
          <div className="grid grid-cols-6 gap-2">
            {Object.entries(COLOR_CLASSES).map(([key, c]) => (
              <button
                key={key}
                onClick={() => setForm({...form, color: key})}
                className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center ${form.color === key ? 'ring-2 ring-offset-2 ring-slate-700' : ''}`}
              >
                <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${c.bar}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="btn-secondary flex-1">Annuler</button>
          <button onClick={handleSubmit} className="btn-primary flex-1">
            {objective ? 'Enregistrer' : 'Créer l\'objectif'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
