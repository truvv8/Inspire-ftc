export const dynamic = "force-dynamic";

import MaterialCard from "@/app/components/MaterialCard";
import Link from "next/link";
import { PT_Sans, PT_Serif } from "next/font/google";
import type { CSSProperties } from "react";
import { supabaseServer } from "@/lib/supabase-server";
import { unstable_noStore as noStore } from "next/cache";
import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";

const bodyFont = PT_Sans({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
});

const displayFont = PT_Serif({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
});

const heroStyles = {
  "--hero-deep": "#0b1220",
  "--hero-accent": "rgba(56, 189, 248, 0.45)",
  "--hero-warm": "rgba(251, 146, 60, 0.35)",
} as CSSProperties;

const focusChips = ["TeleOp", "Autonomous", "Vision", "Architecture"];

interface Material {
  id: string;
  title: string;
  team_name: string;
  category: string;
  subcategory: string | null;
  file_url: string | null;
  external_url: string | null;
  created_at: string;
}

async function getMaterials(): Promise<Material[]> {
  noStore();
  const { data, error } = await supabaseServer
    .from("materials")
    .select("*")
    .eq("category", "code")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    throw new Error("Failed to fetch Code materials");
  }

  return data as Material[];
}

export default async function CodeMaterialsPage() {
  const t = await getTranslations("category");
  const locale = await getLocale();
  const materials = await getMaterials();
  const totalMaterials = materials.length;
  const uniqueTeams = new Set(materials.map((m) => m.team_name)).size;
  const latestDate = materials[0]
    ? new Date(materials[0].created_at).toLocaleDateString(locale === "ru" ? "ru-RU" : "en-US")
    : "—";

  return (
    <div className={`${bodyFont.className} space-y-10`}>
      <section
        className="relative overflow-hidden rounded-3xl border border-white/10 px-6 py-10 text-white shadow-lg"
        style={heroStyles}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: "var(--hero-deep)",
            backgroundImage:
              "radial-gradient(circle at top right, var(--hero-accent), transparent 55%), radial-gradient(circle at bottom left, var(--hero-warm), transparent 55%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl motion-safe:animate-float-slow" />
        <div className="absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-sky-400/10 blur-3xl motion-safe:animate-float-slow" />

        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5 motion-safe:animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-white/70">
              {t("codeBadge")}
            </span>
            <h1
              className={`${displayFont.className} text-4xl font-semibold leading-tight md:text-5xl`}
            >
              Code
            </h1>
            <p className="max-w-2xl text-base text-white/80 md:text-lg">
              {t("codeHeroDescription")}
            </p>
            <div className="flex flex-wrap gap-2">
              {focusChips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/80"
                >
                  {chip}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/materials/upload"
                className="inline-flex items-center gap-2 rounded-full bg-inspire-green px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:bg-emerald-600"
              >
                {t("addMaterial")}
                <span aria-hidden="true">&rarr;</span>
              </Link>
              <span className="text-xs text-white/60">
                {t("shareHint")}
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 motion-safe:animate-fade-up-delay-1">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                {t("materialsCount")}
              </p>
              <p className={`${displayFont.className} text-3xl font-semibold`}>
                {totalMaterials}
              </p>
              <p className="text-sm text-white/70">{t("inLibrary")}</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                {t("teamsCount")}
              </p>
              <p className={`${displayFont.className} text-3xl font-semibold`}>
                {uniqueTeams}
              </p>
              <p className="text-sm text-white/70">{t("sharingExperience")}</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur sm:col-span-2">
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                {t("updated")}
              </p>
              <p className={`${displayFont.className} text-2xl font-semibold`}>
                {latestDate}
              </p>
              <p className="text-sm text-white/70">{t("latestAddition")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <h2 className={`${displayFont.className} text-2xl text-white md:text-3xl`}>
              {t("latestMaterials")}
            </h2>
            <p className="max-w-2xl text-white/50">
              {t("codeLatestDescription")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-white/50">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              {t("total")}: {totalMaterials}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              {t("teams")}: {uniqueTeams}
            </span>
          </div>
        </div>

        <div className="relative rounded-3xl border border-white/8 bg-white/[0.02] p-6 backdrop-blur">
          {materials.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
              <p className={`${displayFont.className} text-xl text-white/70`}>
                {t("noMaterials")}
              </p>
              <p className="mt-2 text-sm text-white/40">
                {t("noMaterialsHint")}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {materials.map((m, index) => {
                const href =
                  m.external_url && m.external_url.trim() !== ""
                    ? m.external_url
                    : m.file_url && m.file_url.trim() !== ""
                    ? m.file_url
                    : null;

                return (
                  <div
                    key={m.id}
                    className="motion-safe:animate-fade-up"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <MaterialCard
                      id={m.id}
                      title={m.title}
                      description={m.subcategory ?? t("noDescription")}
                      tags={m.subcategory ? [m.subcategory] : []}
                      author={m.team_name}
                      date={new Date(m.created_at).toLocaleDateString(locale === "ru" ? "ru-RU" : "en-US")}
                      href={href}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
