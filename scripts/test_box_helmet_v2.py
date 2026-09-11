import bpy
import bmesh
import math
from mathutils import Vector

bpy.ops.wm.read_factory_settings(use_empty=True)

# --------------------------------------------------------------------------
# BOX MODELING V2 : TOPOLOGIE AUTOMOBILE STILO ST5 COMPLÈTE
# Coque fermée à l'arrière avec découpe du cou ergonomique & flancs latéraux
# --------------------------------------------------------------------------

bm = bmesh.new()

# Niveaux verticaux (profil sagittal médian X = 0)
# De la nuque (0) jusqu'au sommet (5), front (7), arcade (8), mentonnière (9..12), col menton (13)
sagittal_pts = [
    (0.0, -0.118, -0.120),  # 0: base nuque arrière
    (0.0, -0.142, -0.065),  # 1: nuque moyenne
    (0.0, -0.150, -0.005),  # 2: occiput arrière
    (0.0, -0.142, 0.065),   # 3: dôme arrière
    (0.0, -0.080, 0.128),   # 4: dôme arrière-sommet
    (0.0, 0.000, 0.140),    # 5: sommet
    (0.0, 0.070, 0.130),    # 6: dôme avant
    (0.0, 0.125, 0.088),    # 7: front haut
    (0.0, 0.142, 0.045),    # 8: arcade sourcilière (lèvre sup eyeport)
    # --- EYEPORT ---
    (0.0, 0.154, -0.012),   # 9: lèvre inf mentonnière (seuil visière)
    (0.0, 0.174, -0.045),   # 10: mentonnière mi-hauteur
    (0.0, 0.188, -0.075),   # 11: proue aérodynamique Stilo
    (0.0, 0.168, -0.115),   # 12: bas mentonnière
    (0.0, 0.115, -0.130),   # 13: col avant mentonnière
]

# 6 colonnes méridiens latéraux pour une rondeur parfaite et une transition fluide des joues
meridian_configs = [
    # (fx, fy_front, fy_back, z_curve)
    (0.00, 1.00, 1.00, 0.0),       # Col 0 : Axe médian
    (0.30, 0.99, 0.99, -0.001),    # Col 1
    (0.58, 0.96, 0.97, -0.005),    # Col 2 : Courbe frontale
    (0.80, 0.91, 0.93, -0.010),    # Col 3 : Angle oeil / coin mâchoire
    (0.96, 0.72, 0.88, -0.016),    # Col 4 : Flanc tempe / joue
    (1.00, 0.35, 0.82, -0.022),    # Col 5 : Flanc latéral max (oreille / pivot)
]

max_half_width = 0.120  # Largeur totale casque = 24 cm

grid_verts = []

for c_idx, (fx, fy_f, fy_b, z_curv) in enumerate(meridian_configs):
    col = []
    x = fx * max_half_width
    for level, (sx, sy, sz) in enumerate(sagittal_pts):
        y = sy * (fy_f if sy > 0 else fy_b)
        z = sz + z_curv

        # Arrondi de calotte sur le sommet (levels 3 à 7)
        if 3 <= level <= 7:
            z -= 0.020 * (fx ** 2)

        # Flanc tempe / oreille (Col 4 et 5) :
        # L'eyeport se referme en V vers l'axe du pivot (y ~ 0.015, z ~ 0.018)
        if c_idx == 4:
            if level == 8:
                y = 0.065
                z = 0.024
            elif level == 9:
                y = 0.065
                z = 0.012
        elif c_idx == 5:
            if level == 8:
                y = 0.018
                z = 0.020
            elif level == 9:
                y = 0.018
                z = 0.016

        v = bm.verts.new((x, y, z))
        col.append(v)
    grid_verts.append(col)

bm.verts.ensure_lookup_table()

# 1. QUADS DÔME SUPÉRIEUR (levels 0 à 8, toutes colonnes)
for c in range(len(meridian_configs) - 1):
    for l in range(8):
        bm.faces.new((grid_verts[c][l], grid_verts[c + 1][l], grid_verts[c + 1][l + 1], grid_verts[c][l + 1]))

# 2. QUADS MENTONNIÈRE (levels 9 à 13, toutes colonnes)
for c in range(len(meridian_configs) - 1):
    for l in range(9, 13):
        bm.faces.new((grid_verts[c][l], grid_verts[c + 1][l], grid_verts[c + 1][l + 1], grid_verts[c][l + 1]))

# 3. QUADS JOUES & TEMPES (fermeture latérale de l'eyeport sur cols 3->4 et 4->5)
for c in range(3, len(meridian_configs) - 1):
    bm.faces.new((grid_verts[c][8], grid_verts[c + 1][8], grid_verts[c + 1][9], grid_verts[c][9]))

# 4. FERMETURE DU FLANC D'OREILLE ET DE L'ARRIÈRE (relier level 0 nuque au level 13 col menton via le flanc)
# Sur la dernière colonne (c = 5, flanc latéral), relions l'arrière et l'avant pour ceinturer l'oreille :
# level 0 (nuque) relié à level 1 (bas arrière) relié à level 12 et 13
bm.faces.new((grid_verts[5][0], grid_verts[5][1], grid_verts[5][12], grid_verts[5][13]))
bm.faces.new((grid_verts[5][1], grid_verts[5][2], grid_verts[5][11], grid_verts[5][12]))
bm.faces.new((grid_verts[5][2], grid_verts[5][3], grid_verts[5][10], grid_verts[5][11]))
bm.faces.new((grid_verts[5][3], grid_verts[5][8], grid_verts[5][9], grid_verts[5][10]))

