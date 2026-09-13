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
    sub: "KARTING DES FAGNES // PLEIN GAZ 16 000 TR/MIN",
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
      t: 0.08,
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
      name: "CHICANE DE GENK",
      type: "chicane",
      sub: "HOME OF CHAMPIONS // TRANSFERT DE CHARGE",
      speed: "78 KM/H",
      gear: "DIRECT",
      gForce: "2.60 G",
      desc: "Le châssis Eurokarting encaisse la torsion sans sourciller.",
      t: 0.52,
    },
    {
      id: "parabolica",
      name: "PARABOLIQUE DU RAIDILLON",
      type: "apex",
      sub: "COURBE RAPIDE EN APPUI // PNEUS KOMET",
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

    // Définition de la piste (Circuit FIA Karting de Mariembourg / Genk profilé)
    const rawWaypoints = [
      { x: 180, y: 780 },
      { x: 180, y: 550 },
      { x: 180, y: 350 },
      { x: 210, y: 220 },
      { x: 280, y: 150 },
      { x: 390, y: 120 },
      { x: 550, y: 120 },
      { x: 720, y: 120 },
      { x: 860, y: 150 },
      { x: 960, y: 220 },
      { x: 1010, y: 320 },
      { x: 980, y: 420 },
      { x: 890, y: 480 },
      { x: 760, y: 480 },
      { x: 650, y: 430 },
      { x: 570, y: 340 },
      { x: 570, y: 260 },
      { x: 640, y: 210 },
      { x: 740, y: 210 },
      { x: 820, y: 260 },
      { x: 840, y: 340 },
      { x: 790, y: 420 },
      { x: 700, y: 500 },
      { x: 620, y: 590 },
      { x: 610, y: 680 },
      { x: 670, y: 750 },
      { x: 780, y: 770 },
      { x: 900, y: 800 },
      { x: 960, y: 860 },
      { x: 900, y: 920 },
      { x: 740, y: 930 },
      { x: 520, y: 930 },
      { x: 340, y: 910 },
      { x: 220, y: 860 },
    ];

    const sampledPoints: { x: number; y: number; angle: number; normalX: number; normalY: number }[] = [];
    const numSamples = 2000;

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
        const nextPt = catmullRom(p0, p1, p2, p3, Math.min(t + 0.01, 1));
        const angle = Math.atan2(nextPt.y - pt.y, nextPt.x - pt.x);
        // Vecteur normal unitaire (perpendiculaire à la piste)
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

    const render = () => {
      smoothProgress += (targetProgress - smoothProgress) * 0.09;

      const totalPts = sampledPoints.length;
      const currentIdx = Math.min(Math.floor(smoothProgress * (totalPts - 1)), totalPts - 1);
      const kart = sampledPoints[currentIdx] || sampledPoints[0];

      // Caméra fluide centrée sur le kart
      cameraX += (kart.x - cameraX) * 0.06;
      cameraY += (kart.y - cameraY) * 0.06;

      ctx.clearRect(0, 0, width, height);

      ctx.save();
      ctx.translate(width / 2, height / 2);
      const baseZoom = Math.min(width, height) / 580;
      ctx.scale(baseZoom, baseZoom);
      ctx.translate(-cameraX, -cameraY);

      // =========================================================
      // 1. DÉGAGEMENT SABLE & GRAVIER (RUN-OFF ZONE HOMOLOGUÉE FIA)
      // =========================================================
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Bande de sable/gravier large avec texture rugueuse
      ctx.beginPath();
      ctx.moveTo(sampledPoints[0].x, sampledPoints[0].y);
      for (let i = 1; i < totalPts; i++) {
        ctx.lineTo(sampledPoints[i].x, sampledPoints[i].y);
      }
      ctx.closePath();

      // Zone de dégagement extérieure (Gravel trap)
      ctx.strokeStyle = "#161b26";
      ctx.lineWidth = 110;
      ctx.stroke();

      // Asphalte de sécurité secondaire (Run-off bitumé)
      ctx.strokeStyle = "#0f1520";
      ctx.lineWidth = 92;
      ctx.stroke();

      // =========================================================
      // 2. VIBREURS BICOLORES DE COURSE INDÉPENDANTS (KERBS GAUCHE & DROITE)
      // =========================================================
      // Vibreur Gauche (Extérieur/Intérieur selon virage)
      ctx.save();
      ctx.beginPath();
      for (let i = 0; i < totalPts; i++) {
        const p = sampledPoints[i];
        const kx = p.x + p.normalX * 38;
        const ky = p.y + p.normalY * 38;
        if (i === 0) ctx.moveTo(kx, ky);
        else ctx.lineTo(kx, ky);
      }
      ctx.closePath();
      ctx.lineWidth = 10;
      ctx.setLineDash([14, 14]);
      ctx.strokeStyle = "#e10600";
      ctx.stroke();
      ctx.lineDashOffset = 14;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();
      ctx.restore();

      // Vibreur Droit
      ctx.save();
      ctx.beginPath();
      for (let i = 0; i < totalPts; i++) {
        const p = sampledPoints[i];
        const kx = p.x - p.normalX * 38;
        const ky = p.y - p.normalY * 38;
        if (i === 0) ctx.moveTo(kx, ky);
        else ctx.lineTo(kx, ky);
      }
      ctx.closePath();
      ctx.lineWidth = 10;
      ctx.setLineDash([14, 14]);
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();
      ctx.lineDashOffset = 14;
      ctx.strokeStyle = "#e10600";
      ctx.stroke();
      ctx.restore();

      // =========================================================
      // 3. RUBAN D'ASPHALTE DE COMPÉTITION NOIR PROFOND (68px)
      // =========================================================
      ctx.beginPath();
      ctx.moveTo(sampledPoints[0].x, sampledPoints[0].y);
      for (let i = 1; i < totalPts; i++) {
        ctx.lineTo(sampledPoints[i].x, sampledPoints[i].y);
      }
      ctx.closePath();

      // Bitume granuleux haute adhérence
      ctx.strokeStyle = "#080b11";
      ctx.lineWidth = 68;
      ctx.stroke();

      // Lignes blanches continues de délimitation de piste (Track Limits FIA)
      ctx.save();
      // Limite gauche
      ctx.beginPath();
      for (let i = 0; i < totalPts; i++) {
        const p = sampledPoints[i];
        const lx = p.x + p.normalX * 33;
        const ly = p.y + p.normalY * 33;
        if (i === 0) ctx.moveTo(lx, ly);
        else ctx.lineTo(lx, ly);
      }
      ctx.closePath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#475569";
      ctx.stroke();

      // Limite droite
      ctx.beginPath();
      for (let i = 0; i < totalPts; i++) {
        const p = sampledPoints[i];
        const rx = p.x - p.normalX * 33;
        const ry = p.y - p.normalY * 33;
        if (i === 0) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
      }
      ctx.closePath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#475569";
      ctx.stroke();
      ctx.restore();

      // =========================================================
      // 4. TRACES DE GOMME DE COURSE DANS LA TRAJECTOIRE (RACING GROOVE)
      // =========================================================
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(sampledPoints[0].x, sampledPoints[0].y);
      for (let i = 1; i < totalPts; i++) {
        ctx.lineTo(sampledPoints[i].x, sampledPoints[i].y);
      }
      ctx.closePath();
      ctx.strokeStyle = "#030407";
      ctx.lineWidth = 22;
      ctx.stroke();
      ctx.restore();

      // Ligne médiane discontinue subtile
      ctx.save();
      ctx.lineWidth = 1.2;
      ctx.setLineDash([16, 24]);
      ctx.strokeStyle = "#1b2432";
      ctx.stroke();
      ctx.restore();

      // =========================================================
      // 5. MARQUAGES AU SOL : GRILLE DE DÉPART & DAMIER MARIEMBOURG
      // =========================================================
      // Ligne de départ / arrivée Damier
      ctx.save();
      ctx.translate(180, 760);
      ctx.rotate(Math.PI / 2);
      ctx.lineWidth = 7;
      ctx.setLineDash([7, 7]);
      ctx.strokeStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(-33, 0);
      ctx.lineTo(33, 0);
      ctx.stroke();
      ctx.restore();

      // Emplacements de départ sur la grille (Boîtes de départ décalées)
      const gridPositions = [
        { x: 172, y: 730, pole: "P1" },
        { x: 188, y: 700, pole: "P2" },
        { x: 172, y: 670, pole: "P3" },
        { x: 188, y: 640, pole: "P4" },
      ];
      ctx.save();
      gridPositions.forEach((gp) => {
        ctx.strokeStyle = "#334155";
        ctx.lineWidth = 1.2;
        ctx.strokeRect(gp.x - 6, gp.y - 10, 12, 20);
        ctx.fillStyle = "#64748b";
        ctx.font = "bold 6px monospace";
        ctx.textAlign = "center";
        ctx.fillText(gp.pole, gp.x, gp.y + 2);
      });
      ctx.restore();

      // Panneaux de distance de freinage avant virage (100m, 50m)
      const brakeBoards = [
        { x: 140, y: 420, label: "100" },
        { x: 140, y: 360, label: "50" },
      ];
      ctx.save();
      brakeBoards.forEach((b) => {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(b.x - 8, b.y - 4, 16, 8);
        ctx.fillStyle = "#000000";
        ctx.font = "900 6px monospace";
        ctx.textAlign = "center";
        ctx.fillText(b.label, b.x, b.y + 2.5);
      });
      ctx.restore();

      // =========================================================
      // 6. TRAJECTOIRE IDÉALE ILLUMINÉE (RACING LINE GLOW AU SCROLL)
      // =========================================================
      const passedPtsCount = Math.floor(smoothProgress * totalPts);
      if (passedPtsCount > 1) {
        ctx.beginPath();
        ctx.moveTo(sampledPoints[0].x, sampledPoints[0].y);
        for (let i = 1; i <= passedPtsCount; i++) {
          ctx.lineTo(sampledPoints[i].x, sampledPoints[i].y);
        }
        ctx.strokeStyle = "#e10600";
        ctx.lineWidth = 4;
        ctx.shadowColor = "#e10600";
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // =========================================================
      // 7. LE KART DE COURSE OFFICIEL #105 (DOUDOU RACING)
      // =========================================================
      ctx.save();
      ctx.translate(kart.x, kart.y);
      ctx.rotate(kart.angle + Math.PI / 2);

      // Ombre portée au sol aérodynamique
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.beginPath();
      ctx.ellipse(0, 3, 22, 26, 0, 0, Math.PI * 2);
      ctx.fill();

      // Traces de gomme fumante laissées par les pneus arrière sous l'accélération
      const tyreSmoke = ctx.createRadialGradient(0, 16, 1, 0, 16, 18);
      tyreSmoke.addColorStop(0, "rgba(225, 6, 0, 0.35)");
      tyreSmoke.addColorStop(1, "rgba(225, 6, 0, 0)");
      ctx.fillStyle = tyreSmoke;
      ctx.beginPath();
      ctx.arc(0, 16, 18, 0, Math.PI * 2);
      ctx.fill();

      // A. CHÂSSIS TUBULAIRE EN ACIER CHROMOLYBDE
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      // Arbre arrière rigide de 50mm
      ctx.moveTo(-18, 14);
      ctx.lineTo(18, 14);
      // Longérons principaux
      ctx.moveTo(-9, 14);
      ctx.lineTo(-9, -12);
      ctx.moveTo(9, 14);
      ctx.lineTo(9, -12);
      // Traverse avant
      ctx.moveTo(-14, -12);
      ctx.lineTo(14, -12);
      ctx.stroke();

      // B. DISQUE DE FREIN ARRIÈRE VENTILÉ & ÉTRIER ROUGE
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(-6, 11, 2.5, 6);
      ctx.fillStyle = "#e10600";
      ctx.fillRect(-6.5, 10, 3.5, 2.5);

      // C. BLOC MOTEUR IAME X30 À DROITE & ÉCHAPPEMENT
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(8, 2, 7, 9);
      ctx.fillStyle = "#64748b";
      ctx.fillRect(9, 3, 5, 3);
      // Échappement tubulaire cintré titane
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(11, 10);
      ctx.lineTo(10, 19);
      ctx.lineTo(5, 22);
      ctx.stroke();

      // D. LES 4 ROUES DE COMPÉTITION (PNEUS KOMET SLICK + JANTES MAGNÉSIUM)
      const drawWheel = (wx: number, wy: number, w: number, h: number) => {
        ctx.fillStyle = "#0a0d14";
        ctx.strokeStyle = "#1e293b";
        ctx.lineWidth = 0.8;
        ctx.fillRect(wx - w / 2, wy - h / 2, w, h);
        ctx.strokeRect(wx - w / 2, wy - h / 2, w, h);
        // Jante magnésium dorée/bronze
        ctx.fillStyle = "#92400e";
        ctx.fillRect(wx - w / 4, wy - h / 4, w / 2, h / 2);
        // Écrou de roue anodisé rouge
        ctx.fillStyle = "#e10600";
        ctx.fillRect(wx - 1, wy - 1, 2, 2);
      };

      drawWheel(-16, -12, 6, 11);
      drawWheel(16, -12, 6, 11);
      drawWheel(-19, 14, 8, 14);
      drawWheel(19, 14, 8, 14);

      // E. CARROSSERIE CIK-FIA OFFICIELLE
      // Spoiler avant profilé
      ctx.fillStyle = "#e10600";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-14, -18);
      ctx.lineTo(14, -18);
      ctx.lineTo(16, -14);
      ctx.lineTo(11, -12);
      ctx.lineTo(-11, -12);
      ctx.lineTo(-16, -14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Pontons latéraux
      ctx.fillStyle = "#e10600";
      ctx.beginPath();
      ctx.moveTo(-15, -8);
      ctx.lineTo(-11, -8);
      ctx.lineTo(-11, 10);
      ctx.lineTo(-15, 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(11, -8);
      ctx.lineTo(15, -8);
      ctx.lineTo(15, 10);
      ctx.lineTo(11, 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Bandes racing blanches
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(-14, -2, 2, 8);
      ctx.fillRect(12, -2, 2, 8);

      // Naseau central avant blanc (Porte-numéro)
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(-5, -16);
      ctx.lineTo(5, -16);
      ctx.lineTo(6, -4);
      ctx.lineTo(-6, -4);
      ctx.closePath();
      ctx.fill();

      // Numéro officiel #105 de Doudou Racing
      ctx.fillStyle = "#07090e";
      ctx.font = "900 6.5px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("105", 0, -10);

      // F. VOLANT MÉPLAT & ÉCRAN MYCHRON
      ctx.strokeStyle = "#07090e";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, -3, 3.8, Math.PI * 0.1, Math.PI * 0.9);
      ctx.stroke();
      ctx.fillStyle = "#2563eb";
      ctx.fillRect(-1.5, -4, 3, 1.8);

      // G. SIÈGE BAQUET CARBONE TILLET & PILOTE CASQUÉ
      ctx.strokeStyle = "#475569";
      ctx.fillStyle = "#0c1017";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(0, 5, 6.5, 7.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Combinaison Alpinestars d'Edouard Godfroid
      ctx.fillStyle = "#e10600";
      ctx.beginPath();
      ctx.ellipse(0, 4.5, 5.5, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(-5, 3, 2, 3);
      ctx.fillRect(3, 3, 2, 3);

      // Casque FIA Pro avec visière irisée
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#07090e";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.ellipse(0, 2.5, 3.8, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#e10600";
      ctx.beginPath();
      ctx.arc(0, 2.5, 2.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#2563eb";
      ctx.lineWidth = 1.8;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(0, 1.8, 2.6, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(2.8, 2, 0.8, 0.8);

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
          if (smoothProgress >= checkpoints[i].t - 0.12) {
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
              d="M 180 780 L 180 350 C 180 200, 280 120, 550 120 C 860 120, 1010 220, 1010 320 C 1010 420, 890 480, 760 480 C 650 480, 570 340, 570 260 C 570 210, 740 210, 820 260 C 840 340, 790 420, 700 500 C 620 590, 610 680, 670 750 C 780 770, 960 860, 900 920 C 740 930, 340 910, 180 780 Z"
              strokeWidth="48"
              className="opacity-30"
            />
            <path
              d="M 180 780 L 180 350 C 180 200, 280 120, 550 120 C 860 120, 1010 220, 1010 320 C 1010 420, 890 480, 760 480 C 650 480, 570 340, 570 260 C 570 210, 740 210, 820 260 C 840 340, 790 420, 700 500 C 620 590, 610 680, 670 750 C 780 770, 960 860, 900 920 C 740 930, 340 910, 180 780 Z"
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
