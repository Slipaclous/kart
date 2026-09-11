# RÈGLES BLENDER PYTHON (bpy) // EXPERT 3D PHOTORÉALISTE & WEB SCROLLYTELLING

Ces règles s'appliquent systématiquement à **chaque script Blender (`bpy`)** généré dans ce projet, sans rappel préalable.

---

## 📐 1. Géométrie & Maillage
- **Lissage automatique :** Appliquer systématiquement `bpy.ops.object.shade_smooth()` ou équivalent BMesh sur tout maillage créé.
- **Subdivision Surface :** Ajouter systématiquement un modifier `SUBSURF` (levels: 2 viewport / render: 3) sur toute forme courbée, aérodynamique, mécanique arrondie ou organique.
- **Unwrap UV Propre :** Effectuer un déballage UV propre (`bpy.ops.uv.smart_project(angle_limit=66.0, island_margin=0.02)`) avant toute projection ou assignation de texture.

---

## 🎨 2. Matériaux & Shaders PBR
- **Zéro défaut :** Jamais de `Principled BSDF` avec les valeurs par défaut. Spécifier expressément `Base Color`, `Roughness`, `Metallic`, `Coat Weight` (vernis motorsport/carbone) selon le matériau physique réel (alliages, chrome-molybdène, caoutchouc gommé, carbone sergé, titane, cuir/Nomex).
- **Textures PBR complètes :**
  - Si un pack de textures existe : brancher automatiquement *Albedo/Base Color* (sRGB), *Roughness* (Non-Color), *Metallic* (Non-Color), et *Normal Map* (via le node `ShaderNodeNormalMap` en Non-Color).
  - Si aucune texture n'est fournie : créer une texture procédurale haute fidélité (trame carbone, grain de pneu, dégradé thermique d'échappement) et recommander les références Poly Haven / AmbientCG adaptées.

---

## 💡 3. Éclairage
- **Zéro lampe isolée par défaut :** Jamais de simple point light standard.
- **Setup d'éclairage :**
  - Soit un **HDRI Studio Neutre** (World > `ShaderNodeTexEnvironment` avec mapping de rotation).
  - Soit un **Setup Studio 3 Points calibré** : *Key Light* principale, *Fill Light* diffuse et *Rim Light* rasante (avec accentuation de marque Acid Lime `#d2ff00` ou Cyan selon la DA).

---

## ⚙️ 4. Rendu & Color Management
- **Moteur :** `Cycles` par défaut pour tout rendu offline/bake (sauf demande expresse temps réel WebGL).
- **Denoising :** Denoising activé (`use_denoising = True`, OpenImageDenoise ou OptiX selon GPU).
- **Gestion des couleurs :** Color Management réglé sur **AgX** ou **Filmic** avec Look *Medium High Contrast*, jamais en `Standard`.

---

## 🎥 5. Caméra & Optique
- **Focale cinématique :** Focale réaliste comprise entre **35 mm et 50 mm** (85 mm pour les plans macro mécaniques), bannie la focale grand-angle par défaut.
- **Profondeur de champ (DoF) :** Activer la profondeur de champ (`dof.use_dof = True`) avec focus sur l'organe mécanique central (sujet net, arrière-plan et avant-plan doucement floutés).

---

## 🧱 6. Architecture du Code Python (bpy)
Tous les scripts doivent être modulaires et structurés en fonctions autonomes réutilisables :
- `create_object(...)`
- `apply_pbr_material(...)`
- `setup_lighting(...)`
- `setup_camera(...)`
- `export_web_glb(...)` ou `render_final(...)`
- Commentaires précis sur chaque bloc pour faciliter les réglages manuels dans Blender.
