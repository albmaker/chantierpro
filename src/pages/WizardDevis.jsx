import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Sparkles, Wrench, Plus, Trash2, Save, X, ChevronRight, ChevronLeft, Droplet, Zap, PaintBucket, Hammer, AlertCircle } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { OUVRAGES_BTP } from '../data/empty'

const METIERS = [
  { id: 'plomberie', label: 'Plomberie', icon: Droplet, color: 'blue' },
  { id: 'electricite', label: 'Électricité', icon: Zap, color: 'amber' },
  { id: 'peinture', label: 'Peinture', icon: PaintBucket, color: 'purple' },
  { id: 'maconnerie', label: 'Maçonnerie', icon: Hammer, color: 'emerald' },
]

const TYPES_TRAVAUX = {
  plomberie: [
    { id: 'sdb', label: 'Rénovation salle de bain', icon: '🚿', ouvrageRefs: ['PLO-001', 'PLO-003', 'PLO-005'] },
    { id: 'cuisine', label: 'Installation cuisine', icon: '🍳', ouvrageRefs: ['PLO-003', 'PLO-007', 'PLO-008'] },
    { id: 'chauffe-eau', label: 'Chauffe-eau / cumulus', icon: '🔥', ouvrageRefs: ['PLO-002'] },
    { id: 'fuite', label: 'Réparation fuite', icon: '🔧', ouvrageRefs: ['PLO-004', 'PLO-010'] },
  ],
  electricite: [
    { id: 'renovation', label: 'Rénovation complète', icon: '🔌', ouvrageRefs: ['ELE-001', 'ELE-002', 'ELE-003'] },
    { id: 'normes', label: 'Mise aux normes', icon: '⚡', ouvrageRefs: ['ELE-004', 'ELE-009'] },
    { id: 'vmc', label: 'Pose VMC', icon: '💨', ouvrageRefs: ['ELE-005'] },
    { id: 'chauffage', label: 'Radiateur électrique', icon: '🌡️', ouvrageRefs: ['ELE-008'] },
  ],
  peinture: [
    { id: 'piece', label: 'Peindre une pièce', icon: '🖌️', ouvrageRefs: ['PEI-003', 'PEI-001', 'PEI-002'] },
    { id: 'facade', label: 'Peinture façade', icon: '🏠', ouvrageRefs: ['PEI-006'] },
    { id: 'boiseries', label: 'Peinture boiseries', icon: '🚪', ouvrageRefs: ['PEI-004'] },
  ],
  maconnerie: [
    { id: 'cloison', label: 'Cloison placo', icon: '🧱', ouvrageRefs: ['MAC-001', 'MAC-002'] },
    { id: 'carrelage', label: 'Carrelage sol', icon: '⬜', ouvrageRefs: ['MAC-003'] },
    { id: 'faience', label: 'Faïence murale', icon: '🚿', ouvrageRefs: ['MAC-004'] },
    { id: 'parquet', label: 'Pose parquet', icon: '🪵', ouvrageRefs: ['MAC-005'] },
  ],
}

const COLOR_CLASSES = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-500' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-500' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', ring: 'ring-purple-500' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-500' },
}

