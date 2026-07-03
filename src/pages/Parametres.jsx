import { useState } from 'react'
import { Save, Building2, Wrench, CreditCard, FileText, Sparkles, LogOut, Crown } from 'lucide-react'
import Header from '../components/Header'
import { DEFAULT_PROFILE, OUVRAGES_BTP } from '../data/ouvrages'

export default function Parametres() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE)
  const [activeTab, setActiveTab] = useState('entreprise')
  const [saved, setSaved] = useState(false)

  const save = () => {
    localStorage.setItem('chantierpro_profile', JSON.stringify(profile))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const tabs = [
    { id: 'entreprise', icon: Building2, label: 'Entreprise' },
    { id: 'ouvrages', icon: Wrench, label: 'Ouvrages' },
    { id: 'banque', icon: CreditCard, label: 'Bancaire' },
    { id: 'cgv', icon: FileText, label: 'CGV' },
  ]

  return (
    <div className="pb-24">
      <Header
        title="Plus"
        subtitle="Paramètres & abonnements"
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
        {/* Bannière abonnement */}
        <div className="card bg-gradient-to-br from-chantier via-chantier-dark to-chantier text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12" />
          <div className="relative">
            <Crown className="w-8 h-8 mb-2" />
            <h3 className="text-lg font-bold">Plan Starter</h3>
            <p className="text-sm text-white/80 mt-1">Devis illimités · 19€/mois</p>
            <button className="mt-3 bg-white text-chantier font-semibold py-2 px-4 rounded-xl text-sm">
              Passer au Pro (39€)
            </button>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {tabs.map(t => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === t.id
                    ? 'bg-chantier text-white'
                    : 'bg-navy-700 text-gray-300'
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
            <h3 className="text-sm font-semibold text-white mb-2">Informations entreprise</h3>
            <div>
              <label className="text-xs text-gray-400">Nom</label>
              <input
                className="input mt-1"
                value={profile.nom}
                onChange={e => setProfile({...profile, nom: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">SIRET</label>
              <input
                className="input mt-1"
                value={profile.siret}
                onChange={e => setProfile({...profile, siret: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">N° TVA Intracommunautaire</label>
              <input
                className="input mt-1"
                value={profile.tva}
                onChange={e => setProfile({...profile, tva: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Adresse</label>
              <input
                className="input mt-1"
                value={profile.adresse}
                onChange={e => setProfile({...profile, adresse: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Email</label>
              <input
                className="input mt-1"
                value={profile.email}
                onChange={e => setProfile({...profile, email: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Téléphone</label>
              <input
                className="input mt-1"
                value={profile.tel}
                onChange={e => setProfile({...profile, tel: e.target.value})}
              />
            </div>
          </div>
        )}

        {activeTab === 'ouvrages' && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Bibliothèque d'ouvrages ({Object.values(OUVRAGES_BTP).flat().length})</h3>
            {Object.entries(OUVRAGES_BTP).map(([metier, ouvrages]) => (
              <details key={metier} className="card">
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
            <h3 className="text-sm font-semibold text-white mb-2">Coordonnées bancaires</h3>
            <div>
              <label className="text-xs text-gray-400">Banque</label>
              <input
                className="input mt-1"
                value={profile.banque}
                onChange={e => setProfile({...profile, banque: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">IBAN</label>
              <input
                className="input mt-1 font-mono text-sm"
                value={profile.iban}
                onChange={e => setProfile({...profile, iban: e.target.value})}
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="retenue"
                checked={profile.retenueGarantie}
                onChange={e => setProfile({...profile, retenueGarantie: e.target.checked})}
                className="w-4 h-4 accent-chantier"
              />
              <label htmlFor="retenue" className="text-sm text-gray-300">
                Appliquer une retenue de garantie ({profile.tauxRetenue}%)
              </label>
            </div>
          </div>
        )}

        {activeTab === 'cgv' && (
          <div className="card space-y-3">
            <h3 className="text-sm font-semibold text-white mb-2">Conditions Générales de Vente</h3>
            <textarea
              className="input min-h-[200px] font-mono text-xs"
              value={profile.cgv}
              onChange={e => setProfile({...profile, cgv: e.target.value})}
            />
            <p className="text-xs text-gray-400">
              Ces CGV apparaîtront automatiquement sur tous vos devis et factures PDF.
            </p>
          </div>
        )}

        <button onClick={save} className="btn-primary w-full">
          <Save className="w-4 h-4 inline mr-2" />
          Enregistrer les modifications
        </button>

        <div className="pt-4">
          <button className="w-full text-red-400 hover:text-red-300 text-sm font-medium py-3">
            <LogOut className="w-4 h-4 inline mr-2" />
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  )
}
