import bpy
import bmesh
import math
from mathutils import Vector

bpy.ops.wm.read_factory_settings(use_empty=True)

# ---------------------------------------------------------
# TOPOLOGIE QUAD PROPRE DU CASQUE STILO ST5 (SUBDIVISION SURFACE)
# Modélisation par demi-coque avec modifier MIRROR + SUBSURF
# ---------------------------------------------------------

bm = bmesh.new()

# On définit les points de la ligne médiane X=0 (sagittale)
# de l'arrière de la base du cou, montant à l'occiput, passant par le sommet,
# descendant sur le front, le haut de l'ouverture d'eyeport,
# puis sautant l'ouverture pour le seuil de mentonnière, la pointe du menton,
# et le bas du menton.

# Profil sagittal (X = 0) :
# 0: Cou arrière (base nuque)
# 1: Nuque
# 2: Occiput arrière
# 3: Dôme arrière haut
# 4: Sommet crâne
# 5: Dôme avant haut
# 6: Front haut
# 7: Arcade sourcilière (lèvre sup ouverture)
# --- OUVERTURE VISIÈRE ---
# 8: Lèvre inf mentonnière (seuil visière)
# 9: Face avant mentonnière haut
# 10: Pointe aérodynamique mentonnière Stilo (proéminente vers l'avant)
# 11: Face avant mentonnière bas
# 12: Bordure inférieure menton (avant col)

sagittal_pts = [
    (0.0, -0.115, -0.125),  # 0: base nuque
    (0.0, -0.138, -0.070),  # 1: nuque
    (0.0, -0.145, -0.010),  # 2: occiput
    (0.0, -0.135, 0.070),   # 3: dôme arrière haut
    (0.0, -0.070, 0.132),   # 4: dôme arrière-sommet
    (0.0, 0.000, 0.142),    # 5: sommet
    (0.0, 0.070, 0.130),    # 6: dôme avant
    (0.0, 0.125, 0.088),    # 7: front
    (0.0, 0.142, 0.048),    # 8: arcade sourcilière (haut eyeport)
    # Eyeport fente (hauteur ~5.5 cm)
    (0.0, 0.155, -0.010),   # 9: lèvre inf mentonnière (bas eyeport)
    (0.0, 0.176, -0.040),   # 10: mentonnière mi-hauteur
    (0.0, 0.190, -0.075),   # 11: pointe du menton Stilo
    (0.0, 0.170, -0.115),   # 12: menton bas
    (0.0, 0.120, -0.132),   # 13: col avant mentonnière
]

# Construisons une grille de quads régulière pour la demi-coque droite (X >= 0) :
# 5 méridiens latéraux :
# Ring 0 : X = 0 (médian)
# Ring 1 : X ~ 0.045 (paramédian)
# Ring 2 : X ~ 0.085 (crête temporale / angle mâchoire)
# Ring 3 : X ~ 0.115 (flanc latéral / oreille / pivot)
# Ring 4 : X ~ 0.125 (largeur max latérale)

# Chaque méridien a 14 points correspondant aux 14 niveaux verticaux de sagittal_pts.
# Les points 8 et 9 forment la bordure de l'eyeport.
# Pour les rings latéraux (Ring 3 et Ring 4), l'eyeport se referme au niveau du pivot visière !

rings = []

# Facteurs d'échelle et déformation latérale pour chaque ring
ring_configs = [
    # (facteur_x, facteur_y_front, facteur_y_back, z_offset)
    (0.0,   1.00, 1.00, 0.0),      # Ring 0: Centre
    (0.38,  0.98, 0.98, -0.002),   # Ring 1
    (0.72,  0.92, 0.94, -0.006),   # Ring 2: Crête aéro Stilo
    (0.95,  0.80, 0.88, -0.012),   # Ring 3: Zone pivot
    (1.00,  0.60, 0.80, -0.020),   # Ring 4: Flanc latéral
]

max_width = 0.122  # demi-largeur 12.2 cm

grid_verts = []

for r_idx, (fx, fy_f, fy_b, z_off) in enumerate(ring_configs):
    ring_v = []
    x_val = fx * max_width
    for level, (sx, sy, sz) in enumerate(sagittal_pts):
        y_val = sy * (fy_f if sy > 0 else fy_b)
        z_val = sz + z_off
        
        # Pour les niveaux du sommet (4, 5, 6), la calotte s'arrondit vers le bas latéralement
        if 3 <= level <= 7:
            z_val -= 0.025 * (fx ** 2)
            
        # Pour l'eyeport (niveaux 8 et 9) :
        # Sur Ring 3 et Ring 4, l'eyeport se rejoint pour former la commissure latérale (tempe / pivot)
        if r_idx >= 3:
            if level == 8:
                z_val = 0.022  # rejoint le pivot
                y_val = 0.035
            elif level == 9:
                z_val = 0.016  # rejoint le pivot
                y_val = 0.035

        v = bm.verts.new((x_val, y_val, z_val))
        ring_v.append(v)
    grid_verts.append(ring_v)

