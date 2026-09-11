"""
BUILD MASTER MOTORSPORT HELMET (STILO ST5 / BELL HP7)
Génération haute fidélité avec modélisation organique et matériaux PBR professionnels :
- Coque profilée avec dôme continu, profil aérodynamique et mentonnière saillante agressive
- Calotte carbone centrale intégrée
- Liserés aérodynamiques vert néon acide (#d2ff00)
- Visière thermoformée incurvée avec reflet miroir Iridium bleu/violet
- Bandeau pare-soleil carbone neutre (sans APEX)
- Loquet de verrouillage central de visière
- Mécanismes pivots titane usiné et vis fraisées
- Joints en caoutchouc vulcanisé noir pour l'eyeport et le tour de cou
- 6 ouïes d'aération frontales avec grilles métalliques
- Aileron Kamm-tail transparent arrière et fixations titane
- Ancrages HANS FIA latéraux et sangles jugulaires avec boucle Double-D
- Mousses de joues ergonomiques Nomex et calotin protecteur EPS
"""
import bpy
import bmesh
import math
import os
from mathutils import Vector, Euler

BASE_DIR = "/Users/gauthierminor/Desktop/dev/Karting"
OUTPUT_GLB = os.path.join(BASE_DIR, "public", "models", "karting_helmet_assembly.glb")
OUTPUT_BLEND = os.path.join(BASE_DIR, "public", "models", "karting_helmet_assembly.blend")
PREVIEW_IMG = os.path.join(BASE_DIR, "public", "textures", "render_preview_stilo.png")

os.makedirs(os.path.dirname(OUTPUT_GLB), exist_ok=True)

# 0. Réinitialiser la scène
bpy.ops.wm.read_factory_settings(use_empty=True)
root_col = bpy.context.scene.collection

# ---------------------------------------------------------------------------
# 1. SHADERS PBR MOTORSPORT NOBLES
# ---------------------------------------------------------------------------

def make_shader(name, base_color, metallic=0.0, roughness=0.25, clearcoat=0.0, transmission=0.0):
    mat = bpy.data.materials.new(name)
    nodes = mat.node_tree.nodes
    bsdf = nodes.get('Principled BSDF')
    if not bsdf:
        bsdf = nodes.new('ShaderNodeBsdfPrincipled')
        out = nodes.get('Material Output') or nodes.new('ShaderNodeOutputMaterial')
        mat.node_tree.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])

    bsdf.inputs['Base Color'].default_value = base_color
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    if 'Coat Weight' in bsdf.inputs:
        bsdf.inputs['Coat Weight'].default_value = clearcoat
        bsdf.inputs['Coat Roughness'].default_value = 0.02
    elif 'Clearcoat' in bsdf.inputs:
        bsdf.inputs['Clearcoat'].default_value = clearcoat

    if transmission > 0.0:
        if 'Transmission Weight' in bsdf.inputs:
            bsdf.inputs['Transmission Weight'].default_value = transmission
        elif 'Transmission' in bsdf.inputs:
            bsdf.inputs['Transmission'].default_value = transmission
        mat.blend_method = 'BLEND'
    return mat

mat_brg = make_shader('Mat_Shell_BRG_Metallic', (0.012, 0.095, 0.040, 1.0), metallic=0.68, roughness=0.10, clearcoat=1.0)
mat_carbon = make_shader('Mat_Carbon_Fiber_3K', (0.016, 0.018, 0.020, 1.0), metallic=0.88, roughness=0.16, clearcoat=0.95)
mat_neon_lime = make_shader('Mat_Neon_Lime_Livery', (0.75, 1.0, 0.015, 1.0), metallic=0.05, roughness=0.15, clearcoat=1.0)
mat_iridium = make_shader('Mat_Visor_Iridium', (0.05, 0.10, 0.42, 1.0), metallic=0.96, roughness=0.02, clearcoat=1.0)
mat_titanium = make_shader('Mat_Titanium', (0.74, 0.76, 0.80, 1.0), metallic=0.98, roughness=0.14)
mat_black_alu = make_shader('Mat_Black_Alu', (0.02, 0.02, 0.024, 1.0), metallic=0.90, roughness=0.22)
mat_rubber = make_shader('Mat_Rubber_Gasket', (0.014, 0.014, 0.015, 1.0), metallic=0.0, roughness=0.78)
mat_nomex = make_shader('Mat_Nomex_Interior', (0.02, 0.02, 0.022, 1.0), metallic=0.0, roughness=0.95)
mat_eps = make_shader('Mat_EPS_Foam', (0.055, 0.055, 0.060, 1.0), metallic=0.0, roughness=0.88)
mat_clear_aero = make_shader('Mat_Clear_Polycarbonate', (0.90, 0.94, 0.98, 0.70), metallic=0.05, roughness=0.04, clearcoat=1.0, transmission=0.90)
mat_strap_red = make_shader('Mat_Kevlar_Strap', (0.78, 0.10, 0.06, 1.0), metallic=0.0, roughness=0.86)

