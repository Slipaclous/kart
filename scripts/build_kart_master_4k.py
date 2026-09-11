"""APEX MOTORSPORT // FIA 125CC COMPETITION KART MASTER GENERATOR
Standard: Studio 4K Photorealistic & Awwwards-grade Web Scrollytelling
Complies strictly with blender_rules.md:
- Modular function architecture (create_object, apply_pbr_material, setup_lighting, setup_camera)
- Auto shade smooth on every mesh
- Subdivision surface (levels 2/3) on curved/aero components
- Proper UV unwrap (smart_project with angle_limit & margin)
- Advanced PBR shaders (Base Color, Metallic, Roughness, Coat Weight, Normal Map, procedurals)
- Cycles engine setup, AgX/Filmic high-contrast color management, GPU Denoising
- 50mm realistic focal length camera with depth-of-field
- 3-point studio motorsport illumination with Acid Lime (#d2ff00) rim highlights
"""

import bpy
import bmesh
import math
import os

OUT_GLB = "/Users/gauthierminor/Desktop/dev/Karting/public/models/kart_competition_chassis.glb"
TEX_DIR = "/Users/gauthierminor/Desktop/dev/Karting/public/textures"
os.makedirs(TEX_DIR, exist_ok=True)
os.makedirs(os.path.dirname(OUT_GLB), exist_ok=True)

# ==============================================================================
# 0. NETTOYAGE & INITIALISATION SCÈNE
# ==============================================================================
if bpy.context.object and bpy.context.object.mode != 'OBJECT':
    bpy.ops.object.mode_set(mode='OBJECT')
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# ==============================================================================
# 1. MOTEUR DE RENDU CYCLES, COLOR MANAGEMENT & CAMÉRA 50MM AVEC DOF
# ==============================================================================
def setup_render_engine():
    """Configure Cycles, AgX/Filmic, Denoising et échantillonnage haute fidélité."""
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    
    # Cycles device
    cycles = scene.cycles
    cycles.preview_samples = 32
    cycles.samples = 128
    cycles.use_denoising = True
    
    # Color Management AgX / Filmic
    scene.view_settings.view_transform = 'AgX' if 'AgX' in [v.name for v in bpy.types.ColorManagedViewSettings.bl_rna.properties['view_transform'].enum_items] else 'Filmic'
    scene.view_settings.look = 'Medium High Contrast'
    print(f"[RENDER] Cycles configuré avec {scene.view_settings.view_transform} - Look: {scene.view_settings.look}")

def setup_camera():
    """Crée une caméra cinéma 50mm avec profondeur de champ (DoF) physique."""
    cam_data = bpy.data.cameras.new("CinemaCamera_50mm")
    cam_data.lens = 50.0  # Focale réaliste 50mm
    cam_data.dof.use_dof = True
    cam_data.dof.focus_distance = 2.4
    cam_data.dof.aperture_fstop = 2.8
    
    cam_obj = bpy.data.objects.new("Main_Camera", cam_data)
    bpy.context.collection.objects.link(cam_obj)
    cam_obj.location = (1.8, -1.9, 1.1)
    cam_obj.rotation_euler = (math.radians(65), 0, math.radians(45))
    bpy.context.scene.camera = cam_obj
    return cam_obj

def setup_lighting():
    """Éclairage Studio 3 Points Motorsport + Key/Fill/Rim Acid Lime & Cyan."""
    # Key Light (Haute intensité, ombre douce)
    key_data = bpy.data.lights.new("Studio_Key_Light", 'AREA')
    key_data.energy = 450.0
    key_data.size = 2.5
    key_data.color = (1.0, 0.98, 0.95)
    key_obj = bpy.data.objects.new("Key_Light", key_data)
    key_obj.location = (2.5, 3.5, 3.2)
    key_obj.rotation_euler = (math.radians(45), math.radians(-25), 0)
    bpy.context.collection.objects.link(key_obj)

    # Fill Light (Diffusion froide pour déboucher les ombres sous le châssis)
    fill_data = bpy.data.lights.new("Studio_Fill_Light", 'AREA')
    fill_data.energy = 180.0
    fill_data.size = 3.0
    fill_data.color = (0.85, 0.92, 1.0)
    fill_obj = bpy.data.objects.new("Fill_Light", fill_data)
    fill_obj.location = (-3.0, -2.5, 1.8)
    fill_obj.rotation_euler = (math.radians(35), math.radians(40), 0)
    bpy.context.collection.objects.link(fill_obj)

    # Rim Light Acid Lime (#d2ff00) - Signature Awwwards Liam Moreau
    rim_data = bpy.data.lights.new("Studio_Rim_Lime", 'SPOT')
    rim_data.energy = 600.0
    rim_data.spot_size = math.radians(60)
    rim_data.spot_blend = 0.4
    rim_data.color = (0.75, 1.0, 0.05)
    rim_obj = bpy.data.objects.new("Rim_Light_Lime", rim_data)
    rim_obj.location = (-2.8, 3.0, 2.2)
    rim_obj.rotation_euler = (math.radians(50), math.radians(-45), 0)
    bpy.context.collection.objects.link(rim_obj)