bm.verts.ensure_lookup_table()

# Création des faces QUADS entre les rings :
# Partie Supérieure (Calotte & Front : levels 0 à 8)
for r in range(len(ring_configs) - 1):
    for l in range(8):
        v0 = grid_verts[r][l]
        v1 = grid_verts[r + 1][l]
        v2 = grid_verts[r + 1][l + 1]
        v3 = grid_verts[r][l + 1]
        bm.faces.new((v0, v1, v2, v3))

# Partie Inférieure (Mentonnière & Base : levels 9 à 13)
for r in range(len(ring_configs) - 1):
    for l in range(9, 13):
        v0 = grid_verts[r][l]
        v1 = grid_verts[r + 1][l]
        v2 = grid_verts[r + 1][l + 1]
        v3 = grid_verts[r][l + 1]
        bm.faces.new((v0, v1, v2, v3))

# Fermeture latérale derrière l'eyeport (sur Ring 3 et Ring 4)
# Entre level 8 et 9 pour former la tempe et la zone du pivot
for r in range(2, len(ring_configs) - 1):
    v0 = grid_verts[r][8]
    v1 = grid_verts[r + 1][8]
    v2 = grid_verts[r + 1][9]
    v3 = grid_verts[r][9]
    bm.faces.new((v0, v1, v2, v3))

# Fermeture de la base arrière (entre nuque 0 et menton 13 sur les flancs pour faire le trou du cou)
# Le trou du cou est délimité par les vertices de level 0 (nuque) et 13 (menton col)
# avec une boucle reliant level 0 -> flanc -> level 13

mesh = bpy.data.meshes.new('test_box_mesh')
bm.to_mesh(mesh)
bm.free()

obj = bpy.data.objects.new('TestBoxHelmet', mesh)
bpy.context.scene.collection.objects.link(obj)

# Modificateurs professionnels :
# 1. MIRROR (symétrie parfaite gauche-droite le long de X=0)
m_mir = obj.modifiers.new('Mirror', 'MIRROR')
m_mir.use_axis[0] = True
m_mir.use_clip = True

# 2. SUBSURF (Subdivision Surface pour une surface lisse aérodynamique sans facettes)
m_sub = obj.modifiers.new('Subsurf', 'SUBSURF')
m_sub.levels = 2
m_sub.render_levels = 3

# 3. SOLIDIFY (épaisseur de coque)
m_sol = obj.modifiers.new('Solidify', 'SOLIDIFY')
m_sol.thickness = 0.005
m_sol.offset = -1.0

# 4. Smooth shading
for p in obj.data.polygons:
    p.use_smooth = True

# Matériau Vert Racing Verni
mat = bpy.data.materials.new('MAT_Test_BRG')
mat.use_nodes = True
bsdf = mat.node_tree.nodes['Principled BSDF']
bsdf.inputs['Base Color'].default_value = (0.012, 0.15, 0.045, 1.0)
bsdf.inputs['Metallic'].default_value = 0.45
bsdf.inputs['Roughness'].default_value = 0.10
if 'Coat Weight' in bsdf.inputs:
    bsdf.inputs['Coat Weight'].default_value = 1.0
obj.data.materials.append(mat)

# Caméra et lumière studio
world = bpy.data.worlds.new('StudioWorld')
bpy.context.scene.world = world
world.color = (0.16, 0.17, 0.19)

cam_data = bpy.data.cameras.new('Camera')
cam_data.lens = 55
cam = bpy.data.objects.new('Camera', cam_data)
bpy.context.scene.collection.objects.link(cam)
bpy.context.scene.camera = cam
cam.location = (0.42, 0.58, 0.16)
cam.rotation_euler = (Vector((0, 0.04, -0.01)) - cam.location).to_track_quat('-Z', 'Y').to_euler()

l1 = bpy.data.lights.new('Key', 'SUN')
l1.energy = 4.5
lo1 = bpy.data.objects.new('Key', l1)
bpy.context.scene.collection.objects.link(lo1)
lo1.rotation_euler = (Vector((0,0,0)) - Vector((2, 3, 3))).to_track_quat('-Z', 'Y').to_euler()

l2 = bpy.data.lights.new('Fill', 'SUN')
l2.energy = 2.5
lo2 = bpy.data.objects.new('Fill', l2)
bpy.context.scene.collection.objects.link(lo2)
lo2.rotation_euler = (Vector((0,0,0)) - Vector((-3, 1, 2))).to_track_quat('-Z', 'Y').to_euler()

bpy.context.scene.render.resolution_x = 900
bpy.context.scene.render.resolution_y = 700
bpy.context.scene.render.filepath = '/Users/gauthierminor/Desktop/dev/Karting/public/textures/test_box_preview.png'
bpy.ops.render.render(write_still=True)
print('Rendered test_box_preview.png')
