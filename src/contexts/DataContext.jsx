import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, getCurrentUser } from '../lib/supabase'
import { fetchDevis, createDevis as apiCreateDevis, updateDevis as apiUpdateDevis, deleteDevis as apiDeleteDevis, fetchFactures, createFacture as apiCreateFacture, getProfile as apiGetProfile, upsertProfile as apiUpsertProfile } from '../lib/supabase'

const DataContext = createContext(null)

const STORAGE_KEYS = {
  devis: 'chantierpro_devis',
  factures: 'chantierpro_factures',
  profile: 'chantierpro_profile',
  plan: 'chantierpro_plan',
  user: 'chantierpro_user',
  clients: 'chantierpro_clients',
  templates: 'chantierpro_templates',
  activity: 'chantierpro_activity',
  customObjectives: 'chantierpro_custom_objectives',
}

function loadFromStorage(key, defaultValue) {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : defaultValue
  } catch {
    return defaultValue
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('Storage error:', e)
  }
}

const DEFAULT_PROFILE = {
  company_name: 'Mon Entreprise',
  siret: '',
  adresse: '',
  email: '',
  telephone: '',
  tva: '',
  iban: '',
  banque: '',
  cgv: '- Acompte de 30% \u00e0 la commande\n- Solde \u00e0 la livraison\n- D\u00e9lai de paiement : 30 jours',
}

const DEFAULT_TEMPLATES = [
  {
    id: 'tpl-plomberie',
    name: 'Plomberie - R\u00e9novation salle de bain',
    metier: 'plomberie',
    lignes: [
      { ref: 'PLO-001', label: 'Pose WC suspendu', qty: 1, unit: 'forfait', priceHT: 450, tva: 10 },
      { ref: 'PLO-005', label: 'Pose lavabo sur colonne', qty: 1, unit: 'u', priceHT: 220, tva: 10 },
      { ref: 'PLO-006', label: 'Installation douchette italienne', qty: 1, unit: 'forfait', priceHT: 780, tva: 10 },
    ],
  },
  {
    id: 'tpl-electricite',
    name: 'Electricit\u00e9 - Mise aux normes',
    metier: 'electricite',
    lignes: [
      { ref: 'ELE-003', label: 'Tableau \u00e9lectrique 2 rang\u00e9es', qty: 1, unit: 'u', priceHT: 420, tva: 10 },
      { ref: 'ELE-004', label: 'Mise aux normes NF C15-100', qty: 1, unit: 'forfait', priceHT: 1450, tva: 10 },
      { ref: 'ELE-002', label: 'Point lumineux complet', qty: 6, unit: 'u', priceHT: 85, tva: 10 },
    ],
  },
  {
    id: 'tpl-peinture',
    name: 'Peinture - Pi\u00e8ce compl\u00e8te',
    metier: 'peinture',
    lignes: [
      { ref: 'PEI-003', label: 'Pr\u00e9paration support (enduit)', qty: 50, unit: 'm\u00b2', priceHT: 14, tva: 10 },
      { ref: 'PEI-001', label: 'Peinture mur int\u00e9rieur (au m\u00b2)', qty: 50, unit: 'm\u00b2', priceHT: 22, tva: 10 },
      { ref: 'PEI-002', label: 'Peinture plafond (au m\u00b2)', qty: 20, unit: 'm\u00b2', priceHT: 26, tva: 10 },
    ],
  },
]

