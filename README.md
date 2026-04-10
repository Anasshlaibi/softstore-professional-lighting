<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# GearShop.ma - SoftStore

Équipement d'éclairage professionnel pour studios photo/vidéo au Maroc.

**Live Demo:** [https://gearshop.ma](https://gearshop.ma)

## Structure du Projet
- **/** : Projet racine (Version ancienne)
- **/new web/** : Version actuelle du site (Vite + React)

## Développement Local

**Prérequis :** Node.js

1. Installer les dépendances :
   ```bash
   npm install
   ```
2. Configurer les variables d'environnement :
   Créez un fichier `.env` dans le dossier `new web/` (utilisez `.env.example` comme modèle) et ajoutez votre `GEMINI_API_KEY`.
3. Lancer l'application :
   ```bash
   npm run dev
   ```

## Déploiement sur Vercel

Cette application est configurée pour être déployée sur Vercel à partir de la racine.

### Configuration Vercel :
- **Framework Preset :** Vite (ou Other)
- **Build Command :** `npm run build`
- **Output Directory :** `new web/dist`
- **Install Command :** `npm install`

### Variables d'environnement nécessaires sur Vercel :
- `GEMINI_API_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GA_MEASUREMENT_ID` (G-PQKHW2XKCT)

