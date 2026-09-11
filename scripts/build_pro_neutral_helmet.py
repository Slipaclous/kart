"""
BLENDER SCRIPT: CASQUE AUTOMOBILE HAUTE FIDÉLITÉ (STILO ST5 / BELL HP7 NEUTRE SANS APEX)
Exécutable directement dans Blender ou via Blender MCP.
"""
import bpy
import bmesh
import math
import os
from mathutils import Vector, Euler

# Chemins de sortie
BASE_DIR = "/Users/gauthierminor/Desktop/dev/Karting"
OUTPUT_GLB = os.path.join(BASE_DIR, "public", "models", "karting_helmet_assembly.glb")
OUTPUT_BLEND = os.path.join(BASE_DIR, "public", "models", "karting_helmet_assembly.blend")
PREVIEW_IMG = os.path.join(BASE_DIR, "public", "textures", "render_preview_stilo.png")

os.makedirs(os.path.dirname(OUTPUT_GLB), exist_ok=True)
os.makedirs(os.path.dirname(PREVIEW_IMG), exist_ok=True)

# 0. Réinitialiser la scène
bpy.ops.wm.read_factory_settings(use_empty=True)

root_col = bpy.context.scene.collection

# ---------------------------------------------------------------------------
# 1. SHADERS & MATÉRIAUX PBR PROCÉDURAUX HAUTE DÉFINITION
# ---------------------------------------------------------------------------

def create_pbr_shader(name, base_color=(0.1, 0.1, 0.1, 1.0), metallic=0.0, roughness=0.3, clearcoat=0.0, transmission=0.0, ior=1.5):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    out = nodes.new('ShaderNodeOutputMaterial')
    bsdf = nodes.new('ShaderNodeBsdfPrincipled')
    links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])

    bsdf.inputs['Base Color'].default_value = base_color
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness

    if 'Coat Weight' in bsdf.inputs:
        bsdf.inputs['Coat Weight'].default_value = clearcoat
        bsdf.inputs['Coat Roughness'].default_value = 0.03
    elif 'Clearcoat' in bsdf.inputs:
        bsdf.inputs['Clearcoat'].default_value = clearcoat

    if transmission > 0.0:
        if 'Transmission Weight' in bsdf.inputs:
            bsdf.inputs['Transmission Weight'].default_value = transmission
        elif 'Transmission' in bsdf.inputs:
            bsdf.inputs['Transmission'].default_value = transmission
        mat.blend_method = 'BLEND'

    return mat

# A. Vert Anglais Métallisé Verni Carrosserie (British Racing Green)
def create_brg_metallic_material():
    mat = bpy.data.materials.new("MAT_Shell_BRG_Metallic")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    out = nodes.new('ShaderNodeOutputMaterial')
    bsdf = nodes.new('ShaderNodeBsdfPrincipled')
    links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])

    # Couleur de base vert émeraude racing sombre et profond
    bsdf.inputs['Base Color'].default_value = (0.012, 0.10, 0.038, 1.0)
    bsdf.inputs['Metallic'].default_value = 0.68
    bsdf.inputs['Roughness'].default_value = 0.10
    if 'Coat Weight' in bsdf.inputs:
        bsdf.inputs['Coat Weight'].default_value = 1.0
        bsdf.inputs['Coat Roughness'].default_value = 0.02
    elif 'Clearcoat' in bsdf.inputs:
        bsdf.inputs['Clearcoat'].default_value = 1.0

    return mat

