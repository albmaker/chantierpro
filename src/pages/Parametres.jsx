import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, Building2, Wrench, CreditCard, FileText, LogOut, Crown, Check, User } from 'lucide-react'
import Header from '../components/Header'
import { OUVRAGES_BTP } from '../data/empty'
import { useData } from '../contexts/DataContext'

const TABS = [
  { id: 'entreprise', icon: Building2, label: 'Entreprise' },
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
  cgv: 'Conditions générales de vente :\n- Acompte de 30% à la commande\n- Solde à la livraison\n- Délai de paiement : 30 jours',
}

export default function Parametres() {
  const navigate = useNavigate()
  const { profile, saveProfile, plan, signOut, user } = useData()
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
    if (confirm('Te déconnecter ? Tes données resteront sauvegardées.')) {
      await signOut()
      navigate('/')
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
        subtitle={user?.email || 'Compte local'}
        action={saved ? (
          <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
            ✓ Sauvegardé
          </div>
        ) : (
          <button onClick={save} className="w-10 h-10 rounded-full bg-chantier flex items-center justify-center">
            <Save className="w-5 h-5 text-white" />
          </button>
        )}
      />

      <div className="px-5 pt-4 space-y-4">
        {/* Carte utilisateur + plan */}
        <div className="card bg-gradient-to-br from-navy-700 to-navy-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-chantier flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white truncate">{form.company_name || 'Mon Entreprise'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email || 'Mode démo local'}</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-navy-600">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-300">Plan actuel</span>
            </div>
            <span className="text-sm font-bold text-chantier">{planLabel}</span>
          </div>
          {plan === 'free' && (
            <button onClick={() => navigate('/pricing')} className="btn-primary w-full mt-3">
              Passer au Starter (19€/mois)
            </button>
          )}
        </div>

        {/* Onglets */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {TABS.map(t => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  activeTab === t.id ? 'bg-chantier text-white' : 'bg-navy-700 text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            )
          })}
        </div>

        {/* Contenu */}
        {activeTab === 'entreprise' && (
          <div className="card space-y-3">
            <h3 className="text-sm font-semibold text-white">Informations entreprise</h3>
            <div>
              <label className="text-xs text-gray-400">Nom</label>
              <input className="input mt-1" value={form.company_name || ''} onChange={e => setForm({...form, company_name: e.target.value})} />
            </div>
            <div>
              <label className="text-xs text-gray-400">SIRET</label>
              <input className="input mt-1" value={form.siret || ''} onChange={e => setForm({...form, siret: e.target.value})} />
            </div>
            <div>
              <label className="text-xs text-gray-400">N° TVA Intracommunautaire</label>
              <input className="input mt-1" value={form.tva || ''} onChange={e => setForm({...form, tva: e.target.value})} />
            </div>
            <div>
              <label className="text-xs text-gray-400">Adresse</label>
              <input className="input mt-1" value={form.adresse || ''} onChange={e => setForm({...form, adresse: e.target.value})} />
            </div>
            <div>
              <label className="text-xs text-gray-400">Email</label>
              <input className="input mt-1" type="email" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div>
              <label className="text-xs text-gray-400">Téléphone</label>
              <input className="input mt-1" value={form.telephone || ''} onChange={e => setForm({...form, telephone: e.target.value})} />
            </div>
          </div>
        )}

        {activeTab === 'ouvrages' && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Bibliothèque d'ouvrages ({Object.values(OUVRAGES_BTP).flat().length})</h3>
            {Object.entries(OUVRAGES_BTP).map(([metier, ouvrages]) => (
              <details key={metier} className="card" open={metier === 'plomberie'}>
                <summary className="cursor-pointer font-medium text-white capitalize flex items-center justify-between">
                  <span>🔧 {metier} ({ouvrages.length})</span>
                  <span className="text-xs text-gray-400">Cliquer pour voir</span>
                </summary>
                <div className="mt-3 space-y-2">
                  {ouvrages.map(o => (
                    <div key={o.ref} className="flex items-center justify-between p-2 bg-navy-800/50 rounded-lg">
                      <div>
                        <p className="text-sm text-white">{o.label}</p>
                        <p className="text-xs text-gray-400">{o.ref} · TVA {o.tva}%</p>
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
            <h3 className="text-sm font-semibold text-white">Coordonnées bancaires</h3>
            <div>
              <label className="text-xs text-gray-400">Banque</label>
              <input className="input mt-1" value={form.banque || ''} onChange={e => setForm({...form, banque: e.target.value})} />
            </div>
            <div>
              <label className="text-xs text-gray-400">IBAN</label>
              <input className="input mt-1 font-mono text-sm" value={form.iban || ''} onChange={e => setForm({...form, iban: e.target.value})} />
            </div>
          </div>
        )}

        {activeTab === 'cgv' && (
          <div className="card space-y-3">
            <h3 className="text-sm font-semibold text-white">Conditions Générales de Vente</h3>
            <textarea
              className="input min-h-[200px] font-mono text-xs"
              value={form.cgv || ''}
              onChange={e => setForm({...form, cgv: e.target.value})}
            />
            <p className="text-xs text-gray-400">Ces CGV apparaîtront automatiquement sur tous tes PDF.</p>
          </div>
        )}

        <button onClick={save} className="btn-primary w-full">
          <Save className="w-4 h-4 inline mr-2" />
          Enregistrer les modifications
        </button>

        <div className="pt-4 border-t border-navy-700/50">
          <button onClick={handleSignOut} className="w-full text-red-400 hover:text-red-300 text-sm font-medium py-3 hover:bg-red-500/10 rounded-xl">
            <LogOut className="w-4 h-4 inline mr-2" />
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  )
}