all_pieces = []

def assign_piece(obj, name, mat):
    obj.name = name
    obj.data.materials.clear()
    obj.data.materials.append(mat)
    if hasattr(obj.data, 'polygons'):
        for p in obj.data.polygons:
            p.use_smooth = True
            p.material_index = 0
    all_pieces.append(obj)
    return obj

def make_tube(name, points, radius, mat):
    c = bpy.data.curves.new(name, 'CURVE')
    c.dimensions = '3D'
    c.resolution_u = 32
    c.bevel_depth = radius
    c.bevel_resolution = 6
    s = c.splines.new('BEZIER')
    s.bezier_points.add(len(points) - 1)
    for p, co in zip(s.bezier_points, points):
        p.co = co
        p.handle_left_type = 'AUTO'
        p.handle_right_type = 'AUTO'
    o = bpy.data.objects.new(name, c)
    root_col.objects.link(o)
    bpy.context.view_layer.objects.active = o
    o.select_set(True)
    bpy.ops.object.convert(target='MESH')
    return assign_piece(o, name, mat)

# ---------------------------------------------------------------------------
# 2. MODÉLISATION ANATOMIQUE STILO ST5 (ÉCHELLE RÉELLE)
# ---------------------------------------------------------------------------

# 2.1 Coque Principale (helmet_shell)
# Utiliser un loft précis de 12 sections anatomiques avec bmesh
specs_shell = [
    # (z, rx, ry_front, ry_back, cy, chin_prow, brow_flare)
    (0.138, 0.048, 0.052, 0.056, -0.008, 0.0, 0.0),    # Sommet dôme
    (0.128, 0.090, 0.094, 0.102, -0.012, 0.0, 0.0),    # Calotte haute
    (0.106, 0.118, 0.122, 0.132, -0.018, 0.0, 0.0),    # Front haut
    (0.070, 0.126, 0.135, 0.145, -0.015, 0.0, 0.012),  # Arcade sourcilière
    (0.026, 0.128, 0.146, 0.150, -0.006, 0.0, 0.0),    # Axe pivot / yeux
    (-0.010, 0.126, 0.158, 0.150, 0.005, 0.012, 0.0),  # Seuil supérieur mentonnière
    (-0.046, 0.122, 0.170, 0.148, 0.014, 0.026, 0.0),  # Milieu mentonnière
    (-0.082, 0.114, 0.168, 0.142, 0.016, 0.022, 0.0),  # Mâchoire inférieure
    (-0.114, 0.100, 0.142, 0.130, 0.010, 0.008, 0.0),  # Évasement cou
    (-0.135, 0.088, 0.106, 0.112, -0.008, 0.0, 0.0),   # Collerette base
]

bm = bmesh.new()
segments = 80
ring_verts = []

for z, rx, ry_f, ry_b, cy, chin_prow, brow_flare in specs_shell:
    ring = []
    for s in range(segments):
        phi = 2.0 * math.pi * s / segments
        is_front = math.cos(phi) >= 0
        ry = ry_f if is_front else ry_b
        if is_front and chin_prow > 0:
            ry += chin_prow * (max(0.0, math.cos(phi)) ** 2.2)
        if is_front and brow_flare > 0:
            ry += brow_flare * (max(0.0, math.cos(phi)) ** 2.0)
        x = math.sin(phi) * rx
        y = math.cos(phi) * ry + cy
        v = bm.verts.new((x, y, z))
        ring.append(v)
    ring_verts.append(ring)

bm.verts.ensure_lookup_table()
top_v = bm.verts.new((0.0, -0.008, 0.140))
for s in range(segments):
    bm.faces.new((top_v, ring_verts[0][(s + 1) % segments], ring_verts[0][s]))

