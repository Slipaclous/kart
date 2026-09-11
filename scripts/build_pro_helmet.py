"""APEX R-1 MASTER MOTORSPORT HELMET GENERATOR v4
Subdivision-surface aerodynamic sculpting based on authentic FIA 8860-2018 karting helmets (Bell HP7 / Arai GP-6).
Generates over 35 distinct CAD components that assemble organically along the scroll.
"""
import bpy, bmesh, math, os

OUT = "/Users/gauthierminor/Desktop/dev/Karting/public/models/pro_karting_helmet_assembly.glb"

if bpy.context.object and bpy.context.object.mode != 'OBJECT':
    bpy.ops.object.mode_set(mode='OBJECT')
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def create_mat(name, color, metallic=0.0, rough=0.25, coat=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = None
    for n in m.node_tree.nodes:
        if n.type == 'BSDF_PRINCIPLED':
            p = n
            break
    if p:
        p.inputs['Base Color'].default_value = color
        p.inputs['Metallic'].default_value = metallic
        p.inputs['Roughness'].default_value = rough
        if 'Coat Weight' in p.inputs:
            p.inputs['Coat Weight'].default_value = coat
    return m

def make_tile(name, kind):
    """Bake repeatable weave/grain textures into the GLB instead of flat colours."""
    folder = '/Users/gauthierminor/Desktop/dev/karting/public/textures'
    os.makedirs(folder, exist_ok=True)
    size = 256
    image = bpy.data.images.get(name) or bpy.data.images.new(name, size, size, alpha=False)
    pixels = []
    for y in range(size):
        for x in range(size):
            if kind == 'carbon':
                warp = (x // 4 + y // 4) % 2
                weft = (x // 7 - y // 7) % 2
                value = .025 + .042 * warp + .020 * weft + .010 * math.sin(x * .6) * math.sin(y * .45)
                pixels.extend((value * .58, value * .76, min(value * 1.18, .16), 1))
            elif kind == 'nomex':
                value = .025 + .052 * (((x * 17 + y * 31) % 23) < 4) + .012 * math.sin(x * .9) * math.sin(y * 1.2)
                pixels.extend((value, value * 1.05, value * 1.13, 1))
            else:
                value = .012 + .018 * math.sin(x * .23) * math.sin(y * .31)
                pixels.extend((value, value, value, 1))
    image.pixels.foreach_set(pixels)
    image.filepath_raw = os.path.join(folder, name + '.png')
    image.file_format = 'PNG'
    image.save()
    return image

def add_texture(mat, image, roughness):
    nodes, links = mat.node_tree.nodes, mat.node_tree.links
    bsdf = next(n for n in nodes if n.type == 'BSDF_PRINCIPLED')
    texture = nodes.new('ShaderNodeTexImage')
    texture.image = image
    texture.interpolation = 'Linear'
    links.new(texture.outputs['Color'], bsdf.inputs['Base Color'])
    bsdf.inputs['Roughness'].default_value = roughness

# Materials
mat_carbon_highgloss = create_mat('Carbon_Gloss', (0.012, 0.015, 0.018, 1.0), metallic=0.82, rough=0.06, coat=1.0)
mat_carbon_matte = create_mat('Carbon_Matte', (0.022, 0.026, 0.030, 1.0), metallic=0.45, rough=0.42, coat=0.05)
mat_apex_lime = create_mat('Apex_Acid_Lime', (0.72, 1.0, 0.02, 1.0), metallic=0.08, rough=0.18, coat=0.95)
mat_titanium = create_mat('Brushed_Titanium', (0.75, 0.78, 0.82, 1.0), metallic=0.98, rough=0.15)
mat_iridium_shield = create_mat('Iridium_Shield', (0.04, 0.16, 0.38, 1.0), metallic=0.96, rough=0.02, coat=1.0)
mat_nomex_black = create_mat('Nomex_Fabric', (0.015, 0.016, 0.018, 1.0), metallic=0.0, rough=0.95)
mat_rubber = create_mat('Gasket_Rubber', (0.008, 0.009, 0.011, 1.0), metallic=0.0, rough=0.7)
mat_clear_aero = create_mat('Polycarbonate_Clear', (0.8, 0.85, 0.9, 1.0), metallic=0.1, rough=0.08, coat=1.0)

add_texture(mat_carbon_highgloss, make_tile('apex-carbon-3k', 'carbon'), .13)
add_texture(mat_carbon_matte, make_tile('apex-carbon-forged', 'carbon'), .30)
add_texture(mat_nomex_black, make_tile('apex-nomex-knit', 'nomex'), .92)
add_texture(mat_rubber, make_tile('apex-rubber-grain', 'rubber'), .68)

parts = []

def register(obj, name, mat, smooth=True):
    obj.name = name
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)
    if smooth and hasattr(obj.data, 'polygons'):
        for f in obj.data.polygons:
            f.use_smooth = True
    parts.append(obj)
    return obj

def make_tube(name, points, radius, mat, bevel_res=4):
    c = bpy.data.curves.new(name, 'CURVE')
    c.dimensions = '3D'
    c.resolution_u = 24
    c.bevel_depth = radius
    c.bevel_resolution = bevel_res
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
    return register(bpy.context.object, name, mat)

# ==============================================================================
# 1. COQUE PRINCIPALE SCULPTÉE AÉRO (Fibre de Carbone haute brillance)
# Vraie forme de casque de course : visière orientée vers +Y, front profilé, arrière Kamm-tail
# ==============================================================================
bpy.ops.mesh.primitive_uv_sphere_add(segments=96, ring_count=64, location=(0, -0.06, 0.12))
shell = bpy.context.object
shell.scale = (1.04, 1.28, 1.16)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

# Déformation morphologique motorsport
for v in shell.data.vertices:
    x = v.co.x
    y = v.co.y
    z = v.co.z
    # Arrière effilé et becquet inférieur
    if y < 0:
        v.co.y -= 0.22 * math.cos(max(min(z, 0.8), -0.6))
    # Front plongeant aérodynamique
    if y > 0.3 and z > 0.2:
        v.co.z -= 0.08 * (y - 0.3)
    # Affinement des joues
    if z < -0.2:
        v.co.x *= 0.90

# Découpe visière (eyeport motorsport aux dimensions Bell / Arai)
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 1.05, 0.16))
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

