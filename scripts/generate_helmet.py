import bpy
import os
import math

# Nettoyer la scène
bpy.ops.wm.read_factory_settings(use_empty=True)

# 1. Matériaux PBR réalistes
def create_material(name, base_color, metallic, roughness, transmission=0.0, ior=1.45, clearcoat=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = base_color
        bsdf.inputs["Metallic"].default_value = metallic
        bsdf.inputs["Roughness"].default_value = roughness
        if "Transmission Weight" in bsdf.inputs:
            bsdf.inputs["Transmission Weight"].default_value = transmission
        elif "Transmission" in bsdf.inputs:
            bsdf.inputs["Transmission"].default_value = transmission
        if "IOR" in bsdf.inputs:
            bsdf.inputs["IOR"].default_value = ior
        if "Coat Weight" in bsdf.inputs:
            bsdf.inputs["Coat Weight"].default_value = clearcoat
        elif "Clearcoat" in bsdf.inputs:
            bsdf.inputs["Clearcoat"].default_value = clearcoat
    return mat

mat_carbon = create_material("Mat_Carbon", (0.05, 0.05, 0.05, 1.0), metallic=0.8, roughness=0.2, clearcoat=1.0)
mat_lime = create_material("Mat_Lime", (0.82, 1.0, 0.0, 1.0), metallic=0.1, roughness=0.3)
mat_visor = create_material("Mat_Visor", (0.1, 0.1, 0.15, 1.0), metallic=0.9, roughness=0.05, transmission=0.4, ior=1.55)
mat_inner_eps = create_material("Mat_InnerEPS", (0.02, 0.02, 0.02, 1.0), metallic=0.0, roughness=0.9)
mat_screws = create_material("Mat_Titanium", (0.8, 0.8, 0.85, 1.0), metallic=0.95, roughness=0.1)

# Collection pour exporter
export_objects = []

# --- A. Calotin Intérieur (Inner EPS Foam & Padding) ---
bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=32, radius=0.85, location=(0, 0, 0))
eps_inner = bpy.context.active_object
eps_inner.name = "Part_InnerEPS"
eps_inner.scale = (0.95, 1.05, 1.1)
bpy.ops.object.transform_apply(scale=True)
eps_inner.data.materials.append(mat_inner_eps)
export_objects.append(eps_inner)

# --- B. Coque Principale Supérieure (Outer Shell) ---
bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=48, radius=1.0, location=(0, 0, 0))
shell = bpy.context.active_object
shell.name = "Part_OuterShell"
shell.scale = (1.0, 1.12, 1.18)
bpy.ops.object.transform_apply(scale=True)
shell.data.materials.append(mat_carbon)
export_objects.append(shell)

# --- C. Mentonnière Agressive (Chin Guard) ---
bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=0.75, depth=0.6, location=(0, 0.45, -0.55))
chin = bpy.context.active_object
chin.name = "Part_ChinGuard"
chin.scale = (1.0, 1.25, 1.0)
bpy.ops.object.transform_apply(scale=True)
chin.data.materials.append(mat_carbon)
export_objects.append(chin)

# --- D. Visière Iridium Chrome (Visor) ---
bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=0.88, depth=0.42, location=(0, 0.45, -0.05))
visor = bpy.context.active_object
visor.name = "Part_Visor"
visor.scale = (1.0, 1.2, 1.0)
bpy.ops.object.transform_apply(scale=True)
visor.data.materials.append(mat_visor)
export_objects.append(visor)

# --- E. Aileron Aérodynamique Supérieur (Aero Spoiler) ---
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -0.55, 0.95))
spoiler = bpy.context.active_object
spoiler.name = "Part_Spoiler"
spoiler.scale = (0.7, 0.35, 0.08)
spoiler.rotation_euler = (-0.3, 0, 0)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
spoiler.data.materials.append(mat_lime)
export_objects.append(spoiler)

# --- F. Visserie & Platines Latérales (Pivot Screws) ---
# Platine Gauche
bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.12, depth=0.08, location=(-0.92, 0.15, -0.08))
screw_l = bpy.context.active_object
screw_l.name = "Part_PivotLeft"
screw_l.rotation_euler = (0, math.radians(90), 0)
bpy.ops.object.transform_apply(rotation=True)
screw_l.data.materials.append(mat_screws)
export_objects.append(screw_l)

# Platine Droite
bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.12, depth=0.08, location=(0.92, 0.15, -0.08))
screw_r = bpy.context.active_object
screw_r.name = "Part_PivotRight"
screw_r.rotation_euler = (0, math.radians(90), 0)
bpy.ops.object.transform_apply(rotation=True)
screw_r.data.materials.append(mat_screws)
export_objects.append(screw_r)

# --- G. Prises d'Air Avant / Écope (Air Intakes) ---
bpy.ops.mesh.primitive_cube_add(size=0.15, location=(0, 1.15, -0.5))
vent = bpy.context.active_object
vent.name = "Part_FrontVent"
vent.scale = (1.8, 0.3, 0.6)
bpy.ops.object.transform_apply(scale=True)
vent.data.materials.append(mat_lime)
export_objects.append(vent)

# Sélectionner les objets pour l'export
bpy.ops.object.select_all(action='DESELECT')
for obj in export_objects:
    obj.select_set(True)

# Chemin d'export GLB
output_dir = os.path.abspath("public/models")
os.makedirs(output_dir, exist_ok=True)
output_path = os.path.join(output_dir, "racing_helmet_exploded.glb")

bpy.ops.export_scene.gltf(
    filepath=output_path,
    export_format='GLB',
    use_selection=True,
    export_materials='EXPORT',
    export_apply=False
)

print(f"[BLENDER SUCCESS] Modèle de casque exporté vers : {output_path}")
