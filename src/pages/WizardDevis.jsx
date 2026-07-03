import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Sparkles, Wrench, Home, Ruler, Check, Plus, Trash2, Edit2, Save, X, ChevronRight, ChevronLeft, Home as HomeIcon, Building, Hammer, PaintBucket, Droplet, Zap } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { OUVRAGES_BTP } from '../data/empty'

// === WIZARD DE DEVIS GUIDÉ ===
// Remplace le scanner IA : bien plus fiable, bien plus utile
// L'user r\u00e9pond \u00e0 4 questions simples, on g\u00e9n\u00e8re un devis sur mesure

const METIERS = [
  { id: 'plomberie', label: 'Plomberie', icon: Droplet, color: 'blue', description: 'WC, robinetterie, tuyauterie, chauffe-eau...' },
  { id: 'electricite', label: 'Électricité', icon: Zap, color: 'amber', description: 'Prises, éclairage, tableau, mise aux normes...' },
  { id: 'peinture', label: 'Peinture', icon: PaintBucket, color: 'purple', description: 'Murs, plafonds, façades, papier peint...' },
  { id: 'maconnerie', label: 'Maçonnerie', icon: Hammer, color: 'emerald', description: 'Cloisons, carrelage, placo, façades...' },
]

const TYPES_TRAVAUX = {
  plomberie: [
    { id: 'sdb', label: 'Rénovation salle de bain', icon: '🚿', ouvrages: ['PLO-001', 'PLO-003', 'PLO-005'] },
    { id: 'cuisine', label: 'Installation cuisine', icon: '🍳', ouvrages: ['PLO-003', 'PLO-007', 'PLO-008'] },
    { id: 'chauffe-eau', label: 'Chauffe-eau / cumulus', icon: '🔥', ouvrages: ['PLO-002'] },
    { id: 'fuite', label: 'Réparation fuite', icon: '🔧', ouvrages: ['PLO-004', 'PLO-010'] },
  ],
  electricite: [
    { id: 'renovation', label: 'Rénovation complète', icon: '🔌', ouvrages: ['ELE-001', 'ELE-002', 'ELE-003'] },
    { id: 'normes', label: 'Mise aux normes', icon: '⚡', ouvrages: ['ELE-004', 'ELE-009'] },
    { id: 'vmc', label: 'Pose VMC', icon: '💨', ouvrages: ['ELE-005'] },
    { id: 'chauffage', label: 'Radiateur électrique', icon: '🌡️', ouvrages: ['ELE-008'] },
  ],
  peinture: [
    { id: 'piece', label: 'Peindre une pièce', icon: '🖌️', ouvrages: ['PEI-003', 'PEI-001', 'PEI-002'] },
    { id: 'facade', label: 'Peinture façade', icon: '🏠', ouvrages: ['PEI-006'] },
    { id: 'boiseries', label: 'Peinture boiseries', icon: '🚪', ouvrages: ['PEI-004'] },
  ],
  maconnerie: [
    { id: 'cloison', label: 'Cloison placo', icon: '🧱', ouvrages: ['MAC-001', 'MAC-002'] },
    { id: 'carrelage', label: 'Carrelage sol', icon: '⬜', ouvrages: ['MAC-003'] },
    { id: 'faience', label: 'Faïence murale', icon: '🚿', ouvrages: ['MAC-004'] },
    { id: 'parquet', label: 'Pose parquet', icon: '🪵', ouvrages: ['MAC-005'] },
  ],
}

const COLOR_CLASSES = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', ring: 'ring-blue-500' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', ring: 'ring-amber-500' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', ring: 'ring-purple-500' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', ring: 'ring-emerald-500' },
}

