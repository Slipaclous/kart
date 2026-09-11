import Link from "next/link";
import Image from "next/image";
import { Download, ChevronDown, Award, Zap, Disc3, Compass, Trophy, Calendar, Flag, User, ShieldCheck } from "lucide-react";
import CircuitMapHeroCanvas from "@/components/CircuitMapHeroCanvas";
import CircuitMapSVG from "@/components/CircuitMapSVG";

export default function HomePage() {
  const telemetryStats = [
    { label: "RÉGIME MOTEUR", value: "15 200", unit: "TR/MIN", detail: "TM Racing 125cc à boîte séquentielle" },
    { label: "0 À 100 KM/H", value: "3.1 s", unit: "DÉPART ARRÊTÉ", detail: "Pneus Vega XM3 Prime" },
    { label: "GRIP LATÉRAL", value: "2.85 G", unit: "COURBE APEX", detail: "Châssis Birel ART 25CrMo4" },
    { label: "POIDS TOTAL", value: "175 kg", unit: "AVEC PILOTE", detail: "Poids minimum réglementaire FIA" },
  ];

  const trophies = [
    { year: "2025", title: "Champion de France KZ2", org: "FFSA Karting", track: "Laval & Varennes", badge: "TITRE NATIONAL" },
    { year: "2025", title: "Vainqueur WSK Euro Series", org: "WSK Promotion", track: "Sarno (Italie)", badge: "P1 INTERNATIONAL" },
    { year: "2024", title: "Vice-Champion d'Europe OK-Junior", org: "FIA Karting", track: "Portimao & Genk", badge: "VICE-CHAMPION" },
    { year: "2023", title: "Champion National Cadet", org: "FFSA Karting", track: "Angerville", badge: "ROOKIE DE L'ANNÉE" },
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
      name: "IAME Euro Series - Genk",
      track: "Karting Genk 'Home of Champions'",
      country: "BELGIQUE",
      date: "28-30 MARS 2026",
      status: "VICTOIRE P1",
      highlight: true,
      circuitType: "genk",
    },
    {
      round: "RD 02",
      name: "Champions of the Future - Portimao",
      track: "Kartódromo Internacional do Algarve",
      country: "PORTUGAL",
      date: "17-19 AVRIL 2026",
      status: "PODIUM P2",
      highlight: false,
      circuitType: "portimao",
    },
    {
      round: "RD 03",
      name: "FIA Karting European Championship",
      track: "Circuito Internazionale Napoli (Sarno)",
      country: "ITALIE",
      date: "15-17 MAI 2026",
      status: "PROCHAINE COURSE",
      highlight: true,
      nextRace: true,
      circuitType: "sarno",
    },
    {
      round: "RD 04",
      name: "Rotax Max Euro Trophy",
      track: "Wackersdorf Prokart Raceland",
      country: "ALLEMAGNE",
      date: "12-14 JUIN 2026",
      status: "CONFIRMÉ",
      highlight: false,
      circuitType: "wackersdorf",
    },
  ];

  const partners = [
    { name: "CORSE RACING LAB", tier: "Partenaire Titre", category: "Acquisition de Données & Télémétrie", role: "Optimisation des réglages châssis en temps réel" },
    { name: "VEGA TYRES MOTORSPORT", tier: "Fournisseur Officiel", category: "Pneumatiques & Trains Roulants", role: "Gommes slicks XM3 Prime homologuées FIA" },
    { name: "BIREL ART TECHNOLOGY", tier: "Constructeur Châssis", category: "Structure Acier 25CrMo4", role: "Châssis d'usine officiel catégorie KZ" },
    { name: "UNLEASHED DATA LAB", tier: "Partenaire Performance", category: "Préparation Physique & Data", role: "Biométrie, temps de réaction et cardio 180 bpm" },
  ];

  return (
    <div className="bg-[#07090e] text-[#f1f5f9] selection:bg-[#e10600] selection:text-white min-h-screen relative overflow-x-clip font-sans">
      {/* 1. SCÈNE DU CIRCUIT EN SCROLLYTELLING // LE KART EFFECTUE LE TOUR */}
      <CircuitMapHeroCanvas />

      {/* TOP BAR MOTORSPORT FIXE */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#07090e]/85 backdrop-blur-md border-b border-[#1b2533] px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="bg-[#e10600] text-white font-mono font-black text-xs px-2.5 py-0.5 tracking-tighter">
            #42
          </span>
          <span className="font-mono tracking-widest text-sm font-bold uppercase text-white group-hover:text-[#e10600] transition-colors">
            LIAM MOREAU &bull; KZ RACING
          </span>
        </Link>

        <div className="flex items-center gap-4 font-mono text-xs">
          <span className="hidden sm:inline text-[#64748b] tracking-wider">CHAMPION DE FRANCE KZ2 &bull; BIREL ART FACTORY</span>
          <Link
            href="/admin"
            className="px-3.5 py-1.5 border border-[#1e293b] hover:border-[#e10600] text-[#94a3b8] hover:text-white bg-[#0c1017]/90 transition-all"
          >
            ESPACE ÉCURIE &rarr;
          </Link>
        </div>
      </header>

      {/* =========================================================
          SECTEUR 0 : HERO / GRID LAUNCH (0% Scroll)
          ========================================================= */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-16 z-20 pointer-events-none">
        <div className="max-w-2xl space-y-6 pt-16 pointer-events-auto">
          <div className="inline-flex items-center gap-2 bg-[#0c1017]/90 border border-[#1b2533] px-3.5 py-1.5 font-mono text-[11px] text-[#e10600]">
            <span className="w-2 h-2 rounded-full bg-[#e10600] animate-ping"></span>
            <span className="font-bold tracking-wider">PILOTE ESPOIR FIA KARTING &bull; CATÉGORIE REINE KZ</span>
          </div>

          <h1 className="text-6xl sm:text-7xl md:text-9xl font-black uppercase tracking-tighter leading-[0.88] text-white">
            LIAM <br />
            <span className="text-[#e10600]">MOREAU</span>
          </h1>

          <p className="font-mono text-xs sm:text-sm text-[#94a3b8] leading-relaxed max-w-lg">
            16 ans, Champion de France KZ2 en titre et engagé sur le Championnat d&apos;Europe FIA Karting.
            Embarquez à bord du kart #42 pour vivre un tour de qualification en immersion totale.
          </p>

          <div className="flex items-center gap-3 font-mono text-xs text-white pt-4">
            <ChevronDown className="w-4 h-4 animate-bounce text-[#e10600]" />
            <span className="tracking-widest text-[#94a3b8]">SCROLLEZ POUR SUIVRE LE TOUR CHRONO SUR LA PISTE</span>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTEUR 1 : L'HISTOIRE DU CHAMPION (~20% Scroll)
          ========================================================= */}
      <section className="relative min-h-screen flex items-center justify-start px-6 md:px-16 z-20 pointer-events-none">
        <div className="max-w-xl pointer-events-auto bg-[#0c1017]/95 border-l-4 border-l-[#e10600] border-y border-r border-[#1b2533] p-6 backdrop-blur-md shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row gap-5 items-center">
            {/* PORTRAIT MOTORSPORT OFFICIEL DU PILOTE */}
            <div className="relative w-28 h-36 sm:w-32 sm:h-40 shrink-0 border border-[#1e293b] bg-[#07090e] overflow-hidden group">
              <Image
                src="/driver-hero.jpg"
                alt="Liam Moreau Pilote Officiel"
                fill
                className="object-cover object-top contrast-115 grayscale group-hover:grayscale-0 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between font-mono text-[9px]">
                <span className="text-white font-bold tracking-tighter">#42 MOREAU</span>
                <span className="text-[#e10600] font-black">KZ2</span>
              </div>
            </div>

            {/* DÉTAILS BIO */}
            <div className="space-y-2 flex-1">
              <div className="font-mono text-[11px] text-[#e10600] tracking-widest uppercase flex items-center gap-2 font-bold">
                <User className="w-3.5 h-3.5" />
                <span>BIO &bull; DE LA PISTE LOCALE À L&apos;EUROPE</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white leading-tight">
                La Rage de Vaincre depuis l&apos;Âge de 7 Ans
              </h2>

              <p className="font-mono text-xs text-[#94a3b8] leading-relaxed">
                Débuté en catégorie Minime, Liam a gravi tous les échelons du karting de vitesse. 
                Aujourd&apos;hui en KZ, il allie rigueur analytique des datas télémétriques et agressivité propre sur la piste.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-[#1e293b] flex items-center justify-between font-mono text-xs text-[#64748b]">
            <span>ÂGE : 16 ANS</span>
            <span>NATIONALITÉ : FRANÇAISE</span>
            <span className="text-[#e10600] font-bold">LICENCE FIA INT-B</span>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTEUR 2 : PALMARÈS & TITRES MAJEURS (~40% Scroll)
          ========================================================= */}
      <section className="relative min-h-screen flex items-center justify-end px-6 md:px-16 z-20 pointer-events-none">
        <div className="max-w-lg space-y-4 pointer-events-auto bg-[#0c1017]/95 border-l-4 border-l-[#e10600] border-y border-r border-[#1b2533] p-6 backdrop-blur-md shadow-2xl">
          <div className="font-mono text-[11px] text-[#e10600] tracking-widest uppercase flex items-center gap-2 font-bold">
            <Trophy className="w-3.5 h-3.5" />
            <span>PALMARÈS &bull; LES TITRES DU CHAMPION</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white">
            Palmarès Officiel FFSA & FIA
          </h2>

          <div className="divide-y divide-[#1e293b] border-y border-[#1e293b] font-mono text-xs">
            {trophies.map((t, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                <div>
                  <span className="text-white font-bold block">{t.title}</span>
                  <span className="text-[10px] text-[#64748b]">{t.org} &bull; {t.track}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[#e10600] font-bold block">{t.year}</span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-[#e10600]/15 text-[#e10600] border border-[#e10600]/30 font-bold">
                    {t.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTEUR 3 : LA MACHINE DE COURSE KZ (~60% Scroll)
          ========================================================= */}
      <section className="relative min-h-screen flex items-center justify-start px-6 md:px-16 z-20 pointer-events-none">
        <div className="max-w-xl pointer-events-auto bg-[#0c1017]/95 border-l-4 border-l-[#2563eb] border-y border-r border-[#1b2533] p-6 backdrop-blur-md shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row gap-5 items-center">
            {/* PHOTO D'ACTION DE PISTE EN CONDITIONS RÉELLES */}
            <div className="relative w-full sm:w-44 h-32 sm:h-40 shrink-0 border border-[#1e293b] bg-[#07090e] overflow-hidden group">
              <Image
                src="/track-action.jpg"
                alt="Karting en attaque sur vibreur"
                fill
                className="object-cover contrast-125 grayscale group-hover:grayscale-0 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-transparent to-transparent opacity-70" />
              <div className="absolute top-1.5 left-2 bg-[#2563eb] text-white font-mono font-bold text-[9px] px-1.5 py-0.5 uppercase">
                ON TRACK
              </div>
            </div>

            {/* SPÉCIFICATIONS TECHNIQUES */}
            <div className="space-y-2 flex-1">
              <div className="font-mono text-[11px] text-[#2563eb] tracking-widest uppercase flex items-center gap-2 font-bold">
                <Zap className="w-3.5 h-3.5" />
                <span>LE MONSTRE &bull; BIREL ART CRY30-S16 KZ</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white leading-tight">
                50 Ch &bull; Boîte Séquentielle 6
              </h2>

              <p className="font-mono text-xs text-[#94a3b8] leading-relaxed">
                Châssis tubulaire 30mm en acier 25CrMo4. Passage des rapports à la volée en 40 ms sans embrayage, 139 km/h à 3 cm du sol.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 font-mono text-xs pt-1">
            <div className="p-2.5 border border-[#1e293b] bg-[#07090e]">
              <span className="text-[#64748b] text-[9px] block uppercase">Freinage</span>
              <span className="text-sm font-bold text-white">3 disques ventilés</span>
            </div>
            <div className="p-2.5 border border-[#1e293b] bg-[#07090e]">
              <span className="text-[#64748b] text-[9px] block uppercase">Pneumatiques</span>
              <span className="text-sm font-bold text-[#2563eb]">Vega XM3 Slick</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTEUR 4 : CHRONO & POLE RECORD DU TOUR (~80% Scroll)
          ========================================================= */}
      <section className="relative min-h-screen flex items-center justify-end px-6 md:px-16 z-20 pointer-events-none">
        <div className="max-w-lg space-y-4 pointer-events-auto bg-[#0c1017]/95 border-l-4 border-l-[#e10600] border-y border-r border-[#1b2533] p-6 backdrop-blur-md shadow-2xl">
          <div className="font-mono text-[11px] text-[#e10600] tracking-widest uppercase flex items-center gap-2 font-bold">
            <Flag className="w-3.5 h-3.5" />
            <span>LIGNE DROITE &bull; TEMPS RECORD OFFICIEL</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight text-white">
            00:54.108 &bull; POLE POSITION
          </h2>

          <p className="font-mono text-xs text-[#94a3b8] leading-relaxed">
            Chaque millième compte. Télémétrie d&apos;acquisition AIM Mychron 5S synchronisée au virage près.
          </p>

          <div className="grid grid-cols-2 gap-2 font-mono text-xs pt-2">
            {telemetryStats.map((s, idx) => (
              <div key={idx} className="p-2.5 border border-[#1e293b] bg-[#07090e]">
                <span className="text-[#64748b] text-[9px] block uppercase">{s.label}</span>
                <span className="text-xl font-black text-white block mt-0.5">
                  {s.value} <span className="text-[10px] text-[#e10600]">{s.unit}</span>
                </span>
                <span className="text-[#94a3b8] text-[9px]">{s.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          ACTE 5 : CALENDRIER DES PROCHAINS RENDEZ-VOUS (100% Scroll)
          ========================================================= */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-16 z-20 pointer-events-none py-20">
        <div className="max-w-2xl space-y-6 pointer-events-auto bg-[#0c1017]/95 border border-[#1b2533] p-8 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-[#e10600] tracking-widest uppercase flex items-center gap-2 font-bold">
              <Calendar className="w-4 h-4" />
              <span>CHAMPIONNAT D&apos;EUROPE FIA KARTING</span>
            </span>
            <span className="text-[#64748b]">SAISON 2026</span>
          </div>

          <h2 className="text-3xl font-bold uppercase tracking-tight text-white">
            Prochains Rendez-vous en Piste
          </h2>

          <p className="font-mono text-xs text-[#94a3b8]">
            Retrouvez Liam Moreau sur les tracés les plus redoutés du continent européen.
          </p>

          <div className="divide-y divide-[#1b2533] border-y border-[#1b2533]">
            {calendarEvents.map((evt, i) => (
              <div key={i} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 p-0.5 bg-[#07090e] border border-[#1e293b] shrink-0">
                    <CircuitMapSVG type={evt.circuitType} className="w-full h-full" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{evt.name}</h4>
                    <span className="text-xs font-mono text-[#94a3b8] block">
                      {evt.track} ({evt.country})
                    </span>
                  </div>
                </div>

                <div className="font-mono text-xs flex items-center gap-3">
                  <span className="text-[#64748b] hidden sm:inline">{evt.date}</span>
                  <span
                    className={`px-2.5 py-1 text-[10px] font-bold uppercase ${
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
          ACTE 6 : LES SPONSORS & PARTENAIRES OFFICIELS
          ========================================================= */}
      <section className="relative min-h-screen flex flex-col justify-between px-6 md:px-16 py-20 z-20 pointer-events-none">
        <div className="max-w-3xl mx-auto text-center space-y-6 pt-10 pointer-events-auto">
          <div className="inline-flex items-center gap-2 bg-[#e10600] text-white font-mono font-bold text-xs px-3.5 py-1.5 uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>PARTENARIATS OFFICIELS &bull; PROGRAMME JEUNES PILOTES 2026</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white">
            Ils Soutiennent Liam Moreau.
          </h2>

          <p className="font-mono text-xs sm:text-sm text-[#94a3b8] max-w-xl mx-auto leading-relaxed">
            Accompagner un jeune champion vers le sport automobile de haut niveau (Formule 4 / FRECA).
            Découvrez nos partenaires techniques et sponsors majeurs.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6 text-left">
            {partners.map((sp, idx) => (
              <div key={idx} className="p-4 border border-[#1e293b] bg-[#0c1017]/95 hover:border-[#e10600] transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase text-[#e10600] font-bold block">{sp.tier}</span>
                  <span className="font-mono text-[9px] text-[#64748b]">{sp.category}</span>
                </div>
                <span className="font-bold text-base text-white mt-1 block">{sp.name}</span>
                <p className="font-mono text-[11px] text-[#94a3b8] mt-1">{sp.role}</p>
              </div>
            ))}
          </div>

          <div className="pt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/admin"
              className="px-6 py-3 bg-[#e10600] text-white font-mono font-bold text-xs uppercase tracking-wider hover:bg-[#ff2a2a] transition-colors shadow-lg shadow-red-950/40"
            >
              Console Back-Office Écurie
            </Link>
            <a
              href="#"
              className="px-6 py-3 border border-[#1e293b] bg-[#07090e] text-white font-mono text-xs uppercase tracking-wider hover:border-[#2563eb] hover:text-[#2563eb] transition-colors flex items-center gap-2"
            >
              <span>Dossier Sponsoring 2026 (PDF)</span>
              <Download className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Footer Motorsport */}
        <footer className="w-full border-t border-[#1b2533] pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs text-[#64748b] pointer-events-auto">
          <span>LIAM MOREAU #42 &bull; ATHLÈTE OFFICIEL FIA KARTING &bull; CATÉGORIE REINE KZ</span>
          <span className="text-[#e10600] font-bold">CHAMPIONNAT D&apos;EUROPE 2026 &bull; SCROLLYTELLING CIRCUIT</span>
        </footer>
      </section>
    </div>
  );
}