# Découpe col inférieur (entrée de cou ergonomique ovale)
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

# Solidify : épaisseur de 4.2mm de carbone composite
mod_solid = shell.modifiers.new('SolidShell', 'SOLIDIFY')
mod_solid.thickness = 0.045
bpy.context.view_layer.objects.active = shell
bpy.ops.object.modifier_apply(modifier=mod_solid.name)

# Bevel pour arêtes adoucies sans facettes
mod_bev = shell.modifiers.new('BevelEdges', 'BEVEL')
mod_bev.width = 0.008
mod_bev.segments = 3
bpy.context.view_layer.objects.active = shell
bpy.ops.object.modifier_apply(modifier=mod_bev.name)

register(shell, '01_CARBON_SHELL', mat_carbon_highgloss)

# Joint d'étanchéité vulcanisé sur tout le tour de l'ouverture
make_tube('01_EYEPORT_GASKET', [
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

# Bordure basse en caoutchouc (Gasket de bas de casque)
make_tube('01_LOWER_BASE_GASKET', [
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

# ==============================================================================
# 2. COCKPIT INTÉRIEUR CREUX (Mousses de joues ergonomiques et col anatomique)
# Aucun mannequin, aucune boule pleine : un intérieur d'habitacle de formule 1
# ==============================================================================
# Col anatomique bas (Neck Roll)
bpy.ops.mesh.primitive_torus_add(major_radius=0.68, minor_radius=0.08, major_segments=64, minor_segments=16, location=(0, -0.18, -0.66))
neck_roll = bpy.context.object
neck_roll.scale = (1.12, 0.94, 0.52)
neck_roll.rotation_euler = (math.radians(10), 0, 0)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
register(neck_roll, '02_NECK_ROLL_LEATHER', mat_nomex_black)

# Mousses de maintien de joues droite et gauche
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
    register(pad, f'02_CHEEK_PAD_{side}', mat_nomex_black)

# Doublure interne supérieure creuse
bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=32, location=(0, -0.10, 0.16))
inner_liner = bpy.context.object
inner_liner.scale = (0.96, 1.16, 1.06)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

bpy.ops.mesh.primitive_cube_add(size=2, location=(0, 0.85, -0.2))
liner_cut = bpy.context.object
mod_lc = inner_liner.modifiers.new('LCut', 'BOOLEAN')
mod_lc.operation = 'DIFFERENCE'
mod_lc.object = liner_cut
bpy.context.view_layer.objects.active = inner_liner
bpy.ops.object.modifier_apply(modifier=mod_lc.name)
bpy.data.objects.remove(liner_cut, do_unlink=True)
# The liner was previously exported as a large grey dome.  It reads as a
# placeholder head in the exploded view, not as a helmet component.  Keep only
# the anatomical pads below, which are the parts a viewer would actually see.
bpy.data.objects.remove(inner_liner, do_unlink=True)

# ==============================================================================
# 3. MENTONNIÈRE ET SYSTÈME DE VENTILATION SPORT
# Pare-pierre renforcé en carbone mat et volets de désembuage
# ==============================================================================
make_tube('03_CHIN_SPOILER_LIP', [
    (-0.72, 0.48, -0.26),
    (-0.66, 0.88, -0.50),
    (-0.38, 1.10, -0.64),
    (0, 1.16, -0.66),
    (0.38, 1.10, -0.64),
    (0.66, 0.88, -0.50),
    (0.72, 0.48, -0.26)
], 0.11, mat_carbon_matte)

# Prise d'air basse centrale (Entrée d'air menton)
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 1.20, -0.58))
intake_box = bpy.context.object
intake_box.scale = (0.36, 0.05, 0.12)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
register(intake_box, '03_CHIN_AIR_INTAKE_BEZEL', mat_apex_lime)

for i, gx in enumerate((-0.12, -0.06, 0.0, 0.06, 0.12)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(gx, 1.23, -0.58))
    vane = bpy.context.object
    vane.scale = (0.015, 0.025, 0.08)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    register(vane, f'03_INTAKE_VANE_{i}', mat_titanium)

# ==============================================================================
# 4. VISIÈRE DOUBLE COURBURE IRIDIUM RACING 2.5MM
# Optique torique sans distorsion avec bandeau pare-soleil
# ==============================================================================
verts_vis = []
faces_vis = []
segments = 48
for row, (rad, zpos) in enumerate([(1.035, -0.14), (1.055, 0.18), (1.03, 0.41)]):
    for i in range(segments + 1):
        ang = math.radians(-66 + 132 * i / segments)
        vx = 1.045 * math.sin(ang) * rad
        vy = 0.28 + 0.745 * math.cos(ang) * rad
        verts_vis.append((vx, vy, zpos))

stride = segments + 1
for r in range(2):
    for i in range(segments):
        p0 = r * stride + i
        p1 = p0 + 1
        p2 = (r + 1) * stride + i + 1
        p3 = (r + 1) * stride + i
        faces_vis.append((p0, p1, p2, p3))

mvis = bpy.data.meshes.new('Visor_Mesh')
mvis.from_pydata(verts_vis, [], faces_vis)
mvis.update()
vis_obj = bpy.data.objects.new('04_IRIDIUM_VISOR', mvis)
bpy.context.collection.objects.link(vis_obj)
register(vis_obj, '04_IRIDIUM_VISOR', mat_iridium_shield)

mod_sv = vis_obj.modifiers.new('VisorThick', 'SOLIDIFY')
mod_sv.thickness = 0.025
bpy.context.view_layer.objects.active = vis_obj
bpy.ops.object.modifier_apply(modifier=mod_sv.name)

# Bandeau pare-soleil (Sunstrip racing bandeau supérieur)
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

mstrip = bpy.data.meshes.new('Strip_Mesh')
mstrip.from_pydata(verts_strip, [], faces_strip)
mstrip.update()
strip_obj = bpy.data.objects.new('04_SUNSTRIP_VISOR', mstrip)
bpy.context.collection.objects.link(strip_obj)
register(strip_obj, '04_SUNSTRIP_VISOR', mat_carbon_matte)

# Picots pour Tear-offs
for side, tx in (('L', -0.89), ('R', 0.89)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.024, depth=0.04, location=(tx, 0.58, 0.12), rotation=(0, math.pi/2, 0))
    register(bpy.context.object, f'04_TEAROFF_POST_{side}', mat_titanium)

# ==============================================================================
# 5. PLATINES DE ROTATION ET VISSERIE TITANE ANODISÉ
# Taillées dans la masse CNC
# ==============================================================================
for side, px in (('L', -0.99), ('R', 0.99)):
    # Disque de pivot en carbone mat
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=0.12, depth=0.04, location=(px, 0.38, 0.08), rotation=(0, math.pi/2, 0))
    register(bpy.context.object, f'05_PIVOT_PLATE_{side}', mat_carbon_matte)
    
    # Vis titane centrale
    bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=0.055, depth=0.065, location=(px * 1.02, 0.38, 0.08), rotation=(0, math.pi/2, 0))
    register(bpy.context.object, f'05_TITANIUM_BOLT_{side}', mat_titanium)

    # Verrouillage mécanique lime
    bpy.ops.mesh.primitive_cube_add(size=1, location=(px * 1.025, 0.48, 0.06))
    lever = bpy.context.object
    lever.scale = (0.025, 0.065, 0.025)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    register(lever, f'05_VISOR_LOCK_{side}', mat_apex_lime)

