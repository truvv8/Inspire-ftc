"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { RESOURCES, RESOURCE_TYPES, type ResourceItem } from "@/data/resources";

/* ─── Level meta ──────────────────────────────────────────────── */
const LEVEL_META: Record<
  ResourceItem["level"],
  { label: string; labelRu: string; color: string; dot: string; icon: React.ReactNode }
> = {
  beginner: {
    label: "Beginner",
    labelRu: "Новичок",
    color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    dot: "bg-emerald-400",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3 w-3">
        <circle cx="8" cy="8" r="6" />
        <path d="M8 5v3l2 1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  intermediate: {
    label: "Intermediate",
    labelRu: "Средний",
    color: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    dot: "bg-sky-400",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3 w-3">
        <path d="M2 12l4-4 3 3 5-7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  advanced: {
    label: "Advanced",
    labelRu: "Продвинутый",
    color: "bg-violet-500/15 text-violet-300 border-violet-500/30",
    dot: "bg-violet-400",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3 w-3">
        <path d="M8 2l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4L2.1 6.2l4-.6L8 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
};

/* ─── Category icons ──────────────────────────────────────────── */
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  official: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  path: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <path d="M3 12h18M3 12C3 7 7 3 12 3s9 4 9 9-4 9-9 9-9-4-9-9z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  vision: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" strokeLinecap="round" />
    </svg>
  ),
  library: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  cad: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" />
      <path d="M3 9h18M9 21V9" strokeLinecap="round" />
    </svg>
  ),
  code: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <polyline points="16 18 22 12 16 6" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="8 6 2 12 8 18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  inspire: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  community: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="7" r="4" strokeLinecap="round" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const totalResources = RESOURCES.reduce((s, c) => s + c.items.length, 0);

type LevelFilter = ResourceItem["level"] | null;