# B. Fibre de Carbone Tissée 3K Procédurale (Dôme central & détails latéraux)
def create_carbon_3k_material():
    mat = bpy.data.materials.new("MAT_Carbon_Fiber_3K")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    out = nodes.new('ShaderNodeOutputMaterial')
    bsdf = nodes.new('ShaderNodeBsdfPrincipled')
    links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])

    coord = nodes.new('ShaderNodeTexCoord')
    mapping = nodes.new('ShaderNodeMapping')
    mapping.inputs['Scale'].default_value = (140.0, 140.0, 140.0)
    links.new(coord.outputs['UV'], mapping.inputs['Vector'])

    # Tissage 45°
    wave1 = nodes.new('ShaderNodeTexWave')
    wave1.wave_type = 'BANDS'
    wave1.inputs['Scale'].default_value = 18.0
    wave1.inputs['Distortion'].default_value = 0.4
    links.new(mapping.outputs['Vector'], wave1.inputs['Vector'])

    wave2 = nodes.new('ShaderNodeTexWave')
    wave2.wave_type = 'RINGS'
    wave2.inputs['Scale'].default_value = 18.0
    wave2.inputs['Distortion'].default_value = 0.4
    links.new(mapping.outputs['Vector'], wave2.inputs['Vector'])

    mix_tex = nodes.new('ShaderNodeMix')
    mix_tex.data_type = 'FLOAT'
    mix_tex.inputs['Factor'].default_value = 0.5
    links.new(wave1.outputs['Color'], mix_tex.inputs[2])
    links.new(wave2.outputs['Color'], mix_tex.inputs[3])

    color_ramp = nodes.new('ShaderNodeValToRGB')
    color_ramp.color_ramp.elements[0].position = 0.3
    color_ramp.color_ramp.elements[0].color = (0.015, 0.016, 0.018, 1.0)
    color_ramp.color_ramp.elements[1].position = 0.7
    color_ramp.color_ramp.elements[1].color = (0.045, 0.048, 0.052, 1.0)
    links.new(mix_tex.outputs['Result'], color_ramp.inputs['Fac'])

    links.new(color_ramp.outputs['Color'], bsdf.inputs['Base Color'])
    bsdf.inputs['Metallic'].default_value = 0.85
    bsdf.inputs['Roughness'].default_value = 0.18
    if 'Coat Weight' in bsdf.inputs:
        bsdf.inputs['Coat Weight'].default_value = 1.0
        bsdf.inputs['Coat Roughness'].default_value = 0.02
    elif 'Clearcoat' in bsdf.inputs:
        bsdf.inputs['Clearcoat'].default_value = 1.0

    bump = nodes.new('ShaderNodeBump')
    bump.inputs['Strength'].default_value = 0.12
    bump.inputs['Distance'].default_value = 0.002
    links.new(mix_tex.outputs['Result'], bump.inputs['Height'])
    links.new(bump.outputs['Normal'], bsdf.inputs['Normal'])

    return mat

# C. Visière Miroir Iridium Bleu-Violet
def create_iridium_visor_material():
    mat = bpy.data.materials.new("MAT_Visor_Iridium")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    out = nodes.new('ShaderNodeOutputMaterial')
    bsdf = nodes.new('ShaderNodeBsdfPrincipled')
    links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])

    # Reflets irisés bleu nuit & violet racing
    fresnel = nodes.new('ShaderNodeFresnel')
    fresnel.inputs['IOR'].default_value = 2.4

    ramp = nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].position = 0.0
    ramp.color_ramp.elements[0].color = (0.03, 0.08, 0.35, 1.0) # Bleu nuit
    ramp.color_ramp.elements[1].position = 0.85
    ramp.color_ramp.elements[1].color = (0.32, 0.04, 0.40, 1.0) # Teinte violette sur les bords
    links.new(fresnel.outputs['Fac'], ramp.inputs['Fac'])

    links.new(ramp.outputs['Color'], bsdf.inputs['Base Color'])
    bsdf.inputs['Metallic'].default_value = 0.98
    bsdf.inputs['Roughness'].default_value = 0.015
    if 'Coat Weight' in bsdf.inputs:
        bsdf.inputs['Coat Weight'].default_value = 1.0
        bsdf.inputs['Coat Roughness'].default_value = 0.01
    elif 'Clearcoat' in bsdf.inputs:
        bsdf.inputs['Clearcoat'].default_value = 1.0

    return mat

# D. Liserés Déco Vert Néon Acide (#d2ff00)
mat_neon_lime = create_pbr_shader("MAT_Neon_Lime_Livery", base_color=(0.76, 1.0, 0.01, 1.0), metallic=0.08, roughness=0.15, clearcoat=1.0)

