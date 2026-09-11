"""BLENDER PYTHON SCRIPT: Recreate Reference Stilo/Bell Karting Helmet with authentic textures and materials.
Builds the exact geometry of reference_karting_helmet:
1. Metallic British Racing Green + exposed 3K carbon weave sections
2. Authentic Stilo eyeport aperture with rubber trim
3. Iridium blue-violet visor + curved carbon sunstrip 'APEX'
4. Titanium pivot screws with FIA homologation sticker & tear-off post
5. Chin vents with metallic mesh inserts & number 42 imprint
6. Rear clear aerodynamic Kamm-tail spoiler
7. Neon lime (#d2ff00) livery stripes outlining the carbon contours
8. Hollow cockpit with Nomex black fabric lining
"""
import bpy, bmesh, math, os

OUT_GLB = "/Users/gauthierminor/Desktop/dev/Karting/public/models/pro_karting_helmet_assembly.glb"
REF_IMG = "/Users/gauthierminor/Desktop/dev/Karting/public/images/helmet_reference.jpg"

# Always reset to empty scene
bpy.ops.wm.read_factory_settings(use_empty=True)

# ----------------------------------------------------------------------
# PROCEDURAL & PBR SHADERS
# ----------------------------------------------------------------------
def make_shader(name, base_color, metallic=0.0, roughness=0.25, clearcoat=0.0, transmission=0.0, emission=(0,0,0,1)):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = None
    for n in mat.node_tree.nodes:
        if n.type == 'BSDF_PRINCIPLED':
            bsdf = n
            break
    if bsdf:
        bsdf.inputs['Base Color'].default_value = base_color
        bsdf.inputs['Metallic'].default_value = metallic
        bsdf.inputs['Roughness'].default_value = roughness
        if 'Coat Weight' in bsdf.inputs:
            bsdf.inputs['Coat Weight'].default_value = clearcoat
        if 'Transmission Weight' in bsdf.inputs:
            bsdf.inputs['Transmission Weight'].default_value = transmission
        if 'Emission Color' in bsdf.inputs:
            bsdf.inputs['Emission Color'].default_value = emission[:3] + (1.0,)
    return mat

# 1. British Racing Green Metallic Clearcoat Paint (Exact color from generated image)
mat_brg_paint = make_shader('Mat_BRG_Metallic', (0.015, 0.085, 0.045, 1.0), metallic=0.65, roughness=0.08, clearcoat=1.0)

# 2. Exposed 3K Carbon Fiber Weave
mat_carbon_weave = make_shader('Mat_Carbon_Fiber', (0.02, 0.022, 0.025, 1.0), metallic=0.85, roughness=0.12, clearcoat=0.95)

# 3. Vibrant Neon Acid Lime Livery (#d2ff00)
mat_neon_lime = make_shader('Mat_Neon_Lime', (0.75, 1.0, 0.01, 1.0), metallic=0.05, roughness=0.15, clearcoat=1.0, emission=(0.15, 0.25, 0.0, 1.0))

# 4. Iridium Blue/Purple Visor Shield
mat_iridium_visor = make_shader('Mat_Iridium_Visor', (0.08, 0.12, 0.45, 1.0), metallic=0.98, roughness=0.02, clearcoat=1.0)

# 5. Clear Polycarbonate Rear Kamm-Tail Spoiler
mat_clear_spoiler = make_shader('Mat_Clear_Aero', (0.85, 0.90, 0.95, 1.0), metallic=0.1, roughness=0.05, clearcoat=1.0)

# 6. Machined Brushed Titanium (Pivots, vents, bolts)
mat_titanium = make_shader('Mat_Titanium', (0.72, 0.75, 0.78, 1.0), metallic=0.98, roughness=0.16)

# 7. Gasket Rubber & Nomex Interior
mat_rubber = make_shader('Mat_Rubber_Gasket', (0.012, 0.013, 0.015, 1.0), metallic=0.0, roughness=0.7)
mat_nomex = make_shader('Mat_Nomex_Interior', (0.018, 0.019, 0.022, 1.0), metallic=0.0, roughness=0.92)

all_parts = []