export function DataProvider({ children }) {
  const [user, setUser] = useState(() => loadFromStorage(STORAGE_KEYS.user, null))
  const [devis, setDevis] = useState(() => loadFromStorage(STORAGE_KEYS.devis, []))
  const [factures, setFactures] = useState(() => loadFromStorage(STORAGE_KEYS.factures, []))
  const [profile, setProfile] = useState(() => loadFromStorage(STORAGE_KEYS.profile, null))
  const [plan, setPlan] = useState(() => loadFromStorage(STORAGE_KEYS.plan, 'free'))
  const [clients, setClients] = useState(() => loadFromStorage(STORAGE_KEYS.clients, []))
  const [templates, setTemplates] = useState(() => loadFromStorage(STORAGE_KEYS.templates, DEFAULT_TEMPLATES))
  const [activity, setActivity] = useState(() => loadFromStorage(STORAGE_KEYS.activity, []))
  const [customObjectives, setCustomObjectives] = useState(() => loadFromStorage(STORAGE_KEYS.customObjectives, []))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        const currentUser = await getCurrentUser()
        if (!mounted) return

        if (currentUser) {
          setUser(currentUser)
          saveToStorage(STORAGE_KEYS.user, currentUser)
          try {
            const [userDevis, userFactures, userProfile] = await Promise.all([
              fetchDevis(currentUser.id),
              fetchFactures(currentUser.id),
              apiGetProfile(currentUser.id),
            ])
            if (mounted) {
              if (userDevis?.length > 0) {
                setDevis(userDevis)
                saveToStorage(STORAGE_KEYS.devis, userDevis)
              }
              if (userFactures?.length > 0) {
                setFactures(userFactures)
                saveToStorage(STORAGE_KEYS.factures, userFactures)
              }
              if (userProfile) {
                setProfile(userProfile)
                saveToStorage(STORAGE_KEYS.profile, userProfile)
              }
            }
          } catch (err) {
            console.warn('Supabase offline mode:', err.message)
          }
        }
      } catch (err) {
        console.warn('Init:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user || null)
        if (session?.user) saveToStorage(STORAGE_KEYS.user, session.user)
        else localStorage.removeItem(STORAGE_KEYS.user)
      }
    })

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  useEffect(() => { saveToStorage(STORAGE_KEYS.devis, devis) }, [devis])
  useEffect(() => { saveToStorage(STORAGE_KEYS.factures, factures) }, [factures])
  useEffect(() => { saveToStorage(STORAGE_KEYS.profile, profile) }, [profile])
  useEffect(() => { saveToStorage(STORAGE_KEYS.plan, plan) }, [plan])
  useEffect(() => { saveToStorage(STORAGE_KEYS.clients, clients) }, [clients])
  useEffect(() => { saveToStorage(STORAGE_KEYS.templates, templates) }, [templates])
  useEffect(() => { saveToStorage(STORAGE_KEYS.activity, activity.slice(0, 50)) }, [activity])
  useEffect(() => { saveToStorage(STORAGE_KEYS.customObjectives, customObjectives) }, [customObjectives])

  // === ACTIVITY LOG ===
  function logActivity(type, label, metadata = {}) {
    setActivity(prev => [{
      id: crypto.randomUUID(),
      type,
      label,
      metadata,
      created_at: new Date().toISOString(),
    }, ...prev].slice(0, 50))
  }

  // === DEVIS ===
  async function addDevis(newDevis) {
    const id = newDevis.id || crypto.randomUUID()
    const numero = newDevis.numero || `DEV-${new Date().getFullYear()}-${String(devis.length + 1).padStart(3, '0')}`
    const fullDevis = {
      id,
      numero,
      statut: 'en_attente',
      date_emission: new Date().toISOString().slice(0, 10),
      date_validite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      ...newDevis,
    }
    setDevis(prev => [fullDevis, ...prev])

    // Auto-cr\u00e9e le client s'il n'existe pas
    if (fullDevis.client_nom) {
      upsertClientFromDevis(fullDevis)
    }

    logActivity('devis_created', `Devis ${numero} cr\u00e9\u00e9 pour ${fullDevis.client_nom}`)

    if (user) {
      try { await apiCreateDevis(fullDevis) } catch (e) { console.warn('Sync BDD:', e) }
    }
    return fullDevis
  }

  async function updateDevis(id, updates) {
    setDevis(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d))
    if (updates.statut) {
      const d = devis.find(x => x.id === id)
      if (d) logActivity('devis_status', `Devis ${d.numero} -> ${updates.statut}`)
    }
    if (user) {
      try { await apiUpdateDevis(id, updates) } catch (e) { console.warn('Sync BDD:', e) }
    }
  }

  async function deleteDevis(id) {
    const d = devis.find(x => x.id === id)
    setDevis(prev => prev.filter(x => x.id !== id))
    if (d) logActivity('devis_deleted', `Devis ${d.numero} supprim\u00e9`)
    if (user) {
      try { await apiDeleteDevis(id) } catch (e) { console.warn('Sync BDD:', e) }
    }
  }

  // === FACTURES ===
  async function addFacture(newFacture) {
    const id = newFacture.id || crypto.randomUUID()
    const numero = newFacture.numero || `FAC-${new Date().getFullYear()}-${String(factures.length + 1).padStart(3, '0')}`
    const fullFacture = {
      id,
      numero,
      statut: 'en_attente',
      date_emission: new Date().toISOString().slice(0, 10),
      date_echeance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      ...newFacture,
    }
    setFactures(prev => [fullFacture, ...prev])
    logActivity('facture_created', `Facture ${numero} cr\u00e9\u00e9e pour ${fullFacture.client_nom}`)
    if (user) {
      try { await apiCreateFacture(fullFacture) } catch (e) { console.warn('Sync BDD:', e) }
    }
    return fullFacture
  }

  async function updateFacture(id, updates) {
    setFactures(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f))
    if (user) {
      try { await apiUpdateFacture(id, updates) } catch (e) {}
    }
  }

  // === CLIENTS ===
  function upsertClientFromDevis(devis) {
    if (!devis.client_nom) return
    setClients(prev => {
      const existing = prev.find(c =>
        c.nom?.toLowerCase() === devis.client_nom?.toLowerCase() ||
        (devis.client_email && c.email === devis.client_email)
      )
      if (existing) {
        // Met \u00e0 jour
        return prev.map(c => c.id === existing.id ? {
          ...c,
          email: devis.client_email || c.email,
          telephone: devis.client_tel || c.telephone,
          adresse: devis.client_adresse || c.adresse,
          derniere_interaction: new Date().toISOString(),
          total_devis: (c.total_devis || 0) + 1,
        } : c)
      } else {
        // Cr\u00e9e
        return [{
          id: crypto.randomUUID(),
          nom: devis.client_nom,
          email: devis.client_email || '',
          telephone: devis.client_tel || '',
          adresse: devis.client_adresse || '',
          created_at: new Date().toISOString(),
          derniere_interaction: new Date().toISOString(),
          total_devis: 1,
        }, ...prev]
      }
    })
  }

  function addClient(client) {
    const newClient = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      total_devis: 0,
      ...client,
    }
    setClients(prev => [newClient, ...prev])
    logActivity('client_created', `Client ${client.nom} ajout\u00e9`)
    return newClient
  }

  function updateClient(id, updates) {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
  }

  function deleteClient(id) {
    setClients(prev => prev.filter(c => c.id !== id))
  }

  // === TEMPLATES ===
  function addTemplate(template) {
    const newTpl = {
      id: crypto.randomUUID(),
      ...template,
    }
    setTemplates(prev => [newTpl, ...prev])
  }

  function deleteTemplate(id) {
    setTemplates(prev => prev.filter(t => t.id !== id))
  }

  // === PROFIL ===
  async function saveProfile(newProfile) {
    setProfile(newProfile)
    if (user) {
      try { await apiUpsertProfile(newProfile) } catch (e) { console.warn('Sync BDD:', e) }
    }
  }

  function getProfile() {
    return profile || { ...DEFAULT_PROFILE, email: user?.email || '' }
  }

  // === AUTH ===
  async function signOut() {
    try { await supabase.auth.signOut() } catch (e) {}
    setUser(null)
    // On garde les devis/factures en local
    setPlan('free')
    localStorage.removeItem(STORAGE_KEYS.user)
    localStorage.removeItem(STORAGE_KEYS.plan)
  }

  function upgradePlan(newPlan) {
    setPlan(newPlan)
    logActivity('plan_upgraded', `Plan mis \u00e0 jour : ${newPlan}`)
  }

  function clearAllData() {
    setDevis([])
    setFactures([])
    setClients([])
    setActivity([])
    localStorage.removeItem(STORAGE_KEYS.devis)
    localStorage.removeItem(STORAGE_KEYS.factures)
    localStorage.removeItem(STORAGE_KEYS.clients)
    localStorage.removeItem(STORAGE_KEYS.activity)
  }

  // === OBJECTIFS PERSONNALISÉS ===
  function addCustomObjective(obj) {
    setCustomObjectives(prev => [...prev, obj])
  }

  function removeCustomObjective(id) {
    setCustomObjectives(prev => prev.filter(o => o.id !== id))
  }

  const value = {
    user, loading,
    devis, factures, profile, plan,
    clients, templates, activity, customObjectives,
    addDevis, updateDevis, deleteDevis,
    addFacture, updateFacture,
    addClient, updateClient, deleteClient,
    addTemplate, deleteTemplate,
    addCustomObjective, removeCustomObjective,
    saveProfile, getProfile,
    signOut, upgradePlan, clearAllData,
    isPro: plan === 'pro' || plan === 'business',
    isBusiness: plan === 'business',
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
