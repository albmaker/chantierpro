# 🏗️ ChantierPro v2.0 — Devis & Factures IA pour artisans BTP

**Le SaaS complet qui fait tout : IA, auth, paiements, blog SEO, RGPD, FE 2026.**

---

## 🎯 Pitch (1 ligne)

Logiciel de devis et factures pour artisans du bâtiment avec **scan IA Mistral**, **auth Supabase**, **paiements Stripe** et **blog SEO intégré** — le tout pour 0€/mois jusqu'à 100 utilisateurs.

---

## ✨ Fonctionnalités V2 (complètes)

| Feature | Techno | Coût |
|---|---|---|
| 📸 **Scan IA de chantier** | Mistral Pixtral-12b | 0,0002€/analyse |
| 🔐 **Auth + BDD** | Supabase (PostgreSQL) | Gratuit jusqu'à 500MB |
| 💳 **Abonnements** | Stripe Checkout (19/39/79€) | 2,9% + 0,25€/tx |
| 📄 **PDF conformes FE 2026** | jsPDF + autoTable | Gratuit |
| 📚 **40 ouvrages BTP** pré-remplis | JSON statique | Gratuit |
| 🏷️ **Multi-TVA auto** (0/5,5/10/20) | Logique custom | Gratuit |
| 📱 **Mobile-first responsive** | Tailwind CSS | Gratuit |
| 🎨 **Design dark mode pro** | Custom UI | Gratuit |
| 📝 **Blog SEO 6 articles** | React Router | Gratuit |
| 🤖 **Structured data JSON-LD** | Schema.org | Gratuit |
| 🗺️ **Sitemap + robots.txt** | Statique | Gratuit |

---

## 🚀 Démarrage

```bash
npm install
npm run dev      # → http://localhost:5173
npm run build    # → production dans dist/
```

---

## 📦 Structure complète

```
chantierpro/
├── src/
│   ├── components/          # Header, BottomNav, DevisCard, StatCard
│   ├── pages/               # 10 pages (Landing, Auth, Dashboard, Pricing, Blog...)
│   ├── data/
│   │   ├── ouvrages.js      # 40 ouvrages BTP
│   │   └── blogPosts.js     # 6 articles SEO (2000+ mots)
│   ├── lib/
│   │   ├── pdfGenerator.js  # PDF pro avec mentions FE 2026
│   │   ├── mistralAI.js     # Client Mistral Vision
│   │   ├── supabase.js      # Client Supabase + CRUD
│   │   └── stripe.js        # Config Stripe + helpers
│   ├── App.jsx              # Routing + ProtectedRoute
│   ├── main.jsx             # Entry point
│   └── index.css            # Tailwind + thème
├── api/                     # Vercel Serverless Functions
│   ├── mistral-analyze.js   # Proxy sécurisé Mistral
│   ├── stripe-checkout.js   # Création session Stripe
│   ├── stripe-portal.js     # Portail client Stripe
│   └── stripe-webhook.js    # Webhook Stripe → BDD
├── supabase/
│   └── schema.sql           # Schéma BDD + RLS + triggers
├── public/
│   ├── logo.svg
│   ├── robots.txt
│   └── sitemap.xml
├── index.html               # SEO meta + JSON-LD
├── .env.example             # Template variables
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── vercel.json
```

---

## 🌍 Routes disponibles

| Route | Description | Auth |
|---|---|---|
| `/` | Landing page | ❌ |
| `/auth` | Login / Signup | ❌ |
| `/pricing` | Page tarifs avec Stripe | ❌ |
| `/blog` | Liste des 6 articles SEO | ❌ |
| `/blog/:slug` | Article complet | ❌ |
| `/dashboard` | Tableau de bord | ✅ |
| `/devis` | Liste des devis | ✅ |
| `/devis/:id` | Détail d'un devis | ✅ |
| `/nouveau-devis` | Création devis (avec pré-remplissage IA) | ✅ |
| `/factures` | Liste des factures | ✅ |
| `/scanner` | Scan IA Mistral | ✅ |
| `/parametres` | Profil + bibliothèque + abo | ✅ |

---

## 🛠️ Stack technique

**Frontend**
- React 18.3 + Vite 5.4
- React Router 6.26
- Tailwind CSS 3.4
- Lucide React (icônes)

**Backend (Serverless)**
- Vercel Functions (Node.js)
- Supabase (PostgreSQL + Auth + RLS)
- Mistral AI (Pixtral-12b vision)
- Stripe (Checkout + Webhooks + Portal)

**Outils**
- jsPDF + jspdf-autotable (PDF)
- Schema.org JSON-LD (SEO)

---

## 💰 Modèle économique

| Plan | Prix/mois | Inclus |
|---|---|---|
| **Free** | 0€ | 2 devis/mois, PDF, FE 2026 |
| **Starter** | 19€ | Devis illimités, bibliothèque |
| **Pro** ⭐ | 39€ | + Scan IA illimité, relances |
| **Business** | 79€ | + Multi-users, signature élec, FEC |

**Annual -20%** sur tous les plans payants.

---

## 📈 Métriques cibles (12 mois)

| Mois | Users | MRR |
|---|---|---|
| 1-2 | 0-5 | 0-200€ |
| 3-4 | 10-30 | 400-1200€ |
| 6 | 30-80 | 1200-3000€ |
| 9 | 80-200 | 3000-8000€ |
| 12 | 200-500 | **8000-20 000€** |

---

## 📚 Documentation

- `DEPLOIEMENT_GRATUIT.md` — Déployer sur Vercel
- `SETUP_PRODUCTION.md` — Setup complet Mistral + Supabase + Stripe
- `KIT_BETATESTEURS.md` — Stratégie acquisition 50 artisans
- `PLAN_BUSINESS_APP_NICHE.md` — Analyse de marché initiale

---

## 🇫🇷 Made in France

- IA : Mistral (français 🇫🇷)
- BDD : Supabase EU West
- Paiements : Stripe Europe
- Hébergement : Vercel EU (Frankfurt)

**RGPD compliant** · **Factur-X 2026 ready** · **Prêt à facturer dès septembre 2026**

---

## 📜 Licence

Propriétaire © 2026 ChantierPro