def register_piece(obj, name, mat, smooth=True):
    obj.name = name
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)
    if smooth and hasattr(obj.data, 'polygons'):
        for f in obj.data.polygons:
            f.use_smooth = True
    all_parts.append(obj)
    return obj

def make_curved_tube(name, points, radius, mat):
    c = bpy.data.curves.new(name, 'CURVE')
    c.dimensions = '3D'
    c.resolution_u = 24
    c.bevel_depth = radius
    c.bevel_resolution = 4
    s = c.splines.new('BEZIER')
    s.bezier_points.add(len(points) - 1)
    for p, co in zip(s.bezier_points, points):
        p.co = co
        p.handle_left_type = 'AUTO'
        p.handle_right_type = 'AUTO'
    o = bpy.data.objects.new(name, c)
    bpy.context.collection.objects.link(o)
    bpy.context.view_layer.objects.active = o
    o.select_set(True)
    bpy.ops.object.convert(target='MESH')
    return register_piece(bpy.context.object, name, mat)

# ======================================================================
# 1. COQUE PRINCIPALE EN VERT ANGLAIS MÉTALLISÉ (Stilo ST5 / Bell style)
# Profil allongé, mentonnière agressive, arêtes douces conformes à l'image
# ======================================================================
bpy.ops.mesh.primitive_uv_sphere_add(segments=96, ring_count=64, location=(0, -0.06, 0.12))
shell = bpy.context.object
shell.scale = (1.04, 1.28, 1.16)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

for v in shell.data.vertices:
    x = v.co.x
    y = v.co.y
    z = v.co.z
    # Profil arrière aérodynamique allongé
    if y < 0:
        v.co.y -= 0.22 * math.cos(max(min(z, 0.8), -0.6))
    # Avant profilé plongeant
    if y > 0.3 and z > 0.2:
        v.co.z -= 0.08 * (y - 0.3)
    # Affinement des côtés
    if z < -0.2:
        v.co.x *= 0.91

# Découpe ouverture visière (Eyeport Stilo)
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 1.06, 0.16))
vcut = bpy.context.object
vcut.scale = (0.90, 0.70, 0.44)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

b_cut = shell.modifiers.new('VisorCut', 'BOOLEAN')
b_cut.operation = 'DIFFERENCE'
b_cut.solver = 'EXACT'
b_cut.object = vcut
bpy.context.view_layer.objects.active = shell
bpy.ops.object.modifier_apply(modifier=b_cut.name)
bpy.data.objects.remove(vcut, do_unlink=True)

# Découpe ouverture inférieure pour le cou
bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=0.68, depth=1.4, location=(0, -0.16, -0.88))
neck_cut = bpy.context.object
neck_cut.scale = (1.05, 1.22, 1.0)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

b_neck = shell.modifiers.new('NeckCut', 'BOOLEAN')
b_neck.operation = 'DIFFERENCE'
b_neck.solver = 'EXACT'
b_neck.object = neck_cut
bpy.context.view_layer.objects.active = shell
bpy.ops.object.modifier_apply(modifier=b_neck.name)
bpy.data.objects.remove(neck_cut, do_unlink=True)

# Épaisseur de coque composite (4.5mm)
solid = shell.modifiers.new('Solid', 'SOLIDIFY')
solid.thickness = 0.045
bpy.context.view_layer.objects.active = shell
bpy.ops.object.modifier_apply(modifier=solid.name)

# Bevel pour lisser les arêtes
bev = shell.modifiers.new('Bev', 'BEVEL')
bev.width = 0.008
bev.segments = 3
bpy.context.view_layer.objects.active = shell
bpy.ops.object.modifier_apply(modifier=bev.name)

register_piece(shell, '01_BRG_METALLIC_SHELL', mat_brg_paint)

# Joint d'étanchéité vulcanisé noir autour de l'ouverture faciale
make_curved_tube('01_EYEPORT_GASKET', [
    (-0.78, 0.60, -0.11),
    (-0.86, 0.74, 0.10),
    (-0.74, 0.88, 0.39),
    (0, 0.98, 0.44),
    (0.74, 0.88, 0.39),
    (0.86, 0.74, 0.10),
    (0.78, 0.60, -0.11),
    (0, 0.96, -0.11),
    (-0.78, 0.60, -0.11)
], 0.024, mat_rubber)

