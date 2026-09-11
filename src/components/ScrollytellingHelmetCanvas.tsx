"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface ModularPiece {
  mesh: THREE.Object3D;
  origPos: THREE.Vector3;
  explodedOffset: THREE.Vector3;
  origRot: THREE.Euler;
  explodedRotOffset: THREE.Vector3;
  arrivalStart: number; // Début de transition au scroll (0 à 1)
  arrivalEnd: number;   // Fin d'emboîtement (verrouillé à sa place exacte)
}

export default function ScrollytellingHelmetCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Scene & Camera Setup haute fidélité
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.8);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.65;
    container.appendChild(renderer.domElement);

    // 2. Éclairage Studio Motorsport Haute Définition
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    // Key light principale
    const keyLight = new THREE.DirectionalLight(0xffffff, 5.2);
    keyLight.position.set(4, 7, 5);
    scene.add(keyLight);

    // Rim light latérale vert acide / lime (signature de marque Liam Moreau)
    const limeRim = new THREE.DirectionalLight(0xd2ff00, 5.5);
    limeRim.position.set(-6, 3, -2);
    scene.add(limeRim);

    // Lumière rasante cyan de contre-plongée (révèle la trame du carbone et les arêtes)
    const cyanFill = new THREE.DirectionalLight(0x40e0d0, 3.2);
    cyanFill.position.set(5, -4, 3);
    scene.add(cyanFill);

    // Follow-spot dynamique qui inspecte le casque lors de l'assemblage
    const followSpot = new THREE.SpotLight(0xffffff, 7.5, 15, Math.PI / 5, 0.4, 1);
    followSpot.position.set(0, 3, 4);
    scene.add(followSpot);

    // 3. Groupe racine & chargement du modèle Blender généré
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    const pieces: ModularPiece[] = [];
    const loader = new GLTFLoader();

    loader.load("/models/karting_helmet_assembly.glb", (gltf) => {
      // Ajustement de l'échelle du casque à l'écran
      gltf.scene.scale.set(6.8, 6.8, 6.8);
      gltf.scene.position.set(0, -0.2, 0);

      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const name = child.name;

          // Définition de la chorégraphie cinématique d'assemblage selon chaque pièce générée
          let arrivalStart = 0.0;
          let arrivalEnd = 0.15;
          let offset = new THREE.Vector3(0, 0, 0);
          let rotOffset = new THREE.Vector3(0, 0, 0);

          if (name === "helmet_shell") {
            // ACTE 1 : Coque principale
            arrivalStart = 0.0;
            arrivalEnd = 0.08;
            offset.set(0, 0, 0);
            rotOffset.set(0, 0, 0);
          } else if (name === "inner_shell" || name === "inner_padding") {
            // ACTE 2 : Calotte EPS et mousses Nomex intérieures (remontent du bas)
            arrivalStart = 0.06;
            arrivalEnd = 0.24;
            offset.set(0, -2.2, 0.2);
            rotOffset.set(0.15, 0, 0);
          } else if (name === "strap_left" || name === "strap_right" || name === "strap_buckle") {
            // ACTE 2 bis : Sangles et boucle Double-D
            arrivalStart = 0.16;
            arrivalEnd = 0.30;
            const isLeft = name.includes("left");
            offset.set(isLeft ? -1.5 : 1.5, -2.5, 0);
            rotOffset.set(0, 0, isLeft ? -0.3 : 0.3);
          } else if (name.startsWith("vent_chin") || name === "chin_spoiler") {
            // ACTE 3 : Mentonnière, canaux d'air frontaux et lèvre aéro
            arrivalStart = 0.28;
            arrivalEnd = 0.45;
            offset.set(0, -1.8, 2.5);
            rotOffset.set(-0.35, 0, 0);
          } else if (name.startsWith("vent_forehead") || name === "vent_roof_scoop") {
            // ACTE 3 bis : Aérateurs de front et prise d'air de toit
            arrivalStart = 0.36;
            arrivalEnd = 0.50;
            offset.set(0, 2.2, 1.2);
            rotOffset.set(0.4, 0, 0);
          } else if (name === "visor_seal") {
            // ACTE 4 : Joint d'étanchéité avant pose de la visière
            arrivalStart = 0.44;
            arrivalEnd = 0.58;
            offset.set(0, 0, 2.0);
            rotOffset.set(0, 0, 0);
          } else if (name === "visor" || name === "visor_sunstrip") {
            // ACTE 4 bis : Visière polycarbonate transparente et bandeau pare-soleil
            arrivalStart = 0.52;
            arrivalEnd = 0.68;
            offset.set(0, 1.8, 3.2);
            rotOffset.set(0.45, 0, 0);
          } else if (name.startsWith("visor_mechanism") || name.startsWith("screw_visor_pivot")) {
            // ACTE 5 : Platines de rotation latérales et vis pivot titane
            arrivalStart = 0.64;
            arrivalEnd = 0.78;
            const isLeft = name.includes("left");
            offset.set(isLeft ? -3.2 : 3.2, 0.2, 0);
            rotOffset.set(0, 0, isLeft ? 1.5 : -1.5);
          } else if (name.startsWith("hans_post") || name.startsWith("screw_hans_anchor")) {
            // ACTE 5 bis : Ancres HANS FIA et visserie latérale
            arrivalStart = 0.70;
            arrivalEnd = 0.82;
            const isLeft = name.includes("left");
            offset.set(isLeft ? -2.8 : 2.8, -0.4, -0.8);
            rotOffset.set(0, isLeft ? 1.0 : -1.0, 0);
          } else if (name === "rear_spoiler" || name.startsWith("screw_spoiler") || name.startsWith("vent_exhaust_rear")) {
            // ACTE 6 : Aileron arrière ducktail, vis de spoiler et extracteurs
            arrivalStart = 0.78;
            arrivalEnd = 0.92;
            offset.set(0, 1.8, -2.6);
            rotOffset.set(0.5, 0, 0);
          } else if (name === "logo_decal_front") {
            // ACTE 7 : Écusson frontal / badge de finition
            arrivalStart = 0.86;
            arrivalEnd = 0.98;
            offset.set(0, 0.8, 2.5);
            rotOffset.set(-0.2, 0, 0);
          } else {
            arrivalStart = 0.1;
            arrivalEnd = 0.3;
            offset.set(0, 1.5, 0);
            rotOffset.set(0, 0, 0);
          }

          // Shading PBR : Préservation des textures PBR embarquées (Carbone, Nomex, Caoutchouc, Badges)
          if (child.material) {
            const mat = child.material as THREE.MeshStandardMaterial;
            if (mat.map) {
              mat.map.anisotropy = 16;
              mat.map.needsUpdate = true;
            }

            if (name === "helmet_shell") {
              // Fibre de carbone British Racing Green glossy
              mat.roughness = 0.12;
              mat.metalness = 0.60;
            } else if (name === "visor") {
              // Polycarbonate teinté et transparent
              mat.transparent = true;
              mat.opacity = 0.72;
              mat.roughness = 0.03;
              mat.metalness = 0.15;
            } else if (name === "rear_spoiler" || name === "chin_spoiler") {
              mat.transparent = true;
              mat.opacity = 0.78;
              mat.roughness = 0.08;
              mat.metalness = 0.10;
            } else if (name === "visor_sunstrip" || name === "logo_decal_front") {
              mat.roughness = 0.2;
              mat.metalness = 0.2;
            } else if (name.includes("screw") || name.includes("buckle") || name.includes("titanium")) {
              mat.roughness = 0.18;
              mat.metalness = 0.98;
            } else if (name.includes("padding") || name.includes("strap")) {
              mat.roughness = 0.95;
              mat.metalness = 0.02;
            }
            mat.needsUpdate = true;
          }

          pieces.push({
            mesh: child,
            origPos: child.position.clone(),
            explodedOffset: offset,
            origRot: child.rotation.clone(),
            explodedRotOffset: rotOffset,
            arrivalStart,
            arrivalEnd,
          });
        }
      });

      rootGroup.add(gltf.scene);
    });

    // 4. Gestion fluide du scroll et des interactions
    let currentProgress = 0;
    let targetProgress = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      targetProgress = maxScroll > 0 ? Math.min(Math.max(scrollY / maxScroll, 0), 1) : 0;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // 5. Boucle d'animation cinématique
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Lerp d'amorti mécanique
      currentProgress += (targetProgress - currentProgress) * 0.055;

      // Assemblage cinématique pièce par pièce
      pieces.forEach((p) => {
        if (currentProgress < p.arrivalStart) {
          p.mesh.visible = false;
        } else {
          p.mesh.visible = true;

          const range = p.arrivalEnd - p.arrivalStart;
          const rawRatio = range > 0 ? (currentProgress - p.arrivalStart) / range : 1;
          const ratio = Math.min(Math.max(rawRatio, 0), 1);

          // Easing cubique type clip mécanique
          const ease = 1 - Math.pow(1 - ratio, 3);
          const factor = 1 - ease;

          p.mesh.position.x = p.origPos.x + p.explodedOffset.x * factor;
          p.mesh.position.y = p.origPos.y + p.explodedOffset.y * factor;
          p.mesh.position.z = p.origPos.z + p.explodedOffset.z * factor;

          p.mesh.rotation.x = p.origRot.x + p.explodedRotOffset.x * factor;
          p.mesh.rotation.y = p.origRot.y + p.explodedRotOffset.y * factor;
          p.mesh.rotation.z = p.origRot.z + p.explodedRotOffset.z * factor;
        }
      });

      // Rotation synchronisée au scroll (360° pour inspecter chaque angle au fil du scroll)
      const targetRotY = (currentProgress * Math.PI * 2.0) + (mouseX * 0.25);
      const targetRotX = (mouseY * 0.15) - 0.04 + Math.sin(currentProgress * Math.PI) * 0.08;

      rootGroup.rotation.y += (targetRotY - rootGroup.rotation.y) * 0.06;
      rootGroup.rotation.x += (targetRotX - rootGroup.rotation.x) * 0.06;

      // Cadrage spatial (déplacement à droite ou à gauche en vis-à-vis des cartouches de texte)
      let targetPosX = 0;
      if (currentProgress > 0.06 && currentProgress < 0.35) {
        targetPosX = 1.35; // Décalé à droite pour Acte II
      } else if (currentProgress >= 0.35 && currentProgress < 0.70) {
        targetPosX = -1.35; // Décalé à gauche pour Acte III
      } else if (currentProgress >= 0.70 && currentProgress < 0.88) {
        targetPosX = 1.2; // Décalé à droite pour Acte IV
      } else {
        targetPosX = 0; // Centré en début (Acte I) et à l'assemblage complet (Acte V)
      }

      rootGroup.position.x += (targetPosX - rootGroup.position.x) * 0.05;

      // Éclairage spot qui suit la progression du montage
      followSpot.position.x = -3.5 + currentProgress * 7.0;
      followSpot.position.y = 3.5 - Math.sin(currentProgress * Math.PI) * 1.5;
      followSpot.target = rootGroup;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-10"
      style={{ overflow: "hidden" }}
    />
  );
}