# ==============================================================================
# 6. PACK AÉRO DYNAMIQUE HAUTE VITESSE
# Scoop d'admission de toit, diffuseur arrière et aileron transparent
# ==============================================================================
# Prise d'air de toit induction forcée (Air scoop)
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0.16, 1.16))
top_scoop = bpy.context.object
top_scoop.scale = (0.28, 0.50, 0.09)
top_scoop.rotation_euler = (math.radians(14), 0, 0)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
register(top_scoop, '06_TOP_AIR_SCOOP', mat_carbon_matte)

# Lèvre d'entrée d'air verte lime
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0.46, 1.15))
top_lip = bpy.context.object
top_lip.scale = (0.22, 0.03, 0.035)
top_lip.rotation_euler = (math.radians(14), 0, 0)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
register(top_lip, '06_TOP_LIP_LIME', mat_apex_lime)

# Aileron arrière transparent / stabilisateur (Rear Spoiler Arai/Bell)
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -1.22, 0.58))
rear_spoiler = bpy.context.object
rear_spoiler.scale = (0.76, 0.16, 0.075)
rear_spoiler.rotation_euler = (math.radians(-24), 0, 0)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
register(rear_spoiler, '06_REAR_AERO_SPOILER', mat_clear_aero)

# Liseré de contraste lime sur le bord de fuite de l'aileron
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -1.31, 0.56))
rear_trim = bpy.context.object
rear_trim.scale = (0.55, 0.02, 0.02)
rear_trim.rotation_euler = (math.radians(-24), 0, 0)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
register(rear_trim, '06_SPOILER_LIME_TRIM', mat_apex_lime)

