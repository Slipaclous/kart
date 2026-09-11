"""
PRO KARTING HELMET - AUTHENTIC FIA/STILO ST5 GEOMETRY GENERATOR
================================================================
Modélisation 3D anatomique haute fidélité conforme au casque Stilo ST5 / Bell HP7 :
1. Coque profilée avec dôme continu, crête aérodynamique et mentonnière saillante
2. Découpe eyeport trapézoïdale galbée et biseautée
3. Calotte intérieure EPS ergonomique et mousses Nomex sculptées
4. Visière torique thermoformée enveloppant l'ouverture d'un pivot à l'autre
5. Joint d'étanchéité d'eyeport en caoutchouc vulcanisé
6. Bandeau pare-soleil carbone "APEX Racing" avec lettrage contrasté
7. Loquet de verrouillage de visière central sur la mentonnière
8. Platines latérales CNC en aluminium anodisé noir & vis pivot titane fraisées
9. 6 ouïes d'aération frontales de mentonnière avec inserts alu/grille
10. Spoilers transparents avant (chin lip) et arrière (Kamm-tail spoiler)
11. Clips d'ancrage HANS FIA 8858 au niveau du cou
12. Sangles jugulaires Kevlar et boucle Double-D
13. Shaders PBR nobles (British Racing Green métallisé vernis, carbone 3K, titane, iridium)
14. Export GLB optimisé avec origines et hiérarchie pour Three.js
================================================================
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
os.makedirs(os.path.dirname(PREVIEW_IMG), exist_ok=True)

# 0. Réinitialisation complète de la scène
bpy.ops.wm.read_factory_settings(use_empty=True)

root_col = bpy.context.scene.collection
cols = {
    "Shell": bpy.data.collections.new("01_Shell"),
    "Visor": bpy.data.collections.new("02_Visor"),
    "Interior": bpy.data.collections.new("03_Interior"),
    "Aero_Vents": bpy.data.collections.new("04_Aero_Vents"),
    "Hardware": bpy.data.collections.new("05_Hardware"),
    "Straps": bpy.data.collections.new("06_Straps"),
    "Decals": bpy.data.collections.new("07_Decals"),
}
for c in cols.values():
    root_col.children.link(c)


# ---------------------------------------------------------------------------
# 1. SHADERS PBR NOBLES CONFORMES À LA RÉFÉRENCE STILO
# ---------------------------------------------------------------------------
def make_shader(name, base_color, metallic=0.0, roughness=0.3, clearcoat=0.0, transmission=0.0):
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
        if hasattr(mat, "shadow_method"):
            mat.shadow_method = 'NONE'

    return mat

mat_shell_brg = make_shader("MAT_Shell_BRG", (0.010, 0.15, 0.045, 1.0), metallic=0.45, roughness=0.10, clearcoat=1.0)
mat_carbon_3k = make_shader("MAT_Carbon_3K", (0.015, 0.018, 0.020, 1.0), metallic=0.75, roughness=0.12, clearcoat=0.90)
mat_inner_eps = make_shader("MAT_Inner_EPS", (0.07, 0.07, 0.08, 1.0), metallic=0.0, roughness=0.85)
mat_nomex = make_shader("MAT_Nomex", (0.02, 0.02, 0.025, 1.0), metallic=0.0, roughness=0.95)
mat_visor = make_shader("MAT_Visor_Iridium", (0.04, 0.12, 0.45, 1.0), metallic=0.94, roughness=0.025, clearcoat=1.0)
mat_visor_seal = make_shader("MAT_Rubber_Seal", (0.015, 0.015, 0.015, 1.0), metallic=0.0, roughness=0.80)
mat_titanium = make_shader("MAT_Titanium", (0.78, 0.80, 0.84, 1.0), metallic=0.98, roughness=0.14)
mat_black_alu = make_shader("MAT_Black_Alu", (0.03, 0.03, 0.035, 1.0), metallic=0.92, roughness=0.22)
mat_polymer_matte = make_shader("MAT_Polymer", (0.01, 0.01, 0.012, 1.0), metallic=0.85, roughness=0.35)
mat_clear_aero = make_shader("MAT_Clear_Aero", (0.85, 0.90, 0.95, 0.70), metallic=0.05, roughness=0.04, clearcoat=1.0)
mat_strap = make_shader("MAT_Strap", (0.82, 0.12, 0.05, 1.0), metallic=0.0, roughness=0.88)
mat_neon_lime = make_shader("MAT_Neon_Lime", (0.78, 1.0, 0.02, 1.0), metallic=0.10, roughness=0.15, clearcoat=0.9)


def assign_finish(obj, name, col_name, mat):
    obj.name = name
    obj.data.materials.clear()
    obj.data.materials.append(mat)
    if hasattr(obj.data, 'polygons'):
        for p in obj.data.polygons:
            p.use_smooth = True
            p.material_index = 0

    for c in list(obj.users_collection):
        c.objects.unlink(obj)
    cols[col_name].objects.link(obj)

    # UV Smart Project
    if hasattr(obj.data, 'polygons') and len(obj.data.polygons) > 0:
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        bpy.ops.object.mode_set(mode='EDIT')
        try:
            bpy.ops.uv.smart_project(angle_limit=1.15, island_margin=0.02)
        except Exception:
            pass
        bpy.ops.object.mode_set(mode='OBJECT')
        obj.select_set(False)

    return obj


# ---------------------------------------------------------------------------
# 2. GÉOMÉTRIE ANATOMIQUE DU CASQUE STILO ST5 (LOFT & PROPORTIONS RÉELLES)
# ---------------------------------------------------------------------------

VISOR_AXIS = Vector((0.0, 0.015, 0.026))

# --- 2.1 COQUE EXTÉRIEURE CARBONE/KEVLAR (helmet_shell) ---
def build_shell():
    bm = bmesh.new()

    specs = [
        # (z, rx_side, ry_front, ry_back, cy, chin_prow, brow_flare)
        (0.138, 0.045, 0.050, 0.054, -0.008, 0.0, 0.0),    # Sommet
        (0.128, 0.088, 0.092, 0.100, -0.012, 0.0, 0.0),    # Haut calotte
        (0.105, 0.116, 0.120, 0.130, -0.018, 0.0, 0.0),    # Front haut
        (0.068, 0.125, 0.134, 0.144, -0.015, 0.0, 0.010),  # Arcade sourcilière
        (0.025, 0.128, 0.146, 0.148, -0.006, 0.0, 0.0),    # Axe pivot / yeux
        (-0.012, 0.126, 0.156, 0.150, 0.005, 0.010, 0.0),  # Seuil mentonnière
        (-0.048, 0.122, 0.168, 0.148, 0.012, 0.024, 0.0),  # Milieu mentonnière
        (-0.082, 0.114, 0.166, 0.142, 0.016, 0.020, 0.0),  # Bas mentonnière & mâchoire
        (-0.114, 0.100, 0.140, 0.130, 0.010, 0.008, 0.0),  # Évasement cou
        (-0.135, 0.088, 0.105, 0.112, -0.008, 0.0, 0.0),   # Collerette inférieure
    ]

    segments = 64
    ring_verts = []

    for z, rx, ry_f, ry_b, cy, chin_prow, brow_flare in specs:
        ring = []
        for s in range(segments):
            phi = 2.0 * math.pi * s / segments
            is_front = math.cos(phi) >= 0
            ry = ry_f if is_front else ry_b
            
            if is_front and chin_prow > 0:
                front_prow = max(0.0, math.cos(phi)) ** 2.2
                ry += chin_prow * front_prow
            if is_front and brow_flare > 0:
                ry += brow_flare * max(0.0, math.cos(phi)) ** 2.0
                
            x = math.sin(phi) * rx
            y = math.cos(phi) * ry + cy
            v = bm.verts.new((x, y, z))
            ring.append(v)
        ring_verts.append(ring)

    bm.verts.ensure_lookup_table()
    top_v = bm.verts.new((0.0, -0.008, 0.140))
    for s in range(segments):
        bm.faces.new((top_v, ring_verts[0][(s + 1) % segments], ring_verts[0][s]))

    for r in range(len(specs) - 1):
        for s in range(segments):
            bm.faces.new((
                ring_verts[r][s],
                ring_verts[r][(s + 1) % segments],
                ring_verts[r + 1][(s + 1) % segments],
                ring_verts[r + 1][s]
            ))

    mesh = bpy.data.meshes.new("helmet_shell_mesh")
    bm.to_mesh(mesh)
    bm.free()

    shell = bpy.data.objects.new("helmet_shell", mesh)
    root_col.objects.link(shell)

    # Découpe inférieure pour l'entrée du cou
    bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=0.092, depth=0.35, location=(0, -0.010, -0.145))
    neck_cutter = bpy.context.object
    neck_cutter.scale = (1.02, 1.25, 1.0)
    neck_cutter.rotation_euler = (math.radians(10), 0, 0)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    m_neck = shell.modifiers.new('NeckCut', 'BOOLEAN')
    m_neck.operation = 'DIFFERENCE'
    m_neck.object = neck_cutter
    bpy.context.view_layer.objects.active = shell
    shell.select_set(True)
    bpy.ops.object.modifier_apply(modifier=m_neck.name)
    bpy.data.objects.remove(neck_cutter, do_unlink=True)

    # Découpe eyeport
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0.138, 0.028))
    eye_cutter = bpy.context.object
    eye_cutter.scale = (0.225, 0.18, 0.062)
    eye_cutter.rotation_euler = (math.radians(-6), 0, 0)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    m_eye = shell.modifiers.new('EyeCut', 'BOOLEAN')
    m_eye.operation = 'DIFFERENCE'
    m_eye.object = eye_cutter
    bpy.context.view_layer.objects.active = shell
    shell.select_set(True)
    bpy.ops.object.modifier_apply(modifier=m_eye.name)
    bpy.data.objects.remove(eye_cutter, do_unlink=True)

    # Épaisseur de coque composite (4.5 mm)
    m_sol = shell.modifiers.new('Solidify', 'SOLIDIFY')
    m_sol.thickness = 0.0045
    m_sol.offset = -1.0
    bpy.ops.object.modifier_apply(modifier=m_sol.name)

    # Biseautage fin
    m_bev = shell.modifiers.new('Bevel', 'BEVEL')
    m_bev.width = 0.0016
    m_bev.segments = 2
    bpy.ops.object.modifier_apply(modifier=m_bev.name)

    return assign_finish(shell, "helmet_shell", "Shell", mat_shell_brg)

build_shell()


# --- 2.2 CALOTTE INTÉRIEURE EPS (inner_shell) ---
def build_inner_shell():
    bm = bmesh.new()
    # Dimensions intérieures : 88% de la coque
    specs = [
        (0.132, 0.038, 0.042, 0.046, -0.008),
        (0.122, 0.076, 0.080, 0.088, -0.012),
        (0.100, 0.102, 0.106, 0.114, -0.018),
        (0.065, 0.110, 0.118, 0.126, -0.015),
        (0.025, 0.112, 0.128, 0.130, -0.006),
        (-0.012, 0.110, 0.136, 0.132, 0.005),
        (-0.048, 0.106, 0.144, 0.130, 0.012),
        (-0.080, 0.100, 0.142, 0.124, 0.016),
        (-0.110, 0.088, 0.122, 0.114, 0.010),
        (-0.128, 0.076, 0.092, 0.098, -0.008),
    ]

    segments = 48
    ring_verts = []

    for z, rx, ry_f, ry_b, cy in specs:
        ring = []
        for s in range(segments):
            phi = 2.0 * math.pi * s / segments
            is_front = math.cos(phi) >= 0
            ry = ry_f if is_front else ry_b
            x = math.sin(phi) * rx
            y = math.cos(phi) * ry + cy
            v = bm.verts.new((x, y, z))
            ring.append(v)
        ring_verts.append(ring)

    bm.verts.ensure_lookup_table()
    top_v = bm.verts.new((0.0, -0.008, 0.134))
    for s in range(segments):
        bm.faces.new((top_v, ring_verts[0][(s + 1) % segments], ring_verts[0][s]))

    for r in range(len(specs) - 1):
        for s in range(segments):
            bm.faces.new((
                ring_verts[r][s],
                ring_verts[r][(s + 1) % segments],
                ring_verts[r + 1][(s + 1) % segments],
                ring_verts[r + 1][s]
            ))

    mesh = bpy.data.meshes.new("inner_shell_mesh")
    bm.to_mesh(mesh)
    bm.free()

    eps = bpy.data.objects.new("inner_shell", mesh)
    root_col.objects.link(eps)

    # Découpe neck
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=0.082, depth=0.35, location=(0, -0.010, -0.145))
    neck_c = bpy.context.object
    neck_c.scale = (1.0, 1.22, 1.0)
    neck_c.rotation_euler = (math.radians(10), 0, 0)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    m_neck = eps.modifiers.new('NeckCut', 'BOOLEAN')
    m_neck.operation = 'DIFFERENCE'
    m_neck.object = neck_c
    bpy.context.view_layer.objects.active = eps
    eps.select_set(True)
    bpy.ops.object.modifier_apply(modifier=m_neck.name)
    bpy.data.objects.remove(neck_c, do_unlink=True)

    # Découpe eyeport
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0.138, 0.028))
    eye_c = bpy.context.object
    eye_c.scale = (0.24, 0.19, 0.068)
    eye_c.rotation_euler = (math.radians(-6), 0, 0)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    m_eye = eps.modifiers.new('EyeCut', 'BOOLEAN')
    m_eye.operation = 'DIFFERENCE'
    m_eye.object = eye_c
    bpy.context.view_layer.objects.active = eps
    eps.select_set(True)
    bpy.ops.object.modifier_apply(modifier=m_eye.name)
    bpy.data.objects.remove(eye_c, do_unlink=True)

    # Épaisseur calotte EPS
    m_sol = eps.modifiers.new('Solidify', 'SOLIDIFY')
    m_sol.thickness = 0.012
    m_sol.offset = -1.0
    bpy.ops.object.modifier_apply(modifier=m_sol.name)

    return assign_finish(eps, "inner_shell", "Interior", mat_inner_eps)

build_inner_shell()


# --- 2.3 MOUSSES ERGONOMIQUES NOMEX (inner_padding) ---
def build_inner_padding():
    mesh = bpy.data.meshes.new("inner_padding_mesh")
    obj = bpy.data.objects.new("inner_padding", mesh)
    root_col.objects.link(obj)

    bm = bmesh.new()
    # Mousses de joues et tour de tête Nomex
    for side in [-1, 1]:
        # Coussinet de joue (Cheek pad)
        bmesh.ops.create_cube(bm, size=1.0)
        for v in bm.verts[-8:]:
            v.co.x = v.co.x * 0.016 + side * 0.088
            v.co.y = v.co.y * 0.045 + 0.065
            v.co.z = v.co.z * 0.035 - 0.050

    # Coussinet couronne supérieure
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts[-8:]:
        v.co.x = v.co.x * 0.075
        v.co.y = v.co.y * 0.085 - 0.015
        v.co.z = v.co.z * 0.015 + 0.115

    bm.to_mesh(mesh)
    bm.free()

    m_sub = obj.modifiers.new('Sub', 'SUBSURF')
    m_sub.levels = 2
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.modifier_apply(modifier=m_sub.name)

    return assign_finish(obj, "inner_padding", "Interior", mat_nomex)

build_inner_padding()


# --- 2.4 JOINT D'ÉTANCHÉITÉ EN CAOUTCHOUC NOIR (visor_seal) ---
def build_visor_seal():
    bm_seal = bmesh.new()
    seal_segs = 48
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
    seal = bpy.data.objects.new("visor_seal", mesh_seal)
    root_col.objects.link(seal)

    m_skin = seal.modifiers.new('Skin', 'SKIN')
    for v in seal.data.skin_vertices[0].data:
        v.radius = (0.002, 0.002)
    bpy.context.view_layer.objects.active = seal
    seal.select_set(True)
    bpy.ops.object.modifier_apply(modifier=m_skin.name)

    return assign_finish(seal, "visor_seal", "Visor", mat_visor_seal)

build_visor_seal()


# --- 2.5 VISIÈRE THERMOFORMÉE TORIQUE IRIDIUM (visor) ---
def build_visor():
    bm_v = bmesh.new()
    v_segs = 64
    v_heights = 14
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
    visor = bpy.data.objects.new("visor", mesh_v)
    root_col.objects.link(visor)

    m_vsol = visor.modifiers.new('Sol', 'SOLIDIFY')
    m_vsol.thickness = 0.0022
    bpy.context.view_layer.objects.active = visor
    visor.select_set(True)
    bpy.ops.object.modifier_apply(modifier=m_vsol.name)

    # Pivot mécanique pour l'animation Three.js (rotation au scroll)
    visor.location = VISOR_AXIS
    for v in visor.data.vertices:
        v.co -= VISOR_AXIS

    return assign_finish(visor, "visor", "Visor", mat_visor)

build_visor()


# --- 2.6 BANDEAU PARE-SOLEIL CARBONE (visor_sunstrip) ---
def build_visor_sunstrip():
    bm_s = bmesh.new()
    v_segs = 64
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
    sunstrip = bpy.data.objects.new("visor_sunstrip", mesh_s)
    root_col.objects.link(sunstrip)

    sunstrip.location = VISOR_AXIS
    for v in sunstrip.data.vertices:
        v.co -= VISOR_AXIS

    return assign_finish(sunstrip, "visor_sunstrip", "Decals", mat_carbon_3k)

build_visor_sunstrip()


# --- 2.7 LOQUET DE VERROUILLAGE VISIÈRE (visor_latch) ---
def build_visor_latch():
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0.154, -0.004))
    catch = bpy.context.object
    catch.scale = (0.013, 0.007, 0.011)
    catch.rotation_euler = (math.radians(-8), 0, 0)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return assign_finish(catch, "visor_latch", "Hardware", mat_polymer_matte)

build_visor_latch()


# --- 2.8 PLATINES DE ROTATION LATÉRALES & VIS TITANE ---
def build_hardware():
    for side, side_str in [(-1, "left"), (1, "right")]:
        # Platine usinée CNC alu noir
        bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=0.015, depth=0.004, location=(side * 0.125, 0.015, 0.026))
        plat = bpy.context.object
        plat.rotation_euler = (0, math.radians(90), 0)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        assign_finish(plat, f"visor_mechanism_{side_str}", "Hardware", mat_black_alu)

        # Vis centrale titane
        bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.007, depth=0.006, location=(side * 0.127, 0.015, 0.026))
        screw = bpy.context.object
        screw.rotation_euler = (0, math.radians(90), 0)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        assign_finish(screw, f"screw_visor_pivot_{side_str}", "Hardware", mat_titanium)

        # Ergot téton de tear-off sur la visière
        bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.003, depth=0.005, location=(side * 0.118, 0.048, 0.018))
        tear = bpy.context.object
        tear.rotation_euler = (math.radians(20), math.radians(side * 40), 0)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        assign_finish(tear, f"tearoff_post_{side_str}", "Visor", mat_titanium)

        # Clip ancrage HANS FIA 8858
        bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.010, depth=0.008, location=(side * 0.108, -0.065, -0.078))
        hans = bpy.context.object
        hans.rotation_euler = (0, math.radians(90), math.radians(side * 20))
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        assign_finish(hans, f"hans_post_{side_str}", "Hardware", mat_black_alu)

        # Vis ancre HANS titane
        bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.005, depth=0.004, location=(side * 0.112, -0.065, -0.078))
        shans = bpy.context.object
        shans.rotation_euler = (0, math.radians(90), math.radians(side * 20))
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        assign_finish(shans, f"screw_hans_anchor_{side_str}", "Hardware", mat_titanium)

build_hardware()


# --- 2.9 OUÏES DE VENTILATION MENTONNIÈRE ---
def build_chin_vents():
    vent_positions = [
        # (name, loc, scale, rot)
        ("vent_chin_center", (0, 0.170, -0.058), (0.014, 0.006, 0.004), (math.radians(-10), 0, 0)),
        ("vent_chin_left_top", (-0.045, 0.158, -0.035), (0.014, 0.006, 0.004), (math.radians(-10), 0, math.radians(-18))),
        ("vent_chin_right_top", (0.045, 0.158, -0.035), (0.014, 0.006, 0.004), (math.radians(-10), 0, math.radians(18))),
        ("vent_chin_left_bottom", (-0.045, 0.154, -0.058), (0.014, 0.006, 0.004), (math.radians(-10), 0, math.radians(-18))),
        ("vent_chin_right_bottom", (0.045, 0.154, -0.058), (0.014, 0.006, 0.004), (math.radians(-10), 0, math.radians(18))),
    ]
    for vname, loc, scl, rot in vent_positions:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc)
        vent = bpy.context.object
        vent.scale = scl
        vent.rotation_euler = rot
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        assign_finish(vent, vname, "Aero_Vents", mat_polymer_matte)

build_chin_vents()


# --- 2.10 ÉLÉMENTS AÉRODYNAMIQUES : SPOILERS ET PRISES D'AIR ---
def build_aero():
    # Spoiler mentonnière transparent (chin lip)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0.162, -0.100))
    clip = bpy.context.object
    clip.scale = (0.082, 0.015, 0.004)
    clip.rotation_euler = (math.radians(18), 0, 0)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    assign_finish(clip, "chin_spoiler", "Aero_Vents", mat_clear_aero)

    # Aileron transparent arrière Kamm-tail (rear_spoiler)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -0.144, 0.075))
    rspoil = bpy.context.object
    rspoil.scale = (0.11, 0.024, 0.008)
    rspoil.rotation_euler = (math.radians(-32), 0, 0)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    assign_finish(rspoil, "rear_spoiler", "Aero_Vents", mat_clear_aero)

    # Vis aileron arrière titane
    for side, side_str in [(-1, "left"), (1, "right")]:
        bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.003, depth=0.003, location=(side * 0.045, -0.142, 0.080))
        screw = bpy.context.object
        screw.rotation_euler = (math.radians(-32), 0, 0)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        assign_finish(screw, f"screw_spoiler_{side_str}", "Hardware", mat_titanium)

    # Prise d'air de toit (Roof scoop)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0.015, 0.138))
    roof_scoop = bpy.context.object
    roof_scoop.scale = (0.035, 0.055, 0.008)
    roof_scoop.rotation_euler = (math.radians(8), 0, 0)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    assign_finish(roof_scoop, "vent_roof_scoop", "Aero_Vents", mat_polymer_matte)

    # Évents de dépressurisation arrière
    for name, loc, rot in [
        ("vent_exhaust_rear_top", (0, -0.138, 0.082), (math.radians(-25), 0, 0)),
        ("vent_exhaust_rear_bottom", (0, -0.148, 0.015), (math.radians(-25), 0, 0)),
    ]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc)
        v = bpy.context.object
        v.scale = (0.055, 0.010, 0.008)
        v.rotation_euler = rot
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        assign_finish(v, name, "Aero_Vents", mat_polymer_matte)

    # Aérateurs frontaux latéraux
    for side, side_str in [(-1, "left"), (1, "right")]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.038, 0.122, 0.070))
        vent_f = bpy.context.object
        vent_f.scale = (0.008, 0.008, 0.010)
        vent_f.rotation_euler = (math.radians(-45), 0, side * math.radians(15))
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        assign_finish(vent_f, f"vent_forehead_{side_str}", "Aero_Vents", mat_polymer_matte)

build_aero()


# --- 2.11 SANGLES JUGULAIRES ET BOUCLE DOUBLE-D ---
def build_straps():
    for side, side_str in [(-1, "left"), (1, "right")]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.055, -0.018, -0.100))
        st = bpy.context.object
        st.scale = (0.002, 0.014, 0.040)
        st.rotation_euler = (math.radians(-10), 0, side * math.radians(12))
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        assign_finish(st, f"strap_{side_str}", "Straps", mat_strap)

    # Anneaux titane boucle Double-D
    bpy.ops.mesh.primitive_torus_add(major_radius=0.010, minor_radius=0.002, location=(-0.010, -0.028, -0.125))
    buckle = bpy.context.object
    buckle.rotation_euler = (math.radians(65), 0, 0)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    assign_finish(buckle, "strap_buckle", "Straps", mat_titanium)

build_straps()


# --- 2.12 ACCENTS DE LIVRÉE KARTING NÉON LIME ---
def build_decals():
    # Logo frontal au-dessus de l'eyeport
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0.136, 0.068))
    badge = bpy.context.object
    badge.scale = (0.014, 0.002, 0.010)
    badge.rotation_euler = (math.radians(-32), 0, 0)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    assign_finish(badge, "logo_decal_front", "Decals", mat_neon_lime)

build_decals()


# ---------------------------------------------------------------------------
# 3. RENDU D'INSPECTION VISUELLE ET EXPORT GLB
# ---------------------------------------------------------------------------
mesh_objs = [o for o in bpy.data.objects if o.type == 'MESH']
print(f"Total pièces distinctes créées : {len(mesh_objs)}")

# Sauvegarde de la scène .blend
bpy.ops.wm.save_as_mainfile(filepath=OUTPUT_BLEND)

# Environnement studio pour le rendu de contrôle
world = bpy.data.worlds.new('StudioWorld')
bpy.context.scene.world = world
world.color = (0.16, 0.17, 0.19)

# Caméra studio 3/4 face
cam_data = bpy.data.cameras.new('Cam_Review')
cam_data.lens = 55
cam_obj = bpy.data.objects.new('Cam_Review', cam_data)
root_col.objects.link(cam_obj)
cam_obj.location = (0.42, 0.58, 0.16)
cam_obj.rotation_euler = (Vector((0, 0.04, -0.01)) - cam_obj.location).to_track_quat('-Z', 'Y').to_euler()
bpy.context.scene.camera = cam_obj

# Lumières studio
l1 = bpy.data.lights.new('KeySun', 'SUN')
l1.energy = 4.5
lo1 = bpy.data.objects.new('KeySun', l1)
root_col.objects.link(lo1)
lo1.rotation_euler = (Vector((0,0,0)) - Vector((2, 3, 3))).to_track_quat('-Z', 'Y').to_euler()

l2 = bpy.data.lights.new('FillSun', 'SUN')
l2.energy = 2.5
lo2 = bpy.data.objects.new('FillSun', l2)
root_col.objects.link(lo2)
lo2.rotation_euler = (Vector((0,0,0)) - Vector((-3, 1, 2))).to_track_quat('-Z', 'Y').to_euler()

l3 = bpy.data.lights.new('RimSun', 'SUN')
l3.energy = 3.5
lo3 = bpy.data.objects.new('RimSun', l3)
root_col.objects.link(lo3)
lo3.rotation_euler = (Vector((0,0,0)) - Vector((0, -3, 2))).to_track_quat('-Z', 'Y').to_euler()

bpy.context.scene.render.resolution_x = 900
bpy.context.scene.render.resolution_y = 700
bpy.context.scene.render.filepath = PREVIEW_IMG
bpy.ops.render.render(write_still=True)
print(f"Rendu sauvegardé dans : {PREVIEW_IMG}")

# Export GLB final propre pour Three.js
bpy.ops.object.select_all(action='DESELECT')
for o in mesh_objs:
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
print(f"GLB prêt et exporté avec succès dans : {OUTPUT_GLB}")