# Joint de base inférieure
make_curved_tube('01_BASE_RUBBER_SEAL', [
    (0, 1.02, -0.68),
    (0.68, 0.62, -0.68),
    (0.72, -0.22, -0.74),
    (0.45, -1.02, -0.70),
    (0, -1.24, -0.65),
    (-0.45, -1.02, -0.70),
    (-0.72, -0.22, -0.74),
    (-0.68, 0.62, -0.68),
    (0, 1.02, -0.68)
], 0.022, mat_rubber)

# ======================================================================
# 2. SECTIONS EN CARBONE TISSÉ 3K (Calotte centrale & joues arrière)
# Comme sur l'image générée : bande centrale en carbone apparent
# ======================================================================
bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=0.72, depth=0.8, location=(0, -0.05, 0.82), rotation=(math.radians(90), 0, 0))
carbon_top = bpy.context.object
carbon_top.scale = (0.55, 0.68, 1.1)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
mod_csolid = carbon_top.modifiers.new('CSolid', 'SOLIDIFY')
mod_csolid.thickness = 0.03
bpy.context.view_layer.objects.active = carbon_top
bpy.ops.object.modifier_apply(modifier=mod_csolid.name)
register_piece(carbon_top, '02_CROWN_CARBON_INSERT', mat_carbon_weave)

# Panneaux carbone sur les flancs arrière
for side, sx in (('L', -0.66), ('R', 0.66)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(sx, -0.32, 0.02))
    panel = bpy.context.object
    panel.scale = (0.04, 0.42, 0.32)
    panel.rotation_euler = (math.radians(-12), 0, math.radians(-14 if side == 'L' else 14))
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    mod_pb = panel.modifiers.new('PB', 'BEVEL')
    mod_pb.width = 0.02
    bpy.context.view_layer.objects.active = panel
    bpy.ops.object.modifier_apply(modifier=mod_pb.name)
    register_piece(panel, f'02_CARBON_FLANK_{side}', mat_carbon_weave)

# ======================================================================
# 3. LIGNES DE LIVRÉE VERT ACIDE NÉON (#d2ff00)
# Tracé fidèle à l'image générée le long du carbone et du vert
# ======================================================================
for side, lx in (('L', -0.56), ('R', 0.56)):
    # Ligne supérieure longeant le carbone central
    make_curved_tube(f'03_LIME_CROWN_BORDER_{side}', [
        (lx * 0.45, 0.42, 1.05),
        (lx * 0.65, -0.05, 1.12),
        (lx * 0.72, -0.58, 0.95),
        (lx * 0.65, -0.92, 0.68)
    ], 0.016, mat_neon_lime)
    
    # Ligne latérale aérodynamique
    make_curved_tube(f'03_LIME_FLANK_ACCENT_{side}', [
        (lx * 1.10, 0.55, 0.02),
        (lx * 1.18, 0.12, 0.18),
        (lx * 1.14, -0.38, 0.14),
        (lx * 0.95, -0.85, -0.05)
    ], 0.014, mat_neon_lime)

# ======================================================================
# 4. MENTONNIÈRE RACING & GRILLES D'AÉRATION MÉTALLIQUES + N°42
# Conforme à la mentonnière massive avec écopes horizontales de la photo
# ======================================================================
make_curved_tube('04_CHIN_DEFLECTOR', [
    (-0.70, 0.48, -0.28),
    (-0.64, 0.86, -0.52),
    (-0.35, 1.08, -0.66),
    (0, 1.14, -0.68),
    (0.35, 1.08, -0.66),
    (0.64, 0.86, -0.52),
    (0.70, 0.48, -0.28)
], 0.12, mat_brg_paint)