# ==============================================================================
# 2. GÉNÉRATEUR DE TEXTURES PROCÉDURALES HAUTE DÉFINITION
# ==============================================================================
def generate_pbr_tile(name, kind, size=512):
    """Génère des maps PBR 512px sans coutures (Carbone 3K, Gomme pneu, Normal Map, Échappement)."""
    img = bpy.data.images.get(name) or bpy.data.images.new(name, size, size, alpha=False)
    pixels = []
    
    for y in range(size):
        for x in range(size):
            if kind == 'carbon_albedo':
                # Motif sergé carbone 2x2
                tx = (x // 4) % 4
                ty = (y // 4) % 4
                weave = 1.0 if ((tx < 2 and ty < 2) or (tx >= 2 and ty >= 2)) else 0.45
                v = 0.015 + 0.035 * weave + 0.008 * math.sin(x * 0.2)
                pixels.extend((v * 0.7, v * 0.85, v * 0.95, 1.0))
                
            elif kind == 'carbon_normal':
                # Normal map tangente pour relief sergé
                tx = (x // 4) % 4
                ty = (y // 4) % 4
                nx = 0.5 + 0.25 * math.sin(x * 0.5)
                ny = 0.5 + 0.25 * math.cos(y * 0.5)
                pixels.extend((nx, ny, 1.0, 1.0))
                
            elif kind == 'tyre_albedo':
                # Grain pneu compétition gommé
                noise = ((x * 47 + y * 73) % 41) / 41.0
                v = 0.018 + 0.014 * noise
                pixels.extend((v, v, v, 1.0))
                
            elif kind == 'exhaust_heat':
                # Dégradé thermique des soudures d'échappement hydroformé
                norm = y / float(size)
                if norm < 0.25:
                    pixels.extend((0.15, 0.30, 0.70, 1.0))  # Bleu de chauffe
                elif norm < 0.50:
                    pixels.extend((0.68, 0.42, 0.15, 1.0))  # Bronze paille
                elif norm < 0.70:
                    pixels.extend((0.55, 0.18, 0.48, 1.0))  # Pourpre d'oxydation
                else:
                    pixels.extend((0.38, 0.39, 0.42, 1.0))  # Inox brut
            else:
                pixels.extend((0.5, 0.5, 0.5, 1.0))
                
    img.pixels.foreach_set(pixels)
    img.filepath_raw = os.path.join(TEX_DIR, f"{name}.png")
    img.file_format = 'PNG'
    img.save()
    return img

# ==============================================================================
# 3. CRÉATION DES MATÉRIAUX PBR AVEC SHADERS NODES
# ==============================================================================
def apply_pbr_material(mat_name, base_color, metallic=0.0, roughness=0.3, coat=0.0, 
                       texture_albedo=None, texture_normal=None, emission=None, emission_strength=1.0):
    """Crée et configure un matériau PBR physique selon le standard d'ingénierie."""
    mat = bpy.data.materials.new(mat_name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    bsdf = next(n for n in nodes if n.type == 'BSDF_PRINCIPLED')

    bsdf.inputs['Base Color'].default_value = base_color
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    if 'Coat Weight' in bsdf.inputs:
        bsdf.inputs['Coat Weight'].default_value = coat
    if emission and 'Emission Color' in bsdf.inputs:
        bsdf.inputs['Emission Color'].default_value = emission
        if 'Emission Strength' in bsdf.inputs:
            bsdf.inputs['Emission Strength'].default_value = emission_strength

    # Branchement texture Albedo si fournie
    if texture_albedo:
        tex_node = nodes.new('ShaderNodeTexImage')
        tex_node.image = texture_albedo
        links.new(tex_node.outputs['Color'], bsdf.inputs['Base Color'])

    # Branchement Normal Map si fournie (avec Colorspace Non-Color)
    if texture_normal:
        tex_norm = nodes.new('ShaderNodeTexImage')
        tex_norm.image = texture_normal
        tex_norm.image.colorspace_settings.name = 'Non-Color'
        norm_map = nodes.new('ShaderNodeNormalMap')
        norm_map.inputs['Strength'].default_value = 0.8
        links.new(tex_norm.outputs['Color'], norm_map.inputs['Color'])
        links.new(norm_map.outputs['Normal'], bsdf.inputs['Normal'])

    return mat

print("[TEXTURES] Génération des maps 512px PBR...")
tex_carbon_alb = generate_pbr_tile("apex_carbon_albedo_512", "carbon_albedo")
tex_carbon_nor = generate_pbr_tile("apex_carbon_normal_512", "carbon_normal")
tex_tyre_alb = generate_pbr_tile("apex_tyre_albedo_512", "tyre_albedo")
tex_exhaust_alb = generate_pbr_tile("apex_exhaust_heat_512", "exhaust_heat")

# Palette Matériaux
mat_chassis_brg = apply_pbr_material("BRG_Tubing_25CrMo4", (0.010, 0.082, 0.040, 1.0), metallic=0.35, roughness=0.18, coat=0.85)
mat_pod_brg = apply_pbr_material("Aero_Pod_Gloss_BRG", (0.008, 0.070, 0.035, 1.0), metallic=0.25, roughness=0.12, coat=1.0)
mat_acid_lime = apply_pbr_material("Apex_Acid_Lime", (0.75, 1.0, 0.02, 1.0), metallic=0.1, roughness=0.15, coat=0.9)
mat_carbon_seat = apply_pbr_material("Carbon_Bucket_3K", (0.02, 0.02, 0.025, 1.0), metallic=0.6, roughness=0.18, coat=0.9, texture_albedo=tex_carbon_alb, texture_normal=tex_carbon_nor)
mat_magnesium_gold = apply_pbr_material("Magnesium_Forged_Gold", (0.82, 0.65, 0.28, 1.0), metallic=0.98, roughness=0.18)
mat_titanium_cnc = apply_pbr_material("Titanium_Ergal_CNC", (0.72, 0.74, 0.78, 1.0), metallic=0.99, roughness=0.14)
mat_rotor_steel = apply_pbr_material("Brake_Rotor_Steel", (0.45, 0.46, 0.48, 1.0), metallic=0.95, roughness=0.28)
mat_caliper_red = apply_pbr_material("Radial_Caliper_Red", (0.80, 0.02, 0.02, 1.0), metallic=0.45, roughness=0.22, coat=0.8)
mat_slick_rubber = apply_pbr_material("Vega_Slick_Compound", (0.015, 0.016, 0.018, 1.0), metallic=0.0, roughness=0.68, texture_albedo=tex_tyre_alb)
mat_engine_block = apply_pbr_material("Crankcase_Black_Alloy", (0.03, 0.032, 0.035, 1.0), metallic=0.90, roughness=0.30)
mat_cylinder_cyan = apply_pbr_material("Anodized_Cylinder_Head", (0.04, 0.52, 0.85, 1.0), metallic=0.95, roughness=0.15)
mat_exhaust_pipe = apply_pbr_material("Hydroformed_Expansion_Pipe", (0.4, 0.38, 0.35, 1.0), metallic=0.92, roughness=0.24, texture_albedo=tex_exhaust_alb)
mat_telemetry = apply_pbr_material("OLED_Telemetry_Display", (0.01, 0.01, 0.01, 1.0), metallic=0.0, roughness=0.08, emission=(0.75, 1.0, 0.02, 1.0), emission_strength=5.0)

# ==============================================================================
# 4. FONCTION MODULAIRE D'OBJET GÉOMÉTRIQUE (SHADE SMOOTH + SUBSURF + UV UNWRAP)
# ==============================================================================
def create_object(name, mesh_data, mat, use_subsurf=False, subsurf_levels=(2, 3)):
    """Enregistre un objet, applique shade_smooth, unwrappe les UVs et ajoute Subsurf si requis."""
    obj = bpy.data.objects.new(name, mesh_data)
    bpy.context.collection.objects.link(obj)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)

    # 1. Assigne le matériau PBR
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)

    # 2. Shade Smooth automatique systématique
    bpy.ops.object.shade_smooth()

    # 3. Unwrap UV systématique (smart_project pour UVs impeccables)
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.uv.smart_project(angle_limit=math.radians(66.0), island_margin=0.02)
    bpy.ops.object.mode_set(mode='OBJECT')

    # 4. Subdivision Surface si demandé (forme organique ou arrondie)
    if use_subsurf:
        sub_mod = obj.modifiers.new(name="Subdivision", type='SUBSURF')
        sub_mod.levels = subsurf_levels[0]
        sub_mod.render_levels = subsurf_levels[1]

    obj.select_set(False)
    return obj

def create_smooth_tube(name, points, radius, mat, use_subsurf=False):
    """Crée un tube tubulaire lissé converti en mesh propre avec UVs."""
    curve = bpy.data.curves.new(name, 'CURVE')
    curve.dimensions = '3D'
    curve.resolution_u = 24
    curve.bevel_depth = radius
    curve.bevel_resolution = 6
    spline = curve.splines.new('BEZIER')
    spline.bezier_points.add(len(points) - 1)
    for i, pt in enumerate(points):
        bp = spline.bezier_points[i]
        bp.co = pt
        bp.handle_left_type = 'AUTO'
        bp.handle_right_type = 'AUTO'

    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.convert(target='MESH')
    
    # Post-traitement géométrie selon standards
    bpy.ops.object.shade_smooth()
    obj.data.materials.append(mat)
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.uv.smart_project(angle_limit=math.radians(66.0), island_margin=0.02)
    bpy.ops.object.mode_set(mode='OBJECT')

    if use_subsurf:
        sub = obj.modifiers.new(name="Subdivision", type='SUBSURF')
        sub.levels = 1
        sub.render_levels = 2

    obj.select_set(False)
    return obj

# ==============================================================================
# 5. MODÉLISATION DU CHÂSSIS TUBULAIRE 25CRMO4 (DOUBLE BERCEAU)
# ==============================================================================
print("[CHASSIS] Modélisation tubulaire 25CrMo4...")
r_tube = 0.016 # Tube Ø 32mm standard FIA

left_rail = [
    (-0.28, -0.65, 0.05),
    (-0.28, -0.22, 0.05),
    (-0.22, 0.12, 0.06),
    (-0.22, 0.48, 0.06),
    (-0.16, 0.72, 0.08),
]
create_smooth_tube("chassis_rail_left", left_rail, r_tube, mat_chassis_brg)

right_rail = [
    (0.28, -0.65, 0.05),
    (0.28, -0.22, 0.05),
    (0.22, 0.12, 0.06),
    (0.22, 0.48, 0.06),
    (0.16, 0.72, 0.08),
]
create_smooth_tube("chassis_rail_right", right_rail, r_tube, mat_chassis_brg)

# Boucle avant et traverses
create_smooth_tube("chassis_front_loop", [
    (-0.24, 0.74, 0.08),
    (-0.18, 0.98, 0.10),
    (0.00, 1.04, 0.10),
    (0.18, 0.98, 0.10),
    (0.24, 0.74, 0.08)
], 0.012, mat_chassis_brg)

create_smooth_tube("chassis_cross_front", [(-0.30, 0.58, 0.07), (0.30, 0.58, 0.07)], r_tube, mat_chassis_brg)
create_smooth_tube("chassis_cross_mid", [(-0.24, 0.06, 0.05), (0.24, 0.06, 0.05)], r_tube, mat_chassis_brg)
create_smooth_tube("chassis_cross_rear", [(-0.32, -0.55, 0.05), (0.32, -0.55, 0.05)], r_tube, mat_chassis_brg)

# Arbre arrière 50mm et paliers usinés CNC
for idx, x in enumerate([-0.28, 0.0, 0.28]):
    bpy.ops.mesh.primitive_cylinder_add(radius=0.038, depth=0.045, location=(x, -0.55, 0.07))
    palier = bpy.context.active_object
    palier.rotation_euler = (0, math.pi / 2, 0)
    create_object(f"chassis_bearing_cassette_{idx}", palier.data, mat_titanium_cnc)

bpy.ops.mesh.primitive_cylinder_add(radius=0.025, depth=1.05, location=(0, -0.55, 0.07))
axle = bpy.context.active_object
axle.rotation_euler = (0, math.pi / 2, 0)
create_object("rear_axle_50mm", axle.data, mat_titanium_cnc)

# ==============================================================================
# 6. SYSTÈME DE FREINAGE RADIAL FLOTTANT
# ==============================================================================
print("[BRAKES] Système de freinage haute température...")
# Disque perforé ventilé
bpy.ops.mesh.primitive_cylinder_add(radius=0.105, depth=0.014, location=(-0.16, -0.55, 0.07))
disc = bpy.context.active_object
disc.rotation_euler = (0, math.pi / 2, 0)
create_object("brake_rotor_rear", disc.data, mat_rotor_steel)

# Couronne de fentes de refroidissement
bpy.ops.mesh.primitive_torus_add(major_radius=0.075, minor_radius=0.005, location=(-0.16, -0.55, 0.07))
slots = bpy.context.active_object
slots.rotation_euler = (0, math.pi / 2, 0)
create_object("brake_cooling_slots", slots.data, mat_titanium_cnc)

# Étrier radial 4 pistons anodisé rouge
bpy.ops.mesh.primitive_cube_add(size=0.08, location=(-0.16, -0.52, 0.16))
caliper = bpy.context.active_object
caliper.scale = (0.6, 1.25, 0.95)
create_object("brake_caliper_radial", caliper.data, mat_caliper_red, use_subsurf=True)

# ==============================================================================
# 7. ROUES MAGNÉSIUM & PNEUS SLICKS VEGA (AVEC SUBSURF)
# ==============================================================================
print("[WHEELS] Trains roulants magnésium & slicks gommés...")
def build_pro_wheel(name, loc, is_front=True):
    tyre_width = 0.135 if is_front else 0.205
    tyre_rad = 0.132 if is_front else 0.142
    rim_rad = 0.068

    # Gomme slick
    bpy.ops.mesh.primitive_cylinder_add(radius=tyre_rad, depth=tyre_width, location=loc)
    tyre = bpy.context.active_object
    tyre.rotation_euler = (0, math.pi / 2, 0)
    create_object(f"{name}_tyre", tyre.data, mat_slick_rubber, use_subsurf=True, subsurf_levels=(1, 2))

    # Jante magnésium dorée
    bpy.ops.mesh.primitive_cylinder_add(radius=rim_rad, depth=tyre_width + 0.006, location=loc)
    rim = bpy.context.active_object
    rim.rotation_euler = (0, math.pi / 2, 0)
    create_object(f"{name}_rim", rim.data, mat_magnesium_gold, use_subsurf=True, subsurf_levels=(1, 2))

    # Écrou central Ergal
    offset = 0.016 if loc[0] > 0 else -0.016
    bpy.ops.mesh.primitive_cylinder_add(radius=0.022, depth=0.05, location=(loc[0] + offset, loc[1], loc[2]))
    nut = bpy.context.active_object
    nut.rotation_euler = (0, math.pi / 2, 0)
    create_object(f"{name}_nut", nut.data, mat_titanium_cnc)

build_pro_wheel("wheel_front_left", (-0.46, 0.58, 0.08), is_front=True)
build_pro_wheel("wheel_front_right", (0.46, 0.58, 0.08), is_front=True)
build_pro_wheel("wheel_rear_left", (-0.56, -0.55, 0.08), is_front=False)
build_pro_wheel("wheel_rear_right", (0.56, -0.55, 0.08), is_front=False)

# ==============================================================================
# 8. TRAIN AVANT DE DIRECTION & COCKPIT TÉLÉMÉTRIQUE
# ==============================================================================
print("[STEERING] Fusées Ergal, volant méplat et télémétrie...")
# Fusées usinées gauche/droite
for sign, side in [(-1, "left"), (1, "right")]:
    bpy.ops.mesh.primitive_cylinder_add(radius=0.016, depth=0.095, location=(sign * 0.35, 0.58, 0.08))
    stub = bpy.context.active_object
    stub.rotation_euler = (0, 0, sign * 0.15)
    create_object(f"stub_axle_{side}", stub.data, mat_magnesium_gold, use_subsurf=True)

# Biellettes de direction uniball et colonne
create_smooth_tube("steering_column", [(0.0, 0.35, 0.08), (0.0, 0.20, 0.38)], 0.010, mat_titanium_cnc)
create_smooth_tube("tie_rod_left", [(0.02, 0.28, 0.10), (-0.33, 0.55, 0.08)], 0.007, mat_titanium_cnc)
create_smooth_tube("tie_rod_right", [(-0.02, 0.28, 0.10), (0.33, 0.55, 0.08)], 0.007, mat_titanium_cnc)

# Volant ergonomique compétition à méplat
bpy.ops.mesh.primitive_torus_add(major_radius=0.12, minor_radius=0.015, location=(0.0, 0.18, 0.40))
wheel = bpy.context.active_object
wheel.rotation_euler = (math.radians(-35), 0, 0)
wheel.scale = (1.0, 0.85, 1.0)
create_object("steering_wheel_grip", wheel.data, mat_slick_rubber, use_subsurf=True)

# Platine centrale carbone et écran OLED live
bpy.ops.mesh.primitive_cube_add(size=0.10, location=(0.0, 0.18, 0.40))
plate = bpy.context.active_object
plate.rotation_euler = (math.radians(-35), 0, 0)
plate.scale = (1.2, 0.2, 0.9)
create_object("steering_wheel_plate", plate.data, mat_carbon_seat)

bpy.ops.mesh.primitive_plane_add(size=0.065, location=(0.0, 0.174, 0.408))
screen = bpy.context.active_object
screen.rotation_euler = (math.radians(-35), 0, 0)
screen.scale = (1.3, 0.6, 1.0)
create_object("telemetry_oled_screen", screen.data, mat_telemetry)

# Baquet de course carbone anatomique
bpy.ops.mesh.primitive_cube_add(size=0.20, location=(0.0, -0.16, 0.22))
seat = bpy.context.active_object
seat.rotation_euler = (math.radians(24), 0, 0)
seat.scale = (1.65, 1.15, 2.05)
create_object("seat_carbon_anatomical", seat.data, mat_carbon_seat, use_subsurf=True, subsurf_levels=(2, 3))

# ==============================================================================
# 9. CARROSSERIE AÉRODYNAMIQUE (SPOILER FIA, NASSAU & PONTONS)
# ==============================================================================
print("[AERODYNAMICS] Spoiler profilé, nassau et pontons aérodynamiques...")
# Spoiler avant profilé (Bmesh avec Subsurf)
bm = bmesh.new()
v1 = bm.verts.new((-0.38, 0.70, 0.06))
v2 = bm.verts.new((0.38, 0.70, 0.06))
v3 = bm.verts.new((0.32, 1.08, 0.05))
v4 = bm.verts.new((-0.32, 1.08, 0.05))
v5 = bm.verts.new((-0.26, 0.80, 0.22))
v6 = bm.verts.new((0.26, 0.80, 0.22))
v7 = bm.verts.new((0.18, 1.04, 0.12))
v8 = bm.verts.new((-0.18, 1.04, 0.12))

bm.faces.new([v1, v2, v3, v4])
bm.faces.new([v5, v6, v7, v8])
bm.faces.new([v4, v3, v7, v8])
bm.faces.new([v1, v4, v8, v5])
bm.faces.new([v2, v6, v7, v3])
bm.faces.new([v1, v5, v6, v2])

mesh_nose = bpy.data.meshes.new("mesh_aero_nose")
bm.to_mesh(mesh_nose)
bm.free()
create_object("aero_front_nosecone", mesh_nose, mat_pod_brg, use_subsurf=True, subsurf_levels=(2, 3))

# Liseré aéro Acid Lime sur spoiler
bpy.ops.mesh.primitive_cube_add(size=0.10, location=(0.0, 0.94, 0.17))
stripe = bpy.context.active_object
stripe.scale = (1.8, 0.1, 0.02)
stripe.rotation_euler = (math.radians(12), 0, 0)
create_object("aero_front_stripe_lime", stripe.data, mat_acid_lime)

# Nassau panel
bpy.ops.mesh.primitive_cube_add(size=0.10, location=(0.0, 0.48, 0.28))
nassau = bpy.context.active_object
nassau.rotation_euler = (math.radians(-32), 0, 0)
nassau.scale = (0.9, 0.15, 2.5)
create_object("aero_nassau_panel", nassau.data, mat_pod_brg, use_subsurf=True)

# Pontons latéraux profilés avec ailette déflectrice
for sign, side in [(-1, "left"), (1, "right")]:
    bpy.ops.mesh.primitive_cube_add(size=0.10, location=(sign * 0.45, 0.05, 0.14))
    pod = bpy.context.active_object
    pod.scale = (1.5, 5.2, 1.3)
    create_object(f"aero_sidepod_{side}", pod.data, mat_pod_brg, use_subsurf=True, subsurf_levels=(2, 3))

    bpy.ops.mesh.primitive_cube_add(size=0.08, location=(sign * 0.52, -0.05, 0.18))
    fin = bpy.context.active_object
    fin.scale = (0.2, 3.8, 0.15)
    create_object(f"aero_fin_lime_{side}", fin.data, mat_acid_lime)

# ==============================================================================
# 10. MOTEUR 125CC RACING & RÉSONATEUR HYDROFORMÉ
# ==============================================================================
print("[ENGINE] Bloc 125cc à boîte séquentielle & résonateur conique...")
# Carter moteur alu noir
bpy.ops.mesh.primitive_cube_add(size=0.16, location=(0.24, -0.28, 0.15))
crank = bpy.context.active_object
crank.scale = (0.9, 1.1, 0.8)
create_object("engine_crankcase", crank.data, mat_engine_block, use_subsurf=True)

# Cylindre à ailettes usinées
bpy.ops.mesh.primitive_cylinder_add(radius=0.065, depth=0.12, location=(0.24, -0.28, 0.26))
cyl = bpy.context.active_object
create_object("engine_cylinder_finned", cyl.data, mat_titanium_cnc, use_subsurf=True)

# Culasse anodisée bleu électrique
bpy.ops.mesh.primitive_cylinder_add(radius=0.070, depth=0.045, location=(0.24, -0.28, 0.34))
head = bpy.context.active_object
create_object("engine_cylinder_head_anodized", head.data, mat_cylinder_cyan, use_subsurf=True)

# Carburateur Dell'Orto et boîte à air carbone
bpy.ops.mesh.primitive_cylinder_add(radius=0.035, depth=0.08, location=(0.32, -0.20, 0.22))
carb = bpy.context.active_object
carb.rotation_euler = (math.pi / 2, 0, 0)
create_object("engine_carburetor_venturi", carb.data, mat_titanium_cnc)

bpy.ops.mesh.primitive_cube_add(size=0.12, location=(0.34, -0.10, 0.24))
airbox = bpy.context.active_object
airbox.scale = (0.8, 1.2, 0.7)
create_object("engine_carbon_airbox", airbox.data, mat_carbon_seat, use_subsurf=True)

# Ligne d'échappement hydroformée avec cônes de détente
exhaust_pts = [
    (0.24, -0.34, 0.25),
    (0.26, -0.44, 0.20),
    (0.22, -0.56, 0.16),
    (0.05, -0.66, 0.17),
    (-0.15, -0.65, 0.19),
    (-0.24, -0.58, 0.20),
]
create_smooth_tube("exhaust_expansion_chamber", exhaust_pts, 0.025, mat_exhaust_pipe, use_subsurf=True)

# Silencieux carbone
bpy.ops.mesh.primitive_cylinder_add(radius=0.032, depth=0.22, location=(-0.26, -0.42, 0.22))
silencer = bpy.context.active_object
silencer.rotation_euler = (math.radians(-70), 0, 0)
create_object("exhaust_silencer_carbon", silencer.data, mat_carbon_seat, use_subsurf=True)

# Radiateur d'eau et durites silicone
bpy.ops.mesh.primitive_cube_add(size=0.15, location=(-0.24, -0.18, 0.22))
rad = bpy.context.active_object
rad.scale = (0.4, 1.4, 1.8)
rad.rotation_euler = (0, math.radians(-10), 0)
create_object("engine_radiator", rad.data, mat_titanium_cnc)

create_smooth_tube("engine_coolant_hose", [(-0.24, -0.24, 0.18), (0.16, -0.28, 0.22)], 0.008, mat_cylinder_cyan)

# ==============================================================================
# 11. CONFIGURATION STUDIO & EXPORT GLTF WEB OPTIMISÉ
# ==============================================================================
setup_render_engine()
setup_camera()
setup_lighting()

print(f"[EXPORT] Exportation du bolide GLB haute fidélité vers {OUT_GLB}...")
bpy.ops.export_scene.gltf(
    filepath=OUT_GLB,
    export_format='GLB',
    use_selection=False,
    export_apply=True,
    export_materials='EXPORT',
    export_cameras=False,
    export_lights=False
)

print("[SUCCÈS] Master Châssis Karting 4K généré et exporté avec succès !")
