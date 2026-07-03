import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, Building2, Wrench, CreditCard, FileText, LogOut, Crown, Check, User, PenLine, Target, MessageSquare, ChevronRight, Trash2, Plus } from 'lucide-react'
import Header from '../components/Header'
import { OUVRAGES_BTP } from '../data/empty'
import { useData } from '../contexts/DataContext'
import Modal from '../components/Modal'

const TABS = [
  { id: 'entreprise', icon: Building2, label: 'Entreprise' },
  { id: 'clients', icon: User, label: 'Clients' },
  { id: 'ouvrages', icon: Wrench, label: 'Ouvrages' },
  { id: 'banque', icon: CreditCard, label: 'Bancaire' },
  { id: 'cgv', icon: FileText, label: 'CGV' },
]

const DEFAULT_PROFILE = {
  company_name: 'Mon Entreprise',
  siret: '',
  adresse: '',
  email: '',
  telephone: '',
  tva: '',
  iban: '',
  banque: '',
  cgv: '- Acompte de 30% à la commande\n- Solde à la livraison\n- Délai de paiement : 30 jours',
}

export default function Parametres() {
  const navigate = useNavigate()
  const { profile, saveProfile, plan, signOut, user, clients, addClient, updateClient, deleteClient, templates, addTemplate, deleteTemplate, clearAllData } = useData()
  const [form, setForm] = useState(profile || DEFAULT_PROFILE)
  const [activeTab, setActiveTab] = useState('entreprise')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (profile) setForm(profile)
  }, [profile])

  async function save() {
    await saveProfile(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleSignOut() {
    if (confirm('Te déconnecter ? Tes données resteront sauvegardées sur cet appareil.')) {
      await signOut()
      navigate('/')
    }
  }

  function handleResetData() {
    if (confirm('⚠️ ATTENTION : Supprimer TOUTES les données (devis, factures, clients) ? Cette action est irréversible.')) {
      clearAllData()
      alert('Toutes les données ont été supprimées.')
      window.location.reload()
    }
  }

  const planLabel = {
    free: 'Découverte',
    starter: 'Starter',
    pro: 'Pro',
    business: 'Business',
  }[plan] || 'Découverte'

  return (
    <div className="pb-24">
      <Header
        title="Paramètres"
        subtitle={user?.email || 'Mode démo local'}
        action={saved ? (
          <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold flex items-center gap-1">
            <Check className="w-3 h-3" /> Sauvé
          </div>
        ) : (
          <button onClick={save} className="w-11 h-11 rounded-full bg-chantier flex items-center justify-center shadow-soft active:scale-95">
            <Save className="w-5 h-5 text-white" />
          </button>
        )}
      />

      <div className="px-5 pt-4 space-y-4">
        <div className="card bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-chantier flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold truncate">{form.company_name || 'Mon Entreprise'}</p>
              <p className="text-xs text-slate-300 truncate">{user?.email || 'Mode démo local'}</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-slate-700">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-slate-300">Plan</span>
            </div>
            <span className="text-sm font-bold text-chantier-light">{planLabel}</span>
          </div>
          {plan === 'free' && (
            <button onClick={() => navigate('/pricing')} className="btn-primary w-full mt-3">
              Passer au Starter (19€/mois)
            </button>
          )}
        </div>

        {/* Liens rapides vers nouvelles features */}
        <div className="space-y-2">
          <h3 className="text-xs text-slate-500 uppercase font-bold tracking-wider px-1">Outils</h3>
          <button onClick={() => navigate('/signature')} className="w-full card hover:shadow-elevated active:scale-[0.98] text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-chantier-50 flex items-center justify-center">
                <PenLine className="w-5 h-5 text-chantier" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-900 text-sm">Ma signature</p>
                <p className="text-xs text-slate-500">Personnaliser mes PDF</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>
          <button onClick={() => navigate('/messages')} className="w-full card hover:shadow-elevated active:scale-[0.98] text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-900 text-sm">Messages types</p>
                <p className="text-xs text-slate-500">6 modèles prêts à l'emploi</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>
          <button onClick={() => navigate('/objectifs')} className="w-full card hover:shadow-elevated active:scale-[0.98] text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-900 text-sm">Mes objectifs</p>
                <p className="text-xs text-slate-500">Suivre mes KPIs hebdo</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {TABS.map(t => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                  activeTab === t.id ? 'bg-chantier text-white' : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            )
          })}
        </div>

        {activeTab === 'entreprise' && (
          <div className="card space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Informations entreprise</h3>
            <div>
              <label className="label">Nom de l'entreprise</label>
              <input className="input" value={form.company_name || ''} onChange={e => setForm({...form, company_name: e.target.value})} />
            </div>
            <div>
              <label className="label">SIRET</label>
              <input className="input" value={form.siret || ''} onChange={e => setForm({...form, siret: e.target.value})} placeholder="14 chiffres" />
            </div>
            <div>
              <label className="label">N° TVA Intracommunautaire</label>
              <input className="input" value={form.tva || ''} onChange={e => setForm({...form, tva: e.target.value})} placeholder="FRXX..." />
            </div>
            <div>
              <label className="label">Adresse</label>
              <input className="input" value={form.adresse || ''} onChange={e => setForm({...form, adresse: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div>
                <label className="label">Téléphone</label>
                <input className="input" value={form.telephone || ''} onChange={e => setForm({...form, telephone: e.target.value})} />
              </div>
            </div>
            <button onClick={save} className="btn-primary w-full mt-2">
              <Save className="w-4 h-4 inline mr-2" /> Enregistrer
            </button>
          </div>
        )}

        {activeTab === 'clients' && (
          <ClientsTab clients={clients} addClient={addClient} updateClient={updateClient} deleteClient={deleteClient} />
        )}

        {activeTab === 'ouvrages' && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Bibliothèque d'ouvrages ({Object.values(OUVRAGES_BTP).flat().length})</h3>
            {Object.entries(OUVRAGES_BTP).map(([metier, ouvrages]) => (
              <details key={metier} className="card" open={metier === 'plomberie'}>
                <summary className="cursor-pointer font-bold text-slate-900 capitalize flex items-center justify-between">
                  <span>🔧 {metier} ({ouvrages.length})</span>
                  <span className="text-xs text-slate-500">Cliquer</span>
                </summary>
                <div className="mt-3 space-y-2">
                  {ouvrages.map(o => (
                    <div key={o.ref} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{o.label}</p>
                        <p className="text-xs text-slate-500">{o.ref} · TVA {o.tva}%</p>
                      </div>
                      <p className="text-sm font-bold text-chantier">{o.priceHT}€/{o.unit}</p>
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
        )}

        {activeTab === 'banque' && (
          <div className="card space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Coordonnées bancaires</h3>
            <div>
              <label className="label">Banque</label>
              <input className="input" value={form.banque || ''} onChange={e => setForm({...form, banque: e.target.value})} />
            </div>
            <div>
              <label className="label">IBAN</label>
              <input className="input font-mono text-sm" value={form.iban || ''} onChange={e => setForm({...form, iban: e.target.value})} />
            </div>
            <button onClick={save} className="btn-primary w-full">Enregistrer</button>
          </div>
        )}

        {activeTab === 'cgv' && (
          <div className="card space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Conditions Générales de Vente</h3>
            <textarea
              className="input min-h-[200px] font-mono text-xs"
              value={form.cgv || ''}
              onChange={e => setForm({...form, cgv: e.target.value})}
            />
            <p className="text-xs text-slate-500">Ces CGV apparaîtront automatiquement sur tous tes PDF.</p>
            <button onClick={save} className="btn-primary w-full">Enregistrer</button>
          </div>
        )}

        <div className="pt-4 border-t border-slate-200 space-y-2">
          <button onClick={handleSignOut} className="w-full text-slate-600 hover:text-slate-900 text-sm font-medium py-3 hover:bg-slate-100 rounded-xl">
            <LogOut className="w-4 h-4 inline mr-2" />
            Se déconnecter
          </button>
          <button onClick={handleResetData} className="w-full text-red-600 hover:text-red-700 text-sm font-medium py-3 hover:bg-red-50 rounded-xl">
            <Trash2 className="w-4 h-4 inline mr-2" />
            Supprimer toutes mes données
          </button>
        </div>
      </div>
    </div>
  )
}

function ClientsTab({ clients, addClient, updateClient, deleteClient }) {
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ nom: '', email: '', telephone: '', adresse: '' })

  useEffect(() => {
    if (editing) {
      setForm({
        nom: editing.nom || '',
        email: editing.email || '',
        telephone: editing.telephone || '',
        adresse: editing.adresse || '',
      })
    } else {
      setForm({ nom: '', email: '', telephone: '', adresse: '' })
    }
  }, [editing])

  function handleSave() {
    if (!form.nom.trim()) {
      alert('Le nom est obligatoire')
      return
    }
    if (editing) {
      updateClient(editing.id, form)
    } else {
      addClient(form)
    }
    setShowAdd(false)
    setEditing(null)
    setForm({ nom: '', email: '', telephone: '', adresse: '' })
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">Mes clients ({clients.length})</h3>
        <button onClick={() => setShowAdd(true)} className="text-chantier text-sm font-semibold flex items-center gap-1">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-slate-500 text-sm">Aucun client</p>
          <p className="text-slate-400 text-xs mt-1">Ils seront ajoutés automatiquement à partir de vos devis</p>
        </div>
      ) : (
        <div className="space-y-2">
          {clients.map(c => (
            <div key={c.id} className="card flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-chantier-100 to-chantier/20 flex items-center justify-center flex-shrink-0">
                <span className="text-chantier font-bold">{c.nom?.[0]?.toUpperCase() || '?'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate">{c.nom}</p>
                <p className="text-xs text-slate-500 truncate">{c.email || c.telephone || '—'}</p>
              </div>
              <button onClick={() => setEditing(c)} className="text-xs text-slate-500 hover:text-slate-700 px-2">Éditer</button>
              <button onClick={() => { if (confirm('Supprimer ?')) deleteClient(c.id) }} className="text-xs text-red-500 hover:text-red-700 px-2">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={showAdd || !!editing} onClose={() => { setShowAdd(false); setEditing(null) }} title={editing ? 'Modifier' : 'Nouveau client'}>
        <div className="space-y-3">
          <div>
            <label className="label">Nom *</label>
            <input className="input" value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div>
            <label className="label">Téléphone</label>
            <input className="input" value={form.telephone} onChange={e => setForm({...form, telephone: e.target.value})} />
          </div>
          <div>
            <label className="label">Adresse</label>
            <input className="input" value={form.adresse} onChange={e => setForm({...form, adresse: e.target.value})} />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => { setShowAdd(false); setEditing(null) }} className="btn-secondary flex-1">Annuler</button>
            <button onClick={handleSave} className="btn-primary flex-1">{editing ? 'Enregistrer' : 'Créer'}</button>
          </div>
        </div>
      </Modal>
    </>
  )
}