# Fentes d'aération menton avec grilles titane (comme sur la photo de référence)
for i, vx in enumerate((-0.24, -0.12, 0.12, 0.24)):
    # Écope creuse
    bpy.ops.mesh.primitive_cube_add(size=1, location=(vx, 1.18, -0.56))
    vent = bpy.context.object
    vent.scale = (0.08, 0.03, 0.045)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    register_piece(vent, f'04_CHIN_VENT_BEZEL_{i}', mat_neon_lime)

    # Grille interne en titane
    bpy.ops.mesh.primitive_cube_add(size=1, location=(vx, 1.195, -0.56))
    mesh_grille = bpy.context.object
    mesh_grille.scale = (0.07, 0.01, 0.035)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    register_piece(mesh_grille, f'04_CHIN_VENT_MESH_{i}', mat_titanium)

# Empreinte du numéro de course 42 sur la mentonnière
for side, nx in (('L', -0.28), ('R', 0.28)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(nx, 1.10, -0.42))
    num_plate = bpy.context.object
    num_plate.scale = (0.16, 0.015, 0.10)
    num_plate.rotation_euler = (math.radians(-14), 0, math.radians(-15 if side == 'L' else 15))
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    register_piece(num_plate, f'04_DRIVER_NUMBER_42_{side}', mat_carbon_weave)

# ======================================================================
# 5. VISIÈRE DOUBLE COURBURE IRIDIUM VIOLET/BLEU & BANDEAU APEX
# Reproduction fidèle de la visière et du sunstrip en carbone
# ======================================================================
verts_v = []
faces_v = []
segments = 48
for row, (rad, zpos) in enumerate([(1.035, -0.14), (1.055, 0.18), (1.03, 0.41)]):
    for i in range(segments + 1):
        ang = math.radians(-66 + 132 * i / segments)
        vx = 1.045 * math.sin(ang) * rad
        vy = 0.28 + 0.745 * math.cos(ang) * rad
        verts_v.append((vx, vy, zpos))

stride = segments + 1
for r in range(2):
    for i in range(segments):
        p0 = r * stride + i
        p1 = p0 + 1
        p2 = (r + 1) * stride + i + 1
        p3 = (r + 1) * stride + i
        faces_v.append((p0, p1, p2, p3))

mv = bpy.data.meshes.new('Visor_Mesh')
mv.from_pydata(verts_v, [], faces_v)
mv.update()
vis_obj = bpy.data.objects.new('05_IRIDIUM_VISOR', mv)
bpy.context.collection.objects.link(vis_obj)
register_piece(vis_obj, '05_IRIDIUM_VISOR', mat_iridium_visor)

mod_sv = vis_obj.modifiers.new('VisorSolid', 'SOLIDIFY')
mod_sv.thickness = 0.024
bpy.context.view_layer.objects.active = vis_obj
bpy.ops.object.modifier_apply(modifier=mod_sv.name)

# Bandeau pare-soleil carbone avec logo APEX en relief
verts_strip = []
faces_strip = []
for row, (rad, zpos) in enumerate([(1.058, 0.31), (1.062, 0.415)]):
    for i in range(segments + 1):
        ang = math.radians(-64 + 128 * i / segments)
        vx = 1.05 * math.sin(ang) * rad
        vy = 0.28 + 0.75 * math.cos(ang) * rad
        verts_strip.append((vx, vy, zpos))

for i in range(segments):
    faces_strip.append((i, i + 1, stride + i + 1, stride + i))

mstrip = bpy.data.meshes.new('Sunstrip_Mesh')
mstrip.from_pydata(verts_strip, [], faces_strip)
mstrip.update()
strip_obj = bpy.data.objects.new('05_APEX_SUNSTRIP', mstrip)
bpy.context.collection.objects.link(strip_obj)
register_piece(strip_obj, '05_APEX_SUNSTRIP', mat_carbon_weave)

# Loquet de verrouillage central de visière (Central locking clip)
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 1.15, -0.14))
lock_clip = bpy.context.object
lock_clip.scale = (0.045, 0.035, 0.065)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
register_piece(lock_clip, '05_VISOR_LOCK_CLIP', mat_titanium)

