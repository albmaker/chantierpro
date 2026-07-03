import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Mail, Phone, MapPin, Building2, Crown, Sparkles, Check, X, Star, Zap, Users, FileText, BarChart3, Shield, Globe, MessageSquare, Edit2, ExternalLink, Award, TrendingUp, Heart, Headphones } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import Modal from '../components/Modal'

const PLANS_DETAILS = [
  {
    id: 'starter',
    name: 'Starter',
    color: 'slate',
    price: 19,
    tagline: 'L\u2019essentiel pour d\u00e9marrer',
    features: [
      { icon: FileText, label: 'Devis illimit\u00e9s', included: true },
      { icon: FileText, label: 'Factures PDF', included: true },
      { icon: Shield, label: 'Compatible FE 2026', included: true },
      { icon: FileText, label: 'Biblioth\u00e8que 40 ouvrages', included: true },
      { icon: FileText, label: '3 mod\u00e8les de devis', included: true },
      { icon: Headphones, label: 'Support email', included: true },
      { icon: MessageSquare, label: 'Mod\u00e8les de messages', included: false },
      { icon: BarChart3, label: 'Statistiques avanc\u00e9es', included: false },
      { icon: Mail, label: 'Relances automatiques', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    color: 'orange',
    price: 39,
    tagline: 'Le choix des artisans actifs',
    popular: true,
    features: [
      { icon: FileText, label: 'Tout du Starter', included: true },
      { icon: FileText, label: 'Mod\u00e8les de devis illimit\u00e9s', included: true },
      { icon: Mail, label: 'Relances automatiques', included: true },
      { icon: Shield, label: 'Signature \u00e9lectronique', included: true },
      { icon: BarChart3, label: 'Statistiques avanc\u00e9es', included: true },
      { icon: Target, label: 'Objectifs personnalis\u00e9s', included: true },
      { icon: MessageSquare, label: 'Mod\u00e8les de messages', included: true },
      { icon: Headphones, label: 'Support prioritaire', included: true },
      { icon: Building2, label: 'Multi-utilisateurs', included: false },
    ],
  },
  {
    id: 'business',
    name: 'Business',
    color: 'purple',
    price: 79,
    tagline: 'Pour les \u00e9quipes structur\u00e9es',
    features: [
      { icon: FileText, label: 'Tout du Pro', included: true },
      { icon: Users, label: 'Multi-utilisateurs (5)', included: true },
      { icon: FileText, label: 'Export comptable FEC', included: true },
      { icon: Globe, label: 'API access', included: true },
      { icon: Award, label: 'Account manager d\u00e9di\u00e9', included: true },
    ],
  },
]

function Target(props) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> }

const COLOR_CLASSES = {
  slate: { bg: 'bg-slate-50', text: 'text-slate-600', bar: 'from-slate-500 to-slate-300', ring: 'ring-slate-200' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', bar: 'from-orange-500 to-orange-300', ring: 'ring-orange-200' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', bar: 'from-purple-500 to-purple-300', ring: 'ring-purple-200' },
}

export default function Profil() {
  const navigate = useNavigate()
  const { profile, getProfile, plan, upgradePlan, signOut, user, devis, factures, clients } = useData()
  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState(null)
  const [showPlansModal, setShowPlansModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)

  const pro = getProfile()
  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : 'Juin 2026'
  const planLabel = { free: 'Découverte', starter: 'Starter', pro: 'Pro', business: 'Business' }[plan] || 'Découverte'
  const planColor = { free: 'slate', starter: 'slate', pro: 'orange', business: 'purple' }[plan] || 'slate'

  function startEdit() {
    setEditForm({
      company_name: pro.company_name || '',
      siret: pro.siret || '',
      adresse: pro.adresse || '',
      email: pro.email || '',
      telephone: pro.telephone || '',
      tva: pro.tva || '',
    })
    setEditOpen(true)
  }

  function saveProfile() {
    const newProfile = { ...pro, ...editForm }
    localStorage.setItem('chantierpro_profile', JSON.stringify(newProfile))
    alert('Profil mis à jour !')
    setEditOpen(false)
    window.location.reload()
  }

  function changePlan(targetPlan) {
    if (plan === targetPlan) return
    if (confirm(`Passer au plan ${targetPlan.toUpperCase()} ? (simulation)`)) {
      upgradePlan(targetPlan)
      alert(`Plan ${targetPlan.toUpperCase()} activé !`)
      setSelectedPlan(null)
    }
  }

  // Stats utilisateur
  const stats = {
    devis: devis.length,
    factures: factures.length,
    clients: clients.length,
    caTotal: factures.filter(f => f.statut === 'payee').reduce((s, f) => {
      const total = f.lignes.reduce((sum, l) => sum + l.qty * l.priceHT * (1 + l.tva/100), 0)
      return s + total
    }, 0),
  }

  return (
    <div className="pb-24">
      {/* Header avec bouton retour */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-slate-200 px-5 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 -ml-2 rounded-full hover:bg-slate-100 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h1 className="text-lg font-bold text-slate-900">Mon profil</h1>
      </div>

      <div className="px-5 pt-4 space-y-4">
        {/* Carte profil principale */}
        <div className="card bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 overflow-hidden relative">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-chantier/20 rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-chantier to-chantier-dark flex items-center justify-center shadow-elevated">
                <span className="text-white font-extrabold text-3xl">
                  {(pro.company_name || 'M').charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-extrabold truncate">{pro.company_name || 'Mon Entreprise'}</h2>
                <p className="text-sm text-slate-300 truncate">{pro.email || user?.email || 'email@exemple.com'}</p>
                <p className="text-xs text-slate-400 mt-0.5">Membre depuis {memberSince}</p>
              </div>
              <button onClick={startEdit} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center backdrop-blur">
                <Edit2 className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Badge plan actuel */}
            <div className={`flex items-center justify-between p-3 rounded-2xl ${COLOR_CLASSES[planColor].bg} bg-opacity-10 backdrop-blur border border-white/10`}>
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-[10px] text-slate-300 uppercase font-bold tracking-wider">Plan actuel</p>
                  <p className="text-base font-extrabold text-white">{planLabel}</p>
                </div>
              </div>
              <button onClick={() => setShowPlansModal(true)} className="text-xs bg-white text-slate-900 font-bold px-3 py-1.5 rounded-full">
                {plan === 'free' ? 'Upgrader' : 'Changer'}
              </button>
            </div>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Devis créés</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats.devis}</p>
          </div>
          <div className="card">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Factures</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats.factures}</p>
          </div>
          <div className="card">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Clients</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats.clients}</p>
          </div>
          <div className="card">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">CA total</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">{stats.caTotal.toFixed(0)}€</p>
          </div>
        </div>

        {/* Informations entreprise */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Informations entreprise
            </h3>
            <button onClick={startEdit} className="text-xs text-chantier font-semibold flex items-center gap-1">
              <Edit2 className="w-3 h-3" /> Modifier
            </button>
          </div>
          <div className="space-y-2.5 text-sm">
            {pro.siret && <InfoLine icon={FileText} label="SIRET" value={pro.siret} />}
            {pro.tva && <InfoLine icon={FileText} label="TVA Intracom." value={pro.tva} />}
            {pro.telephone && <InfoLine icon={Phone} label="Téléphone" value={pro.telephone} />}
            {pro.adresse && <InfoLine icon={MapPin} label="Adresse" value={pro.adresse} />}
            {!pro.siret && !pro.tva && !pro.telephone && !pro.adresse && (
              <p className="text-slate-400 text-xs italic text-center py-3">
                Aucune information. Clique sur "Modifier" pour compléter.
              </p>
            )}
          </div>
        </div>

        {/* Comparatif des 3 plans (pour donner envie d'upgrader) */}
        {plan === 'free' && (
          <div className="card bg-gradient-to-br from-chantier-50 to-amber-50 border-chantier-200">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-chantier" />
              <h3 className="text-base font-extrabold text-slate-900">Passe au niveau supérieur</h3>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Débloque le scan IA Mistral, les statistiques, les relances automatiques et plus encore.
            </p>
            <div className="space-y-2">
              {PLANS_DETAILS.filter(p => p.id !== 'free' && p.id !== plan).map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlan(p)}
                  className={`w-full card text-left hover:shadow-elevated active:scale-[0.98] transition-all ${p.popular ? 'ring-2 ring-chantier' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-extrabold text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-500">{p.tagline}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-extrabold text-chantier">{p.price}€</p>
                      <p className="text-[10px] text-slate-500">/mois</p>
                    </div>
                  </div>
                  {p.popular && (
                    <span className="inline-block bg-chantier text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-2">
                      ⭐ POPULAIRE
                    </span>
                  )}
                  <div className="space-y-1 text-xs">
                    {p.features.slice(0, 4).map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                        <span className="text-slate-700">{f.label}</span>
                      </div>
                    ))}
                    <p className="text-chantier font-semibold">+ {p.features.length - 4} autres avantages</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Badges / Achievements */}
        <div className="card">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-500" />
            Mes accomplissements
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <Badge
              icon="🚀"
              label="Premier devis"
              unlocked={stats.devis >= 1}
            />
            <Badge
              icon="💰"
              label="Première facture"
              unlocked={stats.factures >= 1}
            />
            <Badge
              icon="👥"
              label="10 clients"
              unlocked={stats.clients >= 10}
            />
            <Badge
              icon="💎"
              label="1000€ de CA"
              unlocked={stats.caTotal >= 1000}
            />
            <Badge
              icon="🏆"
              label="10K de CA"
              unlocked={stats.caTotal >= 10000}
            />
            <Badge
              icon="⭐"
              label="Pro会员"
              unlocked={plan === 'pro' || plan === 'business'}
            />
          </div>
        </div>

        {/* Actions rapides */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900">Actions rapides</h3>
          <QuickAction icon={FileText} label="Mes devis" onClick={() => navigate('/devis')} />
          <QuickAction icon={FileText} label="Mes factures" onClick={() => navigate('/factures')} />
          <QuickAction icon={BarChart3} label="Statistiques détaillées" onClick={() => navigate('/stats')} />
          <QuickAction icon={Building2} label="Mes clients" onClick={() => navigate('/clients')} />
        </div>

        {/* Sign out */}
        <button
          onClick={async () => {
            if (confirm('Te déconnecter ?')) {
              await signOut()
              navigate('/')
            }
          }}
          className="w-full text-slate-600 hover:text-slate-900 text-sm font-medium py-3 hover:bg-slate-100 rounded-xl mt-4"
        >
          Se déconnecter
        </button>
      </div>

      {/* Modal édition profil */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Modifier mon profil">
        {editForm && (
          <div className="space-y-3">
            <div>
              <label className="label">Nom de l'entreprise</label>
              <input className="input" value={editForm.company_name} onChange={e => setEditForm({...editForm, company_name: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label">SIRET</label>
                <input className="input" value={editForm.siret} onChange={e => setEditForm({...editForm, siret: e.target.value})} />
              </div>
              <div>
                <label className="label">N° TVA</label>
                <input className="input" value={editForm.tva} onChange={e => setEditForm({...editForm, tva: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
            </div>
            <div>
              <label className="label">Téléphone</label>
              <input className="input" value={editForm.telephone} onChange={e => setEditForm({...editForm, telephone: e.target.value})} />
            </div>
            <div>
              <label className="label">Adresse</label>
              <input className="input" value={editForm.adresse} onChange={e => setEditForm({...editForm, adresse: e.target.value})} />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setEditOpen(false)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={saveProfile} className="btn-primary flex-1">Enregistrer</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal détail plan */}
      {selectedPlan && (
        <Modal open={!!selectedPlan} onClose={() => setSelectedPlan(null)} title={`Plan ${selectedPlan.name}`}>
          <div className="space-y-3">
            <div className={`card border-2 ${COLOR_CLASSES[selectedPlan.color].ring} bg-gradient-to-br from-white to-slate-50`}>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-extrabold text-slate-900">{selectedPlan.price}€</span>
                <span className="text-sm text-slate-500">/mois</span>
              </div>
              <p className="text-sm text-slate-600">{selectedPlan.tagline}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold mb-2">Tous les avantages :</p>
              <ul className="space-y-1.5">
                {selectedPlan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>{f.label}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button onClick={() => changePlan(selectedPlan.id)} className="btn-primary w-full">
              <Zap className="w-4 h-4 inline mr-2" />
              Activer {selectedPlan.name}
            </button>
            <button onClick={() => setSelectedPlan(null)} className="btn-secondary w-full">Fermer</button>
            <p className="text-[10px] text-slate-500 text-center">
              Mode simulation : activation sans paiement réel
            </p>
          </div>
        </Modal>
      )}

      {/* Modal tous les plans */}
      <Modal open={showPlansModal} onClose={() => setShowPlansModal(false)} title="Comparer les plans">
        <div className="space-y-2">
          {PLANS_DETAILS.map(p => (
            <button
              key={p.id}
              onClick={() => { setShowPlansModal(false); setSelectedPlan(p) }}
              className={`w-full card text-left hover:shadow-elevated active:scale-[0.98] transition-all ${p.id === plan ? 'ring-2 ring-emerald-500' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-slate-900">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.tagline}</p>
                </div>
                <p className="text-xl font-extrabold text-chantier">{p.price}€<span className="text-xs text-slate-500 font-normal">/mois</span></p>
              </div>
              {p.id === plan && <p className="text-xs text-emerald-600 font-semibold mt-1">✓ Ton plan actuel</p>}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  )
}

function InfoLine({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">{label}</p>
        <p className="text-sm text-slate-900 font-medium truncate">{value}</p>
      </div>
    </div>
  )
}

function Badge({ icon, label, unlocked }) {
  return (
    <div className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${
      unlocked
        ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-yellow-300'
        : 'bg-slate-50 border-2 border-slate-200 opacity-40 grayscale'
    }`}>
      <div className="text-2xl">{unlocked ? icon : '🔒'}</div>
      <p className={`text-[10px] font-bold text-center leading-tight ${unlocked ? 'text-slate-900' : 'text-slate-500'}`}>
        {label}
      </p>
    </div>
  )
}

function QuickAction({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full card flex items-center gap-3 hover:shadow-elevated active:scale-[0.98] text-left transition-all"
    >
      <div className="w-10 h-10 rounded-xl bg-chantier-50 flex items-center justify-center">
        <Icon className="w-5 h-5 text-chantier" />
      </div>
      <span className="flex-1 font-semibold text-slate-900 text-sm">{label}</span>
      <ExternalLink className="w-4 h-4 text-slate-400" />
    </button>
  )
}
