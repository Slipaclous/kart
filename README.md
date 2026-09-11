# Apex Karting Platform

Plateforme web de karting avec back-office d'administration, API Node.js et Prisma ORM, optimisée pour un déploiement Vercel.

## 🛠️ Stack Technique
- **Framework** : Next.js (App Router, Turbopack, TypeScript)
- **Base de données & ORM** : Prisma ORM v6 (PostgreSQL)
- **Back-Office** : Intégré sous `/admin`
- **Hébergement** : Optimisé pour Vercel

## 🚀 Démarrage Local

1. Installer les dépendances :
```bash
npm install
```

2. Configurer la variable d'environnement `.env` :
```env
DATABASE_URL="postgresql://user:password@localhost:5432/karting?schema=public"
```

3. Générer le client Prisma et synchroniser le schéma :
```bash
npx prisma db push
```

4. Lancer le serveur de développement :
```bash
npm run dev
```
- **Site public** : `http://localhost:3000`
- **Back-Office Admin** : `http://localhost:3000/admin`
- **Healthcheck API** : `http://localhost:3000/api/health`

## 🏎️ Expérience Scrollytelling Motorsport
- **Circuit Onboard Interactif** : Animation Canvas 2D 60-120 FPS avec caméra dynamique et lissage inertiel (LERP).
- **Kart KZ Authentique** : Modélisation technique du kart de compétition Birel ART #42 (châssis tubulaire 25CrMo4, moteur TM Racing 125cc à boîte séquentielle, jantes magnésium).
- **Histoire & Palmarès** : Présentation du jeune champion Liam Moreau, titres FFSA & FIA Karting, calendrier des Grands Prix 2026 et partenaires officiels.
- **Direction Artistique** : Palette stricte Rouge Corse (`#e10600`), Bleu Cobalt (`#2563eb`) et Noir Carbone (`#07090e`), typographies Oswald et JetBrains Mono.

## 📦 Déploiement Vercel
1. Lier le dépôt Git à Vercel.
2. Ajouter la variable d'environnement `DATABASE_URL` (ex: Vercel Postgres, Neon, Supabase).
3. Le script `postinstall` exécute automatiquement `prisma generate` lors du build.