# ==============================================================================
# 7. DÉCO RACING SIGNATURE LIAM MOREAU #42
# Lignes de livrée néon Lime qui soulignent les arêtes sans dénaturer le carbone
# ==============================================================================
for side, lx in (('L', -0.64), ('R', 0.64)):
    make_tube(f'07_LIVERY_CHEVRON_{side}', [
        (lx * 0.94, -0.55, 0.68),
        (lx * 1.05, 0.05, 0.48),
        (lx * 1.12, 0.42, 0.12),
        (lx * 0.98, 0.35, -0.22)
    ], 0.026, mat_apex_lime)

# ============================================================================
# 8. MICRO-COMPONENTS — the things that make a helmet read as a real product
# Each is intentionally exported separately for an individual scroll arrival.
# ============================================================================
# Replaceable forehead vent cassette: frame, six independent louvers and rivets.
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0.73, 0.82))
vent_frame = bpy.context.object
vent_frame.scale = (0.30, 0.035, 0.095)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
register(vent_frame, '08_FOREHEAD_VENT_CASSETTE', mat_carbon_matte)
for i, x in enumerate((-0.20, -0.12, -0.04, 0.04, 0.12, 0.20)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x, 0.772, 0.82))
    louver = bpy.context.object
    louver.scale = (0.022, 0.018, 0.065)
    louver.rotation_euler = (0.0, math.radians(18), 0.0)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    register(louver, f'08_FOREHEAD_LOUVER_{i:02d}', mat_titanium)

