"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface RacingHelmet3DCanvasProps {
  className?: string;
}

export default function RacingHelmet3DCanvas({ className = "" }: RacingHelmet3DCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 600;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.5, 4.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 2. Lighting (Motorsport studio setup)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(5, 5, 4);
    scene.add(keyLight);

    // Lime signature rim light (identique Lando Norris style)
    const rimLight = new THREE.DirectionalLight(0xd2ff00, 3.0);
    rimLight.position.set(-5, 2, -2);
    scene.add(rimLight);

    const blueFill = new THREE.DirectionalLight(0x00d4ff, 1.2);
    blueFill.position.set(0, -3, 3);
    scene.add(blueFill);

    // 3. Modélisation géométrique procédurale du casque de course
    const helmetGroup = new THREE.Group();

    // A. Coque principale (Carbon fiber glossy)
    const shellGeo = new THREE.SphereGeometry(1, 64, 48);
    shellGeo.scale(1, 1.12, 1.18);

    const shellMat = new THREE.MeshPhysicalMaterial({
      color: 0x111111,
      roughness: 0.15,
      metalness: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 1.0,
    });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    helmetGroup.add(shell);

    // B. Mentonnière agressive (Chin guard)
    const chinGeo = new THREE.CylinderGeometry(0.72, 0.82, 0.65, 32);
    chinGeo.scale(1, 1, 1.3);
    const chinMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.3,
      metalness: 0.6,
    });
    const chin = new THREE.Mesh(chinGeo, chinMat);
    chin.position.set(0, -0.6, 0.42);
    helmetGroup.add(chin);

    // C. Visière Iridium chromée irisée (Visor)
    const visorGeo = new THREE.CylinderGeometry(0.86, 0.84, 0.42, 32, 1, false, Math.PI * 0.15, Math.PI * 0.7);
    const visorMat = new THREE.MeshPhysicalMaterial({
      color: 0x181818,
      metalness: 0.95,
      roughness: 0.05,
      transmission: 0.3,
      ior: 1.6,
      clearcoat: 1.0,
      iridescence: 1.0,
      iridescenceIOR: 1.3,
      reflectivity: 1.0,
    });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.rotation.y = Math.PI * 0.15;
    visor.position.set(0, -0.05, 0.45);
    helmetGroup.add(visor);

    // D. Bandeau pare-soleil Lime #d2ff00
    const stripGeo = new THREE.CylinderGeometry(0.87, 0.865, 0.1, 32, 1, false, Math.PI * 0.15, Math.PI * 0.7);
    const stripMat = new THREE.MeshBasicMaterial({
      color: 0xd2ff00,
    });
    const strip = new THREE.Mesh(stripGeo, stripMat);
    strip.rotation.y = Math.PI * 0.15;
    strip.position.set(0, 0.14, 0.455);
    helmetGroup.add(strip);

    // E. Aileron aérodynamique supérieur (Top winglet)
    const wingGeo = new THREE.BoxGeometry(0.6, 0.08, 0.35);
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0xd2ff00,
      roughness: 0.2,
      metalness: 0.5,
    });
    const wing = new THREE.Mesh(wingGeo, wingMat);
    wing.position.set(0, 0.95, -0.5);
    wing.rotation.x = -0.3;
    helmetGroup.add(wing);

    // F. Prises d'air inférieures
    const ventGeo = new THREE.BoxGeometry(0.18, 0.04, 0.1);
    const ventMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
    const vent1 = new THREE.Mesh(ventGeo, ventMat);
    vent1.position.set(0, -0.52, 1.15);
    helmetGroup.add(vent1);

    scene.add(helmetGroup);

    // 4. Animation Scroll & Mouse Tracker
    let targetRotationY = 0;
    let targetRotationX = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Rotation basée sur le défilement de la page (effet musée / Lando Norris)
      targetRotationY = (scrollY * 0.0035) % (Math.PI * 2);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Render loop à 60 FPS
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth Lerp (inertie fluide)
      helmetGroup.rotation.y += (targetRotationY + mouseX * 0.5 - helmetGroup.rotation.y) * 0.08;
      helmetGroup.rotation.x += (targetRotationX + mouseY * 0.2 - helmetGroup.rotation.x) * 0.08;

      // Légère oscillation flottante (idle breathing)
      helmetGroup.position.y = Math.sin(Date.now() * 0.0015) * 0.05;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className={`relative w-full h-full flex items-center justify-center ${className}`}>
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      {/* HUD Telemetry label */}
      <div className="absolute bottom-3 left-4 flex items-center gap-2 font-mono text-[10px] text-neutral-400 bg-neutral-950/80 border border-neutral-800/80 px-2.5 py-1">
        <span className="w-1.5 h-1.5 rounded-full bg-[#d2ff00] animate-pulse"></span>
        <span>THREE.JS REALTIME 3D &bull; SCROLL & MOUSE TRACKING</span>
      </div>
    </div>
  );
}
