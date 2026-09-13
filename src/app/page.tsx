import Link from "next/link";
import Image from "next/image";
import { Download, ChevronDown, Award, Zap, Disc3, Compass, Trophy, Calendar, Flag, User, ShieldCheck, Quote, Cpu, Activity, CheckCircle2, BarChart3, Mail } from "lucide-react";
import CircuitMapHeroCanvas from "@/components/CircuitMapHeroCanvas";
import CircuitMapSVG from "@/components/CircuitMapSVG";

export default function HomePage() {
  const telemetryStats = [
    { label: "MOTEUR IAME", value: "16 000", unit: "TR/MIN", detail: "IAME X30 125cc à refroidissement liquide" },
    { label: "0 À 100 KM/H", value: "3.4 s", unit: "DÉPART ARRÊTÉ", detail: "Pneus slick Komet K2M neufs" },
    { label: "GRIP LATÉRAL", value: "2.75 G", unit: "COURBE APEX", detail: "Châssis Eurokarting Mariembourg" },
    { label: "POIDS TOTAL", value: "145 kg", unit: "AVEC PILOTE", detail: "Réglementation IAME Series Benelux" },
  ];

  const trophies = [
    { year: "2023", title: "Champion de Belgique", org: "IAME Series Benelux", track: "Catégorie Mini", badge: "TITRE NATIONAL", gap: "LEADER 148 PTS", s1: "18.204", s2: "17.410" },
    { year: "2022", title: "Vice-Champion Benelux", org: "IAME Series Benelux", track: "Mariembourg & Genk", badge: "PODIUM GÉNÉRAL", gap: "+0.042s", s1: "18.312", s2: "17.502" },
    { year: "2021", title: "Top 3 Mini Rookie", org: "IAME Series Benelux & Euro Series", track: "Genk, Mariembourg & Le Mans", badge: "CHALLENGER TOP 3", gap: "+0.118s", s1: "18.480", s2: "17.610" },
    { year: "2019", title: "1er Trophée Endurance", org: "BSK Frasnes", track: "Victoire Course d'Endurance", badge: "PREMIER SUCCÈS", gap: "VICTOIRE", s1: "18.910", s2: "17.990" },
  ];

  const calendarEvents: {
    round: string;
    name: string;
    track: string;
    country: string;
    date: string;
    status: string;
    highlight: boolean;
    nextRace?: boolean;
    circuitType: "genk" | "portimao" | "sarno" | "wackersdorf";
  }[] = [
    {
      round: "RD 01",
      name: "IAME Series Benelux - Mariembourg",
      track: "Karting des Fagnes 'Home of Doudou'",
      country: "BELGIQUE",
      date: "28-30 MARS 2026",
      status: "VICTOIRE P1",
      highlight: true,
      circuitType: "genk",
    },
    {
      round: "RD 02",
      name: "IAME Euro Series - Genk",
      track: "Karting Genk 'Home of Champions'",
      country: "BELGIQUE",
      date: "17-19 AVRIL 2026",
      status: "PODIUM P2",
      highlight: false,
      circuitType: "portimao",
    },
    {
      round: "RD 03",
      name: "IAME Series Benelux - Spa-Francorchamps",
      track: "Circuit de Spa-Francorchamps Karting",
      country: "BELGIQUE",
      date: "15-17 MAI 2026",
      status: "PROCHAINE COURSE",
      highlight: true,
      nextRace: true,
      circuitType: "sarno",
    },
    {
      round: "RD 04",
      name: "Eurocup IAME - Le Mans",
      track: "Circuit International de Karting du Mans",
      country: "FRANCE",
      date: "12-14 JUIN 2026",
      status: "CONFIRMÉ",
      highlight: false,
      circuitType: "wackersdorf",
    },
  ];

  const partners = [
    { name: "CARLIFE CARROSSERIE", tier: "Partenaire Majeur", category: "Soutien Technique & Préparation", role: "Partenaire fidèle de la première heure de Doudou" },
    { name: "LAURENTY SERVICES", tier: "Partenaire Titre", category: "Groupe Multi-Services & Propreté", role: "Accompagnement du projet sportif Benelux & Europe" },
    { name: "AFT & ALUMATIC", tier: "Partenaire Industriel", category: "Châssis & Équipements de pointe", role: "Soutien aux compétitions internationales IAME" },
    { name: "IDEALARME SRL", tier: "Partenaire Sécurité", category: "Protection & Télémétrie", role: "Partenaire officiel de la saison Doudou Racing" },
    { name: "ENTREPRISE DEREY", tier: "Partenaire Entreprise", category: "Génie Civil & Construction", role: "Engagement pour la jeunesse et le sport automobile" },
    { name: "FIDUCIAIRE KRZEWINSKI", tier: "Partenaire Conseil", category: "Gestion & Fiscalité Sportive", role: "Structure et accompagnement de carrière" },
  ];

  return (
    <div className="bg-[#07090e] text-[#f1f5f9] selection:bg-[#e10600] selection:text-white min-h-screen relative overflow-x-clip font-sans">
      {/* 1. SCÈNE DU CIRCUIT EN SCROLLYTELLING // LE KART EFFECTUE LE TOUR */}
      <CircuitMapHeroCanvas />

      {/* TOP BAR MOTORSPORT FIXE */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#07090e]/85 backdrop-blur-md border-b border-[#1b2533] px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="bg-[#e10600] text-white font-mono font-black text-[11px] sm:text-xs px-2 sm:px-2.5 py-0.5 tracking-tighter">
            #105
          </span>
          <span className="font-mono tracking-widest text-xs sm:text-sm font-bold uppercase text-white group-hover:text-[#e10600] transition-colors truncate">
            EDOUARD GODFROID &bull; DOUDOU
          </span>
        </Link>

        <div className="flex items-center gap-4 font-mono text-xs">
          <span className="hidden md:inline text-[#64748b] tracking-wider">CHAMPION DE BELGIQUE 2023 &bull; TEAM EUROKARTING</span>
          <Link
            href="/admin"
            className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 border border-[#1e293b] hover:border-[#e10600] text-[#94a3b8] hover:text-white bg-[#0c1017]/90 transition-all text-[11px] sm:text-xs shrink-0"
          >
            ÉCURIE &rarr;
          </Link>
        </div>
      </header>

      {/* =========================================================
          SECTEUR 0 : HERO / GRID LAUNCH (0% Scroll)
          ========================================================= */}
      <section className="relative min-h-screen flex flex-col justify-end md:justify-center px-4 sm:px-6 md:px-16 z-20 pointer-events-none pb-12 md:pb-0">
        <div className="max-w-2xl space-y-4 sm:space-y-6 pt-16 pointer-events-auto bg-[#07090e]/80 md:bg-transparent p-4 sm:p-6 md:p-0 border border-[#1b2533] md:border-0 backdrop-blur-md md:backdrop-blur-none">
          <div className="inline-flex items-center gap-2 bg-[#0c1017]/90 border border-[#1b2533] px-3 py-1 font-mono text-[10px] sm:text-[11px] text-[#e10600]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e10600] animate-ping"></span>
            <span className="font-bold tracking-wider">CHAMPION DE BELGIQUE DE KARTING &bull; #105</span>
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-9xl font-black uppercase tracking-tighter leading-[0.88] text-white">
            EDOUARD <br />
            <span className="text-[#e10600]">« DOUDOU »</span>
          </h1>

          <p className="font-mono text-xs sm:text-sm text-[#94a3b8] leading-relaxed max-w-lg">
            Né en 2012 à Charleroi, Edouard Godfroid est sacré Champion de Belgique en catégorie Mini. 
            Embarquez à bord du kart #105 pour vivre son tour chrono.
          </p>

          <div className="border-l-2 border-[#e10600] pl-3 py-1 font-mono text-xs text-[#94a3b8] italic hidden sm:block">
            &laquo; Les sensations fortes ne sont pas dans la Victoire mais dans le combat. &raquo;
            <span className="block text-[10px] text-white not-italic font-bold mt-0.5">— Michael Schumacher</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 font-mono text-xs text-white pt-1">
            <ChevronDown className="w-4 h-4 animate-bounce text-[#e10600]" />
            <span className="tracking-widest text-[#94a3b8] text-[10px] sm:text-xs">SCROLLEZ POUR SUIVRE LE TOUR SUR LA PISTE</span>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTEUR 1 : CARTE LICENCE OFFICIELLE CIK-FIA (~20% Scroll)
          ========================================================= */}
      <section className="relative min-h-screen flex items-end md:items-center justify-start px-4 sm:px-6 md:px-16 z-20 pointer-events-none pb-12 md:pb-0">
        <div className="max-w-xl w-full pointer-events-auto bg-[#0c1017]/95 border border-[#1e293b] p-4 sm:p-6 backdrop-blur-md shadow-2xl space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-2 sm:pb-3">
            <div className="flex items-center gap-2">
              <span className="bg-[#e10600] text-white font-mono font-black text-[9px] sm:text-[10px] px-2 py-0.5">
                RACER ID
              </span>
              <span className="font-mono text-[11px] sm:text-xs text-white font-bold tracking-wider">
                CIK-FIA & RACB LICENCE
              </span>
            </div>
            <span className="font-mono text-[9px] sm:text-[10px] text-[#64748b]">VALID: 2026</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-start">
            <div className="relative w-28 sm:w-36 h-36 sm:h-44 shrink-0 border border-[#1e293b] bg-[#07090e] overflow-hidden group">
              <Image
                src="/doudou-hero.png"
                alt="Edouard Godfroid Doudou Racing"
                fill
                className="object-cover object-top contrast-110 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-transparent to-transparent opacity-75" />
              <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between font-mono text-[8px] sm:text-[9px]">
                <span className="text-white font-bold tracking-tighter">#105 DOUDOU</span>
                <span className="text-[#e10600] font-black">CHAMPION</span>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3 flex-1">
              <div>
                <span className="text-[9px] sm:text-[10px] font-mono text-[#e10600] font-bold block uppercase tracking-widest">
                  PILOTE OFFICIEL BELGE
                </span>
                <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white leading-tight">
                  Edouard Godfroid
                </h2>
                <span className="text-[11px] sm:text-xs font-mono text-[#94a3b8] block mt-0.5">
                  « Doudou » &bull; Né le 05/01/2012 (Charleroi)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono text-[10px] sm:text-[11px] pt-1">
                <div className="p-1.5 sm:p-2 border border-[#1e293b] bg-[#07090e]">
                  <span className="text-[#64748b] text-[8px] sm:text-[9px] block uppercase">Écurie</span>
                  <span className="text-white font-bold truncate block">Team Eurokarting</span>
                </div>
                <div className="p-1.5 sm:p-2 border border-[#1e293b] bg-[#07090e]">
                  <span className="text-[#64748b] text-[8px] sm:text-[9px] block uppercase">Circuit Test</span>
                  <span className="text-[#e10600] font-bold truncate block">Mariembourg</span>
                </div>
              </div>

              <p className="font-mono text-[11px] sm:text-xs text-[#94a3b8] leading-relaxed">
                Premier volant à 4 ans à Montigny-le-Tilleul. Formé par Jonathan Dhaese, il s&apos;impose au sommet du Benelux avec le titre 2023.
              </p>
            </div>
          </div>

          <div className="pt-2 sm:pt-3 border-t border-[#1e293b] flex items-center justify-between font-mono text-[10px] sm:text-xs text-[#64748b]">
            <span className="flex items-center gap-1 text-white">
              <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#e10600]" />
              HOMOLOGATION CIK-FIA JUNIOR
            </span>
            <span className="text-[#e10600] font-bold">KART #105</span>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTEUR 2 : LIVE TIMING BOARD OFFICIEL GRAND PRIX (~40% Scroll)
          ========================================================= */}
      <section className="relative min-h-screen flex items-end md:items-center justify-end px-4 sm:px-6 md:px-16 z-20 pointer-events-none pb-12 md:pb-0">
        <div className="max-w-xl w-full space-y-3 sm:space-y-4 pointer-events-auto bg-[#0c1017]/95 border border-[#1e293b] p-4 sm:p-6 backdrop-blur-md shadow-2xl font-mono">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-2 sm:pb-3 text-xs">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="w-2 h-2 rounded-full bg-[#e10600] animate-pulse" />
              <span className="text-white font-bold tracking-wider text-[11px] sm:text-xs">OFFICIAL TIMING BOARD</span>
            </div>
            <span className="text-[#e10600] font-bold text-[11px] sm:text-xs">IAME BENELUX</span>
          </div>

          <div>
            <span className="text-[9px] sm:text-[10px] text-[#64748b] uppercase tracking-widest block">HISTORIQUE DES CHRONOS</span>
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white font-sans">
              Palmarès & Temps Officiels
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1e293b] text-[8px] sm:text-[9px] text-[#64748b] uppercase">
                  <th className="py-1.5 sm:py-2">AN</th>
                  <th className="py-1.5 sm:py-2">TITRE</th>
                  <th className="py-1.5 sm:py-2 text-center">S1</th>
                  <th className="py-1.5 sm:py-2 text-right">RÉSULTAT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]">
                {trophies.map((t, idx) => (
                  <tr key={idx} className="hover:bg-[#111824]/50 transition-colors">
                    <td className="py-2 font-bold text-[#e10600] text-[11px] sm:text-xs">{t.year}</td>
                    <td className="py-2">
                      <span className="text-white font-bold block text-[11px] sm:text-xs">{t.title}</span>
                      <span className="text-[9px] sm:text-[10px] text-[#64748b]">{t.track}</span>
                    </td>
                    <td className="py-2 text-center text-[#94a3b8] text-[10px] sm:text-xs">{t.s1}</td>
                    <td className="py-2 text-right font-black text-white text-[10px] sm:text-xs">{t.gap}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 sm:pt-3 border-t border-[#1e293b] text-[10px] sm:text-[11px] text-[#94a3b8] flex items-center justify-between">
            <div>
              <Quote className="w-3 h-3 text-[#e10600] inline mr-1" />
              &laquo; Soit je gagne, soit j&apos;apprends. &raquo;
            </div>
            <span className="text-[9px] sm:text-[10px] text-white font-bold">— Nelson Mandela</span>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTEUR 3 : FICHE HOMOLOGATION DE COURSE (~60% Scroll)
          ========================================================= */}
      <section className="relative min-h-screen flex items-end md:items-center justify-start px-4 sm:px-6 md:px-16 z-20 pointer-events-none pb-12 md:pb-0">
        <div className="max-w-xl w-full pointer-events-auto bg-[#0c1017]/95 border border-[#1e293b] p-4 sm:p-6 backdrop-blur-md shadow-2xl space-y-3 sm:space-y-4 font-mono">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-2 sm:pb-3 text-xs">
            <span className="text-[#2563eb] font-bold flex items-center gap-1.5 text-[11px] sm:text-xs">
              <Cpu className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              HOMOLOGATION N°105
            </span>
            <span className="text-[#64748b] text-[10px] sm:text-xs">ATELIER EUROKARTING</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-center">
            <div className="relative w-full sm:w-44 h-32 sm:h-44 shrink-0 border border-[#1e293b] bg-[#07090e] overflow-hidden group">
              <Image
                src="/doudou-action-genk.jpg"
                alt="Edouard Godfroid en pleine course à Genk"
                fill
                className="object-cover contrast-115 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-transparent to-transparent opacity-70" />
              <div className="absolute top-1.5 left-2 bg-[#2563eb] text-white text-[8px] sm:text-[9px] px-1.5 py-0.5 uppercase font-bold">
                GENK RD 05
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2 flex-1">
              <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white font-sans leading-tight">
                Précision à 16 000 Tr/min
              </h2>
              <p className="text-[11px] sm:text-xs text-[#94a3b8] leading-relaxed">
                Après le titre national en Mini, Edouard prépare l&apos;accession en catégorie Junior. Châssis affûté par Eurokarting et pneus slick Komet tendres.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs pt-1">
            <div className="p-1.5 sm:p-2 border border-[#1e293b] bg-[#07090e]">
              <span className="text-[#64748b] text-[8px] sm:text-[9px] block uppercase">Châssis</span>
              <span className="text-xs sm:text-sm font-bold text-white block truncate">Eurokarting 28</span>
            </div>
            <div className="p-1.5 sm:p-2 border border-[#1e293b] bg-[#07090e]">
              <span className="text-[#64748b] text-[8px] sm:text-[9px] block uppercase">Moteur</span>
              <span className="text-xs sm:text-sm font-bold text-[#2563eb] block truncate">IAME X30</span>
            </div>
            <div className="p-1.5 sm:p-2 border border-[#1e293b] bg-[#07090e]">
              <span className="text-[#64748b] text-[8px] sm:text-[9px] block uppercase">Télémétrie</span>
              <span className="text-xs sm:text-sm font-bold text-[#e10600] block truncate">MyChron 5S</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTEUR 4 : TÉLÉMÉTRIE & CHRONO DU TOUR RECORD (~80% Scroll)
          ========================================================= */}
      <section className="relative min-h-screen flex items-end md:items-center justify-end px-4 sm:px-6 md:px-16 z-20 pointer-events-none pb-12 md:pb-0">
        <div className="max-w-lg w-full space-y-3 sm:space-y-4 pointer-events-auto bg-[#0c1017]/95 border border-[#1e293b] p-4 sm:p-6 backdrop-blur-md shadow-2xl font-mono">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-2 sm:pb-3 text-xs">
            <span className="text-[#e10600] font-bold flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
              <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              LIVE TELEMETRY ACQUISITION
            </span>
            <span className="text-[#64748b] text-[10px] sm:text-xs">LAP RECORD</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-bold uppercase tracking-tight text-white font-sans">
            00:54.108 &bull; POLE
          </h2>

          <p className="text-[11px] sm:text-xs text-[#94a3b8] leading-relaxed">
            Chaque millième de seconde est traqué par acquisition de données Alfano / Unipro au tour près.
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1 sm:pt-2">
            {telemetryStats.map((s, idx) => (
              <div key={idx} className="p-2 sm:p-3 border border-[#1e293b] bg-[#07090e]">
                <span className="text-[#64748b] text-[8px] sm:text-[9px] block uppercase">{s.label}</span>
                <span className="text-lg sm:text-2xl font-black text-white block mt-0.5 font-sans">
                  {s.value} <span className="text-[9px] sm:text-[10px] text-[#e10600] font-mono">{s.unit}</span>
                </span>
                <span className="text-[#94a3b8] text-[8px] sm:text-[9px] block mt-0.5 sm:mt-1 truncate">{s.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          ACTE 5 : CALENDRIER DES COURSES DU BENELUX & EUROPE (100% Scroll)
          ========================================================= */}
      <section className="relative min-h-screen flex flex-col justify-end md:justify-center px-4 sm:px-6 md:px-16 z-20 pointer-events-none py-16 md:py-20">
        <div className="max-w-2xl space-y-4 sm:space-y-6 pointer-events-auto bg-[#0c1017]/95 border border-[#1b2533] p-4 sm:p-8 shadow-2xl backdrop-blur-md font-mono">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#e10600] tracking-widest uppercase flex items-center gap-1.5 sm:gap-2 font-bold text-[10px] sm:text-xs">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>CHAMPIONNATS BENELUX & EUROPE</span>
            </span>
            <span className="text-[#64748b] text-[10px] sm:text-xs">SAISON 2026</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white font-sans">
            Calendrier Officiel des Courses
          </h2>

          <p className="text-[11px] sm:text-xs text-[#94a3b8]">
            Suivez Edouard Godfroid sur les circuits de Belgique, France et d&apos;Europe.
          </p>

          <div className="divide-y divide-[#1b2533] border-y border-[#1b2533]">
            {calendarEvents.map((evt, i) => (
              <div key={i} className="py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 p-0.5 bg-[#07090e] border border-[#1e293b] shrink-0">
                    <CircuitMapSVG type={evt.circuitType} className="w-full h-full" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-white font-sans truncate max-w-[170px] sm:max-w-none">{evt.name}</h4>
                    <span className="text-[10px] sm:text-xs text-[#94a3b8] block truncate max-w-[170px] sm:max-w-none">
                      {evt.track} ({evt.country})
                    </span>
                  </div>
                </div>

                <div className="text-xs flex items-center gap-2 sm:gap-3 shrink-0">
                  <span className="text-[#64748b] hidden md:inline text-[11px] sm:text-xs">{evt.date}</span>
                  <span
                    className={`px-2 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-bold uppercase ${
                      evt.status.includes("P1")
                        ? "bg-[#e10600] text-white"
                        : evt.status.includes("P2")
                        ? "bg-[#2563eb] text-white"
                        : "border border-[#e10600] text-[#e10600]"
                    }`}
                  >
                    {evt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          ACTE 6 : LES PARTENAIRES OFFICIELS & FORMULAIRE ÉCURIE
          ========================================================= */}
      <section className="relative min-h-screen flex flex-col justify-end md:justify-between px-4 sm:px-6 md:px-16 py-16 md:py-20 z-20 pointer-events-none">
        <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-6 pt-10 pointer-events-auto bg-[#07090e]/85 md:bg-transparent p-4 sm:p-6 md:p-0 border border-[#1b2533] md:border-0 backdrop-blur-md md:backdrop-blur-none">
          <div className="inline-flex items-center gap-2 bg-[#e10600] text-white font-mono font-bold text-[10px] sm:text-xs px-3 py-1 uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>PARTENAIRES OFFICIELS &bull; DOUDOU RACING</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white">
            Ils Soutiennent Edouard.
          </h2>

          <p className="font-mono text-xs sm:text-sm text-[#94a3b8] max-w-xl mx-auto leading-relaxed">
            De ses premières accélérations jusqu&apos;au titre de Champion de Belgique, ces entreprises font vibrer la passion automobile aux côtés de Doudou.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3 pt-4 sm:pt-6 text-left font-mono">
            {partners.map((sp, idx) => (
              <div key={idx} className="p-3 sm:p-4 border border-[#1e293b] bg-[#0c1017]/95 hover:border-[#e10600] transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] sm:text-[10px] uppercase text-[#e10600] font-bold block">{sp.tier}</span>
                  <span className="text-[8px] sm:text-[9px] text-[#64748b]">{sp.category}</span>
                </div>
                <span className="font-bold text-xs sm:text-sm text-white mt-1 block font-sans">{sp.name}</span>
                <p className="text-[9px] sm:text-[10px] text-[#94a3b8] mt-0.5 sm:mt-1">{sp.role}</p>
              </div>
            ))}
          </div>

          <div className="pt-6 sm:pt-8 flex flex-wrap justify-center gap-3 sm:gap-4 font-mono">
            <Link
              href="/admin"
              className="px-5 sm:px-6 py-2.5 sm:py-3 bg-[#e10600] text-white font-bold text-[11px] sm:text-xs uppercase tracking-wider hover:bg-[#ff2a2a] transition-colors shadow-lg shadow-red-950/40"
            >
              Console Back-Office Écurie
            </Link>
            <a
              href="mailto:contact@doudouracing.be?subject=Partenariat%20Saison%202026%20Edouard%20Godfroid"
              className="px-5 sm:px-6 py-2.5 sm:py-3 border border-[#1e293b] bg-[#07090e] text-white text-[11px] sm:text-xs uppercase tracking-wider hover:border-[#2563eb] hover:text-[#2563eb] transition-colors flex items-center gap-2"
            >
              <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2563eb]" />
              <span>Devenir Partenaire</span>
            </a>
          </div>
        </div>

        <footer className="w-full border-t border-[#1b2533] pt-6 sm:pt-8 mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-[10px] sm:text-xs text-[#64748b] pointer-events-auto">
          <span>EDOUARD GODFROID « DOUDOU » #105 &bull; CHAMPION DE BELGIQUE 2023</span>
          <span className="text-[#e10600] font-bold">DOUDOURACING.BE &bull; ONBOARD SCROLLYTELLING</span>
        </footer>
      </section>
    </div>
  );
}
