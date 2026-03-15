"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type TeamEntry = {
  id: string;
  name: string;
  ftcName: string;
  materials: number;
  categories: string[];
  lastUpload: string;
};

const CATEGORY_COLORS: Record<string, string> = {
  robot: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  code: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  inspire: "bg-violet-500/20 text-violet-300 border-violet-500/30",
};

const PODIUM = [
  {
    rank: 1,
    order: "sm:order-2",
    height: "sm:pb-10",
    badge: "h-20 w-20 text-3xl",
    gradient: "from-yellow-300 via-yellow-400 to-amber-500",
    glow: "shadow-[0_0_40px_rgba(250,204,21,0.4)]",
    border: "border-yellow-500/40",
    bg: "bg-gradient-to-b from-yellow-500/[0.08] to-transparent",
    ring: "ring-2 ring-yellow-400/30",
    nameSize: "text-2xl",
    barGradient: "from-yellow-400 to-amber-500",
    barShadow: "shadow-[0_0_20px_rgba(250,204,21,0.3)]",
  },
  {
    rank: 2,
    order: "sm:order-1",
    height: "sm:pt-8",
    badge: "h-14 w-14 text-xl",
    gradient: "from-slate-200 via-slate-300 to-slate-400",
    glow: "shadow-[0_0_25px_rgba(148,163,184,0.3)]",
    border: "border-slate-400/30",
    bg: "bg-gradient-to-b from-slate-400/[0.06] to-transparent",
    ring: "",
    nameSize: "text-xl",
    barGradient: "from-slate-300 to-slate-400",
    barShadow: "",
  },
  {
    rank: 3,
    order: "sm:order-3",
    height: "sm:pt-14",
    badge: "h-14 w-14 text-xl",
    gradient: "from-amber-500 via-amber-600 to-amber-700",
    glow: "shadow-[0_0_25px_rgba(217,119,6,0.3)]",
    border: "border-amber-600/30",
    bg: "bg-gradient-to-b from-amber-600/[0.06] to-transparent",
    ring: "",
    nameSize: "text-xl",
    barGradient: "from-amber-500 to-amber-700",
    barShadow: "",
  },
];

