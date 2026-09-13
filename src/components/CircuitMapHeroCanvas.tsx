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
    name: "LIGNE DROITE MARIEMBOURG",
    sub: "KARTING DES FAGNES // SORTIE DE GRILLE",
    progress: 0,
  });

  const checkpoints: Checkpoint[] = [
    {
      id: "grid",
      name: "LIGNE DROITE MARIEMBOURG",
      type: "straight",
      sub: "KARTING DES FAGNES // SORTIE DE GRILLE",
      speed: "128 KM/H",
      gear: "DIRECT",
      gForce: "1.15 G",
      desc: "Sortie de grille en trombe. Moteur IAME hurlant à 16 000 tr/min.",
      t: 0.05,
    },
    {
      id: "t1",
      name: "VIRAGE 01 : CORDE INTÉRIEURE",
      type: "braking",
      sub: "GROS FREINAGE DÉGRESSIF & POINT DE CORDE",
      speed: "68 KM/H",
      gear: "DIRECT",
      gForce: "2.75 G",
      desc: "Inscrire le train avant sur le vibreur bicolore à pleine adhérence.",
      t: 0.28,
    },
    {
      id: "chicane",
      name: "CHICANE TECHNIQUE",
      type: "chicane",
      sub: "TRANSFERT DE CHARGE MILLIMÉTRÉ",
      speed: "78 KM/H",
      gear: "DIRECT",
      gForce: "2.60 G",
      desc: "Le châssis Eurokarting encaisse la torsion sans sourciller.",
      t: 0.52,
    },
    {
      id: "parabolica",
      name: "GRANDE PARABOLIQUE",
      type: "apex",
      sub: "COURBE RAPIDE EN APPUI PLEIN GAZ",
      speed: "112 KM/H",
      gear: "DIRECT",
      gForce: "2.45 G",
      desc: "Gommes Komet à température de fonctionnement optimale.",
      t: 0.78,
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

    // Tracé de circuit épuré, fluide et naturel (inspiré de Mariembourg / Genk)
    // Points de passage fluides sans angles bizarres
    const rawWaypoints = [
      { x: 180, y: 780 }, // Ligne des stands / départ
      { x: 180, y: 560 },
      { x: 180, y: 380 },
      { x: 210, y: 250 },
      { x: 290, y: 160 }, // Virage 1
      { x: 420, y: 130 },
      { x: 620, y: 130 }, // Plein gaz
      { x: 790, y: 150 },
      { x: 920, y: 220 },
      { x: 970, y: 320 }, // Épingle Est
      { x: 930, y: 430 },
      { x: 800, y: 460 },
      { x: 670, y: 430 }, // Début portion technique
      { x: 570, y: 340 },
      { x: 580, y: 250 },
      { x: 680, y: 210 },
      { x: 780, y: 230 },
      { x: 830, y: 330 },
      { x: 770, y: 440 },
      { x: 670, y: 530 },
      { x: 620, y: 640 },
      { x: 680, y: 740 },
      { x: 800, y: 770 },
      { x: 920, y: 820 },
      { x: 950, y: 890 }, // Dernier virage parabolique
      { x: 860, y: 940 },
      { x: 680, y: 940 },
      { x: 460, y: 930 },
      { x: 280, y: 900 },
      { x: 200, y: 850 },
    ];

    const sampledPoints: { x: number; y: number; angle: number }[] = [];
    const numSamples = 2400;

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
        sampledPoints.push({ x: pt.x, y: pt.y, angle });
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
    let cameraX = 200;
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

    // Fonction d'aide pour tracer le chemin du circuit complet
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
      // Zoom équilibré qui laisse bien respirer la piste et l'ambiance
      const baseZoom = Math.min(width, height) / 720;
      ctx.scale(baseZoom, baseZoom);
      ctx.translate(-cameraX, -cameraY);

      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // =========================================================
      // 1. DÉGAGEMENT SÉCURITÉ & AMBIANCE EXTÉRIEURE (GRAVEL & BORDER)
      // =========================================================
      buildCircuitPath();
      ctx.strokeStyle = "rgba(18, 24, 38, 0.4)";
      ctx.lineWidth = 96;
      ctx.stroke();

      // =========================================================
      // 2. VIBREURS BICOLORES STYLISÉS INTÉGRÉS DANS L'ASPHALTE
      // (Pas de normales déformées : tracé propre avec lineDash)
      // =========================================================
      buildCircuitPath();
      ctx.lineWidth = 62;
      ctx.setLineDash([20, 20]);
      ctx.strokeStyle = "#e10600";
      ctx.stroke();

      ctx.lineDashOffset = 20;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash

      // =========================================================
      // 3. RUBAN D'ASPHALTE DE COURSE NOIR CARBONE ÉLÉGANT
      // =========================================================
      buildCircuitPath();
      ctx.strokeStyle = "#0a0e17";
      ctx.lineWidth = 48;
      ctx.stroke();

      // Texture de grain / bande de roulement centrale sombre
      buildCircuitPath();
      ctx.strokeStyle = "#060910";
      ctx.lineWidth = 32;
      ctx.stroke();

      // Lignes de limites de piste fines et chirurgicales
      buildCircuitPath();
      ctx.strokeStyle = "#1b2533";
      ctx.lineWidth = 50;
      // On trace les bords via un stroke fin au-dessus de l'asphalte
      buildCircuitPath();
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 1;
      ctx.stroke();

      // =========================================================
      // 4. LIGNE DE DÉPART / ARRIVÉE DAMIER MARIEMBOURG
      // =========================================================
      ctx.save();
      ctx.translate(180, 760);
      ctx.rotate(Math.PI / 2);
      ctx.lineWidth = 6;
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(-24, 0);
      ctx.lineTo(24, 0);
      ctx.stroke();
      ctx.restore();

      // =========================================================
      // 5. TRAJECTOIRE DE COURSE CHROMÉE ROUGE GLOW AU SCROLL
      // (Illumine le chemin déjà parcouru par le kart avec finesse)
      // =========================================================
      const passedPtsCount = Math.floor(smoothProgress * totalPts);
      if (passedPtsCount > 1) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(sampledPoints[0].x, sampledPoints[0].y);
        for (let i = 1; i <= passedPtsCount; i++) {
          ctx.lineTo(sampledPoints[i].x, sampledPoints[i].y);
        }
        // Glow subtil
        ctx.strokeStyle = "rgba(225, 6, 0, 0.25)";
        ctx.lineWidth = 8;
        ctx.stroke();

        // Cœur de la trajectoire net et précis
        ctx.strokeStyle = "#e10600";
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();
      }

      // Trajectoire prévisionnelle discrète (reste du tour)
      if (passedPtsCount < totalPts - 1) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(sampledPoints[passedPtsCount].x, sampledPoints[passedPtsCount].y);
        for (let i = passedPtsCount + 1; i < totalPts; i++) {
          ctx.lineTo(sampledPoints[i].x, sampledPoints[i].y);
        }
        ctx.setLineDash([6, 14]);
        ctx.strokeStyle = "rgba(51, 65, 85, 0.45)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }

      // =========================================================
      // 6. LE KART DE COURSE OFFICIEL #105 (DOUDOU RACING)
      // =========================================================
      ctx.save();
      ctx.translate(kart.x, kart.y);
      ctx.rotate(kart.angle + Math.PI / 2);

      // Ombre portée au sol
      ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
      ctx.beginPath();
      ctx.ellipse(0, 3, 20, 24, 0, 0, Math.PI * 2);
      ctx.fill();

      // Sillage lumineux arrière
      const trailGlow = ctx.createRadialGradient(0, 15, 0, 0, 15, 14);
      trailGlow.addColorStop(0, "rgba(225, 6, 0, 0.4)");
      trailGlow.addColorStop(1, "rgba(225, 6, 0, 0)");
      ctx.fillStyle = trailGlow;
      ctx.beginPath();
      ctx.arc(0, 15, 14, 0, Math.PI * 2);
      ctx.fill();

      // A. CHÂSSIS TUBULAIRE
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 2;
      ctx.beginPath();
      // Arbre arrière 50mm
      ctx.moveTo(-17, 13);
      ctx.lineTo(17, 13);
      // Longérons
      ctx.moveTo(-8, 13);
      ctx.lineTo(-8, -10);
      ctx.moveTo(8, 13);
      ctx.lineTo(8, -10);
      // Traverse avant
      ctx.moveTo(-13, -10);
      ctx.lineTo(13, -10);
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
          <span className="text-[#e10600] font-bold">1 548 M</span>
        </div>
        <div className="relative w-full h-20">
          <svg viewBox="0 0 1200 960" className="w-full h-full stroke-[#334155]" fill="none">
            <path
              d="M 180 780 L 180 380 C 180 250, 290 160, 420 130 C 620 130, 920 220, 970 320 C 930 430, 800 460, 670 430 C 570 340, 580 250, 680 210 C 780 230, 830 330, 770 440 C 670 530, 620 640, 680 740 C 800 770, 950 890, 860 940 C 680 940, 280 900, 180 780 Z"
              strokeWidth="48"
              className="opacity-30"
            />
            <path
              d="M 180 780 L 180 380 C 180 250, 290 160, 420 130 C 620 130, 920 220, 970 320 C 930 430, 800 460, 670 430 C 570 340, 580 250, 680 210 C 780 230, 830 330, 770 440 C 670 530, 620 640, 680 740 C 800 770, 950 890, 860 940 C 680 940, 280 900, 180 780 Z"
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
