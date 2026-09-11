# Cahier des Charges & Spécifications : Site Officiel Athlète Karting

> **Inspiration Majeure :** [landonorris.com](https://landonorris.com/)  
> **Rôle :** Ingénieur Full-Stack Senior & Lead Designer (Direction Artistique Awwwards, zéro "AI Slop").  
> **Stack :** Next.js (App Router, Turbopack, TypeScript) + Tailwind CSS + Prisma ORM (PostgreSQL) + Back-office `/admin`, optimisé pour Vercel.

---

## 🏎️ 1. Analyse des Codes Visuels & UX de landonorris.com

Le site de Lando Norris est une référence mondiale dans le motorsport moderne. Nous en reprenons les piliers fondamentaux adaptés au karting :

1. **Architecture & Découpage Spatial :**
   - **Hero Ultra-Impactant :** Typographie géante stylisée (nom du pilote), silhouette/kart dynamique, widget "Next Race / Prochaine Course" incrusté dès l'ouverture.
   - **Double univers "On Track" / "Off Track" :**
     - **On Track :** Télémétrie brute, chronos au millième, circuits tracés en SVG/Canvas, statistiques de saison (podiums, victoires, pôles, tours rapides), calendrier officiel.
     - **Off Track :** Lifestyle, préparation physique & mentale, simulateur, coulisses, communauté et réseaux.
2. **Identité Visuelle & Typographique :**
   - **Couleurs contrastées Motorsport :** Base Dark / Carbone profond (`#0a0a0a` / `#111111`) avec contraste percutant d'une couleur d'accent néon signature (ex: jaune-vert acide/lime `#d2ff00` ou orange papaye/racing).
   - **Typographie sculptée :** Titres ultra-larges et bold condensés, labels techniques en **Monospace** pour les données de course (chronos, gaps, secteurs).
   - **Pas de gradient fade ni de texte flou :** Découpes franches, lignes structurelles techniques inspirées des cockpits et des vibreurs de circuit.
3. **Espace Partenaires & Sponsors de Haut Niveau :**
   - Grille sponsors soignée (Titres, Partenaires Majeurs, Équipementiers techniques).
   - Module de contact dédié avec téléchargement du **Dossier Sponsoring & Presse (Press Kit)**.
4. **Médiathèque & Télémétrie Interactive :**
   - Flux de photos de courses grand format, vidéos embarquées (On-board), débriefs de meetings.

---

## 🗄️ 2. Modèle de Données & Back-Office (Prisma ORM)

Le back-office permet au pilote, à son coach ou à sa famille d'alimenter le site en temps réel :
- **PilotProfile :** Nom, bio, devise, numéro fétiche, catégorie (ex: KZ2, OK-J, Rotax Max).
- **Races / Calendar :** Nom du grand prix/championnat, date, circuit, météo, résultat en finale (P1, P2...), pôle, tour rapide, débrief.
- **Stats / Télémétrie :** Nombre total de courses, victoires, podiums, pôles, meilleur chrono.
- **Sponsors :** Nom, niveau (Tier 1 Title, Tier 2 Major, Tier 3 Technical), logo, lien web, visibilité (combinaison, kart, casque).
- **MediaGallery :** Photos HD en piste, vidéos de caméra embarquée (YouTube/Vimeo/direct), tags (On Track / Off Track).

---

## 🎨 3. Structure de la Première Ébauche (Prototype Public)

1. **Navigation Minimaliste Haute :**
   - Logo / Monogramme avec numéro fétiche.
   - Onglets : `Home`, `On Track` (Résultats & Calendrier), `Off Track` (Coulisses), `Sponsors`, `Contact`.
   - Bouton d'accès direct au Back-Office ou Contact Sponsors.
2. **Hero Section Motorsport :**
   - Typographie grand format du pilote avec numéro de course.
   - Carte flottante "Prochaine Course" (Nom du tracé, compte à rebours de date, catégorie).
   - Badge d'état de saison (Leader Championnat ou Top Rookie).
3. **Paddock Stats (Télémétrie en temps réel) :**
   - Grille technique de chiffres clés (Podiums, Victoires, Pôles, Vitesse max).
4. **Section Calendrier & Résultats :**
   - Liste chronologique des courses avec badges de victoires / podiums et tracés de circuits.
5. **Section Sponsors & Dossier de Partenariat :**
   - Vitrine des sponsors actuels avec call-to-action pour rejoindre l'aventure sportive.
6. **Footer Racing :**
   - Réseaux sociaux, mentions légales, lien d'administration.
