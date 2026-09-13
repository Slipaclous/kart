import Link from "next/link";
import Image from "next/image";
import { Download, ChevronDown, Award, Zap, Disc3, Compass, Trophy, Calendar, Flag, User, ShieldCheck, Quote } from "lucide-react";
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
    { year: "2023", title: "Champion de Belgique", org: "IAME Series Benelux", track: "Catégorie Mini", badge: "TITRE NATIONAL" },
    { year: "2022", title: "Vice-Champion Benelux", org: "IAME Series Benelux", track: "Mariembourg & Genk", badge: "PODIUM GÉNÉRAL" },
    { year: "2021", title: "Top 3 Mini Rookie", org: "IAME Series Benelux & Euro Series", track: "Genk, Mariembourg & Le Mans", badge: "CHALLENGER TOP 3" },
    { year: "2019", title: "1er Trophée Endurance", org: "BSK Frasnes", track: "Victoire Course d'Endurance", badge: "PREMIER SUCCÈS" },
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
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#07090e]/85 backdrop-blur-md border-b border-[#1b2533] px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="bg-[#e10600] text-white font-mono font-black text-xs px-2.5 py-0.5 tracking-tighter">
            #105
          </span>
          <span className="font-mono tracking-widest text-sm font-bold uppercase text-white group-hover:text-[#e10600] transition-colors">
            EDOUARD GODFROID &bull; DOUDOU RACING
          </span>
        </Link>

        <div className="flex items-center gap-4 font-mono text-xs">
          <span className="hidden sm:inline text-[#64748b] tracking-wider">CHAMPION DE BELGIQUE 2023 &bull; TEAM EUROKARTING</span>
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
            <span className="font-bold tracking-wider">CHAMPION DE BELGIQUE DE KARTING &bull; DOUDOU RACING #105</span>
          </div>

          <h1 className="text-6xl sm:text-7xl md:text-9xl font-black uppercase tracking-tighter leading-[0.88] text-white">
            EDOUARD <br />
            <span className="text-[#e10600]">« DOUDOU »</span>
          </h1>

          <p className="font-mono text-xs sm:text-sm text-[#94a3b8] leading-relaxed max-w-lg">
            Né en 2012 à Charleroi, Edouard Godfroid est sacré Champion de Belgique en catégorie Mini. 
            Embarquez à bord du kart #105 pour vivre un tour chrono en immersion totale.
          </p>

          {/* Citation phare */}
          <div className="border-l-2 border-[#e10600] pl-3 py-1 font-mono text-xs text-[#94a3b8] italic">
            &laquo; Les sensations fortes ne sont pas dans la Victoire mais dans le combat. &raquo;
            <span className="block text-[10px] text-white not-italic font-bold mt-0.5">— Michael Schumacher</span>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs text-white pt-2">
            <ChevronDown className="w-4 h-4 animate-bounce text-[#e10600]" />
            <span className="tracking-widest text-[#94a3b8]">SCROLLEZ POUR SUIVRE LE TOUR CHRONO SUR LA PISTE</span>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTEUR 1 : L'HISTOIRE DE DOUDOU (~20% Scroll)
          ========================================================= */}
      <section className="relative min-h-screen flex items-center justify-start px-6 md:px-16 z-20 pointer-events-none">
        <div className="max-w-xl pointer-events-auto bg-[#0c1017]/95 border-l-4 border-l-[#e10600] border-y border-r border-[#1b2533] p-6 backdrop-blur-md shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row gap-5 items-center">
            {/* PHOTO OFFICIELLE D'EDOUARD GODFROID */}
            <div className="relative w-32 h-40 shrink-0 border border-[#1e293b] bg-[#07090e] overflow-hidden group">
              <Image
                src="/doudou-hero.png"
                alt="Edouard Godfroid Doudou Racing"
                fill
                className="object-cover object-top contrast-110 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-transparent to-transparent opacity-75" />
              <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between font-mono text-[9px]">
                <span className="text-white font-bold tracking-tighter">#105 DOUDOU</span>
                <span className="text-[#e10600] font-black">CHAMPION 2023</span>
              </div>
            </div>

            {/* BIO OFFICIELLE DEPUIS LE SITE */}
            <div className="space-y-2 flex-1">
              <div className="font-mono text-[11px] text-[#e10600] tracking-widest uppercase flex items-center gap-2 font-bold">
                <User className="w-3.5 h-3.5" />
                <span>BIO &bull; DE MONTIGNY-LE-TILLEUL AUX CIRCUITS FIA</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white leading-tight">
                La Vitesse dans les Gènes depuis ses 4 Ans
              </h2>

              <p className="font-mono text-xs text-[#94a3b8] leading-relaxed">
                Fils de Michaël Godfroid, Edouard commence dès 4 ans sur le parking de Montigny-le-Tilleul.
                Formé au Karting des Fagnes à Mariembourg par Jonathan Dhaese, il intègre le Team Eurokarting
                et s&apos;impose comme une référence incontournable de la génération montante.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-[#1e293b] flex items-center justify-between font-mono text-xs text-[#64748b]">
            <span>NÉ LE : 05 JANVIER 2012</span>
            <span>ORIGINE : CHARLEROI (BELGIQUE)</span>
            <span className="text-[#e10600] font-bold">TEAM EUROKARTING</span>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTEUR 2 : PALMARÈS & TITRE DE CHAMPION (~40% Scroll)
          ========================================================= */}
      <section className="relative min-h-screen flex items-center justify-end px-6 md:px-16 z-20 pointer-events-none">
        <div className="max-w-lg space-y-4 pointer-events-auto bg-[#0c1017]/95 border-l-4 border-l-[#e10600] border-y border-r border-[#1b2533] p-6 backdrop-blur-md shadow-2xl">
          <div className="font-mono text-[11px] text-[#e10600] tracking-widest uppercase flex items-center gap-2 font-bold">
            <Trophy className="w-3.5 h-3.5" />
            <span>PALMARÈS &bull; LE CHEMIN VERS LE TITRE</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white">
            Palmarès Officiel Doudou Racing
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

          {/* Citation de saison */}
          <div className="pt-2 border-t border-[#1e293b] font-mono text-[11px] text-[#94a3b8]">
            <Quote className="w-3.5 h-3.5 text-[#e10600] inline mr-1" />
            &laquo; Je ne perds jamais, soit je gagne, soit j&apos;apprends. &raquo; — Nelson Mandela
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTEUR 3 : LA MACHINE DE COURSE & ACTION EN PISTE (~60% Scroll)
          ========================================================= */}
      <section className="relative min-h-screen flex items-center justify-start px-6 md:px-16 z-20 pointer-events-none">
        <div className="max-w-xl pointer-events-auto bg-[#0c1017]/95 border-l-4 border-l-[#2563eb] border-y border-r border-[#1b2533] p-6 backdrop-blur-md shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row gap-5 items-center">
            {/* PHOTO D'ACTION RÉELLE D'EDOUARD AU ROUND 5 DE GENK */}
            <div className="relative w-full sm:w-44 h-36 sm:h-44 shrink-0 border border-[#1e293b] bg-[#07090e] overflow-hidden group">
              <Image
                src="/doudou-action-genk.jpg"
                alt="Edouard Godfroid en pleine course à Genk"
                fill
                className="object-cover contrast-115 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-transparent to-transparent opacity-70" />
              <div className="absolute top-1.5 left-2 bg-[#2563eb] text-white font-mono font-bold text-[9px] px-1.5 py-0.5 uppercase">
                GENK HOME OF CHAMPIONS
              </div>
            </div>

            {/* SPÉCIFICATIONS TECHNIQUES DE LA CATÉGORIE */}
            <div className="space-y-2 flex-1">
              <div className="font-mono text-[11px] text-[#2563eb] tracking-widest uppercase flex items-center gap-2 font-bold">
                <Zap className="w-3.5 h-3.5" />
                <span>CHÂSSIS &bull; IAME SERIES BENELUX & JUNIOR</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white leading-tight">
                Précision Millimétrée à 16 000 Tr/min
              </h2>

              <p className="font-mono text-xs text-[#94a3b8] leading-relaxed">
                Après le titre national en Mini, Edouard prépare l&apos;accession en catégorie Junior.
                Un matériel affûté par le Team Eurokarting, des pneumatiques Komet ultra-tendres
                et des entraînements intensifs jusqu&apos;à deux fois par semaine.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 font-mono text-xs pt-1">
            <div className="p-2.5 border border-[#1e293b] bg-[#07090e]">
              <span className="text-[#64748b] text-[9px] block uppercase">Châssis Officiel</span>
              <span className="text-sm font-bold text-white">Eurokarting Racing</span>
            </div>
            <div className="p-2.5 border border-[#1e293b] bg-[#07090e]">
              <span className="text-[#64748b] text-[9px] block uppercase">Motorisation</span>
              <span className="text-sm font-bold text-[#2563eb]">IAME Parilla X30</span>
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
            <span>TÉLÉMÉTRIE &bull; TOUR CHRONO OFFICIEL</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight text-white">
            00:54.108 &bull; POLE POSITION
          </h2>

          <p className="font-mono text-xs text-[#94a3b8] leading-relaxed">
            Chaque millième de seconde est traqué par acquisition de données Alfano / Unipro au tour près.
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
          ACTE 5 : CALENDRIER DES COURSES DU BENELUX & EUROPE (100% Scroll)
          ========================================================= */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-16 z-20 pointer-events-none py-20">
        <div className="max-w-2xl space-y-6 pointer-events-auto bg-[#0c1017]/95 border border-[#1b2533] p-8 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-[#e10600] tracking-widest uppercase flex items-center gap-2 font-bold">
              <Calendar className="w-4 h-4" />
              <span>CHAMPIONNATS IAME BENELUX & EURO SERIES</span>
            </span>
            <span className="text-[#64748b]">SAISON 2026</span>
          </div>

          <h2 className="text-3xl font-bold uppercase tracking-tight text-white">
            Calendrier Officiel des Courses
          </h2>

          <p className="font-mono text-xs text-[#94a3b8]">
            Suivez Edouard Godfroid sur les plus grands tracés de karting de Belgique, de France et d&apos;Europe.
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
          ACTE 6 : LES PARTENAIRES OFFICIELS DE DOUDOU RACING
          ========================================================= */}
      <section className="relative min-h-screen flex flex-col justify-between px-6 md:px-16 py-20 z-20 pointer-events-none">
        <div className="max-w-3xl mx-auto text-center space-y-6 pt-10 pointer-events-auto">
          <div className="inline-flex items-center gap-2 bg-[#e10600] text-white font-mono font-bold text-xs px-3.5 py-1.5 uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>PARTENAIRES OFFICIELS &bull; PROGRAMME DOUDOU RACING</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white">
            Ils Soutiennent Edouard Godfroid.
          </h2>

          <p className="font-mono text-xs sm:text-sm text-[#94a3b8] max-w-xl mx-auto leading-relaxed">
            De ses premières accélérations sur parking jusqu&apos;au sommet du karting belge,
            ces entreprises font vibrer la passion automobile aux côtés de Doudou.
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
              href="https://www.doudouracing.be/contact/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border border-[#1e293b] bg-[#07090e] text-white font-mono text-xs uppercase tracking-wider hover:border-[#2563eb] hover:text-[#2563eb] transition-colors flex items-center gap-2"
            >
              <span>Rejoindre l&apos;Aventure Partenaires</span>
              <Download className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Footer Motorsport */}
        <footer className="w-full border-t border-[#1b2533] pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs text-[#64748b] pointer-events-auto">
          <span>EDOUARD GODFROID « DOUDOU » #105 &bull; CHAMPION DE BELGIQUE 2023 &bull; TEAM EUROKARTING</span>
          <span className="text-[#e10600] font-bold">DOUDOURACING.BE &bull; ONBOARD CIRCUIT SCROLLYTELLING</span>
        </footer>
      </section>
    </div>
  );
}