# E. Autres matériaux nobles
mat_shell_brg = create_brg_metallic_material()
mat_carbon_3k = create_carbon_3k_material()
mat_visor = create_iridium_visor_material()
mat_titanium = create_pbr_shader("MAT_Machined_Titanium", base_color=(0.76, 0.78, 0.82, 1.0), metallic=0.98, roughness=0.15)
mat_black_anodized = create_pbr_shader("MAT_Black_Anodized_Alu", base_color=(0.025, 0.025, 0.028, 1.0), metallic=0.92, roughness=0.20)
mat_rubber_gasket = create_pbr_shader("MAT_Rubber_Gasket", base_color=(0.014, 0.014, 0.016, 1.0), metallic=0.0, roughness=0.75)
mat_nomex = create_pbr_shader("MAT_Nomex_Fabric", base_color=(0.02, 0.02, 0.022, 1.0), metallic=0.0, roughness=0.95)
mat_eps_foam = create_pbr_shader("MAT_EPS_Impact_Foam", base_color=(0.06, 0.06, 0.065, 1.0), metallic=0.0, roughness=0.88)
mat_clear_aero = create_pbr_shader("MAT_Clear_Aero_Polycarbonate", base_color=(0.92, 0.94, 0.98, 0.65), metallic=0.05, roughness=0.04, clearcoat=1.0, transmission=0.88)
mat_mesh_grille = create_pbr_shader("MAT_Vent_Grille_Steel", base_color=(0.15, 0.16, 0.17, 1.0), metallic=0.96, roughness=0.25)
mat_strap_red = create_pbr_shader("MAT_Kevlar_Strap_Red", base_color=(0.75, 0.08, 0.05, 1.0), metallic=0.0, roughness=0.85)

def assign_material(obj, mat, name=None):
    if name:
        obj.name = name
    obj.data.materials.clear()
    obj.data.materials.append(mat)
    if hasattr(obj.data, 'polygons'):
        for p in obj.data.polygons:
            p.use_smooth = True
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
    assign_material(o, mat, name)
    return o

# ---------------------------------------------------------------------------
# 2. MODÉLISATION ANATOMIQUE DU CASQUE STILO ST5 (COURBURES, CHANFREINS, DÉTAILS)
# ---------------------------------------------------------------------------

# 2.1 Coque Principale en Vert Anglais Métallisé
bpy.ops.mesh.primitive_uv_sphere_add(segments=128, ring_count=80, location=(0, -0.05, 0.08))
shell = bpy.context.object
shell.name = "01_Shell_BRG_Metallic"
shell.scale = (1.02, 1.25, 1.15)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

# Déformation anatomique Stilo / Bell HP7
for v in shell.data.vertices:
    x, y, z = v.co.x, v.co.y, v.co.z
    # Profil arrière profilé (Kammback drop)
    if y < 0:
        v.co.y -= 0.18 * math.cos(max(min(z, 0.7), -0.6))
    # Mentonnière plongeante et saillante
    if y > 0.1 and z < 0.05:
        v.co.y += 0.22 * (0.05 - z)
        if z < -0.35:
            v.co.z -= 0.04
    # Affinement latéral de la calotte
    if z < -0.2:
        v.co.x *= 0.92
    # Légère crête supérieure centrale
    if abs(x) < 0.22 and z > 0.5:
        v.co.z += 0.03 * (1.0 - abs(x) / 0.22)

# Découpe eyeport faciale Stilo (trapèze galbé)
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0.95, 0.14))
visor_cutter = bpy.context.object
visor_cutter.scale = (0.86, 0.75, 0.40)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

cut_mod = shell.modifiers.new("EyeportCut", 'BOOLEAN')
cut_mod.operation = 'DIFFERENCE'
cut_mod.solver = 'EXACT'
cut_mod.object = visor_cutter
bpy.context.view_layer.objects.active = shell
bpy.ops.object.modifier_apply(modifier=cut_mod.name)
bpy.data.objects.remove(visor_cutter, do_unlink=True)

