# 🚀 COMMENT LANCER L'APP SUR TON PC

## En 3 étapes, 2 minutes

### Étape 1 : Installer Node.js (une seule fois)
Va sur https://nodejs.org → télécharge la version LTS → installe

### Étape 2 : Extraire l'archive
```bash
# Sur Mac/Linux
tar -xzf chantierpro.tar.gz
cd chantierpro

# Sur Windows : décompresse le .zip avec WinRAR ou 7zip
# Puis ouvre un terminal dans le dossier chantierpro
```

### Étape 3 : Lancer
```bash
npm install        # Installe les dépendances (2 min)
npm run dev        # Lance l'app
```

Puis ouvre **http://localhost:5173** dans ton navigateur. ✅

---

## 📁 Ce que tu vas voir

L'app **ChantierPro v2.0 complète** :

- 🏠 **Landing page** → http://localhost:5173/
- 🔐 **Auth** → http://localhost:5173/auth
- 💳 **Pricing** → http://localhost:5173/pricing
- 📝 **Blog SEO** → http://localhost:5173/blog
- 📊 **Dashboard** → http://localhost:5173/dashboard
- 📸 **Scanner IA** → http://localhost:5173/scanner
- 📄 **Devis** → http://localhost:5173/devis
- 🧾 **Factures** → http://localhost:5173/factures
- ⚙️ **Paramètres** → http://localhost:5173/parametres

---

## 🔧 Commandes utiles

```bash
npm run dev        # Lance le serveur de dev (http://localhost:5173)
npm run build      # Compile pour la production (dossier dist/)
npm run preview    # Prévisualise le build production
```

---

## 💡 Astuce : pour tester le scan IA

L'app fonctionne en mode **simulation** par défaut (pas besoin de clé Mistral).
Pour activer la vraie IA Mistral :
1. Crée un compte sur https://console.mistral.ai
2. Récupère ta clé API
3. Crée un fichier `.env` à la racine :
```
MISTRAL_API_KEY=ta_clé_ici
```
4. Déploie sur Vercel (gratuit) → le scan devient réel

---

## 🌐 Pour la mettre en ligne (gratuit)

Voir `DEPLOIEMENT_GRATUIT.md` — 5 minutes sur Vercel.

---

## ❓ Problème ?

Si `npm install` échoue :
- Vérifie que Node.js est installé : `node -v` doit afficher v18+
- Sur Windows, lance le terminal en admin
- Sur Mac, essaie `sudo npm install`

Si l'app ne s'ouvre pas :
- Vérifie le port 5173 (pas bloqué par un antivirus)
- Essaie http://127.0.0.1:5173

---

Made with ❤️ — ChantierPro v2.0
