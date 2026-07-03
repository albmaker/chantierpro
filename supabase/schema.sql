-- ============================================
-- SCHEMA SUPABASE pour ChantierPro
-- À exécuter dans l'éditeur SQL de ton dashboard Supabase
-- ============================================

-- 1. Table des profils utilisateurs
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL DEFAULT 'Mon Entreprise',
  siret TEXT,
  adresse TEXT,
  email TEXT,
  telephone TEXT,
  tva_intra TEXT,
  iban TEXT,
  banque TEXT,
  cgv TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. Table des devis
CREATE TABLE IF NOT EXISTS public.devis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  numero TEXT NOT NULL, -- ex: DEV-2026-001
  client_nom TEXT NOT NULL,
  client_email TEXT,
  client_tel TEXT,
  client_adresse TEXT,
  date_emission DATE NOT NULL DEFAULT CURRENT_DATE,
  date_validite DATE,
  metier TEXT, -- plomberie, electricite, etc.
  lignes JSONB NOT NULL DEFAULT '[]', -- tableau d'ouvrages
  statut TEXT NOT NULL DEFAULT 'en_attente', -- en_attente, accepte, refuse, expire
  notes TEXT,
  total_ht NUMERIC(10,2),
  total_ttc NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_devis_user_id ON public.devis(user_id);
CREATE INDEX idx_devis_statut ON public.devis(statut);
CREATE INDEX idx_devis_created_at ON public.devis(created_at DESC);

-- 3. Table des factures
CREATE TABLE IF NOT EXISTS public.factures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  devis_id UUID REFERENCES public.devis(id) ON DELETE SET NULL,
  numero TEXT NOT NULL,
  client_nom TEXT NOT NULL,
  client_email TEXT,
  client_adresse TEXT,
  date_emission DATE NOT NULL DEFAULT CURRENT_DATE,
  date_echeance DATE,
  lignes JSONB NOT NULL DEFAULT '[]',
  statut TEXT NOT NULL DEFAULT 'en_attente', -- en_attente, payee, en_retard
  date_paiement DATE,
  total_ttc NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_factures_user_id ON public.factures(user_id);
CREATE INDEX idx_factures_statut ON public.factures(statut);

-- 4. Table des abonnements
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free', -- free, starter, pro, business
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 5. Table d'usage (analytics)
CREATE TABLE IF NOT EXISTS public.usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'devis_created', 'facture_created', 'ai_scan', etc.
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_usage_user_id ON public.usage_events(user_id);
CREATE INDEX idx_usage_created_at ON public.usage_events(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS) - CRITIQUE
-- Chaque user ne peut voir que SES données
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.factures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;

-- Profils : user peut lire/modifier uniquement son profil
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Devis : user peut CRUD ses devis
CREATE POLICY "Users can CRUD own devis" ON public.devis
  FOR ALL USING (auth.uid() = user_id);

-- Factures : user peut CRUD ses factures
CREATE POLICY "Users can CRUD own factures" ON public.factures
  FOR ALL USING (auth.uid() = user_id);

-- Subscriptions : user peut lire sa subscription
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Usage : user peut insérer/lire ses events
CREATE POLICY "Users can insert own usage" ON public.usage_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own usage" ON public.usage_events
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- FONCTIONS UTILES
-- ============================================

-- Générer un numéro de devis automatique
CREATE OR REPLACE FUNCTION generate_devis_numero()
RETURNS TEXT AS $$
DECLARE
  year TEXT;
  next_num INTEGER;
BEGIN
  year := TO_CHAR(CURRENT_DATE, 'YYYY');
  SELECT COALESCE(MAX(CAST(SPLIT_PART(numero, '-', 3) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.devis
  WHERE numero LIKE 'DEV-' || year || '-%';
  RETURN 'DEV-' || year || '-' || LPAD(next_num::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_facture_numero()
RETURNS TEXT AS $$
DECLARE
  year TEXT;
  next_num INTEGER;
BEGIN
  year := TO_CHAR(CURRENT_DATE, 'YYYY');
  SELECT COALESCE(MAX(CAST(SPLIT_PART(numero, '-', 3) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.factures
  WHERE numero LIKE 'FAC-' || year || '-%';
  RETURN 'FAC-' || year || '-' || LPAD(next_num::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger pour auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_devis_updated_at
  BEFORE UPDATE ON public.devis
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_factures_updated_at
  BEFORE UPDATE ON public.factures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger pour créer un profil automatiquement à l'inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, company_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'company_name', 'Mon Entreprise'), NEW.email);
  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