# Découpe ouverture inférieure du cou
bpy.ops.mesh.primitive_cylinder_add(vertices=80, radius=0.68, depth=1.6, location=(0, -0.12, -0.92))
neck_cutter = bpy.context.object
neck_cutter.scale = (1.04, 1.22, 1.0)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

neck_mod = shell.modifiers.new("NeckCut", 'BOOLEAN')
neck_mod.operation = 'DIFFERENCE'
neck_mod.solver = 'EXACT'
neck_mod.object = neck_cutter
bpy.context.view_layer.objects.active = shell
bpy.ops.object.modifier_apply(modifier=neck_mod.name)
bpy.data.objects.remove(neck_cutter, do_unlink=True)

# Épaisseur de coque composite (Solidify 4mm)
sol_mod = shell.modifiers.new("Solidify", 'SOLIDIFY')
sol_mod.thickness = 0.042
bpy.ops.object.modifier_apply(modifier=sol_mod.name)

# Chanfrein / Bevel des arêtes
bev_mod = shell.modifiers.new("BevelEdges", 'BEVEL')
bev_mod.width = 0.007
bev_mod.segments = 3
bpy.ops.object.modifier_apply(modifier=bev_mod.name)

assign_material(shell, mat_shell_brg)

# 2.2 Dôme Central en Carbone 3K Apparent (Insert Stilo ST5)
bpy.ops.mesh.primitive_cylinder_add(vertices=80, radius=0.70, depth=0.88, location=(0, -0.06, 0.78), rotation=(math.radians(90), 0, 0))
crown_carbon = bpy.context.object
crown_carbon.name = "02_Crown_Carbon_Weave"
crown_carbon.scale = (0.50, 0.65, 1.08)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

csol = crown_carbon.modifiers.new("CSolid", 'SOLIDIFY')
csol.thickness = 0.025
bpy.ops.object.modifier_apply(modifier=csol.name)
assign_material(crown_carbon, mat_carbon_3k)

# Panneaux latéraux de joues en Carbone 3K
for side, sx in [('Left', -0.68), ('Right', 0.68)]:
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(sx, -0.30, -0.02))
    panel = bpy.context.object
    panel.name = f"02_Cheek_Carbon_{side}"
    panel.scale = (0.035, 0.44, 0.30)
    panel.rotation_euler = (math.radians(-10), 0, math.radians(-14 if sx < 0 else 14))
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    pbev = panel.modifiers.new("PBevel", 'BEVEL')
    pbev.width = 0.015
    bpy.ops.object.modifier_apply(modifier=pbev.name)
    assign_material(panel, mat_carbon_3k)

# 2.3 Lignes de livrée Aérodynamiques Vert Néon Acide (#d2ff00)
for side, sx in [('Left', -0.54), ('Right', 0.54)]:
    # Liseré supérieur bordant le carbone de calotte
    make_tube(f"03_Livery_Crown_Stripe_{side}", [
        (sx * 0.42, 0.42, 1.00),
        (sx * 0.65, -0.05, 1.08),
        (sx * 0.72, -0.56, 0.92),
        (sx * 0.65, -0.90, 0.64)
    ], 0.015, mat_neon_lime)

    # Liseré dynamique sur les flancs
    make_tube(f"03_Livery_Flank_Stripe_{side}", [
        (sx * 1.08, 0.54, 0.02),
        (sx * 1.16, 0.12, 0.16),
        (sx * 1.12, -0.38, 0.12),
        (sx * 0.94, -0.84, -0.06)
    ], 0.014, mat_neon_lime)

# 2.4 Visière Torique Iridium Courbée Haute Fidélité
# Visière galbée épousant l'eyeport
bpy.ops.mesh.primitive_cylinder_add(vertices=96, radius=0.86, depth=0.36, location=(0, 0.14, 0.14))
visor = bpy.context.object
visor.name = "04_Visor_Iridium_Shield"
visor.scale = (1.00, 1.14, 1.0)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

