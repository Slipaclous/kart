"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

interface Checkpoint {
  id: string;
  name: string;
  type: "straight" | "braking" | "apex" | "chicane" | "finish";
  sub: string;
  speed: string;
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

    // Tracé fidèle, réaliste et dynamique de Mariembourg (Karting des Fagnes)
    // 1 366 mètres réels de pur tracé FIA
    const rawWaypoints = [
      // 1. Ligne droite principale des stands
      { x: 220, y: 760 },
      { x: 220, y: 540 },
      { x: 220, y: 360 },
      // 2. Courbe rapide 1 vers la ligne droite arrière
      { x: 250, y: 230 },
      { x: 340, y: 150 },
      { x: 480, y: 130 },
      { x: 680, y: 130 },
      { x: 840, y: 150 },
      // 3. Épingle Est
      { x: 940, y: 220 },
      { x: 970, y: 320 },
      { x: 920, y: 420 },
      { x: 790, y: 450 },
      // 4. Portion sinueuse technique (S du bois)
      { x: 660, y: 440 },
      { x: 550, y: 380 },
      { x: 500, y: 290 },
      { x: 520, y: 220 },
      { x: 610, y: 190 },
      { x: 720, y: 220 },
      { x: 770, y: 300 },
      { x: 740, y: 400 },
      // 5. Descente vers la tribune sud
      { x: 640, y: 500 },
      { x: 570, y: 600 },
      { x: 570, y: 700 },
      // 6. Raccordement et parabolique finale
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

    // Helper pour construire le tracé vectoriel fermé complet
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

      // Caméra fluide centrée sur le kart
      cameraX += (kart.x - cameraX) * 0.05;
      cameraY += (kart.y - cameraY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      ctx.save();
      ctx.translate(width / 2, height / 2);
      // Zoom ultra équilibré et respirant
      const baseZoom = Math.min(width, height) / 820;
      ctx.scale(baseZoom, baseZoom);
      ctx.translate(-cameraX, -cameraY);

      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // =========================================================================
      // 1. DÉGAGEMENT SÉCURITÉ RUN-OFF FIA & SOL D'ASPHALTE SOMBRE NATUREL
      // =========================================================================
      // Fond de dégagement / Bac à gravier sobre (non saturé, look nocturne pro)
      buildCircuitPath();
      ctx.strokeStyle = "#0d131f";
      ctx.lineWidth = 110;
      ctx.stroke();

      // Bordure extérieure de sécurité
      buildCircuitPath();
      ctx.strokeStyle = "#131b29";
      ctx.lineWidth = 92;
      ctx.stroke();

      // =========================================================================
      // 2. VIBREURS DE COURSE FIA HYPER RÉALISTES AUX POINTS CLÉS UNIQUEMENT
      // (Pas sur tout le circuit comme un jouet, mais précisément sur les cordes)
      // =========================================================================
      // Zones réelles de vibreurs :
      // [tStart, tEnd, side: 1 for left / -1 for right, length]
      const kerbZones: { start: number; end: number; side: number }[] = [
        { start: 0.18, end: 0.28, side: -1 }, // Entrée & corde Virage 1
        { start: 0.32, end: 0.38, side: 1 },  // Vibreur extérieur sortie V1
        { start: 0.40, end: 0.48, side: -1 }, // Épingle Est intérieure
        { start: 0.50, end: 0.56, side: 1 },  // Chicane du bois (gauche)
        { start: 0.57, end: 0.63, side: -1 }, // Chicane du bois (droite)
        { start: 0.72, end: 0.80, side: -1 }, // Corde Parabolique sud
        { start: 0.82, end: 0.88, side: 1 },  // Vibreur de sortie parabolique
      ];

      kerbZones.forEach((zone) => {
        const startIdx = Math.floor(zone.start * totalPts);
        const endIdx = Math.floor(zone.end * totalPts);
        const kerbWidth = 6;
        const offset = 32 * zone.side;

        ctx.save();
        ctx.beginPath();
        for (let i = startIdx; i <= endIdx; i++) {
          const pt = sampledPoints[i];
          const kx = pt.x + pt.normalX * offset;
          const ky = pt.y + pt.normalY * offset;
          if (i === startIdx) ctx.moveTo(kx, ky);
          else ctx.lineTo(kx, ky);
        }
        ctx.lineWidth = kerbWidth;
        ctx.setLineDash([12, 12]);
        ctx.strokeStyle = "#e10600";
        ctx.stroke();

        ctx.lineDashOffset = 12;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();
        ctx.restore();
      });

      // =========================================================================
      // 3. RUBAN D'ASPHALTE NOIR CARBONE AUTHENTIQUE (LARGEUR 60PX)
      // =========================================================================
      // Bitume principal haute friction
      buildCircuitPath();
      ctx.strokeStyle = "#080c13";
      ctx.lineWidth = 60;
      ctx.stroke();

      // Bande de roulement texturée / gomme centrale déposée
      buildCircuitPath();
      ctx.strokeStyle = "#05070c";
      ctx.lineWidth = 42;
      ctx.stroke();

      // =========================================================================
      // 4. LIMITES DE PISTE FINES & ÉLÉGANTES (LIGNES BLANCHES FIA CONTINUES)
      // =========================================================================
      ctx.save();
      // Limite gauche
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
      ctx.strokeStyle = "#334155";
      ctx.stroke();

      // Limite droite
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
      ctx.strokeStyle = "#334155";
      ctx.stroke();
      ctx.restore();

      // =========================================================================
      // 5. DAMIER DE DÉPART DE MARIEMBOURG (CHIC & MINIMALISTE)
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
      // 6. TRAJECTOIRE DE COURSE CHRONO (RACING LINE NÉON SUBTIL AU SCROLL)
      // =========================================================================
      const passedPtsCount = Math.floor(smoothProgress * totalPts);
      if (passedPtsCount > 1) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(sampledPoints[0].x, sampledPoints[0].y);
        for (let i = 1; i <= passedPtsCount; i++) {
          ctx.lineTo(sampledPoints[i].x, sampledPoints[i].y);
        }
        // Halo néon subtil
        ctx.strokeStyle = "rgba(225, 6, 0, 0.25)";
        ctx.lineWidth = 6;
        ctx.stroke();

        // Fil rouge chirurgical
        ctx.strokeStyle = "#e10600";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      // =========================================================================
      // 7. LE KART DE COURSE OFFICIEL #105 (DOUDOU RACING)
      // =========================================================================
      ctx.save();
      ctx.translate(kart.x, kart.y);
      ctx.rotate(kart.angle + Math.PI / 2);

      // Ombre portée aérodynamique
      ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
      ctx.beginPath();
      ctx.ellipse(0, 3, 19, 23, 0, 0, Math.PI * 2);
      ctx.fill();

      // Sillage lumineux arrière
      const trailGlow = ctx.createRadialGradient(0, 14, 0, 0, 14, 12);
      trailGlow.addColorStop(0, "rgba(225, 6, 0, 0.45)");
      trailGlow.addColorStop(1, "rgba(225, 6, 0, 0)");
      ctx.fillStyle = trailGlow;
      ctx.beginPath();
      ctx.arc(0, 14, 12, 0, Math.PI * 2);
      ctx.fill();

      // A. CHÂSSIS TUBULAIRE
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

      // B. LES 4 ROUES DE COMPÉTITION (PNEUS SLICK KOMET)
      const drawWheel = (wx: number, wy: number, w: number, h: number) => {
        ctx.fillStyle = "#090d14";
        ctx.strokeStyle = "#1e293b";
        ctx.lineWidth = 0.8;
        ctx.fillRect(wx - w / 2, wy - h / 2, w, h);
        ctx.strokeRect(wx - w / 2, wy - h / 2, w, h);
        // Centre de jante magnésium
        ctx.fillStyle = "#b45309";
        ctx.fillRect(wx - w / 4, wy - h / 4, w / 2, h / 2);
        // Écrou rouge
        ctx.fillStyle = "#e10600";
        ctx.fillRect(wx - 1, wy - 1, 2, 2);
      };

      drawWheel(-15, -11, 6, 10);
      drawWheel(15, -11, 6, 10);
      drawWheel(-18, 13, 8, 13);
      drawWheel(18, 13, 8, 13);

      // C. CARROSSERIE CIK-FIA OFFICIELLE DOUDOU RACING
      // Spoiler avant profilé rouge
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

      // Pontons latéraux rouges
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

      // Porte-numéro naseau avant blanc
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(-5, -15);
      ctx.lineTo(5, -15);
      ctx.lineTo(6, -3);
      ctx.lineTo(-6, -3);
      ctx.closePath();
      ctx.fill();

      // Numéro officiel #105
      ctx.fillStyle = "#07090e";
      ctx.font = "900 6.5px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("105", 0, -9);

      // Volant méplat et bloc MyChron
      ctx.strokeStyle = "#07090e";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, -2, 3.5, Math.PI * 0.1, Math.PI * 0.9);
      ctx.stroke();
      ctx.fillStyle = "#2563eb";
      ctx.fillRect(-1.5, -3, 3, 1.6);

      // Siège baquet Tillet carbone & pilote casqué
      ctx.fillStyle = "#0a0e17";
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.ellipse(0, 5, 6, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Combinaison Alpinestars d'Edouard Godfroid
      ctx.fillStyle = "#e10600";
      ctx.beginPath();
      ctx.ellipse(0, 4.5, 5, 3.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Casque FIA officiel blanc avec bandeau rouge et visière cobalt
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

      // Visière de casque
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
      <div className="absolute inset-0 w-full h-full opacity-20">
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

      {/* 3. RADAR CIRCUIT MINI-MAP FIXE (BAS GAUCHE) */}
      <div className="absolute bottom-6 left-6 md:left-16 pointer-events-auto bg-[#0b0f17]/95 border border-[#1e293b] p-3 backdrop-blur-md shadow-2xl max-w-[200px] hidden sm:block font-mono">
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

      {/* 4. TÉLÉMÉTRIE VITESSE & RAPPORT EN TEMPS RÉEL (HAUT DROITE) */}
      <div className="absolute top-20 right-6 md:right-16 pointer-events-auto bg-[#0b0f17]/95 border border-[#1e293b] p-4 backdrop-blur-md shadow-2xl font-mono max-w-[240px] w-full">
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-2 mb-2 text-[10px]">
          <span className="text-[#e10600] font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#e10600] animate-pulse" />
            LIVE TELEMETRY
          </span>
          <span className="text-white font-bold">{hudData.gear}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[#64748b] text-[9px] block uppercase">Vitesse</span>
            <span className="text-3xl font-black text-white font-sans">{hudData.speed}</span>
          </div>
          <div>
            <span className="text-[#64748b] text-[9px] block uppercase">Force G</span>
            <span className="text-3xl font-black text-[#e10600] font-sans">{hudData.gForce}</span>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-[#1e293b] text-[10px] text-[#94a3b8] leading-tight">
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