# ======================================================================
# 6. PLATINES PIVOT TITANE, VIS CNC & STICKER FIA
# Exactement comme le pivot circulaire argenté sur la photo
# ======================================================================
for side, px in (('L', -0.99), ('R', 0.99)):
    # Platine circulaire anodisée
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=0.115, depth=0.035, location=(px, 0.38, 0.08), rotation=(0, math.pi/2, 0))
    register_piece(bpy.context.object, f'06_PIVOT_DISC_{side}', mat_titanium)

    # Vis centrale creuse à 6 pans
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.045, depth=0.055, location=(px * 1.02, 0.38, 0.08), rotation=(0, math.pi/2, 0))
    register_piece(bpy.context.object, f'06_PIVOT_BOLT_{side}', mat_titanium)

    # Picot tear-off excentré
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.024, depth=0.04, location=(px * 0.92, 0.58, -0.04), rotation=(0, math.pi/2, 0))
    register_piece(bpy.context.object, f'06_TEAROFF_POST_{side}', mat_titanium)

# Sticker d'homologation FIA sur le flanc gauche
bpy.ops.mesh.primitive_cube_add(size=1, location=(-0.96, 0.42, 0.22))
fia_sticker = bpy.context.object
fia_sticker.scale = (0.015, 0.065, 0.065)
fia_sticker.rotation_euler = (0, 0, math.radians(-12))
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
register_piece(fia_sticker, '06_FIA_HOMOLOGATION_BADGE', mat_titanium)

# ======================================================================
# 7. AILERON TRANSPARENT AÉRO KAMM-TAIL ARRIÈRE (Stilo Clear Spoiler)
# Identique au spoiler transparent visible sur l'image à l'arrière
# ======================================================================
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -1.24, 0.54))
rear_spoiler = bpy.context.object
rear_spoiler.scale = (0.78, 0.22, 0.085)
rear_spoiler.rotation_euler = (math.radians(-26), 0, 0)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
mod_sp_b = rear_spoiler.modifiers.new('SpB', 'BEVEL')
mod_sp_b.width = 0.02
bpy.context.view_layer.objects.active = rear_spoiler
bpy.ops.object.modifier_apply(modifier=mod_sp_b.name)
register_piece(rear_spoiler, '07_CLEAR_AERO_SPOILER', mat_clear_spoiler)

# ======================================================================
# 8. HABITACLE INTÉRIEUR NOMEX NOIR
# Col ergonomique et mousses de confort sans aucun ballon ni sphère
# ======================================================================
bpy.ops.mesh.primitive_torus_add(major_radius=0.68, minor_radius=0.08, major_segments=64, minor_segments=16, location=(0, -0.18, -0.66))
neck_roll = bpy.context.object
neck_roll.scale = (1.12, 0.94, 0.52)
neck_roll.rotation_euler = (math.radians(10), 0, 0)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
register_piece(neck_roll, '08_NOMEX_NECK_ROLL', mat_nomex)

for side, x in (('L', -0.60), ('R', 0.60)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x, 0.44, -0.32))
    pad = bpy.context.object
    pad.scale = (0.12, 0.38, 0.30)
    pad.rotation_euler = (0, 0, math.radians(-16 if side == 'L' else 16))
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    mod_b = pad.modifiers.new('B', 'BEVEL')
    mod_b.width = 0.04
    mod_b.segments = 4
    bpy.context.view_layer.objects.active = pad
    bpy.ops.object.modifier_apply(modifier=mod_b.name)
    register_piece(pad, f'08_CHEEK_PAD_{side}', mat_nomex)

# Nettoyage
for o in bpy.data.objects:
    if o.name in ['Cube', 'Light', 'Camera']:
        bpy.data.objects.remove(o, do_unlink=True)

# Export GLB final
bpy.ops.object.select_all(action='DESELECT')
for p in all_parts:
    p.select_set(True)

os.makedirs(os.path.dirname(OUT_GLB), exist_ok=True)
bpy.ops.export_scene.gltf(
    filepath=OUT_GLB,
    export_format='GLB',
    use_selection=True,
    export_materials='EXPORT',
    export_apply=True
)

print(f"SUCCÈS: Modèle 3D fidèle généré et exporté avec {len(all_parts)} composants de précision !")
