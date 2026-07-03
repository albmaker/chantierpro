import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, getCurrentUser } from '../lib/supabase'
import {
  fetchDevis, createDevis as apiCreateDevis, updateDevis as apiUpdateDevis, deleteDevis as apiDeleteDevis,
  fetchFactures, createFacture as apiCreateFacture, updateFacture as apiUpdateFacture,
  getProfile as apiGetProfile, upsertProfile as apiUpsertProfile
} from '../lib/supabase'

const DataContext = createContext(null)

// === ISOLATION PAR USER (sécurité) ===
// Chaque user a ses propres clés de stockage
function getStorageKey(baseKey, userId) {
  if (!userId) return null // Pas d'user = pas de cache
  return `chantierpro_${userId}_${baseKey}`
}

function loadFromStorage(baseKey, userId, defaultValue) {
  if (!userId) return defaultValue
  const key = getStorageKey(baseKey, userId)
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : defaultValue
  } catch {
    return defaultValue
  }
}

function saveToStorage(baseKey, userId, value) {
  if (!userId) return
  const key = getStorageKey(baseKey, userId)
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('Storage error:', e)
  }
}

function clearAllUserData(userId) {
  if (!userId) return
  const baseKeys = ['devis', 'factures', 'profile', 'plan', 'clients', 'templates', 'activity', 'customObjectives']
  baseKeys.forEach(bk => {
    const key = getStorageKey(bk, userId)
    if (key) localStorage.removeItem(key)
  })
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
  cgv: '- Acompte de 30% à la commande\n- Solde à la livraison\n- Délai de paiement : 30 jours',
}

const DEFAULT_TEMPLATES = [
  {
    id: 'tpl-plomberie',
    name: 'Plomberie - Rénovation salle de bain',
    metier: 'plomberie',
    lignes: [
      { ref: 'PLO-001', label: 'Pose WC suspendu', qty: 1, unit: 'forfait', priceHT: 450, tva: 10 },
      { ref: 'PLO-005', label: 'Pose lavabo sur colonne', qty: 1, unit: 'u', priceHT: 220, tva: 10 },
      { ref: 'PLO-006', label: 'Installation douchette italienne', qty: 1, unit: 'forfait', priceHT: 780, tva: 10 },
    ],
  },
  {
    id: 'tpl-electricite',
    name: 'Electricité - Mise aux normes',
    metier: 'electricite',
    lignes: [
      { ref: 'ELE-003', label: 'Tableau électrique 2 rangées', qty: 1, unit: 'u', priceHT: 420, tva: 10 },
      { ref: 'ELE-004', label: 'Mise aux normes NF C15-100', qty: 1, unit: 'forfait', priceHT: 1450, tva: 10 },
      { ref: 'ELE-002', label: 'Point lumineux complet', qty: 6, unit: 'u', priceHT: 85, tva: 10 },
    ],
  },
  {
    id: 'tpl-peinture',
    name: 'Peinture - Pièce complète',
    metier: 'peinture',
    lignes: [
      { ref: 'PEI-003', label: 'Préparation support (enduit)', qty: 50, unit: 'm²', priceHT: 14, tva: 10 },
      { ref: 'PEI-001', label: 'Peinture mur intérieur (au m²)', qty: 50, unit: 'm²', priceHT: 22, tva: 10 },
      { ref: 'PEI-002', label: 'Peinture plafond (au m²)', qty: 20, unit: 'm²', priceHT: 26, tva: 10 },
    ],
  },
]

