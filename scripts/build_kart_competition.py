"""APEX RACING KARTS // FIA COMPETITION CHASSIS GENERATOR
Generates an authentic 125cc competition karting machine with CAD-level detailing:
- 25CrMo4 tubular chrome-moly chassis (Ø 30/32mm)
- Aerodynamic bodywork (front nosecone, nassau panel, side pods)
- Carbon-weave bucket seat & ergonomic racing steering wheel with telemetry display
- Precision front steering geometry (stub axles, tie-rods, steering column)
- 125cc 2-stroke competition engine with finned cylinder, carb & hydroformed tuned pipe
- Rear floating ventilated brake disc with CNC radial caliper
- 50mm rear hollow axle with magnesium hubs and slick tyres
"""

import bpy
import bmesh
import math
import os

OUT_PATH = "/Users/gauthierminor/Desktop/dev/Karting/public/models/kart_competition_chassis.glb"
TEX_DIR = "/Users/gauthierminor/Desktop/dev/Karting/public/textures"
os.makedirs(TEX_DIR, exist_ok=True)
os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)

# 1. Reset scene
if bpy.context.object and bpy.context.object.mode != 'OBJECT':
    bpy.ops.object.mode_set(mode='OBJECT')
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# 2. Material Helper
def create_pbr_material(name, base_color, metallic=0.0, roughness=0.3, coat=0.0, emission=None, emission_strength=1.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = next(n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    bsdf.inputs['Base Color'].default_value = base_color
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    if 'Coat Weight' in bsdf.inputs:
        bsdf.inputs['Coat Weight'].default_value = coat
    if emission and 'Emission Color' in bsdf.inputs:
        bsdf.inputs['Emission Color'].default_value = emission
        if 'Emission Strength' in bsdf.inputs:
            bsdf.inputs['Emission Strength'].default_value = emission_strength
    return mat

def create_procedural_texture(name, kind):
    size = 256
    img = bpy.data.images.get(name) or bpy.data.images.new(name, size, size, alpha=False)
    pixels = []
    for y in range(size):
        for x in range(size):
            if kind == 'carbon':
                w1 = (x // 4 + y // 4) % 2
                w2 = (x // 6 - y // 6) % 2
                v = 0.02 + 0.04 * w1 + 0.02 * w2 + 0.01 * math.sin(x * 0.4) * math.sin(y * 0.4)
                pixels.extend((v * 0.6, v * 0.8, v * 0.9, 1.0))
            elif kind == 'tyre_rubber':
                grain = ((x * 37 + y * 59) % 29) / 29.0
                v = 0.018 + 0.012 * grain
                pixels.extend((v, v, v, 1.0))
            elif kind == 'exhaust_burn':
                norm = y / float(size)
                if norm < 0.3:
                    pixels.extend((0.15, 0.25, 0.65, 1.0))
                elif norm < 0.55:
                    pixels.extend((0.65, 0.45, 0.12, 1.0))
                elif norm < 0.75:
                    pixels.extend((0.45, 0.15, 0.45, 1.0))
                else:
                    pixels.extend((0.35, 0.36, 0.38, 1.0))
            else:
                pixels.extend((0.1, 0.1, 0.1, 1.0))
    img.pixels.foreach_set(pixels)
    img.filepath_raw = os.path.join(TEX_DIR, f"{name}.png")
    img.file_format = 'PNG'
    img.save()
    return img

def attach_texture(mat, img, roughness=None):
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    bsdf = next(n for n in nodes if n.type == 'BSDF_PRINCIPLED')
    tex_node = nodes.new('ShaderNodeTexImage')
    tex_node.image = img
    links.new(tex_node.outputs['Color'], bsdf.inputs['Base Color'])
    if roughness is not None:
        bsdf.inputs['Roughness'].default_value = roughness

# Palette Motorsport Pro
mat_chassis_brg = create_pbr_material("BRG_Tubing", (0.010, 0.075, 0.038, 1.0), metallic=0.2, roughness=0.25, coat=0.6)
mat_pod_brg = create_pbr_material("Aero_BRG_Gloss", (0.008, 0.065, 0.032, 1.0), metallic=0.3, roughness=0.15, coat=0.95)
mat_acid_lime = create_pbr_material("Acid_Lime_Accent", (0.75, 1.0, 0.02, 1.0), metallic=0.1, roughness=0.2, coat=0.8)
mat_carbon_seat = create_pbr_material("Carbon_Seat", (0.02, 0.022, 0.025, 1.0), metallic=0.7, roughness=0.18, coat=0.9)
mat_magnesium_gold = create_pbr_material("Magnesium_Gold", (0.78, 0.62, 0.28, 1.0), metallic=0.95, roughness=0.22)
mat_titanium_silver = create_pbr_material("Titanium_CNC", (0.68, 0.72, 0.75, 1.0), metallic=0.98, roughness=0.18)
mat_disc_steel = create_pbr_material("Brake_Rotor_Steel", (0.45, 0.46, 0.48, 1.0), metallic=0.92, roughness=0.32)
mat_caliper_red = create_pbr_material("Brembo_Anodized_Red", (0.75, 0.03, 0.03, 1.0), metallic=0.4, roughness=0.25)
mat_slick_rubber = create_pbr_material("Vega_Slick_Rubber", (0.015, 0.016, 0.017, 1.0), metallic=0.0, roughness=0.72)
mat_engine_black = create_pbr_material("Engine_Crankcase", (0.03, 0.032, 0.035, 1.0), metallic=0.85, roughness=0.35)
mat_cylinder_head = create_pbr_material("Cylinder_Anodized_Cyan", (0.05, 0.45, 0.75, 1.0), metallic=0.9, roughness=0.2)
mat_exhaust_pipe = create_pbr_material("Hydroformed_Exhaust", (0.4, 0.38, 0.35, 1.0), metallic=0.88, roughness=0.28)
mat_telemetry_screen = create_pbr_material("Telemetry_Display", (0.02, 0.02, 0.02, 1.0), metallic=0.0, roughness=0.1, emission=(0.75, 1.0, 0.02, 1.0), emission_strength=4.0)

# Apply baked textures
attach_texture(mat_carbon_seat, create_procedural_texture('kart_carbon_weave', 'carbon'), 0.18)
attach_texture(mat_slick_rubber, create_procedural_texture('kart_tyre_grain', 'tyre_rubber'), 0.75)
attach_texture(mat_exhaust_pipe, create_procedural_texture('kart_exhaust_heat', 'exhaust_burn'), 0.28)

parts = []

def register_object(obj, name, mat, smooth=True):
    obj.name = name
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)
    if smooth and hasattr(obj.data, 'polygons'):
        for poly in obj.data.polygons:
            poly.use_smooth = True
    parts.append(obj)
    return obj

def create_pipe_curve(name, points, radius, mat):
    curve = bpy.data.curves.new(name, 'CURVE')
    curve.dimensions = '3D'
    curve.resolution_u = 16
    curve.bevel_depth = radius
    curve.bevel_resolution = 4
    spline = curve.splines.new('BEZIER')
    spline.bezier_points.add(len(points) - 1)
    for i, pt in enumerate(points):
        bp = spline.bezier_points[i]
        bp.co = pt
        bp.handle_left_type = 'AUTO'
        bp.handle_right_type = 'AUTO'
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    
    # Convert to mesh for glTF compatibility
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.convert(target='MESH')
    register_object(obj, name, mat)
    return obj

# 3. Tubular Chassis (Left & Right Main Tubes + Crossbars)
tube_radius = 0.016  # 32mm tube diameter

# Main frame rails
left_rail_pts = [
    (-0.28, -0.65, 0.05),
    (-0.28, -0.20, 0.05),
    (-0.22, 0.15, 0.06),
    (-0.22, 0.48, 0.06),
    (-0.16, 0.70, 0.08),
]
create_pipe_curve("chassis_rail_left", left_rail_pts, tube_radius, mat_chassis_brg)

right_rail_pts = [
    (0.28, -0.65, 0.05),
    (0.28, -0.20, 0.05),
    (0.22, 0.15, 0.06),
    (0.22, 0.48, 0.06),
    (0.16, 0.70, 0.08),
]
create_pipe_curve("chassis_rail_right", right_rail_pts, tube_radius, mat_chassis_brg)

# Front bumper loop
front_bumper_pts = [
    (-0.25, 0.75, 0.08),
    (-0.20, 0.95, 0.10),
    (0.00, 1.02, 0.10),
    (0.20, 0.95, 0.10),
    (0.25, 0.75, 0.08)
]
create_pipe_curve("chassis_front_loop", front_bumper_pts, 0.012, mat_chassis_brg)

create_pipe_curve("chassis_front_beam", [(-0.30, 0.58, 0.07), (0.30, 0.58, 0.07)], tube_radius, mat_chassis_brg)
create_pipe_curve("chassis_mid_beam", [(-0.24, 0.05, 0.05), (0.24, 0.05, 0.05)], tube_radius, mat_chassis_brg)
create_pipe_curve("chassis_rear_beam", [(-0.32, -0.55, 0.05), (0.32, -0.55, 0.05)], tube_radius, mat_chassis_brg)

# Rear axle bearing cassettes
for idx, x_pos in enumerate([-0.28, 0.0, 0.28]):
    bpy.ops.mesh.primitive_cylinder_add(radius=0.038, depth=0.04, location=(x_pos, -0.55, 0.07))
    cassette = bpy.context.active_object
    cassette.rotation_euler = (0, math.pi / 2, 0)
    register_object(cassette, f"chassis_cassette_{idx}", mat_titanium_silver)

# Rear solid hollow axle 50mm
bpy.ops.mesh.primitive_cylinder_add(radius=0.025, depth=1.04, location=(0, -0.55, 0.07))
axle = bpy.context.active_object
axle.rotation_euler = (0, math.pi / 2, 0)
register_object(axle, "rear_axle_50mm", mat_titanium_silver)

# 4. Rear Ventilated Floating Brake Disc & Caliper
bpy.ops.mesh.primitive_cylinder_add(radius=0.105, depth=0.014, location=(-0.16, -0.55, 0.07))
brake_disc = bpy.context.active_object
brake_disc.rotation_euler = (0, math.pi / 2, 0)
register_object(brake_disc, "brake_rotor_rear", mat_disc_steel)

bpy.ops.mesh.primitive_torus_add(major_radius=0.075, minor_radius=0.004, location=(-0.16, -0.55, 0.07))
disc_slot = bpy.context.active_object
disc_slot.rotation_euler = (0, math.pi / 2, 0)
register_object(disc_slot, "brake_disc_slots", mat_titanium_silver)

bpy.ops.mesh.primitive_cube_add(size=0.08, location=(-0.16, -0.52, 0.16))
caliper = bpy.context.active_object
caliper.scale = (0.6, 1.2, 0.9)
register_object(caliper, "brake_caliper_cnc", mat_caliper_red)

# 5. Wheels & Tyres
def make_competition_wheel(name, loc, is_front=True):
    wheel_group = []
    tyre_width = 0.13 if is_front else 0.20
    tyre_radius = 0.130 if is_front else 0.140
    rim_radius = 0.065
    
    bpy.ops.mesh.primitive_cylinder_add(radius=tyre_radius, depth=tyre_width, location=loc)
    tyre = bpy.context.active_object
    tyre.rotation_euler = (0, math.pi / 2, 0)
    register_object(tyre, f"{name}_tyre", mat_slick_rubber)
    wheel_group.append(tyre)
    
    bpy.ops.mesh.primitive_cylinder_add(radius=rim_radius, depth=tyre_width + 0.005, location=loc)
    rim = bpy.context.active_object
    rim.rotation_euler = (0, math.pi / 2, 0)
    register_object(rim, f"{name}_rim", mat_magnesium_gold)
    wheel_group.append(rim)
    
    hub_offset = 0.015 if loc[0] > 0 else -0.015
    bpy.ops.mesh.primitive_cylinder_add(radius=0.022, depth=0.05, location=(loc[0] + hub_offset, loc[1], loc[2]))
    hub = bpy.context.active_object
    hub.rotation_euler = (0, math.pi / 2, 0)
    register_object(hub, f"{name}_nut", mat_titanium_silver)
    wheel_group.append(hub)
    return wheel_group

make_competition_wheel("wheel_front_left", (-0.46, 0.58, 0.08), is_front=True)
make_competition_wheel("wheel_front_right", (0.46, 0.58, 0.08), is_front=True)
make_competition_wheel("wheel_rear_left", (-0.56, -0.55, 0.08), is_front=False)
make_competition_wheel("wheel_rear_right", (0.56, -0.55, 0.08), is_front=False)

# 6. Front Steering Geometry
for sign, side in [(-1, "left"), (1, "right")]:
    bpy.ops.mesh.primitive_cylinder_add(radius=0.015, depth=0.09, location=(sign * 0.35, 0.58, 0.08))
    stub = bpy.context.active_object
    stub.rotation_euler = (0, 0, sign * 0.15)
    register_object(stub, f"stub_axle_{side}", mat_magnesium_gold)

create_pipe_curve("steering_column", [(0.0, 0.35, 0.08), (0.0, 0.20, 0.38)], 0.010, mat_titanium_silver)
create_pipe_curve("tie_rod_left", [(0.02, 0.28, 0.10), (-0.33, 0.55, 0.08)], 0.006, mat_titanium_silver)
create_pipe_curve("tie_rod_right", [(-0.02, 0.28, 0.10), (0.33, 0.55, 0.08)], 0.006, mat_titanium_silver)

bpy.ops.mesh.primitive_torus_add(major_radius=0.12, minor_radius=0.014, location=(0.0, 0.18, 0.40))
wheel_rim = bpy.context.active_object
wheel_rim.rotation_euler = (math.radians(-35), 0, 0)
wheel_rim.scale = (1.0, 0.85, 1.0)
register_object(wheel_rim, "steering_wheel_rim", mat_slick_rubber)

bpy.ops.mesh.primitive_cube_add(size=0.10, location=(0.0, 0.18, 0.40))
wheel_hub = bpy.context.active_object
wheel_hub.rotation_euler = (math.radians(-35), 0, 0)
wheel_hub.scale = (1.2, 0.2, 0.9)
register_object(wheel_hub, "steering_wheel_plate", mat_carbon_seat)

bpy.ops.mesh.primitive_plane_add(size=0.065, location=(0.0, 0.174, 0.408))
telemetry = bpy.context.active_object
telemetry.rotation_euler = (math.radians(-35), 0, 0)
telemetry.scale = (1.3, 0.6, 1.0)
register_object(telemetry, "telemetry_screen", mat_telemetry_screen)

# 7. Aerodynamic Bodywork
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

mesh_nose = bpy.data.meshes.new("mesh_nosecone")
bm.to_mesh(mesh_nose)
bm.free()
nose_obj = bpy.data.objects.new("aero_front_nosecone", mesh_nose)
bpy.context.collection.objects.link(nose_obj)
register_object(nose_obj, "aero_front_nosecone", mat_pod_brg)

bpy.ops.mesh.primitive_cube_add(size=0.10, location=(0.0, 0.94, 0.17))
stripe = bpy.context.active_object
stripe.scale = (1.8, 0.1, 0.02)
stripe.rotation_euler = (math.radians(12), 0, 0)
register_object(stripe, "aero_front_stripe", mat_acid_lime)

bpy.ops.mesh.primitive_cube_add(size=0.10, location=(0.0, 0.48, 0.28))
nassau = bpy.context.active_object
nassau.rotation_euler = (math.radians(-32), 0, 0)
nassau.scale = (0.9, 0.15, 2.5)
register_object(nassau, "aero_nassau_panel", mat_pod_brg)

for sign, side in [(-1, "left"), (1, "right")]:
    bpy.ops.mesh.primitive_cube_add(size=0.10, location=(sign * 0.45, 0.05, 0.14))
    pod = bpy.context.active_object
    pod.scale = (1.5, 5.2, 1.3)
    register_object(pod, f"aero_sidepod_{side}", mat_pod_brg)
    
    bpy.ops.mesh.primitive_cube_add(size=0.08, location=(sign * 0.52, -0.05, 0.18))
    fin = bpy.context.active_object
    fin.scale = (0.2, 3.8, 0.15)
    register_object(fin, f"aero_fin_{side}", mat_acid_lime)

# 8. Carbon Racing Bucket Seat
bpy.ops.mesh.primitive_cube_add(size=0.20, location=(0.0, -0.16, 0.22))
seat = bpy.context.active_object
seat.rotation_euler = (math.radians(24), 0, 0)
seat.scale = (1.6, 1.1, 2.0)
register_object(seat, "seat_carbon_bucket", mat_carbon_seat)

create_pipe_curve("seat_bracket_left", [(-0.16, -0.15, 0.20), (-0.26, -0.35, 0.06)], 0.007, mat_titanium_silver)
create_pipe_curve("seat_bracket_right", [(0.16, -0.15, 0.20), (0.26, -0.35, 0.06)], 0.007, mat_titanium_silver)

# 9. 125cc Competition Racing Engine
bpy.ops.mesh.primitive_cube_add(size=0.16, location=(0.24, -0.28, 0.15))
crankcase = bpy.context.active_object
crankcase.scale = (0.9, 1.1, 0.8)
register_object(crankcase, "engine_crankcase", mat_engine_black)

bpy.ops.mesh.primitive_cylinder_add(radius=0.065, depth=0.12, location=(0.24, -0.28, 0.26))
cylinder = bpy.context.active_object
register_object(cylinder, "engine_cylinder", mat_titanium_silver)

bpy.ops.mesh.primitive_cylinder_add(radius=0.070, depth=0.045, location=(0.24, -0.28, 0.34))
head = bpy.context.active_object
register_object(head, "engine_cylinder_head", mat_cylinder_head)

bpy.ops.mesh.primitive_cylinder_add(radius=0.012, depth=0.04, location=(0.24, -0.28, 0.38))
spark = bpy.context.active_object
register_object(spark, "engine_spark_plug", mat_titanium_silver)

create_pipe_curve("engine_ht_lead", [(0.24, -0.28, 0.40), (0.20, -0.22, 0.25)], 0.004, mat_caliper_red)

bpy.ops.mesh.primitive_cylinder_add(radius=0.035, depth=0.08, location=(0.32, -0.20, 0.22))
carb = bpy.context.active_object
carb.rotation_euler = (math.pi / 2, 0, 0)
register_object(carb, "engine_carburetor", mat_titanium_silver)

bpy.ops.mesh.primitive_cube_add(size=0.12, location=(0.34, -0.10, 0.24))
airbox = bpy.context.active_object
airbox.scale = (0.8, 1.2, 0.7)
register_object(airbox, "engine_airbox", mat_carbon_seat)

exhaust_pts = [
    (0.24, -0.34, 0.25),
    (0.26, -0.44, 0.20),
    (0.22, -0.56, 0.16),
    (0.05, -0.66, 0.17),
    (-0.15, -0.65, 0.19),
    (-0.24, -0.58, 0.20),
]
create_pipe_curve("exhaust_tuned_pipe", exhaust_pts, 0.024, mat_exhaust_pipe)

bpy.ops.mesh.primitive_cylinder_add(radius=0.032, depth=0.22, location=(-0.26, -0.42, 0.22))
silencer = bpy.context.active_object
silencer.rotation_euler = (math.radians(-70), 0, 0)
register_object(silencer, "exhaust_silencer", mat_carbon_seat)

bpy.ops.mesh.primitive_cube_add(size=0.15, location=(-0.24, -0.18, 0.22))
radiator = bpy.context.active_object
radiator.scale = (0.4, 1.4, 1.8)
radiator.rotation_euler = (0, math.radians(-10), 0)
register_object(radiator, "cooling_radiator", mat_titanium_silver)

create_pipe_curve("coolant_hose_feed", [(-0.24, -0.24, 0.18), (0.16, -0.28, 0.22)], 0.008, mat_cylinder_head)

print(f"Total CAD components registered: {len(parts)}")

# 10. glTF 2.0 Export
print(f"Exporting optimized GLB to {OUT_PATH}...")
bpy.ops.export_scene.gltf(
    filepath=OUT_PATH,
    export_format='GLB',
    use_selection=False,
    export_apply=True,
    export_materials='EXPORT',
    export_cameras=False,
    export_lights=False
)
print("SUCCESS: Kart competition chassis generated!")
