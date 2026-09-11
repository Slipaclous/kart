"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface CameraWaypoint {
  progress: number; // 0 à 1
  camPos: THREE.Vector3;
  targetPos: THREE.Vector3;
}

export default function KartScrollCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    
    // Position initiale
    camera.position.set(2.2, 1.3, 2.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.7;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 2. Éclairage Studio Motorsport Haute Performance
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    // Key light zénithale chaude
    const keyLight = new THREE.DirectionalLight(0xffffff, 4.5);
    keyLight.position.set(3, 6, 4);
    scene.add(keyLight);

    // Rim light latérale Acid Lime (#d2ff00)
    const limeRim = new THREE.DirectionalLight(0xd2ff00, 4.8);
    limeRim.position.set(-5, 2.5, -3);
    scene.add(limeRim);

    // Lumière rasante Cyan (#00e5ff) pour révéler le chrome-molybdène et les surfaces d'aéro
    const cyanFill = new THREE.DirectionalLight(0x00e5ff, 2.8);
    cyanFill.position.set(4, -1.5, 3);
    scene.add(cyanFill);

    // Spot focalisé qui suit la cible
    const inspectionSpot = new THREE.SpotLight(0xffffff, 5.0, 15, Math.PI / 4, 0.5, 1.2);
    inspectionSpot.position.set(0, 4, 2);
    scene.add(inspectionSpot);

    // Grille de piste subtile sous le kart
    const gridHelper = new THREE.GridHelper(10, 20, 0x1e3a30, 0x0c1c16);
    gridHelper.position.y = -0.05;
    scene.add(gridHelper);

    // 3. Groupe Châssis & Chargement glTF
    const kartGroup = new THREE.Group();
    scene.add(kartGroup);

    const loader = new GLTFLoader();
    loader.load("/models/racing_monoplace.glb", (gltf) => {
      // Ajustement de l'échelle et orientation de la monoplace
      // La monoplace mesure 5.5m de long. À l'échelle 0.65x, elle mesure ~3.6m ce qui s'intègre parfaitement à l'écran.
      gltf.scene.scale.set(0.68, 0.68, 0.68);
      // Centrer légèrement sur la droite pour laisser respirer les textes à gauche
      gltf.scene.position.set(0.2, 0, 0);

      // Amélioration de la réactivité des matériaux PBR Three.js
      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            child.material.envMapIntensity = 2.2;
            child.material.roughness = Math.min(child.material.roughness || 0.5, 0.85);
            child.material.needsUpdate = true;
          }
        }
      });

      kartGroup.add(gltf.scene);
    });

    // 4. Waypoints cinématiques des 6 Actes au fil du scroll - Cadrages immersifs sur la monoplace
    const waypoints: CameraWaypoint[] = [
      // Acte 1 (0.00) : Vue 3/4 avant agressive sur le museau et l'aileron avant
      {
        progress: 0.00,
        camPos: new THREE.Vector3(1.8, 0.7, 2.2),
        targetPos: new THREE.Vector3(0.2, 0.2, 1.1),
      },
      // Acte 2 (0.18) : Plongée cockpit direct, halo carbone, volant télémétrique
      {
        progress: 0.18,
        camPos: new THREE.Vector3(0.1, 1.1, 0.4),
        targetPos: new THREE.Vector3(0.1, 0.35, -0.1),
      },
      // Acte 3 (0.36) : Macro ras du sol sur le train avant, suspensions push-rod et pneu slick
      {
        progress: 0.36,
        camPos: new THREE.Vector3(1.3, 0.3, 1.5),
        targetPos: new THREE.Vector3(0.5, 0.2, 0.9),
      },
      // Acte 4 (0.54) : Flanc aéro, pontons sculptés et entrées d'air radiateur
      {
        progress: 0.54,
        camPos: new THREE.Vector3(1.5, 0.6, -0.4),
        targetPos: new THREE.Vector3(0.3, 0.3, -0.5),
      },
      // Acte 5 (0.72) : Arrière, aileron arrière DRS et diffuseur carbone
      {
        progress: 0.72,
        camPos: new THREE.Vector3(-1.2, 0.8, -2.1),
        targetPos: new THREE.Vector3(-0.1, 0.35, -1.3),
      },
      // Acte 6 (1.00) : Vue d'ensemble latérale héroïque prête pour la course
      {
        progress: 1.00,
        camPos: new THREE.Vector3(-2.4, 1.1, 1.2),
        targetPos: new THREE.Vector3(0.1, 0.25, 0.0),
      },
    ];

    // Variables d'animation lissée
    let currentScrollProgress = 0;
    let targetScrollProgress = 0;
    const currentCamPos = new THREE.Vector3().copy(waypoints[0].camPos);
    const currentTargetPos = new THREE.Vector3().copy(waypoints[0].targetPos);

    const onScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0) {
        targetScrollProgress = Math.min(Math.max(scrollY / maxScroll, 0), 1);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // 5. Interpolation des Waypoints selon le scroll
    function interpolateCamera(p: number) {
      // Trouver les deux waypoints encadrant p
      let i = 0;
      while (i < waypoints.length - 1 && waypoints[i + 1].progress < p) {
        i++;
      }
      const w0 = waypoints[i];
      const w1 = waypoints[Math.min(i + 1, waypoints.length - 1)];

      const span = w1.progress - w0.progress;
      const t = span <= 0.0001 ? 0 : (p - w0.progress) / span;

      // Courbe easeInOutCubic pour une fluidité cinématographique
      const smoothT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      const desiredCamPos = new THREE.Vector3().lerpVectors(w0.camPos, w1.camPos, smoothT);
      const desiredTarget = new THREE.Vector3().lerpVectors(w0.targetPos, w1.targetPos, smoothT);

      return { desiredCamPos, desiredTarget };
    }

    // 6. Boucle de rendu avec lissage inertiel
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Lerp inertiel du scroll
      currentScrollProgress += (targetScrollProgress - currentScrollProgress) * 0.07;

      const { desiredCamPos, desiredTarget } = interpolateCamera(currentScrollProgress);

      // Lissage caméra
      currentCamPos.lerp(desiredCamPos, 0.08);
      currentTargetPos.lerp(desiredTarget, 0.08);

      camera.position.copy(currentCamPos);
      camera.lookAt(currentTargetPos);

      // Ajustement de la poursuite du spot sur la cible examinée
      inspectionSpot.target.position.copy(currentTargetPos);
      inspectionSpot.target.updateMatrixWorld();

      // Légère oscillation aérodynamique subtile
      if (kartGroup) {
        const time = performance.now() * 0.001;
        kartGroup.position.y = Math.sin(time * 2) * 0.004;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 7. Redimensionnement réactif
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-10 w-full h-full"
      style={{ touchAction: "none" }}
    />
  );
}