export default function LeaderboardPage() {
  const [teams, setTeams] = useState<TeamEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setTeams(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalMaterials = teams.reduce((s, t) => s + t.materials, 0);
  const maxMaterials = teams[0]?.materials ?? 1;

  return (
    <div className="space-y-10">
      {/* Hero header */}
      <section className="relative overflow-hidden rounded-3xl border border-white/5 px-6 py-14 text-center md:px-12 md:py-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/[0.06] blur-[140px] animate-pulse-glow" />
          <div className="absolute -right-20 top-0 h-60 w-60 rounded-full bg-yellow-500/[0.04] blur-[100px]" />
          <div className="absolute -left-20 bottom-0 h-60 w-60 rounded-full bg-sky-500/[0.04] blur-[100px]" />
        </div>

        <div className="relative z-10 space-y-5">
          <div className="mx-auto flex items-center justify-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
            </svg>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">
              Hall of Fame
            </span>
            <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
            </svg>
          </div>

          <h1 className="animate-fade-up font-serif text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
            Leaderboard
          </h1>
          <p className="animate-fade-up-delay-1 mx-auto max-w-lg text-white/40">
            The teams shaping the FTC community. Share materials to climb the ranks.
          </p>

          {/* Live stats */}
          <div className="animate-fade-up-delay-2 flex flex-wrap items-center justify-center gap-6 pt-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <span className="text-sm text-white/50">
                <span className="font-bold text-white">{teams.length}</span> teams
              </span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <span className="text-sm text-white/50">
              <span className="font-bold text-white">{totalMaterials}</span> materials shared
            </span>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="py-20 text-center text-white/30 animate-pulse">Loading rankings...</div>
      ) : teams.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center space-y-4">
          <div className="text-5xl">🏆</div>
          <p className="text-xl font-serif font-bold text-white">No one here yet</p>
          <p className="text-white/40">Upload materials to claim the #1 spot.</p>
          <Link
            href="/materials/upload"
            className="mt-2 inline-block rounded-xl bg-inspire-green px-7 py-3 font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:bg-emerald-600"
          >
            Upload now
          </Link>
        </div>
      ) : (
        <>
          {/* Podium — top 3 */}
          {teams.length >= 3 && (
            <section className="animate-fade-up grid items-end gap-4 sm:grid-cols-3">
              {PODIUM.map((p) => {
                const team = teams[p.rank - 1];
                return (
                  <div
                    key={p.rank}
                    className={`${p.order} ${p.height} group relative overflow-hidden rounded-2xl border ${p.border} ${p.bg} p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${p.ring}`}
                  >
                    {/* Glow on hover */}
                    <div className={`pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100`}>
                      <div className={`absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br ${p.gradient} opacity-[0.08] blur-[60px]`} />
                    </div>

                    <div className="relative z-10">
                      {/* Rank badge */}
                      <div className={`mx-auto flex ${p.badge} items-center justify-center rounded-full bg-gradient-to-br ${p.gradient} font-bold text-black ${p.glow}`}>
                        {p.rank}
                      </div>

                      <h3 className={`mt-4 font-serif ${p.nameSize} font-bold text-white`}>
                        {team.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-white/25">{team.ftcName}</p>

                      {/* Material count with bar */}
                      <div className="mt-5 space-y-2">
                        <div className="text-4xl font-bold text-white">{team.materials}</div>
                        <div className="mx-auto h-1 w-2/3 overflow-hidden rounded-full bg-white/10">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${p.barGradient} ${p.barShadow} transition-all duration-1000`}
                            style={{ width: `${(team.materials / maxMaterials) * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-white/30">materials</p>
                      </div>

                      {/* Categories */}
                      <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                        {team.categories.map((cat) => (
                          <span
                            key={cat}
                            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${CATEGORY_COLORS[cat] ?? "bg-white/10 text-white/50 border-white/10"}`}
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>
          )}

          {/* Rankings table */}
          <section className="animate-fade-up-delay-1 space-y-4">
            <h2 className="font-serif text-xl font-bold text-white/80">Full Rankings</h2>

            <div className="overflow-hidden rounded-2xl border border-white/[0.08]" style={{ background: "rgba(255,255,255,0.015)" }}>
              <div className="h-[2px] bg-gradient-to-r from-transparent via-inspire-green/50 to-transparent" />

              <div className="divide-y divide-white/[0.04]">
                {teams.map((team, idx) => {
                  const isTop3 = idx < 3;
                  const pct = (team.materials / maxMaterials) * 100;

                  return (
                    <div
                      key={team.id}
                      className={`group relative flex items-center gap-4 px-5 py-4 transition-all hover:bg-white/[0.03] ${isTop3 ? "bg-white/[0.02]" : ""}`}
                    >
                      {/* Progress bar background */}
                      <div
                        className="pointer-events-none absolute inset-y-0 left-0 bg-gradient-to-r from-inspire-green/[0.04] to-transparent transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />

                      {/* Rank */}
                      <div className="relative z-10 w-10 shrink-0 text-center">
                        {isTop3 ? (
                          <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${PODIUM[idx].gradient} text-sm font-bold text-black ${PODIUM[idx].glow}`}>
                            {idx + 1}
                          </span>
                        ) : (
                          <span className="text-sm font-medium text-white/30">
                            {idx + 1}
                          </span>
                        )}
                      </div>

                      {/* Team info */}
                      <div className="relative z-10 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${isTop3 ? "text-white" : "text-white/80"}`}>
                            {team.name}
                          </span>
                          <span className="hidden text-xs text-white/20 sm:inline">{team.ftcName}</span>
                        </div>
                        {/* Category tags on mobile */}
                        <div className="mt-1 flex flex-wrap gap-1 sm:hidden">
                          {team.categories.map((cat) => (
                            <span
                              key={cat}
                              className={`rounded-full border px-2 py-px text-[9px] font-semibold uppercase tracking-wider ${CATEGORY_COLORS[cat] ?? "bg-white/10 text-white/50 border-white/10"}`}
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Categories — desktop */}
                      <div className="relative z-10 hidden flex-wrap gap-1.5 sm:flex">
                        {team.categories.map((cat) => (
                          <span
                            key={cat}
                            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${CATEGORY_COLORS[cat] ?? "bg-white/10 text-white/50 border-white/10"}`}
                          >
                            {cat}
                          </span>
                        ))}
                      </div>

                      {/* Material count */}
                      <div className="relative z-10 w-16 text-right">
                        <span className={`text-lg font-bold ${isTop3 ? "text-white" : "text-white/70"}`}>
                          {team.materials}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="animate-fade-up-delay-2 text-center py-6">
            <div className="glass-card inline-flex flex-col items-center gap-4 rounded-2xl px-10 py-8">
              <p className="font-serif text-lg font-bold text-white">Want to see your team here?</p>
              <p className="text-sm text-white/40">Share materials and climb the leaderboard.</p>
              <Link
                href="/materials/upload"
                className="rounded-xl bg-inspire-green px-8 py-3 font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-emerald-500/30"
              >
                Upload Materials
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
