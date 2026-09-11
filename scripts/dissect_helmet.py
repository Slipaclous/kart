import bpy
import bmesh
import os
import math

# Nettoyer
bpy.ops.wm.read_factory_settings(use_empty=True)

input_glb = os.path.abspath("public/models/master_helmet.glb")
output_glb = os.path.abspath("public/models/racing_helmet_exploded.glb")

bpy.ops.import_scene.gltf(filepath=input_glb)

# Trouver le mesh maître
original_mesh = None
for obj in bpy.context.scene.objects:
    if obj.type == 'MESH':
        original_mesh = obj
        break

if original_mesh:
    bpy.context.view_layer.objects.active = original_mesh
    original_mesh.select_set(True)

    # 1. VISIÈRE SEULE (Garder uniquement les faces avant centrales : Y > 0.1 et -0.3 < Z < 0.25)
    bpy.ops.object.duplicate()
    visor_obj = bpy.context.active_object
    visor_obj.name = "Part_Visor"
    bm = bmesh.new()
    bm.from_mesh(visor_obj.data)
    to_delete = [f for f in bm.faces if not (f.calc_center_bounds().y > 0.15 and -0.3 < f.calc_center_bounds().z < 0.35)]
    bmesh.ops.delete(bm, geom=to_delete, context='FACES_ONLY')
    bm.to_mesh(visor_obj.data)
    bm.free()

    # 2. COQUE EXTÉRIEURE SUPÉRIEURE (Garder le dôme du haut : Z > 0.15)
    bpy.context.view_layer.objects.active = original_mesh
    original_mesh.select_set(True)
    bpy.ops.object.duplicate()
    shell_obj = bpy.context.active_object
    shell_obj.name = "Part_OuterShell"
    bm = bmesh.new()
    bm.from_mesh(shell_obj.data)
    to_delete = [f for f in bm.faces if f.calc_center_bounds().z <= 0.15]
    bmesh.ops.delete(bm, geom=to_delete, context='FACES_ONLY')
    bm.to_mesh(shell_obj.data)
    bm.free()

    # 3. MENTONNIÈRE & BAS DU CASQUE (Garder Z < -0.15 et Y > -0.2)
    bpy.context.view_layer.objects.active = original_mesh
    original_mesh.select_set(True)
    bpy.ops.object.duplicate()
    chin_obj = bpy.context.active_object
    chin_obj.name = "Part_ChinGuard"
    bm = bmesh.new()
    bm.from_mesh(chin_obj.data)
    to_delete = [f for f in bm.faces if not (f.calc_center_bounds().z <= -0.15 and f.calc_center_bounds().y > -0.2)]
    bmesh.ops.delete(bm, geom=to_delete, context='FACES_ONLY')
    bm.to_mesh(chin_obj.data)
    bm.free()

    # 4. STRUCTURE ARRIÈRE & CALOTIN (Garder Y <= -0.1)
    bpy.context.view_layer.objects.active = original_mesh
    original_mesh.select_set(True)
    bpy.ops.object.duplicate()
    rear_obj = bpy.context.active_object
    rear_obj.name = "Part_InnerEPS"
    bm = bmesh.new()
    bm.from_mesh(rear_obj.data)
    to_delete = [f for f in bm.faces if f.calc_center_bounds().y > -0.1]
    bmesh.ops.delete(bm, geom=to_delete, context='FACES_ONLY')
    bm.to_mesh(rear_obj.data)
    bm.free()

    # 5. AJOUTER DES PIÈCES COMPLÉMENTAIRES DÉTAILLÉES (Aileron Lime, Visserie Titane, Sangle)
    # Matériaux
    mat_lime = bpy.data.materials.new(name="Mat_AeroLime")
    mat_lime.use_nodes = True
    bsdf_lime = mat_lime.node_tree.nodes.get("Principled BSDF")
    if bsdf_lime:
        bsdf_lime.inputs["Base Color"].default_value = (0.82, 1.0, 0.0, 1.0)
        bsdf_lime.inputs["Roughness"].default_value = 0.25

    mat_titanium = bpy.data.materials.new(name="Mat_Titanium")
    mat_titanium.use_nodes = True
    bsdf_ti = mat_titanium.node_tree.nodes.get("Principled BSDF")
    if bsdf_ti:
        bsdf_ti.inputs["Base Color"].default_value = (0.75, 0.75, 0.8, 1.0)
        bsdf_ti.inputs["Metallic"].default_value = 0.95
        bsdf_ti.inputs["Roughness"].default_value = 0.1

    # Aileron aéro arrière (Spoiler)
    bpy.ops.mesh.primitive_cube_add(size=0.5, location=(0, -0.6, 0.55))
    spoiler = bpy.context.active_object
    spoiler.name = "Part_Spoiler"
    spoiler.scale = (1.4, 0.45, 0.08)
    spoiler.rotation_euler = (-0.25, 0, 0)
    bpy.ops.object.transform_apply(rotation=True, scale=True)
    spoiler.data.materials.append(mat_lime)

    # Vis / Platine latérale Gauche
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.12, depth=0.06, location=(-0.85, 0.12, 0.05))
    screw_l = bpy.context.active_object
    screw_l.name = "Part_PivotLeft"
    screw_l.rotation_euler = (0, math.radians(90), 0)
    bpy.ops.object.transform_apply(rotation=True)
    screw_l.data.materials.append(mat_titanium)

    # Vis / Platine latérale Droite
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.12, depth=0.06, location=(0.85, 0.12, 0.05))
    screw_r = bpy.context.active_object
    screw_r.name = "Part_PivotRight"
    screw_r.rotation_euler = (0, math.radians(90), 0)
    bpy.ops.object.transform_apply(rotation=True)
    screw_r.data.materials.append(mat_titanium)

    # Supprimer le mesh d'origine duplicateur pour ne garder que les 7 morceaux découpés
    bpy.data.objects.remove(original_mesh, do_unlink=True)

    # Sélectionner toutes les pièces découpées
    bpy.ops.object.select_all(action='SELECT')

    bpy.ops.export_scene.gltf(
        filepath=output_glb,
        export_format='GLB',
        use_selection=True,
        export_materials='EXPORT'
    )
    print(f"[BLENDER SUCCESS] Casque découpé en 7 pièces uniques distinctes vers : {output_glb}")