# Re-calculer les normales
bm.normal_update()

mesh = bpy.data.meshes.new('box_helmet_v2_mesh')
bm.to_mesh(mesh)
bm.free()

helmet = bpy.data.objects.new('BoxHelmetV2', mesh)
bpy.context.scene.collection.objects.link(helmet)

# 1. Mirror
m_mir = helmet.modifiers.new('Mirror', 'MIRROR')
m_mir.use_axis[0] = True
m_mir.use_clip = True

# 2. Subsurf
m_sub = helmet.modifiers.new('Subsurf', 'SUBSURF')
m_sub.levels = 2
m_sub.render_levels = 3

# 3. Solidify
m_sol = helmet.modifiers.new('Solidify', 'SOLIDIFY')
m_sol.thickness = 0.005
m_sol.offset = -1.0

# Shading doux
for p in helmet.data.polygons:
    p.use_smooth = True

# Matériau Vert Racing Stilo
mat_brg = bpy.data.materials.new('MAT_Stilo_BRG')
mat_brg.use_nodes = True
bsdf = mat_brg.node_tree.nodes['Principled BSDF']
bsdf.inputs['Base Color'].default_value = (0.012, 0.16, 0.048, 1.0)
bsdf.inputs['Metallic'].default_value = 0.50
bsdf.inputs['Roughness'].default_value = 0.10
if 'Coat Weight' in bsdf.inputs:
    bsdf.inputs['Coat Weight'].default_value = 1.0
helmet.data.materials.append(mat_brg)

# --- VISIÈRE CONFORME (construite par révolution/loft torique le long de l'eyeport) ---
bm_v = bmesh.new()
v_segs = 48
v_heights = 10
for h in range(v_heights):
    t = h / (v_heights - 1)
    z = -0.008 + t * (0.045 - (-0.008))
    # Toric curve
    rad_x = 0.118 + 0.003 * math.sin(t * math.pi)
    rad_y = 0.146 + 0.004 * math.sin(t * math.pi)
    for s in range(v_segs):
        ang = math.radians(-72 + 144 * s / (v_segs - 1))
        vx = math.sin(ang) * rad_x
        vy = math.cos(ang) * rad_y - 0.002
        bm_v.verts.new((vx, vy, z))

bm_v.verts.ensure_lookup_table()
for h in range(v_heights - 1):
    for s in range(v_segs - 1):
        bm_v.faces.new((
            bm_v.verts[h * v_segs + s],
            bm_v.verts[h * v_segs + s + 1],
            bm_v.verts[(h + 1) * v_segs + s + 1],
            bm_v.verts[(h + 1) * v_segs + s]
        ))

mesh_v = bpy.data.meshes.new('visor_v2_mesh')
bm_v.to_mesh(mesh_v)
bm_v.free()

visor = bpy.data.objects.new('visor_v2', mesh_v)
bpy.context.scene.collection.objects.link(visor)
m_vsol = visor.modifiers.new('Sol', 'SOLIDIFY')
m_vsol.thickness = 0.0025
bpy.context.view_layer.objects.active = visor
visor.select_set(True)
bpy.ops.object.modifier_apply(modifier=m_vsol.name)
for p in visor.data.polygons:
    p.use_smooth = True

mat_v = bpy.data.materials.new('MAT_Visor_Iridium')
mat_v.use_nodes = True
v_bsdf = mat_v.node_tree.nodes['Principled BSDF']
v_bsdf.inputs['Base Color'].default_value = (0.04, 0.14, 0.50, 1.0)
v_bsdf.inputs['Metallic'].default_value = 0.94
v_bsdf.inputs['Roughness'].default_value = 0.025
if 'Coat Weight' in v_bsdf.inputs:
    v_bsdf.inputs['Coat Weight'].default_value = 1.0
visor.data.materials.append(mat_v)

# Platines usinées titane / alu aux pivots latéraux
for side in [-1, 1]:
    bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=0.014, depth=0.004, location=(side * 0.119, 0.018, 0.018))
    plat = bpy.context.object
    plat.rotation_euler = (0, math.radians(90), 0)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    m_p = bpy.data.materials.new(f'Mat_Plat_{side}')
    m_p.use_nodes = True
    m_p.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (0.75, 0.78, 0.82, 1.0)
    m_p.node_tree.nodes['Principled BSDF'].inputs['Metallic'].default_value = 0.98
    plat.data.materials.append(m_p)

# Loquet noir mentonnière
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0.156, -0.008))
latch = bpy.context.object
latch.scale = (0.012, 0.006, 0.010)
latch.rotation_euler = (math.radians(-8), 0, 0)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
m_l = bpy.data.materials.new('Mat_Latch')
m_l.use_nodes = True
m_l.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (0.02, 0.02, 0.02, 1.0)
latch.data.materials.append(m_l)

# Studio Camera & Lighting
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
bpy.context.scene.render.filepath = '/Users/gauthierminor/Desktop/dev/Karting/public/textures/test_box_v2_preview.png'
bpy.ops.render.render(write_still=True)
print('Rendered test_box_v2_preview.png successfully!')
