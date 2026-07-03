// Client Supabase pour ChantierPro
// Doc : https://supabase.com/docs
// ⚠️ Ces clés sont des EXEMPLES - à remplacer par les tiennes

import { createClient } from '@supabase/supabase-js'

// Configuration depuis .env
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://YOUR-PROJECT.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR-ANON-KEY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// ============================================
// AUTH HELPERS
// ============================================

export async function signUp({ email, password, companyName, siret }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        company_name: companyName,
        siret: siret,
        plan: 'starter',
      },
    },
  })
  if (error) throw error
  return data
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) return null
  return user
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// ============================================
// DEVIS CRUD
// ============================================

export async function fetchDevis(userId) {
  const { data, error } = await supabase
    .from('devis')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function createDevis(devis) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('devis')
    .insert([{ ...devis, user_id: user.id }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateDevis(id, updates) {
  const { data, error } = await supabase
    .from('devis')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteDevis(id) {
  const { error } = await supabase.from('devis').delete().eq('id', id)
  if (error) throw error
}

// ============================================
// FACTURES CRUD
// ============================================

export async function fetchFactures(userId) {
  const { data, error } = await supabase
    .from('factures')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function createFacture(facture) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('factures')
    .insert([{ ...facture, user_id: user.id }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateFacture(id, updates) {
  const { data, error } = await supabase
    .from('factures')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ============================================
// PROFIL ENTREPRISE
// ============================================

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function upsertProfile(profile) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ ...profile, user_id: user.id, updated_at: new Date().toISOString() })
    .select()
    .single()
  if (error) throw error
  return data
}

// ============================================
// ABONNEMENTS / USAGE
// ============================================

export async function getUserPlan(userId) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()
  if (error && error.code !== 'PGRST116') return null
  return data
}

export async function getUsageThisMonth(userId) {
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count, error } = await supabase
    .from('devis')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfMonth.toISOString())
  if (error) return 0
  return count || 0
}

export async function canCreateDevis(userId) {
  const plan = await getUserPlan(userId)
  const usage = await getUsageThisMonth(userId)

  // Limites par plan
  const limits = {
    free: 2,        // 2 devis/mois
    starter: 999,   // illimité
    pro: 999,
    business: 999,
  }
  const currentPlan = plan?.plan || 'free'
  return usage < (limits[currentPlan] || 2)
}
