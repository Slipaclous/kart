"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

export interface LapTelemetryPoint {
  progress: number;
  lapTime: string;
  delta: string; // ex: "-0.248s"
  isPurple: boolean;
  speed: number;
  rpm: number;
  gear: number;
  throttle: number;
  brake: number;
  gx: number; // Accélération latérale (-2.85 à +2.85)
  gy: number; // Accélération longitudinale (-1.8 frein à +1.2 accélération)
  currentZone: string;
  advice: string;
  sector: 1 | 2 | 3;
}

export default function HotLapTelemetryCanvas() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const pathRef = useRef<SVGPathElement | null>(null);
  const [kartPos, setKartPos] = useState({ x: 30, y: 75, angle: 0 });

  // Circuit FIA Karting Sarno Napoli (Grande boucle 1 548 mètres)
  const circuitPathD =
    "M 30 82 L 12 82 C 6 82, 4 72, 8 62 L 18 38 C 22 26, 34 16, 50 16 L 76 16 C 88 16, 94 26, 90 38 L 84 50 C 80 58, 68 62, 58 55 L 48 48 C 42 42, 45 32, 55 30 L 70 30 C 78 30, 80 40, 72 45 L 62 50 C 52 56, 48 68, 55 75 L 78 75 C 88 75, 92 85, 82 90 L 45 90 C 35 90, 32 82, 30 82 Z";

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0) {
        const p = Math.min(Math.max(scrollY / maxScroll, 0), 1);
        setScrollProgress(p);

        if (pathRef.current) {
          const totalLen = pathRef.current.getTotalLength();
          const curLen = p * totalLen;
          const pt = pathRef.current.getPointAtLength(curLen);
          const nextPt = pathRef.current.getPointAtLength(Math.min(curLen + 2, totalLen));
          const angle = Math.atan2(nextPt.y - pt.y, nextPt.x - pt.x) * (180 / Math.PI);
          setKartPos({ x: pt.x, y: pt.y, angle });
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calcul physique réaliste de la télémétrie tour par tour
  const getLapTelemetry = (p: number): LapTelemetryPoint => {
    if (p < 0.18) {
      // Zone 1 : Sortie de la grille & Ligne droite des stands (Pleine charge)
      const lp = p / 0.18;
      const speed = Math.round(92 + lp * 47);
      const rpm = Math.round(11400 + lp * 3800);
      return {
        progress: p,
        lapTime: `00:0${Math.floor(p * 50)}.${Math.floor((p * 54321) % 999)}`,
        delta: "-0.142s",
        isPurple: true,
        speed,
        rpm,
        gear: lp < 0.4 ? 4 : lp < 0.7 ? 5 : 6,
        throttle: 100,
        brake: 0,
        gx: Number((Math.sin(lp * 4) * 0.4).toFixed(2)),
        gy: 0.95,
        currentZone: "LIGNE DROITE DES STANDS // PLEINE CHARGE 6E",
        advice: "Aspiration idéale. Le point de corde T1 se profile à 139 km/h.",
        sector: 1,
      };
    } else if (p < 0.38) {
      // Zone 2 : Gros freinage dégressif Turn 1 & Vibreur
      const lp = (p - 0.18) / 0.2;
      const speed = Math.round(139 - lp * 72);
      const rpm = Math.round(15200 - lp * 6400);
      return {
        progress: p,
        lapTime: `00:1${Math.floor(lp * 9)}.${Math.floor((p * 74321) % 999)}`,
        delta: "-0.284s",
        isPurple: true,
        speed,
        rpm,
        gear: lp < 0.5 ? 4 : 3,
        throttle: Math.max(0, Math.round(100 - lp * 150)),
        brake: Math.min(100, Math.round(lp * 130)),
        gx: Number((1.2 + lp * 1.65).toFixed(2)), // 2.85G en appui
        gy: -1.6, // Forte décélération
        currentZone: "VIRAGE 01 // FREINAGE DÉGRESSIF & POINT DE CORDE",
        advice: "Pression max sur l'étrier avant. Vibreur touché sans bloquer les roues.",
        sector: 1,
      };
    } else if (p < 0.62) {
      // Zone 3 : Chicane Ascoli rapide (Pif-Paf & torsion du châssis)
      const lp = (p - 0.38) / 0.24;
      const speed = Math.round(67 + lp * 38);
      const rpm = Math.round(8800 + lp * 5100);
      return {
        progress: p,
        lapTime: `00:2${Math.floor(lp * 9)}.${Math.floor((p * 81234) % 999)}`,
        delta: "-0.385s",
        isPurple: true,
        speed,
        rpm,
        gear: lp < 0.5 ? 3 : 4,
        throttle: Math.min(100, Math.round(40 + lp * 60)),
        brake: lp < 0.3 ? 25 : 0,
        gx: Number((-2.4 + lp * 4.8).toFixed(2)), // Inversion brutale du G latéral
        gy: 0.45,
        currentZone: "CHICANE ASCOLI // TRANSFERT DE MASSE GAUCHE-DROITE",
        advice: "Châssis 25CrMo4 en torsion sur le vibreur. Relance anticipée.",
        sector: 2,
      };
    } else if (p < 0.84) {
      // Zone 4 : Courbe Parabolica Sud à haute vitesse
      const lp = (p - 0.62) / 0.22;
      const speed = Math.round(105 + lp * 28);
      const rpm = Math.round(13200 + lp * 1800);
      return {
        progress: p,
        lapTime: `00:4${Math.floor(lp * 7)}.${Math.floor((p * 92145) % 999)}`,
        delta: "-0.412s",
        isPurple: true,
        speed,
        rpm,
        gear: lp < 0.6 ? 5 : 6,
        throttle: 96,
        brake: 0,
        gx: 2.35,
        gy: 0.7,
        currentZone: "PARABOLICA SUD // LONGUE COURBE RAPIDE EN APPUI",
        advice: "Plein gaz maintenu en glisse légère sur les pneus Vega chauds.",
        sector: 3,
      };
    } else {
      // Zone 5 : Ligne d'arrivée / Drapeau à damier / Pole Position
      return {
        progress: p,
        lapTime: "00:54.108",
        delta: "-0.468s",
        isPurple: true,
        speed: 139,
        rpm: 15200,
        gear: 6,
        throttle: 100,
        brake: 0,
        gx: 0.1,
        gy: 1.1,
        currentZone: "LIGNE D'ARRIVÉE // RECORD DU TOUR PURPLE P1",
        advice: "Pole position verrouillée. Secteurs 1, 2 et 3 records.",
        sector: 3,
      };
    }
  };

  const tele = getLapTelemetry(scrollProgress);

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden select-none">
      {/* 1. PHOTOGRAPHIES CINÉMATOGRAPHIQUES PARALLAXES */}
      <div className="absolute inset-0 w-full h-full">
        {/* Photo Paddock & Pilote (Début de tour) */}
        <div
          className="absolute inset-0 transition-opacity duration-700 ease-out"
          style={{
            opacity: Math.max(0, 1 - scrollProgress * 3.5),
            transform: `scale(${1 + scrollProgress * 0.12}) translateY(${scrollProgress * -50}px)`,
          }}
        >
          <Image
            src="/driver-hero.jpg"
            alt="Liam Moreau en pitlane avec son kart de compétition"
            fill
            priority
            className="object-cover object-center brightness-[0.38] contrast-[1.15]"
          />
        </div>

        {/* Photo Action sur Vibreur (En piste) */}
        <div
          className="absolute inset-0 transition-opacity duration-700 ease-out"
          style={{
            opacity: Math.min(1, Math.max(0, (scrollProgress - 0.16) * 3)),
            transform: `scale(${1.06 - scrollProgress * 0.06}) translateY(${(scrollProgress - 0.5) * -35}px)`,
          }}
        >
          <Image
            src="/track-action.jpg"
            alt="Kart KZ2 n°42 en attaque sur vibreur"
            fill
            priority
            className="object-cover object-[center_35%] brightness-[0.34] contrast-[1.2]"
          />
        </div>

        {/* Dégradés sombres cinéma */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/30 to-[#07090e]/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07090e]/95 via-transparent to-[#07090e]/90" />
      </div>

      {/* 2. BANDEAU HAUT CHRONO LIVE & DELTA (ESPRIT F1 QUALIFYING BROADCAST) */}
      <div className="absolute top-16 left-0 right-0 px-6 md:px-16 pointer-events-auto flex items-center justify-between z-30">
        {/* Widget Chrono & Delta */}
        <div className="bg-[#0b0f17]/95 border border-[#1e293b] px-4 py-2 flex items-center gap-4 font-mono text-xs backdrop-blur-md shadow-2xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e10600] animate-ping" />
            <span className="font-bold text-white uppercase tracking-wider">HOT LAP // QUALIF</span>
          </div>

          <div className="h-4 w-px bg-[#1e293b]" />

          {/* Chrono au millième */}
          <div>
            <span className="text-[#64748b] text-[9px] block">CHRONO LIVE</span>
            <span className="text-base font-bold text-white font-sans">{tele.lapTime}</span>
          </div>

          <div className="h-4 w-px bg-[#1e293b]" />

          {/* Delta vs Pole Position */}
          <div>
            <span className="text-[#64748b] text-[9px] block">DELTA POLE</span>
            <span className="text-base font-bold text-[#e10600]">{tele.delta}</span>
          </div>

          {/* Mini Secteurs 1, 2, 3 */}
          <div className="hidden sm:flex items-center gap-1.5 ml-2">
            {[1, 2, 3].map((sec) => (
              <span
                key={sec}
                className={`px-2 py-0.5 text-[10px] font-bold ${
                  tele.sector >= sec
                    ? "bg-[#9333ea] text-white" // Secteur violet (Record absolu)
                    : "bg-[#1e293b] text-[#64748b]"
                }`}
              >
                S{sec}
              </span>
            ))}
          </div>
        </div>

        {/* Localisation du secteur sur la piste */}
        <div className="hidden lg:flex items-center gap-2 font-mono text-[11px] text-[#94a3b8] bg-[#0b0f17]/90 border border-[#1e293b] px-3.5 py-2 backdrop-blur-md">
          <span className="text-[#e10600] font-bold">&bull; {tele.currentZone}</span>
        </div>
      </div>

      {/* 3. RADAR TÉLÉMÉTRIE FLOTTANT : G-FORCE FRICTION CIRCLE & CIRCUIT GPS */}
      <div className="absolute top-32 right-6 md:right-16 pointer-events-auto hidden md:flex flex-col gap-3 max-w-[280px] w-full font-mono">
        {/* Télémétrie brute & Vitesse */}
        <div className="bg-[#0b0f17]/95 border border-[#1e293b] p-4 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-2 mb-3 text-[10px]">
            <span className="text-[#e10600] font-bold">MYCHRON5 DATA // LIVE</span>
            <span className="text-white font-semibold">RAPPORT {tele.gear}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[#64748b] text-[9px] block tracking-wider uppercase">Vitesse</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white font-sans">{tele.speed}</span>
                <span className="text-[10px] text-[#e10600] font-bold">KM/H</span>
              </div>
            </div>
            <div>
              <span className="text-[#64748b] text-[9px] block tracking-wider uppercase">Régime</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-[#f1f5f9] font-sans">
                  {(tele.rpm / 1000).toFixed(1)}k
                </span>
                <span className="text-[10px] text-[#64748b]">RPM</span>
              </div>
            </div>
          </div>

          {/* Barres Accélérateur / Frein */}
          <div className="space-y-2 mt-3 pt-3 border-t border-[#1e293b] text-[9px]">
            <div>
              <div className="flex justify-between text-[#94a3b8] mb-1">
                <span>ACCÉLÉRATEUR</span>
                <span className="text-white font-bold">{tele.throttle}%</span>
              </div>
              <div className="h-1.5 w-full bg-[#1e293b]">
                <div
                  className="h-full bg-[#2563eb] transition-all duration-100"
                  style={{ width: `${tele.throttle}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[#94a3b8] mb-1">
                <span>FREINAGE</span>
                <span className={tele.brake > 0 ? "text-[#e10600] font-bold" : "text-white"}>
                  {tele.brake}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-[#1e293b]">
                <div
                  className="h-full bg-[#e10600] transition-all duration-100"
                  style={{ width: `${tele.brake}%` }}
                />
              </div>
            </div>
          </div>

          {/* CERCLE DE KAMM (G-FORCE RADAR) */}
          <div className="mt-4 pt-3 border-t border-[#1e293b]">
            <div className="flex items-center justify-between text-[10px] mb-2 text-[#94a3b8]">
              <span>CERCLE DE KAMM (G-FORCE)</span>
              <span className="text-[#e10600] font-bold">{Math.abs(tele.gx)} G</span>
            </div>

            <div className="relative w-full h-24 bg-[#07090e] border border-[#1e293b] flex items-center justify-center overflow-hidden">
              {/* Cercles de référence 1G et 2.5G */}
              <div className="absolute w-16 h-16 rounded-full border border-[#1e293b]" />
              <div className="absolute w-10 h-10 rounded-full border border-[#1e293b]/50" />
              <div className="absolute w-full h-px bg-[#1e293b]/40" />
              <div className="absolute h-full w-px bg-[#1e293b]/40" />

              {/* Point G-Force en direct */}
              <div
                className="absolute w-3.5 h-3.5 rounded-full bg-[#e10600] shadow-[0_0_10px_#e10600] transition-all duration-100"
                style={{
                  transform: `translate(${(tele.gx / 3) * 36}px, ${(-tele.gy / 2) * 28}px)`,
                }}
              />
            </div>
          </div>
        </div>

        {/* CIRCUIT GPS LIVE AVEC CURSEUR DE POSITION */}
        <div className="bg-[#0b0f17]/95 border border-[#1e293b] p-4 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-2 text-[10px] text-[#94a3b8]">
            <span>SARNO RACETRACK (1 548 M)</span>
            <span className="text-[#2563eb] font-bold">GPS TRACKER</span>
          </div>

          <div className="relative w-full h-24 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full stroke-neutral-700" fill="none">
              {/* Tracé de la piste */}
              <path
                d={circuitPathD}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-30"
              />
              <path
                ref={pathRef}
                d={circuitPathD}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="stroke-[#2563eb]/70"
              />
              {/* Curseur Kart animé */}
              <circle
                cx={kartPos.x}
                cy={kartPos.y}
                r="4.5"
                fill="#e10600"
                className="drop-shadow-[0_0_8px_#e10600]"
              />
              <circle
                cx={kartPos.x}
                cy={kartPos.y}
                r="8"
                stroke="#e10600"
                strokeWidth="1.5"
                className="animate-ping opacity-75"
              />
            </svg>
          </div>

          <div className="text-[10px] text-[#94a3b8] mt-2 italic leading-tight">
            &ldquo;{tele.advice}&rdquo;
          </div>
        </div>
      </div>

      {/* 4. BARRE D'AVANCEMENT DU TOUR (PROGRESSION BASSE) */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#0b0f17] border-t border-[#1e293b]">
        <div
          className="h-full bg-gradient-to-r from-[#2563eb] via-[#e10600] to-[#9333ea] transition-all duration-75 ease-out"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>
    </div>
  );
}