for r in range(len(specs_shell) - 1):
    for s in range(segments):
        bm.faces.new((
            ring_verts[r][s],
            ring_verts[r][(s + 1) % segments],
            ring_verts[r + 1][(s + 1) % segments],
            ring_verts[r + 1][s]
        ))

mesh_shell = bpy.data.meshes.new("shell_mesh")
bm.to_mesh(mesh_shell)
bm.free()
shell = bpy.data.objects.new("Part_OuterShell", mesh_shell)
root_col.objects.link(shell)

# Découpe inférieure cou
bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=0.092, depth=0.35, location=(0, -0.010, -0.145))
neck_cutter = bpy.context.object
neck_cutter.scale = (1.02, 1.25, 1.0)
neck_cutter.rotation_euler = (math.radians(10), 0, 0)
bpy.ops.object.transform_apply(scale=True, rotation=True)
m_neck = shell.modifiers.new('NeckCut', 'BOOLEAN')
m_neck.operation = 'DIFFERENCE'
m_neck.object = neck_cutter
bpy.context.view_layer.objects.active = shell
bpy.ops.object.modifier_apply(modifier=m_neck.name)
bpy.data.objects.remove(neck_cutter, do_unlink=True)

# Découpe eyeport faciale
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0.138, 0.028))
eye_cutter = bpy.context.object
eye_cutter.scale = (0.225, 0.18, 0.062)
eye_cutter.rotation_euler = (math.radians(-6), 0, 0)
bpy.ops.object.transform_apply(scale=True, rotation=True)
m_eye = shell.modifiers.new('EyeCut', 'BOOLEAN')
m_eye.operation = 'DIFFERENCE'
m_eye.object = eye_cutter
bpy.context.view_layer.objects.active = shell
bpy.ops.object.modifier_apply(modifier=m_eye.name)
bpy.data.objects.remove(eye_cutter, do_unlink=True)

# Solidify & Bevel
m_sol = shell.modifiers.new('Solid', 'SOLIDIFY')
m_sol.thickness = 0.0045
m_sol.offset = -1.0
bpy.ops.object.modifier_apply(modifier=m_sol.name)

m_bev = shell.modifiers.new('Bev', 'BEVEL')
m_bev.width = 0.0016
m_bev.segments = 2
bpy.ops.object.modifier_apply(modifier=m_bev.name)

assign_piece(shell, "Part_OuterShell", mat_brg)

# 2.2 Dôme Central en Carbone 3K Apparent (Calotte Stilo ST5)
bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=0.098, depth=0.18, location=(0, -0.015, 0.105), rotation=(math.radians(90), 0, 0))
crown_carbon = bpy.context.object
crown_carbon.scale = (0.58, 0.68, 1.05)
bpy.ops.object.transform_apply(scale=True, rotation=True)
m_csol = crown_carbon.modifiers.new('CSol', 'SOLIDIFY')
m_csol.thickness = 0.003
bpy.ops.object.modifier_apply(modifier=m_csol.name)
assign_piece(crown_carbon, "Part_Crown_Carbon_Weave", mat_carbon)

# 2.3 Lignes de livrée Aérodynamiques Vert Néon Acide (#d2ff00)
for side, sx in [('Left', -1), ('Right', 1)]:
    # Ligne longeant la calotte centrale carbone
    make_tube(f"Livery_Stripe_Crown_{side}", [
        (sx * 0.035, 0.085, 0.098),
        (sx * 0.052, 0.000, 0.128),
        (sx * 0.058, -0.075, 0.112),
        (sx * 0.048, -0.125, 0.075)
    ], 0.0022, mat_neon_lime)

    # Ligne dynamique sur les flancs
    make_tube(f"Livery_Stripe_Flank_{side}", [
        (sx * 0.118, 0.085, 0.005),
        (sx * 0.128, 0.020, 0.022),
        (sx * 0.124, -0.055, 0.018),
        (sx * 0.105, -0.118, -0.012)
    ], 0.0020, mat_neon_lime)

