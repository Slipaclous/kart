"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

interface Checkpoint {
  id: string;
  name: string;
  type: "straight" | "braking" | "apex" | "chicane" | "finish";
  sub: string;
  speed: string;
  speedNum: number;
  gear: string;
  gForce: string;
  desc: string;
  t: number;
}

export default function CircuitMapHeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hudData, setHudData] = useState({
    speed: "128 KM/H",
    gear: "DIRECT",
    gForce: "1.15 G",
    name: "LIGNE DROITE DES FAGNES",
    sub: "KARTING DES FAGNES // SORTIE DE GRILLE",
    progress: 0,
  });

  const checkpoints: Checkpoint[] = [
    {
      id: "grid",
      name: "LIGNE DROITE DES FAGNES",
      type: "straight",
      sub: "KARTING DES FAGNES MARIEMBOURG // PLEIN GAZ",
      speed: "128 KM/H",
      speedNum: 128,
      gear: "DIRECT",
      gForce: "1.15 G",
      desc: "Sortie de grille en trombe. Moteur IAME hurlant à 16 000 tr/min.",
      t: 0.05,
    },
    {
      id: "t1",
      name: "VIRAGE 01 : CORDE DU TILLOT",
      type: "braking",
      sub: "GROS FREINAGE DÉGRESSIF & POINT DE CORDE",
      speed: "72 KM/H",
      speedNum: 72,
      gear: "DIRECT",
      gForce: "2.75 G",
      desc: "Inscrire le train avant sur le vibreur de corde à pleine adhérence.",
      t: 0.26,
    },
    {
      id: "chicane",
      name: "CHICANE TECHNIQUE DU BOIS",
      type: "chicane",
      sub: "TRANSFERT DE CHARGE MILLIMÉTRÉ",
      speed: "78 KM/H",
      speedNum: 78,
      gear: "DIRECT",
      gForce: "2.60 G",
      desc: "Le châssis Eurokarting encaisse la torsion sans sourciller.",
      t: 0.50,
    },
    {
      id: "parabolica",
      name: "GRANDE PARABOLIQUE SUD",
      type: "apex",
      sub: "COURBE RAPIDE EN APPUI PLEIN GAZ",
      speed: "114 KM/H",
      speedNum: 114,
      gear: "DIRECT",
      gForce: "2.45 G",
      desc: "Gommes Komet à température de fonctionnement optimale.",
      t: 0.76,
    },
    {
      id: "finish",
      name: "DRAPEAU À DAMIER // VICTOIRE P1",
      type: "finish",
      sub: "CHAMPION DE BELGIQUE // TOUR RECORD",
      speed: "128 KM/H",
      speedNum: 128,
      gear: "DIRECT",
      gForce: "1.10 G",
      desc: "Tour bouclé. Le titre de Champion de Belgique en poche.",
      t: 0.98,
    },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // 1. CRÉATION D'UNE TEXTURE D'ASPHALTE PROCÉDURALE OFFSCREEN
    const patternCanvas = document.createElement("canvas");
    patternCanvas.width = 64;
    patternCanvas.height = 64;
    const pctx = patternCanvas.getContext("2d");
    let asphaltPattern: CanvasPattern | null = null;

    if (pctx) {
      pctx.fillStyle = "#090d14";
      pctx.fillRect(0, 0, 64, 64);
      for (let i = 0; i < 400; i++) {
        const x = Math.random() * 64;
        const y = Math.random() * 64;
        const radius = Math.random() * 1.2 + 0.3;
        const shade = Math.floor(Math.random() * 25) + 14;
        pctx.fillStyle = `rgb(${shade}, ${shade + 4}, ${shade + 9})`;
        pctx.beginPath();
        pctx.arc(x, y, radius, 0, Math.PI * 2);
        pctx.fill();
      }
      asphaltPattern = ctx.createPattern(patternCanvas, "repeat");
    }

    // 2. TRACÉ FIDÈLE DU KARTING DES FAGNES (MARIEMBOURG 1 366 M)
    const rawWaypoints = [
      { x: 220, y: 760 },
      { x: 220, y: 540 },
      { x: 220, y: 360 },
      { x: 250, y: 230 },
      { x: 340, y: 150 },
      { x: 480, y: 130 },
      { x: 680, y: 130 },
      { x: 840, y: 150 },
      { x: 940, y: 220 },
      { x: 970, y: 320 },
      { x: 920, y: 420 },
      { x: 790, y: 450 },
      { x: 660, y: 440 },
      { x: 550, y: 380 },
      { x: 500, y: 290 },
      { x: 520, y: 220 },
      { x: 610, y: 190 },
      { x: 720, y: 220 },
      { x: 770, y: 300 },
      { x: 740, y: 400 },
      { x: 640, y: 500 },
      { x: 570, y: 600 },
      { x: 570, y: 700 },
      { x: 630, y: 780 },
      { x: 740, y: 810 },
      { x: 870, y: 840 },
      { x: 930, y: 900 },
      { x: 850, y: 960 },
      { x: 680, y: 960 },
      { x: 480, y: 940 },
      { x: 320, y: 910 },
      { x: 240, y: 850 },
    ];

    const sampledPoints: { x: number; y: number; angle: number; normalX: number; normalY: number }[] = [];
    const numSamples = 2800;

    function catmullRom(
      p0: { x: number; y: number },
      p1: { x: number; y: number },
      p2: { x: number; y: number },
      p3: { x: number; y: number },
      t: number
    ) {
      const t2 = t * t;
      const t3 = t2 * t;
      return {
        x:
          0.5 *
          (2 * p1.x +
            (-p0.x + p2.x) * t +
            (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
            (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y:
          0.5 *
          (2 * p1.y +
            (-p0.y + p2.y) * t +
            (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
            (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
      };
    }

    const n = rawWaypoints.length;
    for (let i = 0; i < n; i++) {
      const p0 = rawWaypoints[(i - 1 + n) % n];
      const p1 = rawWaypoints[i];
      const p2 = rawWaypoints[(i + 1) % n];
      const p3 = rawWaypoints[(i + 2) % n];

      const stepsPerSegment = Math.floor(numSamples / n);
      for (let s = 0; s < stepsPerSegment; s++) {
        const t = s / stepsPerSegment;
        const pt = catmullRom(p0, p1, p2, p3, t);
        const nextPt = catmullRom(p0, p1, p2, p3, Math.min(t + 0.005, 1));
        const angle = Math.atan2(nextPt.y - pt.y, nextPt.x - pt.x);
        const normalX = -Math.sin(angle);
        const normalY = Math.cos(angle);
        sampledPoints.push({ x: pt.x, y: pt.y, angle, normalX, normalY });
      }
    }

    let width = 0;
    let height = 0;
    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    let targetProgress = 0;
    let smoothProgress = 0;
    let cameraX = 220;
    let cameraY = 600;
    let cameraZoom = 1;

    const particles: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string }[] = [];

    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0) {
        targetProgress = Math.min(Math.max(scrollY / maxScroll, 0), 1);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    let animationFrameId: number;

    const buildCircuitPath = () => {
      ctx.beginPath();
      ctx.moveTo(sampledPoints[0].x, sampledPoints[0].y);
      for (let i = 1; i < sampledPoints.length; i++) {
        ctx.lineTo(sampledPoints[i].x, sampledPoints[i].y);
      }
      ctx.closePath();
    };

    const render = () => {
      smoothProgress += (targetProgress - smoothProgress) * 0.08;

      const totalPts = sampledPoints.length;
      const currentIdx = Math.min(Math.floor(smoothProgress * (totalPts - 1)), totalPts - 1);
      const kart = sampledPoints[currentIdx] || sampledPoints[0];

      let activeSpeed = 120;
      for (let i = 0; i < checkpoints.length; i++) {
        if (smoothProgress >= checkpoints[i].t - 0.12) {
          activeSpeed = checkpoints[i].speedNum;
        }
      }

      // GESTION DU RESPONSIVE MOBILE / TABLETTE / DESKTOP
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;

      // Sur mobile : on cale le kart dans le tiers supérieur (28% à 32% de la hauteur)
      // pour que le contenu en dessous ne le masque JAMAIS.
      const focalCenterX = width / 2;
      const focalCenterY = isMobile ? height * 0.30 : isTablet ? height * 0.40 : height / 2;

      // Échelle adaptée selon la largeur
      const baseScaleReference = isMobile ? 620 : isTablet ? 720 : 820;
      const targetZoom = (Math.min(width, height) / baseScaleReference) * (activeSpeed > 100 ? 0.94 : 1.05);
      cameraZoom += (targetZoom - cameraZoom) * 0.05;

      cameraX += (kart.x - cameraX) * 0.05;
      cameraY += (kart.y - cameraY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      ctx.save();
      ctx.translate(focalCenterX, focalCenterY);
      ctx.scale(cameraZoom, cameraZoom);
      ctx.translate(-cameraX, -cameraY);

      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // =========================================================================
      // 1. ZONE DE DÉGAGEMENT & RUN-OFF FIA (BAC À GRAVIER PRO)
      // =========================================================================
      buildCircuitPath();
      ctx.strokeStyle = "#0b1018";
      ctx.lineWidth = 114;
      ctx.stroke();

      buildCircuitPath();
      ctx.strokeStyle = "#111824";
      ctx.lineWidth = 94;
      ctx.stroke();

      // =========================================================================
      // 2. VIBREURS DE CORDE FIA AVEC OMBRAGE & TEXTURE
      // =========================================================================
      const kerbZones: { start: number; end: number; side: number }[] = [
        { start: 0.18, end: 0.28, side: -1 },
        { start: 0.32, end: 0.38, side: 1 },
        { start: 0.40, end: 0.48, side: -1 },
        { start: 0.50, end: 0.56, side: 1 },
        { start: 0.57, end: 0.63, side: -1 },
        { start: 0.72, end: 0.80, side: -1 },
        { start: 0.82, end: 0.88, side: 1 },
      ];

      kerbZones.forEach((zone) => {
        const startIdx = Math.floor(zone.start * totalPts);
        const endIdx = Math.floor(zone.end * totalPts);
        const offset = 31 * zone.side;

        ctx.save();
        ctx.beginPath();
        for (let i = startIdx; i <= endIdx; i++) {
          const pt = sampledPoints[i];
          const kx = pt.x + pt.normalX * (offset + 1.5 * zone.side);
          const ky = pt.y + pt.normalY * (offset + 1.5 * zone.side);
          if (i === startIdx) ctx.moveTo(kx, ky);
          else ctx.lineTo(kx, ky);
        }
        ctx.lineWidth = 7;
        ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
        ctx.stroke();

        ctx.beginPath();
        for (let i = startIdx; i <= endIdx; i++) {
          const pt = sampledPoints[i];
          const kx = pt.x + pt.normalX * offset;
          const ky = pt.y + pt.normalY * offset;
          if (i === startIdx) ctx.moveTo(kx, ky);
          else ctx.lineTo(kx, ky);
        }
        ctx.lineWidth = 6;
        ctx.setLineDash([12, 12]);
        ctx.strokeStyle = "#e10600";
        ctx.stroke();

        ctx.lineDashOffset = 12;
        ctx.strokeStyle = "#f8fafc";
        ctx.stroke();
        ctx.restore();
      });

      // =========================================================================
      // 3. ASPHALTE AUTHENTIQUE HAUTE ADHÉRENCE AVEC PATTERN MINÉRAL
      // =========================================================================
      buildCircuitPath();
      ctx.strokeStyle = asphaltPattern || "#080c13";
      ctx.lineWidth = 60;
      ctx.stroke();

      buildCircuitPath();
      ctx.strokeStyle = "rgba(4, 6, 10, 0.85)";
      ctx.lineWidth = 42;
      ctx.stroke();

      // =========================================================================
      // 4. LIMITES DE PISTE CONTINUES (FIA)
      // =========================================================================
      ctx.save();
      ctx.beginPath();
      for (let i = 0; i < totalPts; i++) {
        const p = sampledPoints[i];
        const lx = p.x + p.normalX * 28;
        const ly = p.y + p.normalY * 28;
        if (i === 0) ctx.moveTo(lx, ly);
        else ctx.lineTo(lx, ly);
      }
      ctx.closePath();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = "#384556";
      ctx.stroke();

      ctx.beginPath();
      for (let i = 0; i < totalPts; i++) {
        const p = sampledPoints[i];
        const rx = p.x - p.normalX * 28;
        const ry = p.y - p.normalY * 28;
        if (i === 0) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
      }
      ctx.closePath();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = "#384556";
      ctx.stroke();
      ctx.restore();

      // =========================================================================
      // 5. DAMIER DE DÉPART DE MARIEMBOURG
      // =========================================================================
      ctx.save();
      ctx.translate(220, 740);
      ctx.rotate(Math.PI / 2);
      ctx.lineWidth = 5;
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(-26, 0);
      ctx.lineTo(26, 0);
      ctx.stroke();
      ctx.restore();

      // =========================================================================
      // 6. TRAJECTOIRE CHRONO D'ÉDOUARD AU SCROLL
      // =========================================================================
      const passedPtsCount = Math.floor(smoothProgress * totalPts);
      if (passedPtsCount > 1) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(sampledPoints[0].x, sampledPoints[0].y);
        for (let i = 1; i <= passedPtsCount; i++) {
          ctx.lineTo(sampledPoints[i].x, sampledPoints[i].y);
        }
        ctx.strokeStyle = "rgba(225, 6, 0, 0.2)";
        ctx.lineWidth = 6;
        ctx.stroke();

        ctx.strokeStyle = "#e10600";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      // =========================================================================
      // 7. PARTICULES D'ACCÉLÉRATION
      // =========================================================================
      if (Math.random() < 0.35 && passedPtsCount > 5) {
        const backAngle = kart.angle + Math.PI;
        particles.push({
          x: kart.x + Math.cos(backAngle) * 14 + (Math.random() - 0.5) * 8,
          y: kart.y + Math.sin(backAngle) * 14 + (Math.random() - 0.5) * 8,
          vx: Math.cos(backAngle) * (Math.random() * 2 + 1),
          vy: Math.sin(backAngle) * (Math.random() * 2 + 1),
          life: 0,
          maxLife: Math.floor(Math.random() * 20) + 10,
          color: Math.random() > 0.4 ? "rgba(225, 6, 0, 0.6)" : "rgba(100, 116, 139, 0.4)",
        });
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        const alpha = 1 - p.life / p.maxLife;
        if (alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.2 * alpha, 0, Math.PI * 2);
        ctx.fill();
      }

      // =========================================================================
      // 8. LE KART DE COURSE OFFICIEL #105 (DOUDOU RACING)
      // =========================================================================
      ctx.save();
      ctx.translate(kart.x, kart.y);
      ctx.rotate(kart.angle + Math.PI / 2);

      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.beginPath();
      ctx.ellipse(0, 3, 19, 23, 0, 0, Math.PI * 2);
      ctx.fill();

      const trailGlow = ctx.createRadialGradient(0, 14, 0, 0, 14, 14);
      trailGlow.addColorStop(0, "rgba(225, 6, 0, 0.45)");
      trailGlow.addColorStop(1, "rgba(225, 6, 0, 0)");
      ctx.fillStyle = trailGlow;
      ctx.beginPath();
      ctx.arc(0, 14, 14, 0, Math.PI * 2);
      ctx.fill();

      // Châssis
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-16, 12);
      ctx.lineTo(16, 12);
      ctx.moveTo(-8, 12);
      ctx.lineTo(-8, -10);
      ctx.moveTo(8, 12);
      ctx.lineTo(8, -10);
      ctx.moveTo(-12, -10);
      ctx.lineTo(12, -10);
      ctx.stroke();

      // Roues
      const drawWheel = (wx: number, wy: number, w: number, h: number) => {
        ctx.fillStyle = "#080c14";
        ctx.strokeStyle = "#1e293b";
        ctx.lineWidth = 0.8;
        ctx.fillRect(wx - w / 2, wy - h / 2, w, h);
        ctx.strokeRect(wx - w / 2, wy - h / 2, w, h);
        ctx.fillStyle = "#b45309";
        ctx.fillRect(wx - w / 4, wy - h / 4, w / 2, h / 2);
        ctx.fillStyle = "#e10600";
        ctx.fillRect(wx - 1, wy - 1, 2, 2);
      };

      drawWheel(-15, -11, 6, 10);
      drawWheel(15, -11, 6, 10);
      drawWheel(-18, 13, 8, 13);
      drawWheel(18, 13, 8, 13);

      // Carrosserie
      ctx.fillStyle = "#e10600";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-13, -16);
      ctx.lineTo(13, -16);
      ctx.lineTo(15, -12);
      ctx.lineTo(10, -10);
      ctx.lineTo(-10, -10);
      ctx.lineTo(-15, -12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#e10600";
      ctx.beginPath();
      ctx.moveTo(-14, -6);
      ctx.lineTo(-10, -6);
      ctx.lineTo(-10, 9);
      ctx.lineTo(-14, 9);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(10, -6);
      ctx.lineTo(14, -6);
      ctx.lineTo(14, 9);
      ctx.lineTo(10, 9);
      ctx.closePath();
      ctx.fill();

      // Porte-numéro
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(-5, -15);
      ctx.lineTo(5, -15);
      ctx.lineTo(6, -3);
      ctx.lineTo(-6, -3);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#07090e";
      ctx.font = "900 6.5px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("105", 0, -9);

      // Volant
      ctx.strokeStyle = "#07090e";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, -2, 3.5, Math.PI * 0.1, Math.PI * 0.9);
      ctx.stroke();
      ctx.fillStyle = "#2563eb";
      ctx.fillRect(-1.5, -3, 3, 1.6);

      // Siège et pilote
      ctx.fillStyle = "#0a0e17";
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.ellipse(0, 5, 6, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#e10600";
      ctx.beginPath();
      ctx.ellipse(0, 4.5, 5, 3.2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#07090e";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.ellipse(0, 2.5, 3.8, 4.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#e10600";
      ctx.beginPath();
      ctx.arc(0, 2.5, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#2563eb";
      ctx.lineWidth = 1.6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(0, 1.8, 2.4, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();

      ctx.restore(); // Fin kart
      ctx.restore(); // Fin caméra

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    let lastHudUpdate = 0;
    const hudInterval = setInterval(() => {
      const now = performance.now();
      if (now - lastHudUpdate > 70) {
        lastHudUpdate = now;
        let active = checkpoints[0];
        for (let i = 0; i < checkpoints.length; i++) {
          if (smoothProgress >= checkpoints[i].t - 0.1) {
            active = checkpoints[i];
          }
        }
        setHudData({
          speed: active.speed,
          gear: active.gear,
          gForce: active.gForce,
          name: active.name,
          sub: active.sub,
          progress: smoothProgress,
        });
      }
    }, 70);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(animationFrameId);
      clearInterval(hudInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden select-none">
      {/* 1. LAYER DE FOND : SUBTILE TEXTURE DE PISTE */}
      <div className="absolute inset-0 w-full h-full opacity-15 md:opacity-20">
        <Image
          src="/track-action.jpg"
          alt="Atmosphère de piste karting"
          fill
          priority
          className="object-cover object-center grayscale contrast-150"
        />
        <div className="absolute inset-0 bg-[#07090e]/85" />
      </div>

      {/* 2. LE CANVAS HAUTE PERFORMANCE 60-120 FPS GPU ACCÉLÉRÉ */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
        style={{ willChange: "transform" }}
      />

      {/* 3. RADAR CIRCUIT MINI-MAP FIXE (DESKTOP SEULEMENT POUR NE PAS ENCOMBRER LE MOBILE) */}
      <div className="absolute bottom-6 left-6 md:left-16 pointer-events-auto bg-[#0b0f17]/95 border border-[#1e293b] p-3 backdrop-blur-md shadow-2xl max-w-[200px] hidden md:block font-mono">
        <div className="flex items-center justify-between text-[10px] text-[#94a3b8] mb-1">
          <span>MINI-MAP</span>
          <span className="text-[#e10600] font-bold">1 366 M</span>
        </div>
        <div className="relative w-full h-20">
          <svg viewBox="0 0 1200 1000" className="w-full h-full stroke-[#334155]" fill="none">
            <path
              d="M 220 760 L 220 360 C 220 230, 340 150, 480 130 C 680 130, 840 150, 940 220 C 970 320, 920 420, 790 450 C 660 440, 550 380, 500 290 C 520 220, 610 190, 720 220 C 770 300, 740 400, 640 500 C 570 600, 570 700, 630 780 C 740 810, 870 840, 930 900 C 850 960, 680 960, 480 940 C 320 910, 240 850, 220 760 Z"
              strokeWidth="48"
              className="opacity-30"
            />
            <path
              d="M 220 760 L 220 360 C 220 230, 340 150, 480 130 C 680 130, 840 150, 940 220 C 970 320, 920 420, 790 450 C 660 440, 550 380, 500 290 C 520 220, 610 190, 720 220 C 770 300, 740 400, 640 500 C 570 600, 570 700, 630 780 C 740 810, 870 840, 930 900 C 850 960, 680 960, 480 940 C 320 910, 240 850, 220 760 Z"
              stroke="#e10600"
              strokeWidth="40"
              strokeDasharray="100"
              pathLength="100"
              strokeDashoffset={100 - hudData.progress * 100}
            />
          </svg>
        </div>
        <div className="text-[9px] text-white mt-1 uppercase font-bold truncate">
          {hudData.name}
        </div>
      </div>

      {/* 4. TÉLÉMÉTRIE VITESSE ADAPTATIVE (BANDEAU ULTRA COMPACT SUR MOBILE, CADRAN SUR DESKTOP) */}
      <div className="absolute top-16 md:top-20 right-4 md:right-16 pointer-events-auto bg-[#0b0f17]/95 border border-[#1e293b] p-2.5 md:p-4 backdrop-blur-md shadow-2xl font-mono max-w-[180px] md:max-w-[240px] w-full">
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-1.5 md:pb-2 mb-1.5 md:mb-2 text-[9px] md:text-[10px]">
          <span className="text-[#e10600] font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e10600] animate-pulse" />
            TELEMETRY
          </span>
          <span className="text-white font-bold">{hudData.gear}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[#64748b] text-[8px] md:text-[9px] block uppercase">Vitesse</span>
            <span className="text-xl md:text-3xl font-black text-white font-sans leading-none">{hudData.speed}</span>
          </div>
          <div>
            <span className="text-[#64748b] text-[8px] md:text-[9px] block uppercase">G-Force</span>
            <span className="text-xl md:text-3xl font-black text-[#e10600] font-sans leading-none">{hudData.gForce}</span>
          </div>
        </div>

        <div className="mt-1.5 md:mt-2 pt-1.5 md:pt-2 border-t border-[#1e293b] text-[8px] md:text-[10px] text-[#94a3b8] leading-tight hidden sm:block truncate">
          {hudData.sub}
        </div>
      </div>

      {/* 5. BARRE BASSE DE PROGRESSION DU TOUR */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[#1e293b]">
        <div
          className="h-full bg-gradient-to-r from-[#2563eb] to-[#e10600]"
          style={{ width: `${hudData.progress * 100}%` }}
        />
      </div>
    </div>
  );
}