export default function WizardDevis() {
  const navigate = useNavigate()
  const { addDevis, getProfile } = useData()

  const [step, setStep] = useState(1)
  const [data, setData] = useState({
    metier: '',
    typeTravaux: '',
    surface: 20,
    pieces: 1,
    client_nom: '',
    client_email: '',
    client_tel: '',
    client_adresse: '',
    notes: '',
  })
  const [generatedLignes, setGeneratedLignes] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // Récupération sécurisée de la bibliothèque aplatie
  const allOuvrages = useMemo(() => {
    try {
      return Object.values(OUVRAGES_BTP).flat()
    } catch (e) {
      console.error('Erreur biblio ouvrages:', e)
      return []
    }
  }, [])

  const metierInfo = METIERS.find(m => m.id === data.metier)
  const colors = metierInfo ? COLOR_CLASSES[metierInfo.color] : COLOR_CLASSES.blue

  function next() {
    setError(null)
    if (step === 1 && !data.metier) {
      setError('Choisis un métier pour continuer')
      return
    }
    if (step === 2 && !data.typeTravaux) {
      setError('Choisis un type de travaux pour continuer')
      return
    }
    if (step === 3) {
      generateDevis()
    }
    if (step < 5) {
      setStep(step + 1)
    }
  }

  function prev() {
    if (step > 1) setStep(step - 1)
    else navigate(-1)
  }

  function generateDevis() {
    try {
      const types = TYPES_TRAVAUX[data.metier]
      if (!types) {
        setError('Erreur : métier non reconnu')
        return
      }
      const typeInfo = types.find(t => t.id === data.typeTravaux)
      if (!typeInfo) {
        setError('Erreur : type de travaux non reconnu')
        return
      }

      const lignes = typeInfo.ouvrageRefs.map(ref => {
        const o = allOuvrages.find(x => x && x.ref === ref)
        if (!o) {
          // Fallback si l'ouvrage n'est pas trouvé
          return { ref, label: ref, qty: 1, unit: 'forfait', priceHT: 0, tva: 10 }
        }
        // Quantité adapt\u00e9e
        let qty = 1
        if (o.unit === 'm\u00b2') qty = data.surface || 1
        else if (o.unit === 'forfait') qty = 1
        else if (o.unit === 'u') qty = Math.max(1, data.pieces || 1)
        else qty = 1
        return { ...o, qty, priceHT: o.priceHT || 0, tva: o.tva || 10 }
      })
      setGeneratedLignes(lignes)
    } catch (err) {
      console.error('Erreur generateDevis:', err)
      setError('Erreur lors de la génération : ' + err.message)
    }
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
      ref: 'CUSTOM', label: '', qty: 1, unit: 'u', priceHT: 0, tva: 10,
    }])
  }

  async function saveDevis() {
    setError(null)
    if (!data.client_nom.trim()) {
      setError('Renseigne le nom du client')
      return
    }
    if (generatedLignes.length === 0) {
      setError('Aucun ouvrage \u00e0 enregistrer')
      return
    }
    setSaving(true)
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
      setError('Erreur : ' + err.message)
    } finally {
      setSaving(false)
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
        {/* Message d'erreur g\u00e9n\u00e9ral */}
        {error && (
          <div className="card border-red-200 bg-red-50 mb-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* \u00c9TAPE 1 */}
        {step === 1 && (
          <div className="space-y-3">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Quel est ton m\u00e9tier ?</h2>
              <p className="text-sm text-slate-500 mt-1">Choisis ton corps d'\u00e9tat principal</p>
            </div>
            {METIERS.map(m => {
              const c = COLOR_CLASSES[m.color]
              const Icon = m.icon
              return (
                <button
                  key={m.id}
                  onClick={() => setData({...data, metier: m.id, typeTravaux: ''})}
                  className={`w-full card text-left transition-all active:scale-[0.98] ${
                    data.metier === m.id ? `ring-2 ${c.ring}` : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${c.text}`} />
                    </div>
                    <p className="font-bold text-slate-900 dark:text-white flex-1">{m.label}</p>
                    {data.metier === m.id && (
                      <div className="w-6 h-6 rounded-full bg-chantier flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* \u00c9TAPE 2 */}
        {step === 2 && metierInfo && (
          <div className="space-y-3">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Quel type de chantier ?</h2>
              <p className="text-sm text-slate-500 mt-1">S\u00e9lectionne le type qui correspond le mieux</p>
            </div>
            {TYPES_TRAVAUX[data.metier]?.map(t => (
              <button
                key={t.id}
                onClick={() => setData({...data, typeTravaux: t.id})}
                className={`w-full card text-left transition-all active:scale-[0.98] ${
                  data.typeTravaux === t.id ? `ring-2 ${colors.ring}` : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{t.icon}</div>
                  <p className="font-bold text-slate-900 dark:text-white flex-1">{t.label}</p>
                  {data.typeTravaux === t.id && (
                    <div className="w-6 h-6 rounded-full bg-chantier flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* \u00c9TAPE 3 */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Quelle surface ?</h2>
              <p className="text-sm text-slate-500 mt-1">Adapte les quantit\u00e9s \u00e0 ton chantier</p>
            </div>

            <div className="card space-y-4">
              <div>
                <label className="label">Surface (m\u00b2) : {data.surface}</label>
                <input
                  type="range"
                  min="5"
                  max="500"
                  step="5"
                  value={data.surface}
                  onChange={e => setData({...data, surface: parseInt(e.target.value) || 0})}
                  className="w-full accent-chantier"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>5 m\u00b2</span>
                  <span>500 m\u00b2</span>
                </div>
              </div>

              <div>
                <label className="label">Nombre de pi\u00e8ces / unit\u00e9s : {data.pieces}</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setData({...data, pieces: Math.max(1, data.pieces - 1)})}
                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700"
                  >
                    \u2212
                  </button>
                  <div className="flex-1 bg-slate-50 rounded-xl py-2 text-center font-bold text-xl text-slate-900 dark:text-white">
                    {data.pieces}
                  </div>
                  <button
                    type="button"
                    onClick={() => setData({...data, pieces: data.pieces + 1})}
                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700"
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
                  <p className="text-sm font-bold text-slate-900">\u00c9tape suivante</p>
                  <p className="text-xs text-slate-600 mt-1">
                    Je vais g\u00e9n\u00e9rer les lignes de devis adapt\u00e9es \u00e0 ton chantier. Tu pourras les ajuster.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* \u00c9TAPE 4 : Lignes g\u00e9n\u00e9r\u00e9es */}
        {step === 4 && (
          <div className="space-y-3">
            <div className="card bg-gradient-to-br from-chantier-50 to-white border-chantier-200">
              <div className="flex items-start gap-2">
                <Sparkles className="w-5 h-5 text-chantier mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-slate-900">Devis auto-g\u00e9n\u00e9r\u00e9</p>
                  <p className="text-xs text-slate-600 mt-1">
                    {generatedLignes.length} ouvrage{generatedLignes.length > 1 ? 's' : ''} pr\u00eat{s}. Tu peux modifier.
                  </p>
                </div>
              </div>
            </div>

            {generatedLignes.length === 0 && (
              <div className="card text-center py-6">
                <p className="text-slate-500">Aucun ouvrage g\u00e9n\u00e9r\u00e9. Retourne en arri\u00e8re et choisis un type de travaux.</p>
                <button onClick={prev} className="btn-secondary mt-3">Retour</button>
              </div>
            )}

            {generatedLignes.map((l, i) => (
              <div key={i} className="card space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{l.label || 'Sans nom'}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">R\u00e9f {l.ref} \u00b7 TVA {l.tva}%</p>
                  </div>
                  <button
                    onClick={() => removeLigne(i)}
                    className="w-9 h-9 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500">Qt\u00e9</label>
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
                      {((l.qty || 0) * (l.priceHT || 0) * (1 + (l.tva || 0) / 100)).toFixed(0)}\u20ac
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {generatedLignes.length > 0 && (
              <button onClick={addCustomLigne} className="btn-secondary w-full text-sm">
                <Plus className="w-4 h-4 inline mr-2" /> Ajouter une ligne personnalis\u00e9e
              </button>
            )}

            {generatedLignes.length > 0 && (
              <div className="card bg-slate-900 text-white">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-slate-300"><span>Total HT</span><span>{totalHT.toFixed(2)} \u20ac</span></div>
                  <div className="flex justify-between text-slate-300"><span>TVA</span><span>{totalTVA.toFixed(2)} \u20ac</span></div>
                  <div className="flex justify-between text-xl font-bold pt-2 border-t border-slate-700">
                    <span>Total TTC</span>
                    <span className="text-chantier-light">{totalTTC.toFixed(0)} \u20ac</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* \u00c9TAPE 5 : Client + finalisation */}
        {step === 5 && (
          <div className="space-y-3">
            <div className="text-center mb-2">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Pour qui ?</h2>
              <p className="text-sm text-slate-500 mt-1">Derni\u00e8re \u00e9tape : le client</p>
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
                  <label className="label">T\u00e9l\u00e9phone</label>
                  <input className="input" placeholder="06 12 34 56 78" value={data.client_tel} onChange={e => setData({...data, client_tel: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="label">Adresse du chantier</label>
                <input className="input" placeholder="12 rue des Lilas, 75011 Paris" value={data.client_adresse} onChange={e => setData({...data, client_adresse: e.target.value})} />
              </div>
              <div>
                <label className="label">Notes (optionnel)</label>
                <textarea className="input min-h-[80px]" placeholder="Pr\u00e9cisions sur le chantier, acc\u00e8s, demandes sp\u00e9cifiques..." value={data.notes} onChange={e => setData({...data, notes: e.target.value})} />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
              <h3 className="text-sm font-bold text-slate-900 mb-2">R\u00e9cap</h3>
              <div className="space-y-1 text-sm text-slate-700">
                <div className="flex justify-between"><span className="text-slate-500">M\u00e9tier :</span><span className="font-semibold capitalize">{metierInfo?.label || '-'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Type :</span><span className="font-semibold">{TYPES_TRAVAUX[data.metier]?.find(t => t.id === data.typeTravaux)?.label || '-'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Surface :</span><span className="font-semibold">{data.surface} m\u00b2</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Lignes :</span><span className="font-semibold">{generatedLignes.length}</span></div>
                <div className="flex justify-between pt-2 border-t border-emerald-200 mt-2">
                  <span className="font-bold">Total TTC :</span>
                  <span className="font-extrabold text-chantier text-lg">{totalTTC.toFixed(0)} \u20ac</span>
                </div>
              </div>
            </div>

            <button onClick={saveDevis} disabled={saving} className="btn-primary w-full">
              {saving ? 'Cr\u00e9ation...' : 'Cr\u00e9er le devis'}
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
              {step === 3 ? 'G\u00e9n\u00e9rer le devis' : 'Continuer'}
              <ChevronRight className="w-4 h-4 inline ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
