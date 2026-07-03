# 🚀 Guide de mise en production complète

## 1. Créer les comptes externes (gratuit)

### Supabase (BDD + Auth)
1. Crée un compte sur https://supabase.com (gratuit)
2. Crée un nouveau projet `chantierpro`
3. Choisis la région `West EU (Ireland)` (proche France)
4. Note ton **Project URL** et **anon key** (Settings > API)
5. Va dans SQL Editor > New query
6. Copie-colle le contenu de `supabase/schema.sql`
7. Clique "Run" → tes tables sont créées ✅

### Mistral AI (IA Vision)
1. Crée un compte sur https://console.mistral.ai
2. Va dans "API Keys" > "Create new key"
3. Note la clé (`MISTRAL_API_KEY`)
4. Tu as 5€ de crédit gratuit au départ (suffisant pour ~20 000 analyses)

### Stripe (Paiements)
1. Crée un compte sur https://dashboard.stripe.com
2. Active ton compte (mode test d'abord)
3. Dans "Products" > "Add product" :
   - Crée 3 produits : Starter (19€/mois), Pro (39€/mois), Business (79€/mois)
   - Type : **Subscription** (récurrent)
   - Pour chaque, crée **2 prix** : mensuel et annuel (-20%)
4. Note chaque `price_id`
5. Dans "Developers" > "API keys" : note ta `publishable_key` (pk_test_...) et `secret_key` (sk_test_...)
6. Dans "Developers" > "Webhooks" > "Add endpoint" :
   - URL : `https://chantierpro.fr/api/stripe-webhook`
   - Events à cocher : `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`
7. Note le `webhook signing secret` (whsec_...)

## 2. Configurer les variables d'environnement

### Local (`.env`)
```bash
cp .env.example .env
# Remplir toutes les valeurs
```

### Vercel (production)
1. Va sur https://vercel.com > ton projet `chantierpro` > Settings > Environment Variables
2. Ajoute toutes les variables du `.env` (les `VITE_*` pour le frontend, les autres pour les serverless functions)
3. Redéploie

## 3. Déployer

```bash
# Commit et push
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/ton-user/chantierpro.git
git push -u origin main

# Sur Vercel
vercel --prod
```

## 4. Configurer le domaine custom (chantierpro.fr)

1. Achète `chantierpro.fr` sur OVH (10€/an)
2. Sur Vercel : Settings > Domains > Add `chantierpro.fr`
3. Vercel te donne les DNS à copier chez OVH
4. Sur OVH : Zone DNS > ajoute les records Vercel
5. Attends 1-24h la propagation

## 5. Vérification finale

- [ ] App accessible sur `https://chantierpro.fr`
- [ ] Inscription/connexion fonctionne
- [ ] Création de devis fonctionne
- [ ] Génération PDF fonctionne
- [ ] Scan IA Mistral fonctionne (test avec une vraie photo)
- [ ] Stripe Checkout fonctionne (carte test 4242 4242 4242 4242)
- [ ] Webhook Stripe reçoit les events (visible dans Stripe Dashboard > Webhooks)
- [ ] Robots.txt et sitemap.xml accessibles
- [ ] Articles de blog accessibles et indexables

## 6. Activer le SEO

1. **Google Search Console** : https://search.google.com/search-console
   - Ajoute ta propriété `https://chantierpro.fr`
   - Vérifie via DNS
   - Soumet ton sitemap.xml

2. **Google Analytics 4** : https://analytics.google.com
   - Crée une propriété
   - Copie le `G-XXXXX` ID
   - Ajoute dans `index.html` (script de tracking)

3. **Indexation rapide** :
   - Utilise "Inspect URL" dans Search Console pour chaque article
   - Soumis = indexé sous 24-48h

## 7. Marketing immédiat

Voir `KIT_BETATESTEURS.md` pour la stratégie complète.

---

**🎯 Tu es en production. Le premier utilisateur payant est à portée de main.**