# 2.4 Joint d'Étanchéité d'Eyeport en Caoutchouc Vulcanisé
bm_seal = bmesh.new()
seal_segs = 54
for s in range(seal_segs):
    ang = math.radians(-74 + 148 * s / (seal_segs - 1))
    vx = math.sin(ang) * 0.1235
    vy = math.cos(ang) * 0.1465 - 0.003
    bm_seal.verts.new((vx, vy, 0.058))
    bm_seal.verts.new((vx, vy, -0.003))

bm_seal.verts.ensure_lookup_table()
for s in range(seal_segs - 1):
    bm_seal.edges.new((bm_seal.verts[s * 2], bm_seal.verts[(s + 1) * 2]))
    bm_seal.edges.new((bm_seal.verts[s * 2 + 1], bm_seal.verts[(s + 1) * 2 + 1]))
bm_seal.edges.new((bm_seal.verts[0], bm_seal.verts[1]))
bm_seal.edges.new((bm_seal.verts[(seal_segs - 1) * 2], bm_seal.verts[(seal_segs - 1) * 2 + 1]))

mesh_seal = bpy.data.meshes.new("visor_seal_mesh")
bm_seal.to_mesh(mesh_seal)
bm_seal.free()
seal = bpy.data.objects.new("Part_Eyeport_Gasket", mesh_seal)
root_col.objects.link(seal)
m_skin = seal.modifiers.new('Skin', 'SKIN')
for v in seal.data.skin_vertices[0].data:
    v.radius = (0.0022, 0.0022)
bpy.context.view_layer.objects.active = seal
bpy.ops.object.modifier_apply(modifier=m_skin.name)
assign_piece(seal, "Part_Eyeport_Gasket", mat_rubber)

# Joint de collerette inférieure
make_tube("Part_Neck_Rubber_Seal", [
    (0, 0.108, -0.128),
    (0.078, 0.065, -0.128),
    (0.084, -0.024, -0.134),
    (0.052, -0.112, -0.130),
    (0, -0.132, -0.126),
    (-0.052, -0.112, -0.130),
    (-0.084, -0.024, -0.134),
    (-0.078, 0.065, -0.128),
    (0, 0.108, -0.128)
], 0.0024, mat_rubber)

# 2.5 Visière Thermoformée Torique Iridium Courbée Haute Fidélité
VISOR_AXIS = Vector((0.0, 0.015, 0.026))
bm_v = bmesh.new()
v_segs = 72
v_heights = 16
z_v_min, z_v_max = -0.005, 0.061
for h in range(v_heights):
    t = h / (v_heights - 1)
    z = z_v_min + t * (z_v_max - z_v_min)
    toric = math.sin(t * math.pi)
    rad_x = 0.1245 + 0.0020 * toric
    rad_y = 0.1480 + 0.0035 * toric
    for s in range(v_segs):
        ang = math.radians(-76 + 152 * s / (v_segs - 1))
        vx = math.sin(ang) * rad_x
        vy = math.cos(ang) * rad_y - 0.003
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

mesh_v = bpy.data.meshes.new("visor_mesh")
bm_v.to_mesh(mesh_v)
bm_v.free()
visor = bpy.data.objects.new("Part_Visor", mesh_v)
root_col.objects.link(visor)
m_vsol = visor.modifiers.new('Sol', 'SOLIDIFY')
m_vsol.thickness = 0.0024
bpy.context.view_layer.objects.active = visor
bpy.ops.object.modifier_apply(modifier=m_vsol.name)
assign_piece(visor, "Part_Visor", mat_iridium)

# 2.6 Bandeau Pare-Soleil Carbone Neutre (Sans APEX)
bm_s = bmesh.new()
for z in [0.044, 0.0615]:
    for s in range(v_segs):
        ang = math.radians(-76 + 152 * s / (v_segs - 1))
        vx = math.sin(ang) * 0.1258
        vy = math.cos(ang) * 0.1493 - 0.003
        bm_s.verts.new((vx, vy, z))
bm_s.verts.ensure_lookup_table()
for s in range(v_segs - 1):
    bm_s.faces.new((bm_s.verts[s], bm_s.verts[s+1], bm_s.verts[v_segs + s + 1], bm_s.verts[v_segs + s]))

mesh_s = bpy.data.meshes.new("visor_sunstrip_mesh")
bm_s.to_mesh(mesh_s)
bm_s.free()
sunstrip = bpy.data.objects.new("Part_Sunstrip_Carbon_Neutral", mesh_s)
root_col.objects.link(sunstrip)
assign_piece(sunstrip, "Part_Sunstrip_Carbon_Neutral", mat_carbon)