# Conserver uniquement l'arc avant de la visière
bm = bmesh.new()
bm.from_mesh(visor.data)
verts_to_delete = [v for v in bm.verts if v.co.y < 0.28 or v.co.z < -0.14 or v.co.z > 0.28]
bmesh.ops.delete(bm, geom=verts_to_delete, context='VERTS')
bm.to_mesh(visor.data)
bm.free()

vsol = visor.modifiers.new("VSolid", 'SOLIDIFY')
vsol.thickness = 0.018 # Visière FIA 3mm à l'échelle
bpy.ops.object.modifier_apply(modifier=vsol.name)
assign_material(visor, mat_visor)

# 2.5 Bandeau Pare-Soleil Neutre en Fibre de Carbone Pure (Sans mention Apex)
bpy.ops.mesh.primitive_cylinder_add(vertices=96, radius=0.868, depth=0.088, location=(0, 0.14, 0.235))
sunstrip = bpy.context.object
sunstrip.name = "04_Visor_Sunstrip_Carbon_Neutral"
sunstrip.scale = (1.002, 1.142, 1.0)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

bm = bmesh.new()
bm.from_mesh(sunstrip.data)
strip_delete = [v for v in bm.verts if v.co.y < 0.40]
bmesh.ops.delete(bm, geom=strip_delete, context='VERTS')
bm.to_mesh(sunstrip.data)
bm.free()

ssol = sunstrip.modifiers.new("SSolid", 'SOLIDIFY')
ssol.thickness = 0.008
bpy.ops.object.modifier_apply(modifier=ssol.name)
assign_material(sunstrip, mat_carbon_3k)

# 2.6 Mécanismes Pivots Titane & Loquet Central
# Platines et vis pivots latérales
for side, sx in [('Left', -0.87), ('Right', 0.87)]:
    # Base platine anodisée noire
    bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=0.052, depth=0.016, location=(sx, 0.12, 0.14), rotation=(0, math.radians(90), 0))
    plate = bpy.context.object
    assign_material(plate, mat_black_anodized, f"05_Visor_Pivot_Plate_{side}")

    # Vis centrale en titane usiné
    bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=0.028, depth=0.024, location=(sx * 1.01, 0.12, 0.14), rotation=(0, math.radians(90), 0))
    screw = bpy.context.object
    assign_material(screw, mat_titanium, f"05_Visor_Pivot_Titanium_{side}")

    # Téton de tear-off sur la visière
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.012, depth=0.020, location=(sx * 0.94, 0.38, 0.08), rotation=(0, math.radians(90), 0))
    tearoff_post = bpy.context.object
    assign_material(tearoff_post, mat_titanium, f"05_Tearoff_Post_{side}")

# Loquet de verrouillage central de visière sur la mentonnière
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 1.02, -0.04))
lock = bpy.context.object
lock.scale = (0.045, 0.045, 0.065)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
assign_material(lock, mat_black_anodized, "05_Visor_Center_Latch")

# 2.7 Joints d'Étanchéité en Caoutchouc Vulcanisé Noir
# Joint d'eyeport
make_tube("06_Eyeport_Rubber_Gasket", [
    (-0.74, 0.58, -0.08),
    (-0.84, 0.72, 0.12),
    (-0.72, 0.86, 0.36),
    (0, 0.96, 0.42),
    (0.72, 0.86, 0.36),
    (0.84, 0.72, 0.12),
    (0.74, 0.58, -0.08),
    (0, 0.94, -0.09),
    (-0.74, 0.58, -0.08)
], 0.022, mat_rubber_gasket)

# Joint de base inférieure
make_tube("06_Neck_Rubber_Seal", [
    (0, 1.00, -0.66),
    (0.66, 0.60, -0.66),
    (0.70, -0.22, -0.72),
    (0.44, -1.00, -0.68),
    (0, -1.22, -0.63),
    (-0.44, -1.00, -0.68),
    (-0.70, -0.22, -0.72),
    (-0.66, 0.60, -0.66),
    (0, 1.00, -0.66)
], 0.020, mat_rubber_gasket)