export default function WizardDevis() {
  const navigate = useNavigate()
  const { addDevis, getProfile } = useData()
  const [step, setStep] = useState(1)
  const [data, setData] = useState({
    metier: null,
    typeTravaux: null,
    surface: 20,
    pieces: 1,
    client_nom: '',
    client_email: '',
    client_tel: '',
    client_adresse: '',
    notes: '',
  })
  const [generatedLignes, setGeneratedLignes] = useState([])

  const metierInfo = METIERS.find(m => m.id === data.metier)
  const colors = metierInfo ? COLOR_CLASSES[metierInfo.color] : COLOR_CLASSES.blue
  const IconMetier = metierInfo?.icon || Wrench

  function next() {
    if (step === 1 && !data.metier) {
      alert('Choisis un métier')
      return
    }
    if (step === 2 && !data.typeTravaux) {
      alert('Choisis un type de travaux')
      return
    }
    if (step === 3) {
      // G\u00e9n\u00e9rer le devis \u00e0 partir des choix
      generateDevis()
    }
    setStep(step + 1)
  }

  function prev() {
    if (step > 1) setStep(step - 1)
    else navigate(-1)
  }

  function generateDevis() {
    const typeInfo = TYPES_TRAVAUX[data.metier].find(t => t.id === data.typeTravaux)
    const allOuvrages = Object.values(OUVRAGES_BTP).flat()
    const lignes = typeInfo.ouvrages.map(ref => {
      const o = allOuvrages.find(x => x.ref === ref)
      // Adapter la quantit\u00e9 \u00e0 la surface si applicable
      let qty = o.qty || 1
      if (o.unit === 'm\u00b2') qty = data.surface
      else if (o.unit === 'forfait') qty = 1
      else if (o.unit === 'u') qty = Math.ceil(data.pieces)
      return { ...o, qty }
    })
    setGeneratedLignes(lignes)
  }

  function updateLigne(i, field, value) {
    const newLignes = [...generatedLignes]
    newLignes[i] = { ...newLignes[i], [field]: value }
    setGeneratedLignes(newLignes)
  }

  function removeLigne(i) {
    setGeneratedLignes(generatedLignes.filter((_, idx) => idx !== i))
  }

  function addCustomLigne() {
    setGeneratedLignes([...generatedLignes, {
      ref: 'CUSTOM',
      label: '',
      qty: 1,
      unit: 'u',
      priceHT: 0,
      tva: 10,
    }])
  }

  async function saveDevis() {
    if (!data.client_nom.trim()) {
      alert('Renseigne le nom du client')
      return
    }
    if (generatedLignes.length === 0) {
      alert('Ajoute au moins une ligne')
      return
    }
    try {
      const newDevis = await addDevis({
        client_nom: data.client_nom,
        client_email: data.client_email,
        client_tel: data.client_tel,
        client_adresse: data.client_adresse,
        metier: data.metier,
        notes: data.notes,
        lignes: generatedLignes,
        statut: 'en_attente',
      })
      alert('Devis créé avec succès !')
      navigate(`/devis/${newDevis.id}`)
    } catch (err) {
      alert('Erreur : ' + err.message)
    }
  }

  const totalHT = generatedLignes.reduce((s, l) => s + (Number(l.qty) || 0) * (Number(l.priceHT) || 0), 0)
  const totalTVA = generatedLignes.reduce((s, l) => s + (Number(l.qty) || 0) * (Number(l.priceHT) || 0) * ((Number(l.tva) || 0) / 100), 0)
  const totalTTC = totalHT + totalTVA

  return (
    <div className="pb-24">
      {/* Header avec progression */}
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 px-5 py-4 flex items-center gap-3">
        <button onClick={prev} className="w-10 h-10 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-200" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Devis guidé</h1>
          <div className="flex items-center gap-1.5 mt-1">
            {[1, 2, 3, 4, 5].map(s => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${
                s <= step ? 'bg-chantier' : 'bg-slate-200 dark:bg-slate-700'
              }`} />
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 pt-4">
        {/* ÉTAPE 1 : Métier */}
        {step === 1 && (
          <div className="space-y-3">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Quel est ton métier ?</h2>
              <p className="text-sm text-slate-500 mt-1">Choisis ton corps d'état principal</p>
            </div>
            {METIERS.map(m => {
              const c = COLOR_CLASSES[m.color]
              const Icon = m.icon
              return (
                <button
                  key={m.id}
                  onClick={() => setData({...data, metier: m.id, typeTravaux: null})}
                  className={`w-full card text-left transition-all ${
                    data.metier === m.id ? `ring-2 ${c.ring}` : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${c.text}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 dark:text-white">{m.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{m.description}</p>
                    </div>
                    {data.metier === m.id && (
                      <div className="w-6 h-6 rounded-full bg-chantier flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* ÉTAPE 2 : Type de travaux */}
        {step === 2 && metierInfo && (
          <div className="space-y-3">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Quel type de chantier ?</h2>
              <p className="text-sm text-slate-500 mt-1">Sélectionne le type qui correspond le mieux</p>
            </div>
            {TYPES_TRAVAUX[data.metier].map(t => (
              <button
                key={t.id}
                onClick={() => setData({...data, typeTravaux: t.id})}
                className={`w-full card text-left transition-all ${
                  data.typeTravaux === t.id ? `ring-2 ${colors.ring}` : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{t.icon}</div>
                  <p className="font-bold text-slate-900 dark:text-white flex-1">{t.label}</p>
                  {data.typeTravaux === t.id && (
                    <div className="w-6 h-6 rounded-full bg-chantier flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ÉTAPE 3 : Surface / Quantités */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Quelle surface ?</h2>
              <p className="text-sm text-slate-500 mt-1">Adapte les quantités à ton chantier</p>
            </div>

            <div className="card space-y-4">
              <div>
                <label className="label">Surface (m²)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="5"
                    max="500"
                    step="5"
                    value={data.surface}
                    onChange={e => setData({...data, surface: parseInt(e.target.value)})}
                    className="flex-1 accent-chantier"
                  />
                  <div className="bg-chantier text-white font-bold px-4 py-2 rounded-xl min-w-[80px] text-center">
                    {data.surface} m²
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  💡 Astuce : pour une pièce standard, compte la longueur × largeur
                </p>
              </div>

              <div>
                <label className="label">Nombre de pièces / unités</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setData({...data, pieces: Math.max(1, data.pieces - 1)})}
                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold"
                  >
                    −
                  </button>
                  <div className="flex-1 bg-slate-50 rounded-xl py-2 text-center font-bold text-xl text-slate-900 dark:text-white">
                    {data.pieces}
                  </div>
                  <button
                    onClick={() => setData({...data, pieces: data.pieces + 1})}
                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
              <div className="flex items-start gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-slate-900">Devis auto-généré</p>
                  <p className="text-xs text-slate-600 mt-1">
                    À l'étape suivante, je te proposerai les ouvrages correspondants avec les bons prix.
                    Tu pourras les ajuster avant de finaliser.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 4 : Lignes pré-générées (ajustables) */}
        {step === 4 && (
          <div className="space-y-3">
            <div className="card bg-gradient-to-br from-chantier-50 to-white border-chantier-200">
              <div className="flex items-start gap-2">
                <Sparkles className="w-5 h-5 text-chantier mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-slate-900">Voici ton devis pré-rempli</p>
                  <p className="text-xs text-slate-600 mt-1">
                    Ajoute, supprime ou modifie les lignes selon le chantier réel.
                  </p>
                </div>
              </div>
            </div>

            {generatedLignes.map((l, i) => (
              <div key={i} className="card space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{l.label}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Réf {l.ref} · TVA {l.tva}%</p>
                  </div>
                  <button
                    onClick={() => removeLigne(i)}
                    className="w-9 h-9 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500">Quantité</label>
                    <input
                      type="number"
                      className="input text-sm"
                      value={l.qty}
                      onChange={e => updateLigne(i, 'qty', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500">Prix HT</label>
                    <input
                      type="number"
                      className="input text-sm"
                      value={l.priceHT}
                      onChange={e => updateLigne(i, 'priceHT', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500">Total TTC</label>
                    <div className="input text-sm bg-slate-50 font-bold text-chantier">
                      {(l.qty * l.priceHT * (1 + l.tva/100)).toFixed(0)}€
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button onClick={addCustomLigne} className="btn-secondary w-full text-sm">
              <Plus className="w-4 h-4 inline mr-2" /> Ajouter une ligne personnalisée
            </button>

            <div className="card bg-slate-900 text-white">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-slate-300"><span>Total HT</span><span>{totalHT.toFixed(2)} €</span></div>
                <div className="flex justify-between text-slate-300"><span>TVA</span><span>{totalTVA.toFixed(2)} €</span></div>
                <div className="flex justify-between text-xl font-bold pt-2 border-t border-slate-700">
                  <span>Total TTC</span>
                  <span className="text-chantier-light">{totalTTC.toFixed(0)} €</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 5 : Client + finalisation */}
        {step === 5 && (
          <div className="space-y-3">
            <div className="text-center mb-2">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Pour qui ?</h2>
              <p className="text-sm text-slate-500 mt-1">Dernière étape : le client</p>
            </div>

            <div className="card space-y-3">
              <div>
                <label className="label">Nom du client *</label>
                <input className="input" placeholder="M. Dupont Bernard" value={data.client_nom} onChange={e => setData({...data, client_nom: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">Email</label>
                  <input className="input" type="email" placeholder="email@exemple.com" value={data.client_email} onChange={e => setData({...data, client_email: e.target.value})} />
                </div>
                <div>
                  <label className="label">Téléphone</label>
                  <input className="input" placeholder="06 12 34 56 78" value={data.client_tel} onChange={e => setData({...data, client_tel: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="label">Adresse du chantier</label>
                <input className="input" placeholder="12 rue des Lilas, 75011 Paris" value={data.client_adresse} onChange={e => setData({...data, client_adresse: e.target.value})} />
              </div>
              <div>
                <label className="label">Notes (optionnel)</label>
                <textarea
                  className="input min-h-[80px]"
                  placeholder="Précisions sur le chantier, accès, demandes spécifiques..."
                  value={data.notes}
                  onChange={e => setData({...data, notes: e.target.value})}
                />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Récap</h3>
              <div className="space-y-1 text-sm text-slate-700">
                <div className="flex justify-between"><span className="text-slate-500">Métier :</span><span className="font-semibold capitalize">{metierInfo?.label}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Type :</span><span className="font-semibold">{TYPES_TRAVAUX[data.metier]?.find(t => t.id === data.typeTravaux)?.label}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Surface :</span><span className="font-semibold">{data.surface} m²</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Lignes :</span><span className="font-semibold">{generatedLignes.length}</span></div>
                <div className="flex justify-between pt-2 border-t border-emerald-200 mt-2">
                  <span className="font-bold">Total TTC :</span>
                  <span className="font-extrabold text-chantier text-lg">{totalTTC.toFixed(0)} €</span>
                </div>
              </div>
            </div>

            <button onClick={saveDevis} className="btn-primary w-full">
              <Check className="w-4 h-4 inline mr-2" />
              Créer le devis
            </button>
          </div>
        )}
      </div>

      {/* Boutons navigation bas */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-700 px-5 py-3 z-30">
        <div className="max-w-2xl mx-auto flex gap-2">
          {step > 1 && (
            <button onClick={prev} className="btn-secondary flex-shrink-0">
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          {step < 5 && (
            <button onClick={next} className="btn-primary flex-1">
              {step === 3 ? 'Générer le devis' : 'Continuer'}
              <ChevronRight className="w-4 h-4 inline ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
