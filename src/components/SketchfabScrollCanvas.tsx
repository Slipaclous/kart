"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface CameraPoint {
  position: [number, number, number];
  target: [number, number, number];
}

declare global {
  interface Window {
    Sketchfab?: any;
  }
}

export default function SketchfabScrollCanvas() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isViewerReady, setIsViewerReady] = useState(false);
  const apiRef = useRef<any>(null);
  const lastUpdateRef = useRef<number>(0);
  
  // Caméra de référence globale mesurée
  const baseCameraRef = useRef<CameraPoint | null>(null);

  const handleScriptLoad = () => {
    if (!window.Sketchfab || !iframeRef.current) return;

    const client = new window.Sketchfab("1.12.1", iframeRef.current);
    const modelUid = "e2aa3cccd8334fcb8acedc0c39af93fc";

    client.init(modelUid, {
      success: (api: any) => {
        apiRef.current = api;
        api.start();

        api.addEventListener("viewerready", () => {
          // 1. Récupérer la position d'origine du modèle Sketchfab
          api.getCameraLookAt((err: any, camera: any) => {
            if (!err && camera) {
              const originPos: [number, number, number] = [
                camera.position[0],
                camera.position[1],
                camera.position[2],
              ];
              const originTgt: [number, number, number] = [
                camera.target[0],
                camera.target[1],
                camera.target[2],
              ];

              baseCameraRef.current = {
                position: originPos,
                target: originTgt,
              };

              // Appliquer immédiatement un cadrage large et dézoomé (recule de 80% pour voir tout le kart)
              const dx = originPos[0] - originTgt[0];
              const dy = originPos[1] - originTgt[1];
              const dz = originPos[2] - originTgt[2];
              
              const widePos: [number, number, number] = [
                originTgt[0] + dx * 1.85,
                originTgt[1] + dy * 1.85,
                originTgt[2] + dz * 1.65,
              ];

              api.setCameraLookAt(widePos, originTgt, 0.1);
            }
            
            setIsViewerReady(true);
          });
        });
      },
      error: () => {
        console.error("Erreur d'initialisation du Sketchfab Viewer API");
      },
      autostart: 1,
      transparent: 1,
      ui_controls: 0,
      ui_infos: 0,
      ui_watermark: 0,
      ui_stop: 0,
      ui_help: 0,
      ui_settings: 0,
      ui_vr: 0,
      ui_fullscreen: 0,
      ui_annotations: 0,
      ui_theatre: 0,
      camera: 1,
      preload: 1,
      scrollwheel: 0,
    });
  };

  // Orbite cinématique large : le kart reste 100% visible et respire sur la scène
  const applyScrollCinematics = (progress: number) => {
    if (!apiRef.current || !baseCameraRef.current) return;

    const now = performance.now();
    if (now - lastUpdateRef.current < 45) return; // ~22 FPS pour fluidité maximale sans saccade iframe
    lastUpdateRef.current = now;

    const { position: basePos, target: baseTgt } = baseCameraRef.current;

    const dx = basePos[0] - baseTgt[0];
    const dy = basePos[1] - baseTgt[1];
    const dz = basePos[2] - baseTgt[2];
    const baseRadius = Math.sqrt(dx * dx + dy * dy);
    const initialAngle = Math.atan2(dy, dx);

    // DISTANCE DE CAMÉRA DÉZOOMÉE : facteur 1.8x à 2.0x pour avoir le kart complet
    const wideRadius = baseRadius * (1.80 + Math.sin(progress * Math.PI) * 0.25);

    // Rotation douce de 70° sur l'ensemble du scroll
    const currentAngle = initialAngle + progress * (Math.PI * 0.45);

    // Élévation douce pour varier l'angle de vue sans jamais perdre le kart de vue
    const elevation = dz * (1.50 + Math.sin(progress * Math.PI * 2) * 0.25);

    const newPos: [number, number, number] = [
      baseTgt[0] + Math.cos(currentAngle) * wideRadius,
      baseTgt[1] + Math.sin(currentAngle) * wideRadius,
      baseTgt[2] + elevation,
    ];

    try {
      apiRef.current.setCameraLookAt(newPos, baseTgt, 0.4);
    } catch {
      // Sécurité si l'iframe est en transition
    }
  };

  useEffect(() => {
    const onScroll = () => {
      if (!isViewerReady) return;
      const scrollY = window.scrollY || window.pageYOffset;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0) {
        const progress = Math.min(Math.max(scrollY / maxScroll, 0), 1);
        applyScrollCinematics(progress);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [isViewerReady]);

  return (
    <>
      <Script
        src="https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />
      <div className="fixed inset-0 pointer-events-none z-10 w-full h-full overflow-hidden bg-[#08120e]">
        {/* Iframe Sketchfab décalée légèrement sur la droite pour ne pas être masquée par les cartes texte */}
        <div className="w-full h-full flex items-center justify-center lg:justify-end lg:pr-12 pointer-events-none">
          <iframe
            ref={iframeRef}
            id="sketchfab-viewer-frame"
            title="Karting - jdaniel_92"
            className="w-full h-full max-w-[1400px] max-h-[900px] border-0 pointer-events-none opacity-95 transition-opacity duration-700"
            style={{
              background: "transparent",
              filter: "contrast(1.06) saturate(1.12)",
            }}
            allow="autoplay; fullscreen; vr"
          />
        </div>

        {/* Halo dégradé radial discret fondu dans le British Racing Green */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_60%,#08120e_98%)]" />
      </div>
    </>
  );
}
