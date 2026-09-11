import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminDashboardPage() {
  let stats = {
    users: 0,
    karts: 0,
    circuits: 0,
    sessions: 0,
  };

  try {
    const [users, karts, circuits, sessions] = await Promise.all([
      prisma.user.count(),
      prisma.kart.count(),
      prisma.circuit.count(),
      prisma.session.count(),
    ]);
    stats = { users, karts, circuits, sessions };
  } catch {
    // Mode offline ou DB en attente d'initialisation
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex">
      {/* Sidebar navigation */}
      <aside className="w-64 border-r border-neutral-900 flex flex-col justify-between p-6 bg-neutral-950">
        <div className="space-y-8">
          <div>
            <span className="font-mono text-xs tracking-widest text-amber-500 font-bold block">
              APEX ADMIN
            </span>
            <span className="text-xs text-neutral-500">Back-Office v1.0</span>
          </div>

          <nav className="space-y-1 font-mono text-xs">
            <Link
              href="/admin"
              className="block px-3 py-2 rounded-sm bg-neutral-900 text-white border border-neutral-800"
            >
              Tableau de bord
            </Link>
            <span className="block px-3 py-2 text-neutral-500 cursor-not-allowed">
              Sessions & Courses
            </span>
            <span className="block px-3 py-2 text-neutral-500 cursor-not-allowed">
              Flotte Karts
            </span>
            <span className="block px-3 py-2 text-neutral-500 cursor-not-allowed">
              Circuits & Tracés
            </span>
            <span className="block px-3 py-2 text-neutral-500 cursor-not-allowed">
              Pilotes & Réservations
            </span>
          </nav>
        </div>

        <div className="pt-6 border-t border-neutral-900">
          <Link
            href="/"
            className="text-xs font-mono text-neutral-400 hover:text-white transition-colors"
          >
            &larr; Retour au site public
          </Link>
        </div>
      </aside>

      {/* Main Admin View */}
      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-5xl space-y-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Console d&apos;Exploitation
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              Supervision de la flotte, des réservations et configuration de la télémétrie.
            </p>
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 border border-neutral-900 bg-neutral-900/40 rounded-sm">
              <span className="font-mono text-xs text-neutral-500 block mb-1">
                PILOTES ENREGISTRÉS
              </span>
              <span className="text-3xl font-semibold text-white">
                {stats.users}
              </span>
            </div>

            <div className="p-5 border border-neutral-900 bg-neutral-900/40 rounded-sm">
              <span className="font-mono text-xs text-neutral-500 block mb-1">
                KARTS ACTIFS
              </span>
              <span className="text-3xl font-semibold text-white">
                {stats.karts}
              </span>
            </div>

            <div className="p-5 border border-neutral-900 bg-neutral-900/40 rounded-sm">
              <span className="font-mono text-xs text-neutral-500 block mb-1">
                TRACÉS / CIRCUITS
              </span>
              <span className="text-3xl font-semibold text-white">
                {stats.circuits}
              </span>
            </div>

            <div className="p-5 border border-neutral-900 bg-neutral-900/40 rounded-sm">
              <span className="font-mono text-xs text-neutral-500 block mb-1">
                SESSIONS TOTALES
              </span>
              <span className="text-3xl font-semibold text-white">
                {stats.sessions}
              </span>
            </div>
          </div>

          {/* System status & next steps */}
          <div className="border border-neutral-900 bg-neutral-900/20 p-6 rounded-sm space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider font-mono text-neutral-200">
              Configuration Infrastructure & Vercel
            </h2>
            <div className="space-y-2 text-xs font-mono text-neutral-400 leading-relaxed">
              <p>
                &bull; <strong className="text-neutral-200">Prisma Client :</strong> Initialisé avec singleton serverless dans <code className="text-neutral-300">src/lib/prisma.ts</code>.
              </p>
              <p>
                &bull; <strong className="text-neutral-200">Variables d&apos;environnement :</strong> Définir <code className="text-neutral-300">DATABASE_URL</code> dans le dashboard Vercel (PostgreSQL, Supabase, Neon ou Vercel Postgres).
              </p>
              <p>
                &bull; <strong className="text-neutral-200">Génération automatique :</strong> Le script <code className="text-neutral-300">postinstall</code> dans <code className="text-neutral-300">package.json</code> assure la compilation du client Prisma à chaque déploiement Vercel.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