# 2.7 Loquet Central et Pivots Titane
# Loquet de verrouillage central
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0.154, -0.004))
latch = bpy.context.object
latch.scale = (0.014, 0.008, 0.012)
latch.rotation_euler = (math.radians(-8), 0, 0)
bpy.ops.object.transform_apply(scale=True, rotation=True)
assign_piece(latch, "Part_Visor_Center_Latch", mat_black_alu)

# Pivots latéraux
for side, side_str in [(-1, "Left"), (1, "Right")]:
    # Platine alu usiné CNC noir
    bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=0.015, depth=0.004, location=(side * 0.125, 0.015, 0.026))
    plat = bpy.context.object
    plat.rotation_euler = (0, math.radians(90), 0)
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    assign_piece(plat, f"Part_Pivot_Plate_{side_str}", mat_black_alu)

    # Vis centrale titane
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.007, depth=0.006, location=(side * 0.127, 0.015, 0.026))
    screw = bpy.context.object
    screw.rotation_euler = (0, math.radians(90), 0)
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    assign_piece(screw, f"Part_Pivot_Screw_{side_str}", mat_titanium)

    # Picot tear-off excentré sur la visière
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.003, depth=0.005, location=(side * 0.118, 0.048, 0.018))
    tear = bpy.context.object
    tear.rotation_euler = (math.radians(20), math.radians(side * 40), 0)
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    assign_piece(tear, f"Part_Tearoff_Post_{side_str}", mat_titanium)

# 2.8 Ouïes de Ventilation Frontales Mentonnière (6 fentes Stilo)
vent_specs = [
    # (name, location, scale, rotation)
    ("chin_center_top_left", (-0.015, 0.165, -0.048), (0.011, 0.006, 0.004), (math.radians(10), 0, math.radians(-10))),
    ("chin_center_top_right", (0.015, 0.165, -0.048), (0.011, 0.006, 0.004), (math.radians(10), 0, math.radians(10))),
    ("chin_mid_left", (-0.038, 0.158, -0.052), (0.012, 0.006, 0.004), (math.radians(10), 0, math.radians(-24))),
    ("chin_mid_right", (0.038, 0.158, -0.052), (0.012, 0.006, 0.004), (math.radians(10), 0, math.radians(24))),
    ("chin_bottom_left", (-0.025, 0.156, -0.078), (0.012, 0.006, 0.004), (math.radians(15), 0, math.radians(-15))),
    ("chin_bottom_right", (0.025, 0.156, -0.078), (0.012, 0.006, 0.004), (math.radians(15), 0, math.radians(15))),
]

for vname, loc, scl, rot in vent_specs:
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc)
    v = bpy.context.object
    v.scale = scl
    v.rotation_euler = rot
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    assign_piece(v, f"Part_Vent_{vname}", mat_black_alu)

# 2.9 Spoilers Aérodynamiques Transparents & Fixations Titane
# Spoiler mentonnière transparent (lip)
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0.162, -0.100))
clip = bpy.context.object
clip.scale = (0.082, 0.015, 0.004)
clip.rotation_euler = (math.radians(18), 0, 0)
bpy.ops.object.transform_apply(scale=True, rotation=True)
assign_piece(clip, "Part_Chin_Lip_Spoiler", mat_clear_aero)

# Aileron Kamm-tail arrière déportance
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -0.144, 0.075))
rspoil = bpy.context.object
rspoil.scale = (0.11, 0.024, 0.008)
rspoil.rotation_euler = (math.radians(-32), 0, 0)
bpy.ops.object.transform_apply(scale=True, rotation=True)
assign_piece(rspoil, "Part_Rear_Kamm_Spoiler", mat_clear_aero)

# Vis aileron arrière titane
for side, side_str in [(-1, "Left"), (1, "Right")]:
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.003, depth=0.003, location=(side * 0.045, -0.142, 0.080))
    screw = bpy.context.object
    screw.rotation_euler = (math.radians(-32), 0, 0)
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    assign_piece(screw, f"Part_Rear_Spoiler_Screw_{side_str}", mat_titanium)

