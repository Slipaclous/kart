"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface ExplodedHelmetCanvasProps {
  className?: string;
}

interface PieceState {
  mesh: THREE.Object3D;
  origPos: THREE.Vector3;
  explodedOffset: THREE.Vector3;
  origRot: THREE.Euler;
  explodedRotOffset: THREE.Vector3;
}

export default function ExplodedHelmetCanvas({ className = "" }: ExplodedHelmetCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [assemblyProgress, setAssemblyProgress] = useState(0); // 0 = Éclaté, 1 = Assemblé
  const [activePartName, setActivePartName] = useState("Calotin EPS & Mousse");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 800;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 5.0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // 2. Lighting Motorsport Studio
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.0);
    keyLight.position.set(5, 6, 5);
    scene.add(keyLight);

    const limeRimLight = new THREE.DirectionalLight(0xd2ff00, 3.5);
    limeRimLight.position.set(-6, 2, -2);
    scene.add(limeRimLight);

    const blueBottom = new THREE.DirectionalLight(0x00e1ff, 1.2);
    blueBottom.position.set(0, -4, 2);
    scene.add(blueBottom);

    // 3. Charger le modèle GLB généré par Blender
    const loader = new GLTFLoader();
    const pieces: PieceState[] = [];
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Définition des trajectoires d'éclatement physiques
    const explosionVectors: Record<string, { pos: THREE.Vector3; rot: THREE.Vector3; label: string }> = {
      Part_InnerEPS: { pos: new THREE.Vector3(0, -0.3, -1.2), rot: new THREE.Vector3(0, 0, 0), label: "Calotin EPS d'absorption" },
      Part_OuterShell: { pos: new THREE.Vector3(0, 1.2, -0.4), rot: new THREE.Vector3(0.25, 0, 0), label: "Coque Carbone 3K & Vert Racing" },
      Part_Crown_Carbon_Weave: { pos: new THREE.Vector3(0, 1.6, -0.2), rot: new THREE.Vector3(0.35, 0, 0), label: "Insert Calotte Carbone 3K" },
      Part_Visor: { pos: new THREE.Vector3(0, 0.4, 2.0), rot: new THREE.Vector3(0.4, 0, 0), label: "Visière Iridium Optique Class 1" },
      Part_Sunstrip_Carbon_Neutral: { pos: new THREE.Vector3(0, 0.7, 2.2), rot: new THREE.Vector3(0.45, 0, 0), label: "Bandeau pare-soleil Carbone" },
      Part_Rear_Kamm_Spoiler: { pos: new THREE.Vector3(0, 1.8, -1.5), rot: new THREE.Vector3(0.6, 0, 0), label: "Aileron Kamm-tail Aéro Déportance" },
      Part_Chin_Lip_Spoiler: { pos: new THREE.Vector3(0, -1.4, 1.5), rot: new THREE.Vector3(-0.35, 0, 0), label: "Lame aéro inférieure mentonnière" },
      Part_Eyeport_Gasket: { pos: new THREE.Vector3(0, 0.2, 1.1), rot: new THREE.Vector3(0.2, 0, 0), label: "Joint vulcanisé d'étanchéité" },
      Part_Pivot_Plate_Left: { pos: new THREE.Vector3(-1.8, 0, 0.2), rot: new THREE.Vector3(0, 0, 1.2), label: "Platine Titane Gauche" },
      Part_Pivot_Plate_Right: { pos: new THREE.Vector3(1.8, 0, 0.2), rot: new THREE.Vector3(0, 0, -1.2), label: "Platine Titane Droite" },
      Part_InnerPadding_Nomex: { pos: new THREE.Vector3(0, -0.8, 0.4), rot: new THREE.Vector3(0, 0, 0), label: "Mousses Nomex ignifugées FIA" },
    };

    loader.load("/models/racing_helmet_exploded.glb", (gltf) => {
      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const config = explosionVectors[child.name] || {
            pos: new THREE.Vector3(0, 0, 0),
            rot: new THREE.Vector3(0, 0, 0),
            label: child.name,
          };

          pieces.push({
            mesh: child,
            origPos: child.position.clone(),
            explodedOffset: config.pos,
            origRot: child.rotation.clone(),
            explodedRotOffset: config.rot,
          });
        }
      });
      rootGroup.add(gltf.scene);
      updateAssembly(0); // Commencer éclaté
    });

    let currentProgress = 0;
    let targetProgress = 0;
    let mouseX = 0;
    let mouseY = 0;

    const updateAssembly = (prog: number) => {
      // prog = 0 (Éclaté) -> prog = 1 (100% Assemblé)
      // On inverse pour le calcul d'écart : 1 - prog
      const factor = 1 - prog;

      pieces.forEach((p) => {
        p.mesh.position.x = p.origPos.x + p.explodedOffset.x * factor;
        p.mesh.position.y = p.origPos.y + p.explodedOffset.y * factor;
        p.mesh.position.z = p.origPos.z + p.explodedOffset.z * factor;

        p.mesh.rotation.x = p.origRot.x + p.explodedRotOffset.x * factor;
        p.mesh.rotation.y = p.origRot.y + p.explodedRotOffset.y * factor;
        p.mesh.rotation.z = p.origRot.z + p.explodedRotOffset.z * factor;
      });

      // Mettre à jour l'étape affichée dans l'UI
      if (prog < 0.25) setActivePartName("Vue Éclatée : Structure Carbon & EPS");
      else if (prog < 0.6) setActivePartName("Assemblage : Mentonnière & Platines Titane");
      else if (prog < 0.9) setActivePartName("Verrouillage : Visière Iridium & Aéro");
      else setActivePartName("Casque 100% Assemblé & Homologué FIA");
    };

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = 1200; // Distance de défilement pour compléter l'assemblage
      const progress = Math.min(Math.max(scrollY / maxScroll, 0), 1);
      targetProgress = progress;
      setAssemblyProgress(Math.round(progress * 100));
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Lerp progress d'assemblage fluide
      currentProgress += (targetProgress - currentProgress) * 0.08;
      updateAssembly(currentProgress);

      // Rotation de caméra / scène au scroll & à la souris
      const rotY = (window.scrollY * 0.002) + (mouseX * 0.4);
      const rotX = (mouseY * 0.2) + 0.1;

      rootGroup.rotation.y += (rotY - rootGroup.rotation.y) * 0.06;
      rootGroup.rotation.x += (rotX - rootGroup.rotation.x) * 0.06;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-center ${className}`}>
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Barre d'assemblage de précision mécanique */}
      <div className="absolute top-4 left-6 right-6 flex items-center justify-between font-mono text-xs z-20 pointer-events-none">
        <div className="bg-neutral-950/85 border border-neutral-800 px-3.5 py-1.5 backdrop-blur-md flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#d2ff00] animate-pulse"></span>
          <span className="text-white font-bold tracking-widest uppercase">
            {activePartName}
          </span>
        </div>

        <div className="bg-neutral-950/85 border border-neutral-800 px-3 py-1.5 backdrop-blur-md flex items-center gap-3">
          <span className="text-neutral-400">ASSEMBLAGE SCROLL</span>
          <span className="text-[#d2ff00] font-black text-sm">{assemblyProgress}%</span>
        </div>
      </div>

      {/* Guide visuel en bas */}
      <div className="absolute bottom-4 flex items-center gap-3 font-mono text-[10px] text-neutral-400 bg-neutral-950/90 border border-neutral-800/90 px-3 py-1.5 z-20 pointer-events-none">
        <span className="text-[#d2ff00] font-bold">SCROLL VERS LE BAS</span>
        <span>&darr;</span>
        <span>POUR ASSEMBLER LES PIÈCES BLENDER</span>
      </div>
    </div>
  );
}
