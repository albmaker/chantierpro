# 🚀 Guide de déploiement GRATUIT (mieux que Cloudways)

Adam utilise Cloudways (14$/mois). Toi tu vas utiliser **Vercel = 0€** pour ton V1.
On peut migrer sur un VPS payant plus tard quand tu auras 200+ clients.

---

## ✅ OPTION 1 : Vercel (recommandé, 100% gratuit, 5 minutes)

### Pourquoi Vercel ?
- **Gratuit à vie** pour ton usage (jusqu'à 100GB de bande passante/mois)
- **HTTPS automatique** (SSL gratuit inclus)
- **Domaine custom** gratuit (chantierpro.fr)
- **Déploiement en 1 clic** depuis GitHub
- **Plus rapide qu'un VPS** (CDN global)

### Étapes :

**1. Crée un compte GitHub** (si pas déjà fait)
→ https://github.com (gratuit)

**2. Crée un nouveau repo**
- Va sur https://github.com/new
- Nom : `chantierpro`
- Coche "Add a README file"
- Crée le repo

**3. Upload ton code**
- Sur la page du repo, clique "uploading an existing file"
- Glisse-dépose TOUT le contenu du dossier `/home/user/chantierpro/` SAUF :
  - `node_modules/` (trop gros)
  - `dist/` (sera généré par Vercel)
- Commit

**4. Crée un compte Vercel**
→ https://vercel.com (sign in with GitHub)

**5. Déploie**
- Clique "Add New Project"
- Sélectionne ton repo `chantierpro`
- Vercel détecte automatiquement Vite
- Clique "Deploy"
- ⏳ 2-3 minutes et ton app est en ligne !

**6. Domaine custom (optionnel)**
- Dans Vercel → Settings → Domains
- Ajoute `chantierpro.fr` (acheté sur OVH/Namecheap, ~10€/an)
- Vercel te donne les DNS à copier chez ton registrar

**Coût total : 10€/an (domaine) + 0€/mois = 0,83€/mois 🎉**

---

## ✅ OPTION 2 : Netlify (alternative)

Identique à Vercel, gratuit à vie, mêmes étapes.
→ https://netlify.com

---

## ✅ OPTION 3 : Cloudflare Pages (encore plus rapide)

Gratuit à vie, CDN mondial ultra-rapide.
→ https://pages.cloudflare.com

---

## 🧪 Tester l'app EN LOCAL maintenant

Si tu veux la tester tout de suite sur ton Mac/PC :

```bash
cd chantierpro
npm install
npm run dev
```

Ouvre http://localhost:5173 dans ton navigateur.

---

## 📦 Build de production local (pour vérifier)

```bash
npm run build
npm run preview
```

Ouvre http://localhost:4173 — c'est exactement la version qui sera en ligne.

---

## 🆓 Pourquoi c'est mieux que Cloudways (méthode Adam) ?

| | Cloudways (Adam) | **Vercel (toi)** |
|---|---|---|
| Coût | 14$/mois (168$/an) | **0€/mois (gratuit à vie)** |
| Setup | SFTP, Nginx, SSL à config | **1 clic** |
| HTTPS | Let's Encrypt manuel | **Auto** |
| CDN | Non | **Oui (global)** |
| Performance | Bon | **Excellent** |
| Domaine custom | Oui | **Oui** |
| Scaling | Manuel | **Auto** |

**Seul "inconvénient" Vercel** : quand tu auras 1000+ clients et besoin d'une vraie BDD + auth, tu migreras sur un VPS. Mais c'est pas pour tout de suite (et tu auras les 20K€/mois pour le payer 😉).

---

## 🔥 Prochaines étapes (après mise en ligne)

1. **Brancher Supabase** (gratuit) pour la vraie persistance des données
2. **Brancher Stripe** (gratuit) pour encaisser les abonnements
3. **Brancher une vraie API Vision** (Mistral AI français, ~0,01€/image) pour le scanner
4. **SEO** : page `/blog` avec articles "comment faire un devis plombier", etc.
5. **Marketing** : TikTok + groupes Facebook artisans

---

## 📞 Support

Si tu bloques à l'étape Vercel, dis-le moi et je te guide en direct.