# 2.8 Mentonnière Racing avec 6 Ouïes de Ventilation et Grilles Métalliques
vent_coords = [
    (0.12, 1.08, -0.32, -18, 12),
    (-0.12, 1.08, -0.32, -18, -12),
    (0.28, 0.98, -0.35, -15, 26),
    (-0.28, 0.98, -0.35, -15, -26),
    (0.12, 1.02, -0.52, -22, 12),
    (-0.12, 1.02, -0.52, -22, -12),
]

for idx, (vx, vy, vz, rx, rz) in enumerate(vent_coords):
    # Écope creusée noire
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(vx, vy, vz))
    vent_scoop = bpy.context.object
    vent_scoop.scale = (0.075, 0.028, 0.022)
    vent_scoop.rotation_euler = (math.radians(rx), 0, math.radians(rz))
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    assign_material(vent_scoop, mat_black_anodized, f"07_Vent_Scoop_{idx+1}")

    # Grille d'aération métallique interne
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(vx * 0.98, vy * 0.98, vz))
    grille = bpy.context.object
    grille.scale = (0.068, 0.012, 0.016)
    grille.rotation_euler = (math.radians(rx), 0, math.radians(rz))
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    assign_material(grille, mat_mesh_grille, f"07_Vent_Steel_Grille_{idx+1}")

# 2.9 Spoilers Aérodynamiques Transparents & Fixations Titane
# Spoiler mentonnière avant (lip)
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 1.12, -0.48))
chin_spoiler = bpy.context.object
chin_spoiler.scale = (0.42, 0.10, 0.018)
chin_spoiler.rotation_euler = (math.radians(22), 0, 0)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
assign_material(chin_spoiler, mat_clear_aero, "08_Chin_Aero_Spoiler")

# Spoiler arrière Kamm-tail transparent déportance
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -0.92, 0.44))
rear_spoiler = bpy.context.object
rear_spoiler.scale = (0.58, 0.16, 0.024)
rear_spoiler.rotation_euler = (math.radians(-32), 0, 0)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
assign_material(rear_spoiler, mat_clear_aero, "08_Rear_Kamm_Spoiler")

# Vis titane de fixation d'aileron arrière
for side, sx in [('Left', -0.22), ('Right', 0.22)]:
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.014, depth=0.018, location=(sx, -0.92, 0.46), rotation=(math.radians(-32), 0, 0))
    screw = bpy.context.object
    assign_material(screw, mat_titanium, f"08_Spoiler_Titanium_Screw_{side}")

# 2.10 Ancrages de Sécurité HANS FIA 8858 & Jugulaire
for side, sx in [('Left', -0.74), ('Right', 0.74)]:
    # Plot fileté FIA anodisé argenté
    bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=0.040, depth=0.035, location=(sx, -0.48, -0.42), rotation=(0, math.radians(90), 0))
    hans = bpy.context.object
    assign_material(hans, mat_titanium, f"09_HANS_Post_FIA_{side}")

# Sangles jugulaires et boucle Double-D
for side, sx in [('Left', -0.38), ('Right', 0.38)]:
    make_tube(f"09_Kevlar_Chinstrap_{side}", [
        (sx, 0.05, -0.38),
        (sx * 0.7, 0.10, -0.65),
        (0, 0.12, -0.78)
    ], 0.016, mat_strap_red)

# Boucle Double-D en titane
bpy.ops.mesh.primitive_torus_add(major_radius=0.032, minor_radius=0.008, location=(0, 0.12, -0.78), rotation=(math.radians(90), 0, 0))
buckle = bpy.context.object
assign_material(buckle, mat_titanium, "09_Double_D_Ring_Buckle")

# 2.11 Intérieur Habillage : Calotin EPS & Mousses Nomex
# Calotin EPS protecteur intérieur
bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=48, location=(0, -0.05, 0.08))
eps_core = bpy.context.object
eps_core.scale = (0.95, 1.16, 1.08)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

eps_sol = eps_core.modifiers.new("EPSSolid", 'SOLIDIFY')
eps_sol.thickness = 0.06
bpy.ops.object.modifier_apply(modifier=eps_sol.name)
assign_material(eps_core, mat_eps_foam, "10_Interior_EPS_Cushion")

