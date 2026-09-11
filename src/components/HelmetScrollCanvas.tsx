"use client";

import { useEffect, useRef, useState } from "react";

interface HelmetScrollCanvasProps {
  className?: string;
}

export default function HelmetScrollCanvas({ className = "" }: HelmetScrollCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);

  // Frames de la séquence
  const frames = [
    "/helmet-sequence/frame-0.jpg", // Face
    "/helmet-sequence/frame-1.jpg", // 3/4 droit
    "/helmet-sequence/frame-2.jpg", // Profil droit
    "/helmet-sequence/frame-3.jpg", // 3/4 gauche
  ];

  const imagesRef = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    let loadedCount = 0;
    const loadedImages: HTMLImageElement[] = [];

    frames.forEach((src, idx) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedCount++;
        loadedImages[idx] = img;
        if (loadedCount === frames.length) {
          imagesRef.current = loadedImages;
          setImagesLoaded(true);
          renderFrame(0);
        }
      };
    });

    const handleScroll = () => {
      if (!containerRef.current || !imagesRef.current.length) return;

      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calcul de la progression du scroll par rapport à l'élément (0 à 1)
      const elementTop = rect.top;
      const elementHeight = rect.height;
      
      const totalScrollableDistance = windowHeight + elementHeight;
      const currentScroll = windowHeight - elementTop;
      const progress = Math.min(Math.max(currentScroll / totalScrollableDistance, 0), 1);

      // Calcul du frame correspondant
      const frameCount = frames.length;
      const frameIdx = Math.min(Math.floor(progress * frameCount), frameCount - 1);

      setCurrentFrameIndex(frameIdx);
      renderFrame(frameIdx);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const renderFrame = (index: number) => {
    const canvas = canvasRef.current;
    const img = imagesRef.current[index];
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dessin en cover ou contain centré
    const hRatio = canvas.width / img.width;
    const vRatio = canvas.height / img.height;
    const ratio = Math.min(hRatio, vRatio);

    const centerShiftX = (canvas.width - img.width * ratio) / 2;
    const centerShiftY = (canvas.height - img.height * ratio) / 2;

    ctx.drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      centerShiftX,
      centerShiftY,
      img.width * ratio,
      img.height * ratio
    );
  };

  return (
    <div ref={containerRef} className={`relative flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        width={800}
        height={800}
        className="w-full h-full max-w-[500px] max-h-[500px] object-contain drop-shadow-[0_0_35px_rgba(210,255,0,0.12)] cursor-grab active:cursor-grabbing"
      />
      {/* UI Indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-neutral-950/80 border border-neutral-800 px-3 py-1 font-mono text-[10px] text-neutral-400">
        <span className="w-1.5 h-1.5 rounded-full bg-[#d2ff00] animate-ping"></span>
        <span>SCROLL TO ROTATE &bull; ANGLE {currentFrameIndex * 45}°</span>
      </div>
    </div>
  );
}
