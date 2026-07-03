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

export function DataProvider({ children }) {
  const [user, setUser] = useState(() => loadFromStorage(STORAGE_KEYS.user, null))
  const [devis, setDevis] = useState(() => loadFromStorage(STORAGE_KEYS.devis, []))
  const [factures, setFactures] = useState(() => loadFromStorage(STORAGE_KEYS.factures, []))
  const [profile, setProfile] = useState(() => loadFromStorage(STORAGE_KEYS.profile, null))
  const [plan, setPlan] = useState(() => loadFromStorage(STORAGE_KEYS.plan, 'free'))
  const [loading, setLoading] = useState(true)

  // Initial load : récupère l'user et ses données
  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        const currentUser = await getCurrentUser()
        if (!mounted) return

        if (currentUser) {
          setUser(currentUser)
          saveToStorage(STORAGE_KEYS.user, currentUser)

          // Tente de charger depuis Supabase
          try {
            const [userDevis, userFactures, userProfile] = await Promise.all([
              fetchDevis(currentUser.id),
              fetchFactures(currentUser.id),
              apiGetProfile(currentUser.id),
            ])
            if (mounted) {
              if (userDevis.length > 0) {
                setDevis(userDevis)
                saveToStorage(STORAGE_KEYS.devis, userDevis)
              }
              if (userFactures.length > 0) {
                setFactures(userFactures)
                saveToStorage(STORAGE_KEYS.factures, userFactures)
              }
              if (userProfile) {
                setProfile(userProfile)
                saveToStorage(STORAGE_KEYS.profile, userProfile)
              }
            }
          } catch (err) {
            console.warn('Supabase fetch échoué, mode local uniquement:', err)
          }
        }
      } catch (err) {
        console.warn('Init:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    init()

    // Listen auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user || null)
        if (session?.user) {
          saveToStorage(STORAGE_KEYS.user, session.user)
        } else {
          localStorage.removeItem(STORAGE_KEYS.user)
        }
      }
    })

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  // Persistance auto
  useEffect(() => { saveToStorage(STORAGE_KEYS.devis, devis) }, [devis])
  useEffect(() => { saveToStorage(STORAGE_KEYS.factures, factures) }, [factures])
  useEffect(() => { saveToStorage(STORAGE_KEYS.profile, profile) }, [profile])
  useEffect(() => { saveToStorage(STORAGE_KEYS.plan, plan) }, [plan])

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

    if (user) {
      try { await apiCreateDevis(fullDevis) } catch (e) { console.warn('Sync BDD:', e) }
    }
    return fullDevis
  }

  async function updateDevis(id, updates) {
    setDevis(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d))
    if (user) {
      try { await apiUpdateDevis(id, updates) } catch (e) { console.warn('Sync BDD:', e) }
    }
  }

  async function deleteDevis(id) {
    setDevis(prev => prev.filter(d => d.id !== id))
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
    if (user) {
      try { await apiCreateFacture(fullFacture) } catch (e) { console.warn('Sync BDD:', e) }
    }
    return fullFacture
  }

  async function updateFacture(id, updates) {
    setFactures(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f))
  }

  // === PROFIL ===
  async function saveProfile(newProfile) {
    setProfile(newProfile)
    if (user) {
      try { await apiUpsertProfile(newProfile) } catch (e) { console.warn('Sync BDD:', e) }
    }
  }

  function getProfile() {
    return profile || {
      company_name: 'Mon Entreprise',
      siret: '',
      adresse: '',
      email: user?.email || '',
      telephone: '',
      tva: '',
      iban: '',
      banque: '',
      cgv: 'Conditions générales de vente standard.',
    }
  }

  // === AUTH ===
  async function signOut() {
    try { await supabase.auth.signOut() } catch (e) {}
    setUser(null)
    setDevis([])
    setFactures([])
    setProfile(null)
    setPlan('free')
    localStorage.removeItem(STORAGE_KEYS.user)
    localStorage.removeItem(STORAGE_KEYS.devis)
    localStorage.removeItem(STORAGE_KEYS.factures)
    localStorage.removeItem(STORAGE_KEYS.profile)
    localStorage.removeItem(STORAGE_KEYS.plan)
  }

  // === PLAN ===
  function upgradePlan(newPlan) {
    setPlan(newPlan)
  }

  const value = {
    user,
    loading,
    devis,
    factures,
    profile,
    plan,
    addDevis,
    updateDevis,
    deleteDevis,
    addFacture,
    updateFacture,
    saveProfile,
    getProfile,
    signOut,
    upgradePlan,
    // Helpers
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