export default function ResourcesPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<ResourceItem["type"] | null>(null);
  const [activeLevel, setActiveLevel] = useState<LevelFilter>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return RESOURCES.map((cat) => ({
      ...cat,
      items: cat.items.filter((item) => {
        const matchesQuery =
          !q ||
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q));
        const matchesCat = !activeCategory || cat.id === activeCategory;
        const matchesType = !activeType || item.type === activeType;
        const matchesLevel = !activeLevel || item.level === activeLevel;
        return matchesQuery && matchesCat && matchesType && matchesLevel;
      }),
    })).filter((cat) => cat.items.length > 0);
  }, [query, activeCategory, activeType, activeLevel]);

  const filteredCount = filtered.reduce((s, c) => s + c.items.length, 0);

  const beginnerCount = RESOURCES.reduce((s, c) => s + c.items.filter(i => i.level === "beginner").length, 0);
  const intermediateCount = RESOURCES.reduce((s, c) => s + c.items.filter(i => i.level === "intermediate").length, 0);
  const advancedCount = RESOURCES.reduce((s, c) => s + c.items.filter(i => i.level === "advanced").length, 0);

  const hasFilters = query || activeCategory || activeType || activeLevel;

  return (
    <div className="space-y-10">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl border border-white/5 px-6 py-14 text-center md:px-12 md:py-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-inspire-green/[0.06] blur-[140px] animate-pulse-glow" />
          <div className="absolute -right-20 top-0 h-60 w-60 rounded-full bg-sky-500/[0.04] blur-[100px]" />
          <div className="absolute -left-20 bottom-0 h-60 w-60 rounded-full bg-violet-500/[0.04] blur-[100px]" />
        </div>

        <div className="relative z-10 space-y-5">
          <span className="inline-block rounded-full border border-white/10 bg-white/5 px-5 py-1.5 text-xs font-medium uppercase tracking-[0.25em] text-white/50">
            Open Source Hub
          </span>
          <h1 className="animate-fade-up font-serif text-4xl font-bold tracking-tight text-white md:text-5xl">
            FTC Resources
          </h1>
          <p className="animate-fade-up-delay-1 mx-auto max-w-lg text-white/40">
            Curated open-source libraries, guides, and tools for FIRST Tech Challenge teams.
          </p>

          <div className="animate-fade-up-delay-2 flex flex-wrap items-center justify-center gap-6 pt-2 text-sm text-white/40">
            <span><span className="font-bold text-white">{totalResources}</span> resources</span>
            <div className="h-4 w-px bg-white/10" />
            <span><span className="font-bold text-white">{RESOURCES.length}</span> categories</span>
            <div className="h-4 w-px bg-white/10" />
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Free &amp; Open Source
            </span>
          </div>
        </div>
      </section>

      {/* ── Level quick-pick cards ─────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {(["beginner", "intermediate", "advanced"] as const).map((lvl) => {
          const meta = LEVEL_META[lvl];
          const count = lvl === "beginner" ? beginnerCount : lvl === "intermediate" ? intermediateCount : advancedCount;
          const isActive = activeLevel === lvl;
          return (
            <button
              key={lvl}
              onClick={() => setActiveLevel(isActive ? null : lvl)}
              className={`group relative flex flex-col gap-2 overflow-hidden rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 ${
                isActive
                  ? lvl === "beginner"
                    ? "border-emerald-500/40 bg-emerald-500/10"
                    : lvl === "intermediate"
                    ? "border-sky-500/40 bg-sky-500/10"
                    : "border-violet-500/40 bg-violet-500/10"
                  : "border-white/[0.07] bg-white/[0.025] hover:border-white/15 hover:bg-white/[0.04]"
              }`}
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl border text-sm ${meta.color}`}>
                {lvl === "beginner" ? "🌱" : lvl === "intermediate" ? "⚡" : "🚀"}
              </div>
              <div>
                <p className={`font-semibold text-white ${isActive ? "" : "group-hover:text-white/90"}`}>
                  {meta.label}
                </p>
                <p className="text-xs text-white/40">
                  {lvl === "beginner"
                    ? "Just starting out with FTC"
                    : lvl === "intermediate"
                    ? "Building your second robot"
                    : "Competing at a high level"}
                </p>
              </div>
              <div className={`mt-auto text-xs font-semibold ${
                isActive
                  ? lvl === "beginner" ? "text-emerald-400" : lvl === "intermediate" ? "text-sky-400" : "text-violet-400"
                  : "text-white/30"
              }`}>
                {count} resources
              </div>
              {isActive && (
                <div className={`absolute inset-x-0 bottom-0 h-0.5 ${
                  lvl === "beginner" ? "bg-emerald-500" : lvl === "intermediate" ? "bg-sky-500" : "bg-violet-500"
                }`} />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Search + Filters ──────────────────────────────────── */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search resources..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-white placeholder-white/30 outline-none transition focus:border-inspire-green/40 focus:ring-1 focus:ring-inspire-green/20"
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              activeCategory === null
                ? "bg-inspire-green text-white shadow-lg shadow-emerald-500/20"
                : "border border-white/10 bg-white/5 text-white/50 hover:text-white"
            }`}
          >
            All categories
          </button>
          {RESOURCES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                activeCategory === cat.id
                  ? "bg-inspire-green text-white shadow-lg shadow-emerald-500/20"
                  : "border border-white/10 bg-white/5 text-white/50 hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Type filters */}
        <div className="flex flex-wrap gap-2">
          {(Object.keys(RESOURCE_TYPES) as ResourceItem["type"][]).map((type) => {
            const meta = RESOURCE_TYPES[type];
            return (
              <button
                key={type}
                onClick={() => setActiveType(activeType === type ? null : type)}
                className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition ${
                  activeType === type ? meta.color + " ring-1 ring-current" : "border-white/10 bg-white/5 text-white/30 hover:text-white/60"
                }`}
              >
                {meta.label}
              </button>
            );
          })}
        </div>

        {/* Results count */}
        {hasFilters && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/30">
              {filteredCount} result{filteredCount !== 1 ? "s" : ""}
              {query && <> for &ldquo;<span className="text-white/60">{query}</span>&rdquo;</>}
              {activeLevel && (
                <> &mdash; <span className={
                  activeLevel === "beginner" ? "text-emerald-400" : activeLevel === "intermediate" ? "text-sky-400" : "text-violet-400"
                }>{LEVEL_META[activeLevel].label}</span></>
              )}
            </p>
            <button
              onClick={() => { setQuery(""); setActiveCategory(null); setActiveType(null); setActiveLevel(null); }}
              className="text-xs text-white/30 hover:text-white/60 transition underline underline-offset-2"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ── Resource categories ────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center space-y-3">
          <p className="font-serif text-xl text-white">No resources found</p>
          <p className="text-white/40">Try a different search term or level.</p>
          <button
            onClick={() => { setQuery(""); setActiveCategory(null); setActiveType(null); setActiveLevel(null); }}
            className="mt-2 rounded-xl border border-white/10 bg-white/5 px-6 py-2 text-sm text-white/60 transition hover:bg-white/10"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-14">
          {filtered.map((cat) => (
            <section key={cat.id} className="space-y-5">
              {/* Category header */}
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-inspire-green/10 text-inspire-green-light">
                  {CATEGORY_ICONS[cat.icon] ?? CATEGORY_ICONS["library"]}
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold text-white">{cat.label}</h2>
                  <p className="text-xs text-white/30">{cat.items.length} resources</p>
                </div>
                {/* Level breakdown chips */}
                <div className="hidden items-center gap-1.5 sm:flex">
                  {(["beginner", "intermediate", "advanced"] as const).map((lvl) => {
                    const n = cat.items.filter((i) => i.level === lvl).length;
                    if (!n) return null;
                    const meta = LEVEL_META[lvl];
                    return (
                      <span key={lvl} className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${meta.color}`}>
                        {n} {meta.label}
                      </span>
                    );
                  })}
                </div>
                <div className="ml-auto h-px flex-1 bg-white/[0.05]" />
              </div>

              {/* Cards grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cat.items.map((item) => (
                  <ResourceCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="glass-card rounded-2xl p-8 text-center space-y-4">
        <h3 className="font-serif text-2xl font-bold text-white">Your team has resources to share?</h3>
        <p className="text-white/40">Upload guides, CAD files, or code examples to help the community.</p>
        <Link
          href="/materials/upload"
          className="inline-block rounded-xl bg-inspire-green px-8 py-3 font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:bg-emerald-600"
        >
          Upload Material
        </Link>
      </section>
    </div>
  );
}

/* ─── ResourceCard ────────────────────────────────────────────── */
function ResourceCard({ item }: { item: ResourceItem }) {
  const typeMeta = RESOURCE_TYPES[item.type];
  const levelMeta = LEVEL_META[item.level];

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.05]"
    >
      {/* Level accent bar at top */}
      <div className={`absolute inset-x-0 top-0 h-[2px] opacity-60 ${
        item.level === "beginner"
          ? "bg-emerald-500"
          : item.level === "intermediate"
          ? "bg-sky-500"
          : "bg-violet-500"
      }`} />

      <div className="absolute inset-0 bg-gradient-to-br from-inspire-green/[0.04] to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />

      <div className="relative z-10 flex h-full flex-col gap-3">
        {/* Top row: type badge + level badge + stars */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${typeMeta.color}`}>
              {typeMeta.label}
            </span>
            <span className={`flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${levelMeta.color}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${levelMeta.dot}`} />
              {levelMeta.label}
            </span>
          </div>
          {item.stars && (
            <span className="flex shrink-0 items-center gap-1 text-xs text-white/25">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3 text-yellow-500/60">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              {item.stars >= 1000 ? `${(item.stars / 1000).toFixed(1)}k` : item.stars}
            </span>
          )}
        </div>

        {/* Title + description */}
        <div>
          <h3 className="font-serif text-base font-semibold leading-snug text-white group-hover:text-emerald-100 transition">
            {item.title}
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-white/40">{item.description}</p>
        </div>

        {/* Tags */}
        <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
          {item.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/8 bg-white/5 px-2.5 py-0.5 text-[10px] text-white/40"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Open link */}
        <div className="flex items-center gap-1 text-xs text-white/25 transition group-hover:text-inspire-green-light">
          <span>Open resource</span>
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3 transition group-hover:translate-x-0.5">
            <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </a>
  );
}