# Independent titanium fasteners around the shell and crown.
for i, (x, y, z) in enumerate(((-.78,.56,.43),(.78,.56,.43),(-.74,-.42,.48),(.74,-.42,.48),(-.37,.76,.67),(.37,.76,.67))):
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=.026, depth=.018, location=(x, y, z))
    bolt = bpy.context.object
    bolt.rotation_euler = (math.pi/2, 0, 0)
    register(bolt, f'08_TITANIUM_FASTENER_{i:02d}', mat_titanium)

# Breath deflector, detachable chin curtain and side communication blanking plates.
make_tube('09_BREATH_DEFLECTOR', [(-.38,.84,-.06),(0,.98,-.14),(.38,.84,-.06)], .040, mat_nomex_black)
make_tube('09_CHIN_CURTAIN', [(-.46,.67,-.68),(0,.92,-.77),(.46,.67,-.68)], .050, mat_nomex_black)
for side, x in (('L',-.94),('R',.94)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=.082, depth=.018, location=(x,-.10,.08), rotation=(0,math.pi/2,0))
    register(bpy.context.object, f'09_COMMS_PORT_{side}', mat_rubber)

# Rear extractor uses a base and four thin fins rather than a single generic spoiler.
bpy.ops.mesh.primitive_cube_add(size=1, location=(0,-1.21,.18))
extractor = bpy.context.object
extractor.scale = (.33,.06,.14)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
register(extractor, '10_REAR_EXTRACTOR_BASE', mat_carbon_matte)
for i, x in enumerate((-.18,-.06,.06,.18)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x,-1.29,.20))
    fin = bpy.context.object
    fin.scale = (.014,.045,.09)
    fin.rotation_euler = (math.radians(-18),0,0)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    register(fin, f'10_REAR_EXTRACTOR_FIN_{i:02d}', mat_titanium)

# Three transparent tear-off films have their own pull tabs; their separation reads well in an exploded state.
for i, z in enumerate((.012,.026,.040)):
    film = vis_obj.copy(); film.data = vis_obj.data.copy(); film.location.y += z
    bpy.context.collection.objects.link(film)
    register(film, f'11_TEAROFF_FILM_{i+1}', mat_clear_aero)
    tab = make_tube(f'11_TEAROFF_PULLTAB_{i+1}', [(.88,.63,.03+i*.025),(1.00,.69,.03+i*.025)], .017, mat_clear_aero)

# Clean any lingering cube
for o in bpy.data.objects:
    if o.name == 'Cube' or o.name == 'Light' or o.name == 'Camera':
        bpy.data.objects.remove(o, do_unlink=True)

# Exports
bpy.ops.object.select_all(action='DESELECT')
for p in parts:
    p.select_set(True)

os.makedirs(os.path.dirname(OUT), exist_ok=True)
bpy.ops.export_scene.gltf(
    filepath=OUT,
    export_format='GLB',
    use_selection=True,
    export_materials='EXPORT',
    export_apply=True
)
print(f"SUCCÈS : APEX R-1 MASTER v4 exporté avec {len(parts)} pièces authentiques.")
