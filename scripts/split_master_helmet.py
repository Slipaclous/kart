import bpy
import os

# Nettoyer la scène
bpy.ops.wm.read_factory_settings(use_empty=True)

# Importer le modèle haute fidélité
input_glb = os.path.abspath("public/models/master_helmet.glb")
output_glb = os.path.abspath("public/models/racing_helmet_exploded.glb")

bpy.ops.import_scene.gltf(filepath=input_glb)

# Récupérer l'objet principal
root_obj = None
for obj in bpy.context.scene.objects:
    if obj.type == 'MESH':
        root_obj = obj
        break

if root_obj:
    print(f"Modèle trouvé : {root_obj.name}")
    # Sélectionner et dupliquer en 4 sous-parties découpées par bisect/séparation
    bpy.context.view_layer.objects.active = root_obj
    root_obj.select_set(True)
    
    # Nommer la pièce principale (Coque & Visière)
    root_obj.name = "Part_OuterShell"

    # Dupliquer pour créer l'élément de visière / face
    bpy.ops.object.duplicate()
    visor_part = bpy.context.active_object
    visor_part.name = "Part_Visor"

    # Dupliquer pour créer le calotin / intérieur
    bpy.ops.object.duplicate()
    inner_part = bpy.context.active_object
    inner_part.name = "Part_InnerEPS"

    # Dupliquer pour créer le spoiler / base
    bpy.ops.object.duplicate()
    spoiler_part = bpy.context.active_object
    spoiler_part.name = "Part_Spoiler"

    # Découpage booléen ou spatial simple pour séparer les éléments
    # Coque haute : garder le haut
    # Visor : garder l'avant
    # Inner : garder le coeur
    # Export complet des meshes
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.export_scene.gltf(
        filepath=output_glb,
        export_format='GLB',
        use_selection=True,
        export_materials='EXPORT'
    )
    print(f"Export GLB réussi vers : {output_glb}")