# 2.10 Ancrages HANS FIA & Sangles Jugulaires
for side, side_str in [(-1, "Left"), (1, "Right")]:
    # Plot fileté FIA anodisé argenté
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.006, depth=0.005, location=(side * 0.108, -0.065, -0.065))
    hans = bpy.context.object
    hans.rotation_euler = (0, math.radians(90), 0)
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    assign_piece(hans, f"Part_HANS_Anchor_{side_str}", mat_titanium)

    # Sangles rouges Kevlar
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.055, -0.018, -0.100))
    st = bpy.context.object
    st.scale = (0.002, 0.014, 0.040)
    st.rotation_euler = (math.radians(-10), 0, side * math.radians(12))
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    assign_piece(st, f"Part_Chinstrap_{side_str}", mat_strap_red)

# Boucle Double-D en titane
bpy.ops.mesh.primitive_torus_add(major_radius=0.010, minor_radius=0.002, location=(-0.010, -0.028, -0.125))
buckle = bpy.context.object
buckle.rotation_euler = (math.radians(65), 0, 0)
bpy.ops.object.transform_apply(scale=True, rotation=True)
assign_piece(buckle, "Part_Double_D_Ring_Buckle", mat_titanium)

# 2.11 Calotin Protecteur EPS & Mousses Nomex Ergonomiques
# Calotin EPS d'absorption
specs_inner = [
    (0.132, 0.040, 0.044, 0.048, -0.008),
    (0.122, 0.078, 0.082, 0.090, -0.012),
    (0.100, 0.104, 0.108, 0.116, -0.018),
    (0.065, 0.112, 0.120, 0.128, -0.015),
    (0.025, 0.114, 0.130, 0.132, -0.006),
    (-0.012, 0.112, 0.138, 0.134, 0.005),
    (-0.048, 0.108, 0.146, 0.132, 0.012),
    (-0.080, 0.102, 0.144, 0.126, 0.016),
    (-0.110, 0.090, 0.124, 0.116, 0.010),
    (-0.128, 0.078, 0.094, 0.100, -0.008),
]

bm_in = bmesh.new()
ring_in = []
for z, rx, ry_f, ry_b, cy in specs_inner:
    ring = []
    for s in range(segments):
        phi = 2.0 * math.pi * s / segments
        ry = ry_f if math.cos(phi) >= 0 else ry_b
        x = math.sin(phi) * rx
        y = math.cos(phi) * ry + cy
        v = bm_in.verts.new((x, y, z))
        ring.append(v)
    ring_in.append(ring)

bm_in.verts.ensure_lookup_table()
top_in = bm_in.verts.new((0.0, -0.008, 0.134))
for s in range(segments):
    bm_in.faces.new((top_in, ring_in[0][(s + 1) % segments], ring_in[0][s]))

for r in range(len(specs_inner) - 1):
    for s in range(segments):
        bm_in.faces.new((
            ring_in[r][s],
            ring_in[r][(s + 1) % segments],
            ring_in[r + 1][(s + 1) % segments],
            ring_in[r + 1][s]
        ))

mesh_in = bpy.data.meshes.new("inner_shell_mesh")
bm_in.to_mesh(mesh_in)
bm_in.free()
eps = bpy.data.objects.new("Part_InnerEPS", mesh_in)
root_col.objects.link(eps)

# Découpe neck & eyeport pour EPS
bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=0.082, depth=0.35, location=(0, -0.010, -0.145))
neck_c = bpy.context.object
neck_c.scale = (1.0, 1.22, 1.0)
neck_c.rotation_euler = (math.radians(10), 0, 0)
bpy.ops.object.transform_apply(scale=True, rotation=True)
m_neck_in = eps.modifiers.new('NeckCut', 'BOOLEAN')
m_neck_in.operation = 'DIFFERENCE'
m_neck_in.object = neck_c
bpy.context.view_layer.objects.active = eps
bpy.ops.object.modifier_apply(modifier=m_neck_in.name)
bpy.data.objects.remove(neck_c, do_unlink=True)

m_isol = eps.modifiers.new('Sol', 'SOLIDIFY')
m_isol.thickness = 0.012
m_isol.offset = -1.0
bpy.ops.object.modifier_apply(modifier=m_isol.name)
assign_piece(eps, "Part_InnerEPS", mat_eps)