# Mousses de joues ergonomiques en Nomex noir
for side, sx in [('Left', -0.45), ('Right', 0.45)]:
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(sx, 0.25, -0.22))
    pad = bpy.context.object
    pad.scale = (0.16, 0.32, 0.24)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    pbev = pad.modifiers.new("PadBevel", 'BEVEL')
    pbev.width = 0.06
    pbev.segments = 4
    bpy.ops.object.modifier_apply(modifier=pbev.name)
    assign_material(pad, mat_nomex, f"10_Nomex_Cheekpad_{side}")

# ---------------------------------------------------------------------------
# 3. ÉCLAIRAGE STUDIO MOTORSPORT & RENDU DE CONTRÔLE
# ---------------------------------------------------------------------------
all_meshes = [o for o in bpy.data.objects if o.type == 'MESH']
print(f"Total composants modélisés : {len(all_meshes)}")

# Sauvegarde du fichier .blend
bpy.ops.wm.save_as_mainfile(filepath=OUTPUT_BLEND)

# Environnement World sombre et élégant
world = bpy.data.worlds.new('MotorsportStudioWorld')
bpy.context.scene.world = world
world.color = (0.04, 0.045, 0.05)

# Caméra studio 3/4 avant dynamique
cam_data = bpy.data.cameras.new('Cam_Studio')
cam_data.lens = 65
cam_obj = bpy.data.objects.new('Cam_Studio', cam_data)
root_col.objects.link(cam_obj)
cam_obj.location = (2.2, 2.8, 1.2)

# Orientation précise vers le centre du casque
target = Vector((0, 0.1, -0.05))
direction = target - cam_obj.location
rot_quat = direction.to_track_quat('-Z', 'Y')
cam_obj.rotation_euler = rot_quat.to_euler()
bpy.context.scene.camera = cam_obj

# Lumières studio professionnelles
# 1. Key Light (lumière principale douce)
l1 = bpy.data.lights.new('KeyLight', 'AREA')
l1.energy = 450
l1.size = 2.0
lo1 = bpy.data.objects.new('KeyLight', l1)
root_col.objects.link(lo1)
lo1.location = (2.5, 2.2, 2.5)
lo1.rotation_euler = (target - lo1.location).to_track_quat('-Z', 'Y').to_euler()

# 2. Rim Light Vert Néon (accent signature Lando Norris style)
l2 = bpy.data.lights.new('LimeRimLight', 'AREA')
l2.energy = 380
l2.size = 1.5
l2.color = (0.78, 1.0, 0.02)
lo2 = bpy.data.objects.new('LimeRimLight', l2)
root_col.objects.link(lo2)
lo2.location = (-2.8, 0.5, 1.8)
lo2.rotation_euler = (target - lo2.location).to_track_quat('-Z', 'Y').to_euler()

# 3. Fill Light Bleu Nuit (contraste visière)
l3 = bpy.data.lights.new('BlueFillLight', 'AREA')
l3.energy = 220
l3.size = 2.5
l3.color = (0.1, 0.4, 1.0)
lo3 = bpy.data.objects.new('BlueFillLight', l3)
root_col.objects.link(lo3)
lo3.location = (0.0, -3.0, 1.5)
lo3.rotation_euler = (target - lo3.location).to_track_quat('-Z', 'Y').to_euler()

# Rendu d'image
bpy.context.scene.render.resolution_x = 1080
bpy.context.scene.render.resolution_y = 1080
bpy.context.scene.render.filepath = PREVIEW_IMG
bpy.ops.render.render(write_still=True)
print(f"Rendu de contrôle sauvegardé dans : {PREVIEW_IMG}")

# ---------------------------------------------------------------------------
# 4. EXPORTATION GLB FINAL POUR THREE.JS
# ---------------------------------------------------------------------------
bpy.ops.object.select_all(action='DESELECT')
for o in all_meshes:
    o.select_set(True)

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
print(f"Modèle GLB exporté avec succès dans : {OUTPUT_GLB}")
