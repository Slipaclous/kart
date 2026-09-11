# RÈGLES D'INGÉNIERIE MÉCANIQUE KARTING (bpy) // STANDARD FIA / ROTAX

Ces règles s'appliquent systématiquement à **chaque modélisation de kart** générée dans ce projet, sans rappel préalable.

---

## 📐 1. DIMENSIONS DE RÉFÉRENCE FIA/ROTAX (±10% tolérance)
- **Empattement (Wheelbase) :** 1.04 m à 1.07 m (axe AV -> axe AR)
- **Voie avant (Front track) :** 1.10 m à 1.13 m (centre roue G -> centre roue D)
- **Voie arrière (Rear track) :** 1.32 m à 1.40 m (centre roue G -> centre roue D)
- **Diamètre complet roue :** 0.26 m à 0.28 m (Rayon R = 0.13m à 0.14m). Centre des axes de roues à Z = 0.135m pour contact sol parfait à Z = 0.
- **Largeur des pneus :** Pneu AV ~ 0.12-0.13 m | Pneu AR ~ 0.18-0.21 m
- **Garde au sol & hauteur châssis :** Hauteur tubes ~ 0.05m à 0.08m au-dessus du sol (axe tube à Z ~ 0.07m), hauteur totale hors siège/volant ~ 0.15-0.18 m
- **Diamètre des tubes de châssis :** 30 mm (rayon `bevel_depth` = 0.015 m)
- **Diamètre du volant :** 28 à 30 cm, incliné à 20-25° par rapport à la verticale

---

## 🚫 2. INTERDICTION DES PRIMITIVES BRUTES NON ADAPTÉES
- **Roue :** Tore profilé pour le pneu (écrasement contact sol au plan Z=0) + jante cylindrique plate usinée intérieure avec moyeu/écrou central. Zéro sphère ou cylindre plein brut.
- **Châssis tubulaire :** Courbes de Bézier continues 3D (`bpy.data.curves`) avec biseau circulaire 30mm (`bevel_depth=0.015`), cintrage continu sans discontinuités ni cylindres droits empilés au hasard.
- **Volant :** Tore profilé à méplat pour la jante (diamètre 28-30cm), branches découpées en platine et inclinaison physique de 20-25° sur colonne reliée au châssis.
- **Siège baquet :** Coque galbée anatomique ergonomique (courbure d'assise et renforts latéraux), zéro cube.
- **Carrosserie :** Coque aérodynamique extrudée et lissée avec modifier `Subdivision Surface`, enveloppant le châssis sans intersection.

---

## 🔨 3. ORDRE DE CONSTRUCTION OBLIGATOIRE (Topologie & Kinematic Chain)
1. **Châssis tubulaire complet + Empties d'ancrage nommés :**
   - `ancrage_roue_AV_G`, `ancrage_roue_AV_D`
   - `ancrage_roue_AR_G`, `ancrage_roue_AR_D`
   - `ancrage_siege`
   - `ancrage_volant`
2. **Alignement strict des 4 roues :** Les centres des roues s'alignent au millimètre sur les Empties d'ancrage, perpendiculaires au sol, axe X traversant.
3. **Colonne de direction & volant :** Inclinés à 20-25°, connectés mécaniquement de l'ancrage_volant au palier du châssis.
4. **Siège baquet :** Connecté via ses platines et haubans à l'ancrage_siege.
5. **Carrosserie aérodynamique :** Spoiler avant, panneau nassau et pontons dimensionnés pour englober le châssis sans collision de bounding box.

---

## 🎨 4. MATÉRIAUX PHYSIQUES PBR PAR FONCTION
- **Tubes de châssis :** Métal brossé ou laqué époxy motorsport (`metallic=0.9`, `roughness=0.25-0.30`, `coat=0.6`)
- **Pneus :** Gomme slick noir mat avec grain (`roughness=0.85-0.90`, `metallic=0.0`)
- **Jantes :** Magnésium forgé doré ou Ergal anodisé (`metallic=0.98`, `roughness=0.18`)
- **Carrosserie :** Composite thermoplastique / fibre de carbone (`coat=0.95`, `roughness=0.12`)
- **Volant :** Caoutchouc / peau retournée Alcantara (`roughness=0.75-0.85`, `metallic=0.0`)

---

## ✅ 5. VALIDATION GÉOMÉTRIQUE & PHYSIQUE
- Contact sol parfait : les 4 pneus ont leur point le plus bas tangent au plan `Z = 0`.
- Continuité cinématique : zéro pièce en lévitation, toutes les liaisons mécaniques sont connectées.
