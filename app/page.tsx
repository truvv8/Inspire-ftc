import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function HomePage() {
  const t = await getTranslations("home");

  return (
    <div className="space-y-24">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border border-white/5 px-6 py-20 text-center text-white md:px-12 md:py-28">
        {/* Subtle radial glow behind hero */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-inspire-orange/8 blur-[120px] animate-pulse-glow" />
          <div className="absolute -right-32 top-0 h-80 w-80 rounded-full bg-inspire-sky/5 blur-[100px]" />
          <div className="absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-inspire-emerald/5 blur-[100px]" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-8">
          <span className="animate-fade-up rounded-full border border-white/10 bg-white/5 px-5 py-1.5 text-sm font-medium text-white/60 backdrop-blur-sm">
            {t("badge")}
          </span>

          <h1 className="animate-fade-up max-w-4xl font-serif text-4xl font-bold tracking-tight sm:text-6xl">
            {t("title")}
            <span className="block bg-gradient-to-r from-inspire-orange via-amber-400 to-inspire-orange bg-clip-text text-transparent animate-gradient">
              {t("titleAccent")}
            </span>
          </h1>

          <p className="animate-fade-up-delay-1 max-w-2xl text-lg text-white/50">
            {t("description")}
          </p>

          <div className="animate-fade-up-delay-2 flex flex-wrap justify-center gap-4">
            <Link
              href="/materials"
              className="rounded-xl bg-inspire-orange px-7 py-3 font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-orange-500/30"
            >
              {t("ctaMaterials")}
            </Link>

            <Link
              href="/calendar"
              className="rounded-xl border border-white/10 bg-white/5 px-7 py-3 font-semibold text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/10"
            >
              {t("ctaCalendar")}
            </Link>
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="grid gap-6 sm:grid-cols-3 text-center">
        <Highlight value={t("highlight1Value")} label={t("highlight1Label")} />
        <Highlight value={t("highlight2Value")} label={t("highlight2Label")} />
        <Highlight value={t("highlight3Value")} label={t("highlight3Label")} />
      </section>

      {/* VALUES */}
      <section className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <ValueCard title={t("value1Title")} description={t("value1Description")} />
        <ValueCard title={t("value2Title")} description={t("value2Description")} />
        <ValueCard title={t("value3Title")} description={t("value3Description")} />
      </section>
    </div>
  );
}

function Highlight({ value, label }: { value: string; label: string }) {
  return (
    <div className="glass-card glass-card-hover rounded-2xl p-6 transition hover:-translate-y-0.5">
      <div className="font-serif text-3xl font-bold text-white">
        {value}
      </div>
      <div className="mt-1 text-sm text-white/40">{label}</div>
    </div>
  );
}

function ValueCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="group glass-card glass-card-hover rounded-2xl p-6 transition hover:-translate-y-1">
      <div className="mb-3 h-1 w-10 rounded-full bg-gradient-to-r from-inspire-orange to-amber-400 transition-all group-hover:w-14" />
      <h3 className="mb-2 font-serif text-xl font-semibold text-white">{title}</h3>
      <p className="text-white/50">{description}</p>
    </div>
  );
}