export function DataProvider({ children }) {
  // === ÉTAT INITIAL : TOUT VIDE ===
  // On charge RIEN tant qu'on a pas l'user connecté
  const [user, setUser] = useState(null)
  const [devis, setDevis] = useState([])
  const [factures, setFactures] = useState([])
  const [profile, setProfile] = useState(null)
  const [plan, setPlan] = useState('free')
  const [clients, setClients] = useState([])
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES)
  const [activity, setActivity] = useState([])
  const [customObjectives, setCustomObjectives] = useState([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null) // ID stable pour le cache

  // === CHARGEMENT INITIAL : uniquement après login ===
  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        const currentUser = await getCurrentUser()
        if (!mounted) return

        if (currentUser) {
          const uid = currentUser.id
          setUser(currentUser)
          setUserId(uid)
          // Charger depuis le localStorage de CET user
          setDevis(loadFromStorage('devis', uid, []))
          setFactures(loadFromStorage('factures', uid, []))
          setProfile(loadFromStorage('profile', uid, null))
          setPlan(loadFromStorage('plan', uid, 'free'))
          setClients(loadFromStorage('clients', uid, []))
          setTemplates(loadFromStorage('templates', uid, DEFAULT_TEMPLATES))
          setActivity(loadFromStorage('activity', uid, []))
          setCustomObjectives(loadFromStorage('customObjectives', uid, []))

          // Tenter de sync avec Supabase
          try {
            const [userDevis, userFactures, userProfile] = await Promise.all([
              fetchDevis(uid),
              fetchFactures(uid),
              apiGetProfile(uid),
            ])
            if (mounted) {
              if (userDevis?.length > 0) {
                setDevis(userDevis)
                saveToStorage('devis', uid, userDevis)
              }
              if (userFactures?.length > 0) {
                setFactures(userFactures)
                saveToStorage('factures', uid, userFactures)
              }
              if (userProfile) {
                setProfile(userProfile)
                saveToStorage('profile', uid, userProfile)
              }
            }
          } catch (err) {
            console.warn('Supabase offline:', err.message)
          }
        }
      } catch (err) {
        console.warn('Init error:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    init()

    // === LISTENER AUTH : reset complet au login/logout ===
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return

      if (event === 'SIGNED_IN' && session?.user) {
        const uid = session.user.id
        setUser(session.user)
        setUserId(uid)
        // Charger les données du NOUVEAU user
        setDevis(loadFromStorage('devis', uid, []))
        setFactures(loadFromStorage('factures', uid, []))
        setProfile(loadFromStorage('profile', uid, null))
        setPlan(loadFromStorage('plan', uid, 'free'))
        setClients(loadFromStorage('clients', uid, []))
        setTemplates(loadFromStorage('templates', uid, DEFAULT_TEMPLATES))
        setActivity(loadFromStorage('activity', uid, []))
        setCustomObjectives(loadFromStorage('customObjectives', uid, []))
      } else if (event === 'SIGNED_OUT') {
        // RESET TOTAL au logout
        setUser(null)
        setUserId(null)
        setDevis([])
        setFactures([])
        setProfile(null)
        setPlan('free')
        setClients([])
        setTemplates(DEFAULT_TEMPLATES)
        setActivity([])
        setCustomObjectives([])
      }
    })

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  // === PERSISTANCE AUTOMATIQUE (uniquement si user connecté) ===
  useEffect(() => { if (userId) saveToStorage('devis', userId, devis) }, [devis, userId])
  useEffect(() => { if (userId) saveToStorage('factures', userId, factures) }, [factures, userId])
  useEffect(() => { if (userId) saveToStorage('profile', userId, profile) }, [profile, userId])
  useEffect(() => { if (userId) saveToStorage('plan', userId, plan) }, [plan, userId])
  useEffect(() => { if (userId) saveToStorage('clients', userId, clients) }, [clients, userId])
  useEffect(() => { if (userId) saveToStorage('templates', userId, templates) }, [templates, userId])
  useEffect(() => { if (userId) saveToStorage('activity', userId, activity.slice(0, 50)) }, [activity, userId])
  useEffect(() => { if (userId) saveToStorage('customObjectives', userId, customObjectives) }, [customObjectives, userId])

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
    if (fullDevis.client_nom) upsertClientFromDevis(fullDevis)
    logActivity('devis_created', `Devis ${numero} créé pour ${fullDevis.client_nom}`)
    if (user) {
      try { await apiCreateDevis(fullDevis) } catch (e) { console.warn('Sync BDD:', e) }
    }
    return fullDevis
  }

  async function updateDevis(id, updates) {
    setDevis(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d))
    if (updates.statut) {
      const d = devis.find(x => x.id === id)
      if (d) logActivity('devis_status', `Devis ${d.numero} → ${updates.statut}`)
    }
    if (user) {
      try { await apiUpdateDevis(id, updates) } catch (e) { console.warn('Sync BDD:', e) }
    }
  }

  async function deleteDevis(id) {
    const d = devis.find(x => x.id === id)
    setDevis(prev => prev.filter(x => x.id !== id))
    if (d) logActivity('devis_deleted', `Devis ${d.numero} supprimé`)
    if (user) {
      try { await apiDeleteDevis(id) } catch (e) { console.warn('Sync BDD:', e) }
    }
  }

  // === FACTURES ===
  async function addFacture(newFacture) {
    const id = newFacture.id || crypto.randomUUID()
    const numero = newFacture.numero || `FAC-${new Date().getFullYear()}-${String(factures.length + 1).padStart(3, '0')}`
    const fullFacture = {
      id, numero,
      statut: 'en_attente',
      date_emission: new Date().toISOString().slice(0, 10),
      date_echeance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      ...newFacture,
    }
    setFactures(prev => [fullFacture, ...prev])
    logActivity('facture_created', `Facture ${numero} créée pour ${fullFacture.client_nom}`)
    if (user) {
      try { await apiCreateFacture(fullFacture) } catch (e) { console.warn('Sync BBD:', e) }
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
  function upsertClientFromDevis(d) {
    if (!d.client_nom) return
    setClients(prev => {
      const existing = prev.find(c =>
        c.nom?.toLowerCase() === d.client_nom?.toLowerCase() ||
        (d.client_email && c.email === d.client_email)
      )
      if (existing) {
        return prev.map(c => c.id === existing.id ? {
          ...c,
          email: d.client_email || c.email,
          telephone: d.client_tel || c.telephone,
          adresse: d.client_adresse || c.adresse,
          derniere_interaction: new Date().toISOString(),
          total_devis: (c.total_devis || 0) + 1,
        } : c)
      } else {
        return [{
          id: crypto.randomUUID(),
          nom: d.client_nom,
          email: d.client_email || '',
          telephone: d.client_tel || '',
          adresse: d.client_adresse || '',
          created_at: new Date().toISOString(),
          derniere_interaction: new Date().toISOString(),
          total_devis: 1,
        }, ...prev]
      }
    })
  }

  function addClient(client) {
    const newClient = { id: crypto.randomUUID(), created_at: new Date().toISOString(), total_devis: 0, ...client }
    setClients(prev => [newClient, ...prev])
    logActivity('client_created', `Client ${client.nom} ajouté`)
    return newClient
  }

  function updateClient(id, updates) { setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c)) }
  function deleteClient(id) { setClients(prev => prev.filter(c => c.id !== id)) }

  function addTemplate(template) {
    setTemplates(prev => [{ id: crypto.randomUUID(), ...template }, ...prev])
  }
  function deleteTemplate(id) { setTemplates(prev => prev.filter(t => t.id !== id)) }

  async function saveProfile(newProfile) {
    setProfile(newProfile)
    if (user) {
      try { await apiUpsertProfile(newProfile) } catch (e) { console.warn('Sync BDD:', e) }
    }
  }

  function getProfile() {
    return profile || { ...DEFAULT_PROFILE, email: user?.email || '' }
  }

  // === AUTH : Logout sécurisé ===
  async function signOut() {
    if (!confirm('Te déconnecter ? Tes données resteront sauvegardées sur cet appareil.')) return
    try { await supabase.auth.signOut() } catch (e) {}
    // Reset complet du state (déjà fait par le listener, mais on double)
    setUser(null)
    setUserId(null)
    setDevis([])
    setFactures([])
    setProfile(null)
    setPlan('free')
    setClients([])
    setActivity([])
    setCustomObjectives([])
  }

  // === RESET COMPLET (RGPD) ===
  function clearAllData() {
    if (!confirm('⚠️ ATTENTION : Supprimer TOUTES tes données ? Cette action est irréversible.')) return
    if (userId) {
      clearAllUserData(userId)
    }
    setDevis([])
    setFactures([])
    setClients([])
    setActivity([])
  }

  function upgradePlan(newPlan) {
    setPlan(newPlan)
    logActivity('plan_upgraded', `Plan mis à jour : ${newPlan}`)
  }

  function addCustomObjective(obj) { setCustomObjectives(prev => [...prev, obj]) }
  function removeCustomObjective(id) { setCustomObjectives(prev => prev.filter(o => o.id !== id)) }

  const value = {
    user, loading, userId,
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