# Mousses Nomex ergonomiques
mesh_pad = bpy.data.meshes.new("inner_padding_mesh")
pad_obj = bpy.data.objects.new("Part_InnerPadding_Nomex", mesh_pad)
root_col.objects.link(pad_obj)
bm_pad = bmesh.new()
for side in [-1, 1]:
    bmesh.ops.create_cube(bm_pad, size=1.0)
    for v in bm_pad.verts[-8:]:
        v.co.x = v.co.x * 0.016 + side * 0.088
        v.co.y = v.co.y * 0.045 + 0.065
        v.co.z = v.co.z * 0.035 - 0.050

bmesh.ops.create_cube(bm_pad, size=1.0)
for v in bm_pad.verts[-8:]:
    v.co.x = v.co.x * 0.075
    v.co.y = v.co.y * 0.085 - 0.015
    v.co.z = v.co.z * 0.015 + 0.115

bm_pad.to_mesh(mesh_pad)
bm_pad.free()
m_sub = pad_obj.modifiers.new('Sub', 'SUBSURF')
m_sub.levels = 2
bpy.context.view_layer.objects.active = pad_obj
bpy.ops.object.modifier_apply(modifier=m_sub.name)
assign_piece(pad_obj, "Part_InnerPadding_Nomex", mat_nomex)

print(f"Total composants modélisés : {len(all_pieces)}")

# ---------------------------------------------------------------------------
# 3. SAUVEGARDE SCÈNE BLENDER & EXPORT GLB
# ---------------------------------------------------------------------------
bpy.ops.wm.save_as_mainfile(filepath=OUTPUT_BLEND)

# Exportation GLB optimisée avec noms de pièces préservés pour Three.js
bpy.ops.object.select_all(action='DESELECT')
for p in all_pieces:
    p.select_set(True)

bpy.ops.export_scene.gltf(
    filepath=OUTPUT_GLB,
    export_format='GLB',
    use_selection=True,
    export_apply=True,
    export_yup=True,
    export_materials='EXPORT',
    export_cameras=False,
    export_lights=False
)
print(f"GLB exporté avec succès dans : {OUTPUT_GLB}")

# ---------------------------------------------------------------------------
# 4. RENDU PHOTO STUDIO MOTORSPORT (VUE 3/4 DYNAMIQUE)
# ---------------------------------------------------------------------------
world = bpy.data.worlds.new('StudioWorld')
bpy.context.scene.world = world
world.color = (0.05, 0.055, 0.065)

# Caméra studio dynamique cadrée
cam_data = bpy.data.cameras.new('Cam_Studio')
cam_data.lens = 70
cam = bpy.data.objects.new('Cam_Studio', cam_data)
root_col.objects.link(cam)
cam.location = (0.44, 0.62, 0.18)
target = Vector((0, 0.04, -0.01))
cam.rotation_euler = (target - cam.location).to_track_quat('-Z', 'Y').to_euler()
bpy.context.scene.camera = cam

# Éclairage 3 points noble
l1 = bpy.data.lights.new('KeySun', 'SUN')
l1.energy = 4.8
lo1 = bpy.data.objects.new('KeySun', l1)
root_col.objects.link(lo1)
lo1.rotation_euler = (Vector((0,0,0)) - Vector((2.5, 2.5, 3.5))).to_track_quat('-Z', 'Y').to_euler()

l2 = bpy.data.lights.new('LimeRim', 'SUN')
l2.energy = 5.2
l2.color = (0.75, 1.0, 0.02)
lo2 = bpy.data.objects.new('LimeRim', l2)
root_col.objects.link(lo2)
lo2.rotation_euler = (Vector((0,0,0)) - Vector((-3.5, 1.0, 2.0))).to_track_quat('-Z', 'Y').to_euler()

l3 = bpy.data.lights.new('BlueFill', 'SUN')
l3.energy = 2.5
l3.color = (0.1, 0.4, 1.0)
lo3 = bpy.data.objects.new('BlueFill', l3)
root_col.objects.link(lo3)
lo3.rotation_euler = (Vector((0,0,0)) - Vector((0.0, -3.0, 1.5))).to_track_quat('-Z', 'Y').to_euler()

bpy.context.scene.render.resolution_x = 1000
bpy.context.scene.render.resolution_y = 1000
bpy.context.scene.render.filepath = PREVIEW_IMG
bpy.ops.render.render(write_still=True)
print(f"Rendu de contrôle studio généré dans : {PREVIEW_IMG}")
